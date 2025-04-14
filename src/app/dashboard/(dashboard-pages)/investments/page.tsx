import type { Metadata } from "next";
import { AppName, AppDescription } from "@/const";
import Main from "./Main";
import { Container, Typography, Card} from "@mui/material";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
    title: `Investments | ${AppName}`,
    description: AppDescription,
};

export default function () {
    return (
        <Container>
            <Box sx={{my: 2}}></Box>
            <Card variant="outlined" sx={{p: 3}}>
                <Box>
                    <Typography variantf="h5">Your Investments</Typography>
                    <Main />
                </Box>
            </Card>
        </Container>
    )
}
