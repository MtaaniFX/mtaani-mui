import type { Metadata } from "next";
import { AppName, AppDescription } from "@/const";
import Main from "./Main";
import { Container, Typography } from "@mui/material";

export const metadata: Metadata = {
    title: `Investments | ${AppName}`,
    description: AppDescription,
};

export default function () {
    return (
        <Container>
            <Typography variant="h5" sx={{my: 2}}>Your Investments</Typography>
            <Main />
        </Container>
    )
}
