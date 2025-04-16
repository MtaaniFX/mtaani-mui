'use client'

import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import LinearProgress from '@mui/material/LinearProgress'

// import theme from '@/theme';
import { rawTheme } from '@/theme';
import { AppBarFavicon } from '@/components/internal/icons/Favicon';
import { paths } from '@/lib/paths';
import DashboardIcon from '@mui/icons-material/Dashboard';
import type { Navigation, Session } from '@toolpad/core/AppProvider';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { FullScreenOverlay } from '@/app-components/loaders/loaders';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleIcon from '@mui/icons-material/People';
import SavingsIcon from '@mui/icons-material/Savings';


const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Quick Start',
  },
  {
    segment: paths.dashboard.overview,
    title: 'Overview',
    icon: <DashboardIcon />,
  },
  {
    segment: paths.dashboard.newInvestment,
    title: 'Invest',
    icon: <SavingsIcon />,
  },

  {
    kind: 'header',
    title: 'User',
  },

  {
    segment: paths.dashboard.investments,
    title: 'Investments',
    icon: <AccountBalanceIcon />,
  },
  {
    segment: paths.dashboard.profile,
    title: 'Profile',
    icon: <PersonIcon />,
  },

  {
    kind: 'header',
    title: 'Activity',
  },
  {
    segment: paths.dashboard.transactions,
    title: 'Transactions',
    icon: <ReceiptLongIcon />,
  },
  {
    segment: paths.dashboard.deposits,
    title: 'Deposits',
    icon: <AccountBalanceWalletIcon />,
  },
  {
    segment: paths.dashboard.withdrawals,
    title: 'Withdrawals',
    icon: <PaymentsIcon />,
  },

  {
    kind: 'header',
    title: 'Marketing',
  },
  {
    segment: paths.dashboard.referrals,
    title: 'Referrals',
    icon: <PeopleIcon />,
  },
];

const BRANDING = {
  title: "",
  logo: <AppBarFavicon />,
  homeUrl: '/',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const theme = rawTheme;

  const supabase = createClient();
  const router = useRouter();

  const [logoutOverlayOpen, setLogoutOverlayOpen] = React.useState(false);
  const [session, setSession] = React.useState<Session | null>({
    user: {
      name: 'Guest',
      email: 'guest',
      image: '/user-x-avatar.png',
    },
  });

  React.useEffect(() => {
    async function update() {
      const { data } = await supabase.auth.getUser();
      if (!data) {
        return;
      }

      const name = data.user?.user_metadata?.full_name || "";
      const phone = data.user?.phone || "";

      setSession({
        user: {
          name: name,
          email: phone,
          image: '/user-x-avatar.png',
        },
      });
    }
    update();
  }, []);

  const authentication = React.useMemo(() => {
    return {
      signIn: async () => {
        setSession({
          user: {
            name: 'Loading...',
            email: '',
            image: '/user-x-avatar.png',
          },
        });
      },
      signOut: async () => {
        setLogoutOverlayOpen(true);
        await supabase.auth.signOut();
        router.push("/");
        setSession(null);
      },
    };
  }, []);

  return (
    <main data-toolpad-color-scheme="dark">
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <React.Suspense fallback={<LinearProgress />}>
          <NextAppProvider
            navigation={NAVIGATION}
            branding={BRANDING}
            theme={theme}
            session={session}
            authentication={authentication}
          >
            {props.children}
            <FullScreenOverlay
              open={logoutOverlayOpen}
              message="Logging out..." />
          </NextAppProvider>
        </React.Suspense>
      </AppRouterCacheProvider>
    </main>
  );
}

// export default function RootLayout(props: { children: React.ReactNode }) {
//   const theme = rawTheme;
//   return (
//     <html lang="en" data-toolpad-color-scheme="dark" suppressHydrationWarning>
//       <body>
//         <AppRouterCacheProvider options={{ enableCssLayer: true }}>
//           <React.Suspense fallback={<LinearProgress />}>
//             <NextAppProvider
//               navigation={NAVIGATION}
//               branding={BRANDING}
//               theme={theme}
//             >
//               {props.children}
//             </NextAppProvider>
//           </React.Suspense>
//         </AppRouterCacheProvider>
//       </body>
//     </html>
//   );
// }
