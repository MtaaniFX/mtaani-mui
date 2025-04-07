import Overview from "./overview/Overview";
import { createClient, createServiceRoleClient } from "@/utils/supabase/server";
import { Transaction } from "./overview/TransactionsOverview";
import { isPhoneVerified } from "@/database/supabase";
import * as Transactions from '@/database/app_transactions/transactions';
import * as Investments from '@/database/app_investments/investments';
import { numberOrDefault } from "@/js-utils/convert";

export default async function () {
    const { date, count } = getDaysUntilFifth();
    console.log('date: ', date);

    const supabase = await createClient();
    const data = await supabase.auth.getUser();

    if (data.error) {
        console.error('[error] failed to get user: are you authenticated??');
        return <></>;
    }
    console.log('found user:', data.data.user.id);

    // Get the user's balance
    const user = data.data.user;
    const { data: balance, error } = await Transactions.getBalance(user.id);
    if (error) {
        console.error('[error] getting user balance');
        console.error('....... failed to get user balance:', error);
        return <></>;
    }

    console.log('[ok] getting user balance');

    const initialTransactions: Transaction[] = await fetchTransactions();
    const isVerified = await isPhoneVerified(supabase);

    let totalInvestment = 0;
    await (async function () {
        let dbTotalInvestment = await Investments.getTotalInvestmentAmount(user.id);
        totalInvestment = numberOrDefault(dbTotalInvestment || "", 0);
    })();

    return (
        <Overview
            accountBalance={balance?.amount || 0}
            // TODO: fetch actual referral earnings data
            referralEarnings={0}
            isVerified={isVerified}
            daysToWithdrawal={count}
            withdrawalDate={date}
            initialTransactions={initialTransactions}
            fetchTransactions={fetchTransactions}
            totalInvestment={totalInvestment} />
    )
}

async function fetchTransactions(): Promise<Transaction[]> {
    "use server"

    const supabase = await createClient();
    const response = await supabase.auth.getUser();

    if (response.error || !response.data) {
        console.log('failed to get user: are you authenticated??');
        return [];
    }

    const user = response.data.user;

    console.log('>>> fetching recent transactions for user with ID:', user.id);
    const { data, error } = await Transactions.getRecentTransactions(user.id);
    if (error || !data) {
        console.log('error fetching recent transactions for user with ID:', user.id);
        return [];
    }

    return data.map((value, idx) => {
        const tx: any = {};
        tx.amount = value.amount;
        tx.currency = 'KES';
        tx.id = idx.toString();
        tx.type = value.type;
        return tx as Transaction;
    });
}

function getDaysUntilFifth(): { date: Date, count: number } {
    // Create date object with Nairobi timezone (GMT+3)
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" }));

    // Get current day
    const currentDay = date.getDate();

    // If it's the 5th, return 0
    if (currentDay === 5) {
        return { count: 0, date: date };
    }

    // Get the last day of current month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    date.setDate(5);
    // Calculate days remaining
    if (currentDay < 5) {
        // If we're before the 5th, just subtract from 5
        return { count: 5 - currentDay, date: date };
    } else {
        // If we're after the 5th, calculate days until 5th of next month
        const nextMonth = date.getMonth() + 1;
        date.setMonth(nextMonth <= 11 ? nextMonth : nextMonth - 12)
        return { count: (lastDay - currentDay) + 5, date: date };
    }
}

type NumericValue = number | { amount: number };

/**
 * Calculates the sum of numbers in an array, where the array can contain either numbers directly or objects with an `amount` property.
 *
 * // Example usage:
// const numbers: number[] = [1, 2, 3, 4, 5];
// const objects: { amount: number }[] = [{ amount: 10 }, { amount: 20 }, { amount: 30 }];
// const mixed: NumericValue[] = [1, { amount: 5 }, 10, { amount: 15 }];

// console.log("Sum of numbers:", sumNumericValues(numbers)); // Output: Sum of numbers: 15
// console.log("Sum of objects:", sumNumericValues(objects)); // Output: Sum of objects: 60
// console.log("Sum of mixed:", sumNumericValues(mixed));   // Output: Sum of mixed: 31
 * @param {NumericValue[]} values An array of numbers or objects with an `amount` property.
 * @returns {number} The sum of all numeric values in the array.
 */
function sumNumericValues(values: NumericValue[]): number {
    let sum = 0;

    for (const value of values) {
        if (typeof value === 'number') {
            sum += value;
        } else {
            sum += value.amount;
        }
    }

    return sum;
}
