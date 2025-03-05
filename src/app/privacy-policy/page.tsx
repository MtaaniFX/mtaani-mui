import type { Metadata } from "next";
import { AppName, Terms } from "@/const";
import { DefaultMUItheme } from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import Box from "@mui/material/Box";
import ReactMarkdown from "react-markdown";

export const metadata: Metadata = {
    title: `Privacy Policy | ${AppName}`,
    description: "Your first steps in making an investment that counts",
};

export default function () {
    return (
        <ThemeProvider theme={DefaultMUItheme}>
            <Box sx={{ p: 2 }}>
                <ReactMarkdown>
                    {Terms}
                </ReactMarkdown>
            </Box>
        </ThemeProvider>
    )
}
