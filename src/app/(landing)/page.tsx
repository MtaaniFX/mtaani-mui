"use client";

import React from "react";
// import {ShootingStars} from "@/components/ui/shooting-stars";
// import {StarsBackground} from "@/components/ui/stars-background";
import AppTheme from "@/components/internal/shared-theme/AppTheme";
import CssBaseline from "@mui/material/CssBaseline";
import AppAppBar from "@/components/internal/mui-template/components/AppAppBar";
import Hero from "@/components/internal/ui/Hero";
// import ServiceFeatures from "@/components/internal/landing-page/ServiceFeatures";
import Features from "@/components/internal/landing-page/Features";
import Testimonials from "@/components/internal/landing-page/Testimonials";
import Pricing from "@/components/internal/landing-page/Pricing";
import FAQ from "@/components/internal/landing-page/FAQ";
import Footer from "@/components/internal/landing-page/Footer";
import LandingPageBackground from "@/components/internal/landing-page/LandingPageBackground";

function LandingPage() {
    return (
        <AppTheme>
            <CssBaseline enableColorScheme />
            <LandingPageBackground>
                <AppAppBar/>
                <Hero/>
                <div id={"go-features"}>
                    <Features/>
                </div>

                <div id={"go-testimonials"}>
                    <Testimonials/>
                </div>

                <div id={"go-pricing"}>
                    <Pricing/>
                </div>

                <div id={"go-faq"}>
                    <FAQ/>
                </div>

                <div id={"go-footer"}>
                    <Footer/>
                </div>
            </LandingPageBackground>
        </AppTheme>
    );
}

export default LandingPage;
