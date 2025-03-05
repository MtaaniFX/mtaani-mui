import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
// import PersonIcon from '@mui/icons-material/Person';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LinearProgress from '@mui/material/LinearProgress'
import type { Navigation } from '@toolpad/core/AppProvider';

// import theme from '@/theme';
import {rawTheme} from '@/theme';
// import { FaviconRow } from '@/components/internal/icons/Favicon';
import { paths } from '@/lib/paths';
import { AppName } from '@/const';

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
  // {
  //   segment: paths.dashboard.orders,
  //   title: 'Investments',
  //   icon: <ShoppingCartIcon />,
  // },
  // {
  //   kind: 'header',
  //   title: 'User',
  // },
  // {
  //   segment: paths.dashboard.profile,
  //   title: 'Profile',
  //   icon: <PersonIcon />,
  // },
];

const BRANDING = {
  title: AppName,
  // logo: <FaviconRow/>,
  homeUrl: '/',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const theme = rawTheme;
  return (
      <main data-toolpad-color-scheme="dark">
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <React.Suspense fallback={<LinearProgress />}>
            <NextAppProvider
              navigation={NAVIGATION}
              branding={BRANDING}
              theme={theme}
            >
              {props.children}
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
