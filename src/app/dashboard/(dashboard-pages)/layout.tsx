import * as React from 'react';
import type { Metadata } from 'next';
import { AppName } from '@/const';
// import { PageContainer } from '@toolpad/core/PageContainer';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

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
