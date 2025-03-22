'use client';

import {
    Box,
    Typography,
    Button,
    useTheme,
    useMediaQuery
} from '@mui/material';
import Image from 'next/image';

const Hero: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                // padding: isMobile ? "2rem 1rem" : "4rem 6rem",
            }}
        >
            {/* Left Section: Text and Button */}
            <Box
                sx={{
                    maxWidth: isMobile ? "100%" : "50%",
                    // textAlign: isMobile ? "center" : "left",
                    textAlign: "left",
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: "bold",
                        marginBottom: "1rem",
                    }}
                >
                    You refer, we reward
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.secondary,
                        marginBottom: "2rem",
                    }}
                >
                    Teach a friend how to invest with us, <br/>
                    you both receive a 5% bonus of their first deposit
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                        },
                    }}
                    onClick={(e) => {
                        const target = document.getElementById('cab-target');
                        if(target) {
                            target.scrollIntoView({behavior: "smooth", block: 'start'});
                        }
                    }}
                >
                    Get Started
                </Button>
            </Box>

            {/* Right Section: Image */}
            <Box
                sx={{
                    maxWidth: isMobile ? "100%" : "50%",
                    textAlign: "center",
                }}
            >
                <Image
                    src="/res/referrals/hero-img.png"
                    alt="Illustration"
                    width={500}
                    height={400}
                    style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "8px",
                    }}
                    priority
                />
            </Box>
        </Box>
    );
};

export default Hero;
