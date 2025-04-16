import { notFound, redirect } from 'next/navigation';
import InvoiceDetails from './components/InvoiceDetails';
import { createClient, createServiceRoleClient } from '@/utils/supabase/server';
import { getBalance } from "@/database/app_transactions/transactions";
import { SupabaseClient } from '@supabase/supabase-js';
import { Investment as InvoiceDetailsInvestment } from './components/InvoiceDetails';
import { locations } from '@/lib/paths';

type Investment = {
    "id": string,
    "user_id": string,
    "paid": boolean,
    "paid_at": null,
    "terminated": boolean,
    "terminated_at": null,
    "type": number,
    "amount": number,
    "locked_months": number,
    "accrued_returns": number,
    "group_id": null,
    // "created_at": "2025-04-07T17:50:56.481217+00:00",
    // "updated_at": "2025-04-07T17:50:56.481217+00:00",
    "is_deleted": boolean
};

export default async function InvoicePage({
    params,
    searchParams,
}: {
    params: Promise<{ investmentId: string }>;
    searchParams: { [key: string]: string | string[] | undefined };
}) {
    const investmentId = ((await params).investmentId).trim();
    console.log('investment id:', investmentId);

    const supabase = await createClient();
    // Create supabase client with service role
    const supabaseServiceRole = await createServiceRoleClient();

    // Get the current authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        // Redirect to login if user is not authenticated
        redirect(locations.auth.signIn);
    }

    let investment: Investment | null;
    try {
        investment = await fetchInvestment(supabaseServiceRole, investmentId) as Investment;
        console.log('investment found:', investment);
        /*
        {
            "id": "164a3ce7-f93c-4a81-be48-378a6180ff98",
            "user_id": "d6b2dac6-50ee-4fd1-b36c-e28f6a85aa0d",
            "paid": false,
            "paid_at": null,
            "terminated": false,
            "terminated_at": null,
            "type": 1,
            "amount": 12000,
            "locked_months": 0,
            "accrued_returns": 0,
            "group_id": null,
            "created_at": "2025-04-07T17:50:56.481217+00:00",
            "updated_at": "2025-04-07T17:50:56.481217+00:00",
            "is_deleted": false
        } 
         */
    } catch (e: any) {
        console.error(e);
        notFound();
    }

    // Check if user is the owner of the investment
    if (investment.user_id !== user.id) {
        // User is not authorized to view this invoice
        redirect('/dashboard');
    }

    // Generate invoice
    const invoice = await generateInvoice(supabaseServiceRole, investment, user.id);
    console.log('created invoice:', invoice);
    
    // Get user's balance
    const { data: userBalance, error: userBalanceError } = await getBalance(user.id);
    if (userBalanceError || !userBalance) {
        throw new Error('Failed to get user balance');
    }

    // Check if user has enough balance
    const hasInsufficientFunds = userBalance.amount < invoice.amount;

    // Pass data to client component
    return (
        <InvoiceDetails
            invoice={invoice}
            investment={investment as unknown as InvoiceDetailsInvestment}
            hasInsufficientFunds={hasInsufficientFunds}
            userBalance={userBalance.amount}
        />
    );
}

async function fetchInvestment(supabase: SupabaseClient, investmentId: string) {
    const { data, error } = await supabase
        .schema("app_investments")
        .from('investments')
        .select('*')
        .eq('id', investmentId)
        .limit(1)
        .maybeSingle();

    if (error || !data) {
        console.error(error);
        throw new Error(`Error fetching investment with id: ${investmentId}`);
    }

    return data;
}

async function generateInvoice(
    supabase: SupabaseClient,
    investment: Investment,
    userId: string) {

    const { data: invoiceId, error } = await supabase
        .schema("app_investments")
        .rpc('create_investment_invoice', {
            p_investment_id: investment.id,
        });

    if (error || !invoiceId) {
        console.error('Error calling postgresql function ' + 
            '`app_investments.create_investment_invoice`:', error);
        throw new Error("Failed to create invoice");
    }

    console.log("Created investment with data (Invoice id):", invoiceId);

    const { data: invoice, error: invoiceError } = await supabase
        .schema("app_invoicing")
        .from("invoices")
        .select('*')
        .eq("id", invoiceId as string)
        .maybeSingle();

    if (invoiceError || !invoice) {
        console.error('Error fetching created investment invoice:', invoiceError);
        throw new Error("Failed to create invoice");
    }

    return invoice;
}
