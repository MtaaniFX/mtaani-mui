export const dashboard = 'dashboard'
export const paths = {
    home: '/',
    auth: {
        signIn: '/sign-in',
        signUp: '/sign-up',
        resetPassword: '/reset-password',
        updatePassword: '/u/0/update-password'
    },
    dashboard: {
        root: dashboard,
        overview: dashboard,
        account: `${dashboard}/account`,
        customers: `${dashboard}/customers`,
        integrations: `${dashboard}/integrations`,
        settings: `${dashboard}/settings`,
        orders: `${dashboard}/orders`,
        profile: `${dashboard}/profile`,
        referrals: `${dashboard}/referrals`,
        transactions: `${dashboard}/transactions`,
        withdrawals: `${dashboard}/withdrawals`,
        deposits: `${dashboard}/deposits`,
        investments: `${dashboard}/investments`,
        newInvestment: `${dashboard}/investments/new`,
    },
} as const;

export const locations = {
    home: '/',
    auth: {
        signIn: '/sign-in',
        signUp: '/sign-up',
        resetPassword: '/reset-password',
        updatePassword: '/u/0/update-password'
    },

    dashboard: {
        root: `/${paths.dashboard.root}`,
        overview: `/${paths.dashboard.overview}`,
        account: `/${paths.dashboard.account}`,
        customers: `/${paths.dashboard.customers}`,
        integrations: `/${paths.dashboard.integrations}`,
        settings: `/${paths.dashboard.settings}`,
        orders: `/${paths.dashboard.orders}`,
        profile: `/${paths.dashboard.profile}`,
        referrals: `/${paths.dashboard.referrals}`,
        transactions: `/${paths.dashboard.transactions}`,
        withdrawals: `/${paths.dashboard.withdrawals}`,
        deposits: `/${paths.dashboard.deposits}`,
        investments: `/${paths.dashboard.investments}`,
        newInvestment: `/${paths.dashboard.newInvestment}`,
    },
} as const;
