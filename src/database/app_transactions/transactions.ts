'use server'

import type { SupabaseClient } from '@supabase/supabase-js';
import { createServiceRoleClient } from "@/utils/supabase/server";
import type {
    TransactionType,
    Transaction,
    Balance,
    Deposit,
    Withdrawal,
} from "./types";

/**
 * The global supabase client to use for making queries related to the target transactions table.
 * 
 * Note:
 * 
 * May be null, thus be sure to call [ensureSupabaseInitialized] to get a valid instance
 */
let supabase: SupabaseClient | null = null;

/**
 * The database schema that operations defined herein will mostly be working from
 */
const targetSchema = 'app_transactions';

// --- Helper Function for Guarding ---
async function ensureSupabaseInitialized(): Promise<SupabaseClient<any, "public", any>> {
    if (!supabase) {
        supabase = await createServiceRoleClient();
    }
    return supabase;
}

// --- Core Transaction Functions ---

/**
 * Records a new deposit from M-Pesa
 * @param phoneNumber The phone number that made the payment
 * @param mpesaReference The M-Pesa transaction reference
 * @param amount The amount deposited
 * @returns The created deposit record
 */
export async function recordDeposit(
    phoneNumber: string,
    mpesaReference: string,
    amount: number
): Promise<{ data: Deposit | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        if (amount <= 0) {
            throw new Error('Amount must be positive')
        }

        const { data: depositId, error: rpcError } = await supabaseClient
            .schema(targetSchema)
            .rpc('record_deposit', {
                p_phone_number: phoneNumber,
                p_mpesa_reference: mpesaReference,
                p_amount: amount,
            })
            .single()

        if (rpcError) throw rpcError
        if (!depositId) throw new Error('RPC record_deposit did not return an ID');


        // Get the full deposit record
        const { data: deposit, error: fetchError } = await supabaseClient
            .schema(targetSchema)
            .from('deposits')
            .select('*')
            .eq('id', depositId)
            .single()

        if (fetchError) throw fetchError;

        return { data: deposit as Deposit, error: null } // Cast needed if Supabase types aren't perfect
    } catch (error) {
        console.error('recordDeposit error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to record deposit') }
    }
}

/**
 * Requests a withdrawal for a user
 * @param userId The user ID requesting withdrawal
 * @param phoneNumber The phone number to receive funds
 * @param amount The amount to withdraw
 * @returns The withdrawal record
 */
export async function requestWithdrawal(
    userId: string,
    phoneNumber: string,
    amount: number
): Promise<{ data: Withdrawal | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        if (amount <= 0) {
            throw new Error('Amount must be positive')
        }

        const { data: withdrawalId, error: rpcError } = await supabaseClient.schema(targetSchema)
            .rpc('request_withdrawal', {
                p_user_id: userId,
                p_phone_number: phoneNumber,
                p_amount: amount,
            })
            .single()

        if (rpcError) throw rpcError
        if (!withdrawalId) throw new Error('RPC request_withdrawal did not return an ID');


        // Get the full withdrawal record
        const { data: withdrawal, error: fetchError } = await supabaseClient.schema(targetSchema)
            .from('withdrawals')
            .select('*')
            .eq('id', withdrawalId)
            .single()

        if (fetchError) throw fetchError;

        return { data: withdrawal as Withdrawal, error: null } // Cast needed
    } catch (error) {
        console.error('requestWithdrawal error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to request withdrawal') }
    }
}

/**
 * Processes an investment from user's balance
 * @param userId The user ID making the investment
 * @param investmentId The investment record ID
 * @param amount The amount to invest
 */
export async function processInvestment(
    userId: string,
    investmentId: string,
    amount: number
): Promise<{ error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        if (amount <= 0) {
            throw new Error('Amount must be positive')
        }

        const { error } = await supabaseClient.schema(targetSchema).rpc('process_investment', {
            p_user_id: userId,
            p_investment_id: investmentId,
            p_amount: amount,
        })

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('processInvestment error:', error);
        return { error: error instanceof Error ? error : new Error('Failed to process investment') }
    }
}

/**
 * Processes an interest payment to user's balance
 * @param userId The user ID receiving interest
 * @param investmentId The related investment ID
 * @param amount The interest amount
 */
export async function processInterestPayment(
    userId: string,
    investmentId: string,
    amount: number
): Promise<{ error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        if (amount <= 0) {
            throw new Error('Amount must be positive')
        }

        const { error } = await supabaseClient.schema(targetSchema).rpc('process_interest_payment', {
            p_user_id: userId,
            p_investment_id: investmentId,
            p_amount: amount,
        })

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('processInterestPayment error:', error);
        return { error: error instanceof Error ? error : new Error('Failed to process interest payment') }
    }
}

/**
 * Completes a withdrawal with M-Pesa reference
 * @param withdrawalId The withdrawal ID to complete
 * @param mpesaReference The M-Pesa transaction reference
 */
export async function completeWithdrawal(
    withdrawalId: string,
    mpesaReference: string
): Promise<{ error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { error } = await supabaseClient.schema(targetSchema).rpc('complete_withdrawal', {
            p_withdrawal_id: withdrawalId,
            p_mpesa_reference: mpesaReference,
        })

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('completeWithdrawal error:', error);
        return { error: error instanceof Error ? error : new Error('Failed to complete withdrawal') }
    }
}

/**
 * Refunds a failed withdrawal back to user's balance
 * @param withdrawalId The withdrawal ID to refund
 */
export async function refundWithdrawal(withdrawalId: string): Promise<{ error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { error } = await supabaseClient.schema(targetSchema).rpc('refund_withdrawal', {
            p_withdrawal_id: withdrawalId,
        })

        if (error) throw error

        return { error: null }
    } catch (error) {
        console.error('refundWithdrawal error:', error);
        return { error: error instanceof Error ? error : new Error('Failed to refund withdrawal') }
    }
}

// --- Query Functions ---

/**
 * Gets a user's current balance
 * @param userId The user ID
 * @returns The balance record
 */
export async function getBalance(userId: string): Promise<{ data: Balance | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { data, error } = await supabaseClient.schema(targetSchema)
            .schema('app_transactions') // Schema usage remains the same
            .from('balances')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) throw error

        return { data: data as Balance, error: null } // Cast needed
    } catch (error) {
        console.error('getBalance error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to get balance') }
    }
}

/**
 * Gets a user's transaction history
 * @param userId The user ID
 * @param limit Number of transactions to return
 * @returns Array of transactions
 */
export async function getTransactionHistory(
    userId: string,
    limit = 100
): Promise<{ data: Transaction[] | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { data, error } = await supabaseClient.schema(targetSchema)
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return { data: data as Transaction[], error: null } // Cast needed
    } catch (error) {
        console.error('getTransactionHistory error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to get transaction history') }
    }
}

/**
 * Gets a user's deposit history
 * @param userId The user ID
 * @param limit Number of deposits to return
 * @returns Array of deposits
 */
export async function getDepositHistory(
    userId: string,
    limit = 100
): Promise<{ data: Deposit[] | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { data, error } = await supabaseClient.schema(targetSchema)
            .from('deposits')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return { data: data as Deposit[], error: null } // Cast needed
    } catch (error) {
        console.error('getDepositHistory error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to get deposit history') }
    }
}

/**
 * Gets a user's withdrawal history
 * @param userId The user ID
 * @param limit Number of withdrawals to return
 * @returns Array of withdrawals
 */
export async function getWithdrawalHistory(
    userId: string,
    limit = 100
): Promise<{ data: Withdrawal[] | null; error: Error | null }> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { data, error } = await supabaseClient.schema(targetSchema)
            .from('withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error

        return { data: data as Withdrawal[], error: null } // Cast needed
    } catch (error) {
        console.error('getWithdrawalHistory error:', error);
        return { data: null, error: error instanceof Error ? error : new Error('Failed to get withdrawal history') }
    }
}

/**
 * Gets detailed transaction history with references
 * @param userId The user ID
 * @param limit Number of transactions to return
 * @returns Array of enriched transactions
 */
export async function getDetailedTransactionHistory(
    userId: string,
    limit = 100
): Promise<{
    data: Array<{
        transaction: Transaction
        deposit?: Deposit
        withdrawal?: Withdrawal
        investment?: any // You should define a proper type for investments
    }> | null
    error: Error | null
}> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        // First get transactions
        const { data: transactions, error: txError } = await getTransactionHistory(userId, limit)
        if (txError) throw txError
        if (!transactions) return { data: [], error: null }

        // Get all related references
        const depositIds = transactions
            .filter(t => t.type === 'deposit' && t.reference_id)
            .map(t => t.reference_id)
        const withdrawalIds = transactions
            .filter(t => t.type === 'withdrawal' && t.reference_id)
            .map(t => t.reference_id)
        const investmentIds = transactions
            .filter(t => t.type === 'investment' && t.reference_id)
            .map(t => t.reference_id)

        // Fetch related records in parallel
        const [
            { data: deposits },
            { data: withdrawals },
            { data: investments },
        ] = await Promise.all([
            depositIds.length > 0
                ? supabaseClient.schema(targetSchema).from('deposits').select('*').in('id', depositIds)
                : { data: null },
            withdrawalIds.length > 0
                ? supabaseClient.schema(targetSchema).from('withdrawals').select('*').in('id', withdrawalIds)
                : { data: null },
            investmentIds.length > 0
                ? supabaseClient.schema(targetSchema).from('investments').select('*').in('id', investmentIds)
                : { data: null },
        ])

        // Combine the data
        const enrichedTransactions = transactions.map(transaction => {
            let deposit, withdrawal, investment

            if (transaction.type === 'deposit' && transaction.reference_id) {
                deposit = deposits?.find(d => d.id === transaction.reference_id)
            } else if (transaction.type === 'withdrawal' && transaction.reference_id) {
                withdrawal = withdrawals?.find(w => w.id === transaction.reference_id)
            } else if (transaction.type === 'investment' && transaction.reference_id) {
                investment = investments?.find(i => i.id === transaction.reference_id)
            }

            return {
                transaction,
                deposit,
                withdrawal,
                investment,
            }
        })

        return { data: enrichedTransactions, error: null }
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Failed to get detailed transaction history'),
        }
    }
}


/**
 * Gets a user's 5 most recent transactions with basic information
 * @param userId The user ID
 * @returns Array of simplified transaction objects
*/
export async function getRecentTransactions(
    userId: string
): Promise<{
    data: Array<{
        id: string
        type: TransactionType
        amount: number
        balance_after: number
        created_at: string
        description?: string
    }> | null
    error: Error | null
}> {
    const supabaseClient = await ensureSupabaseInitialized();
    try {
        const { data, error } = await supabaseClient.schema(targetSchema)
            .from('transactions')
            .select(`
                id,
                type,
                amount,
                balance_after,
                created_at,
                description
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5)

        if (error) throw error

        // Ensure data conforms to the expected return type structure
        const resultData = data.map(tx => ({
            id: tx.id,
            type: tx.type as TransactionType, // Cast if necessary
            amount: tx.amount,
            balance_after: tx.balance_after,
            created_at: tx.created_at,
            description: tx.description
        }));

        return { data: resultData, error: null };

    } catch (error) {
        console.error('getRecentTransactions error:', error);
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Failed to get recent transactions')
        }
    }
}
