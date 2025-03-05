import type { Metadata } from "next";
import  RootLayout from "@/app/root-layout";
import { AppName } from "@/const";

export const metadata: Metadata = {
    title: `Welcome | ${AppName}`,
    description: "Invest in your future",
};

export default RootLayout;
