import type { Metadata } from "next";
import { AppName } from "@/const";
import Main from "./Main"
import { DefaultMUItheme } from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: `Sign Up | ${AppName}`,
    description: "Your first steps in making an investment that counts",
};

export default async function () {
    let cookieStore = await cookies();
    const code = cookieStore.get('inviteCode');
    const inviteCode = code?.value || "";

    return (
        <ThemeProvider theme={DefaultMUItheme}>
            <Box sx={{p: 2}}>
                 <Main inviteCode={inviteCode} />
            </Box>
        </ThemeProvider>
    )
}
