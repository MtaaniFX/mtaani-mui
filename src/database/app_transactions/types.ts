export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'interest' | 'refund'

export interface Transaction {
    id: string
    user_id: string
    amount: number
    balance_before: number
    balance_after: number
    type: TransactionType
    reference_id?: string
    description?: string
    created_at: string
}

export interface Deposit {
    id: string
    phone_number: string
    mpesa_reference: string
    amount: number
    user_id?: string
    status: 'created' | 'claimed' | 'failed'
    created_at: string
    updated_at: string
    claimed_at?: string
}

export interface Withdrawal {
    id: string
    user_id: string
    phone_number: string
    amount: number
    mpesa_reference?: string
    status: 'requested' | 'processing' | 'completed' | 'failed'
    created_at: string
    updated_at: string
    completed_at?: string
}

export interface Balance {
    user_id: string
    amount: number
    created_at: string
    updated_at: string
}

export type Investment = any;
