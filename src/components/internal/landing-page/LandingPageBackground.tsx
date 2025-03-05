import { useTheme } from "@mui/material/styles";
import { ReactNode } from "react";

export default function LandingPageBackground({ children }: { children?: ReactNode }) {
    const theme = useTheme();
    return (
        <div style={{
            backgroundColor: theme.palette.background.default,
            width: '100%',
            height: '100%'
        }}>
            {children}
        </div>
    );
}
