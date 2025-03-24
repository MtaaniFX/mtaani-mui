import type { Metadata } from "next";
import { AppName } from "@/const";
import Main from "./Main"
import { DefaultMUItheme } from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Cookies from "js-cookie";

export const metadata: Metadata = {
    title: `Sign Up | ${AppName}`,
    description: "Your first steps in making an investment that counts",
};

export default function () {
    let code = Cookies.get('inviteCode');
    if(!code) {
        code = '';
    }
    
    return (
        <ThemeProvider theme={DefaultMUItheme}>
            <Box sx={{p: 2}}>
                 <Main inviteCode={code} />
            </Box>
        </ThemeProvider>
    )
}
