import * as React from 'react';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import type { Metadata } from 'next';
import { AppName } from '@/const';
// import { PageContainer } from '@toolpad/core/PageContainer';


export const metadata: Metadata = {
  title: `Dashboard | ${AppName}`,
  description: "Take charge of your investments",
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {/* <PageContainer>{props.children}</PageContainer> */}
      {props.children}
    </DashboardLayout>
  );
}  
