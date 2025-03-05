'use client';

import { createTheme } from '@mui/material/styles';
import { inputsCustomizations } from '@/theme/customizations/inputs';
import { dataDisplayCustomizations } from '@/theme/customizations/dataDisplay';
import { feedbackCustomizations } from '@/theme/customizations/feedback';
import { navigationCustomizations } from '@/theme/customizations/navigation';
import { surfacesCustomizations } from '@/theme/customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from '@/theme/themePrimitives';
import { Roboto } from 'next/font/google';

export const data = {
  // For more details about CSS variables configuration, 
  // see https://mui.com/material-ui/customization/css-theme-variables/configuration/
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'template',
  },
  // Recently added in v6 for building light & dark mode app, 
  // see https://mui.com/material-ui/customization/palette/#color-schemes
  colorSchemes, 
  typography,
  shadows,
  shape,
  components: {
    ...inputsCustomizations,
    ...dataDisplayCustomizations,
    ...feedbackCustomizations,
    ...navigationCustomizations,
    ...surfacesCustomizations,
  },
};

const theme = createTheme(data);
export const DefaultMUItheme = createTheme({
  // For more details about CSS variables configuration, 
  // see https://mui.com/material-ui/customization/css-theme-variables/configuration/
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
    cssVarPrefix: 'template',
  },});
export default theme;

export const rawTheme = createTheme();
// export const rawTheme = createTheme({
//   cssVariables: {
//     colorSchemeSelector: 'data-toolpad-color-scheme',
//   },
//   colorSchemes: { light: true, dark: true },
//   breakpoints: {
//     values: {
//       xs: 0,
//       sm: 600,
//       md: 600,
//       lg: 1200,
//       xl: 1536,
//     },
//   },
// });

/* Old theme */
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const oldTheme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#60a5fa',
              },
            },
          ],
        },
      },
    },
  },
});

