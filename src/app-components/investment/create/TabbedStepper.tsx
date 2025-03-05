import { Box, Card, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

type Props = {
    children?: ReactNode,
    steps: number,
    activeStep: number
}

function TabbedStepper({ children, steps, activeStep }: Props) {
    return (
        <>
            <Card variant="elevation" elevation={2}>
                <Stack direction="row" spacing={2}>
                    {Array.from({ length: steps }, (_, index) => index).map((_, index) => {
                        return (
                            <Box sx={[
                                {
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '1em',
                                },

                                index !== activeStep ? {
                                    borderRadius: '50%',
                                    backgroundColor: 'red',
                                } : null,
                            ]} key={index}>
                                <Typography>{index + 1}</Typography>
                            </Box>
                        )
                    })}

                </Stack>
                {children}
            </Card>
        </>
    );
}

export default TabbedStepper;
