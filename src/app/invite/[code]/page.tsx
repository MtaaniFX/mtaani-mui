import type { Metadata } from "next";
import { AppName } from "@/const";
import InvitePage from "./Main";
import theme from "@/theme";
import { ThemeProvider } from "@mui/material/styles";

export const metadata: Metadata = {
    title: `Invites | ${AppName}`,
    description: "Your first steps in making an investment that counts",
};

type PageProps = {
    params: Promise<{ code: string }>,
}

export default async function ({ params }: PageProps) {
    const { code } = await params;
    console.log('invite code:', code);

    return (
        <ThemeProvider theme={theme}>
            <InvitePage code={code} />
        </ThemeProvider>
    )
}
