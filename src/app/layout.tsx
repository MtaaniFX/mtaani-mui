import * as React from 'react';

export default function (props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {props.children}
      </body>
    </html>
  );
}
