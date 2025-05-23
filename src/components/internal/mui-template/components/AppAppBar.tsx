import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Drawer from '@mui/material/Drawer';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import { FaviconRow } from "@/components/internal/icons/Favicon";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
    backdropFilter: 'blur(24px)',
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: alpha(theme.palette.background.default, 0.4),
    boxShadow: theme.shadows[1],
    padding: '8px 12px',
}));

// Create a styled <a> component with no default agent styles
const CustomLink = styled('a')({
    textDecoration: 'none', // Remove underline
    color: 'inherit',       // Inherit text color from parent
    cursor: 'pointer',      // Ensure the cursor is a pointer
    ':focus': {
        // remove outline when the link is focused
        outline: 'none',
    },
});

export default function AppAppBar() {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen: boolean) => () => {
        setOpen(newOpen);
    };

    return (
        <AppBar
            position="fixed"
            enableColorOnDark
            sx={{
                boxShadow: 0,
                bgcolor: 'transparent',
                backgroundImage: 'none',
                mt: 'calc(var(--template-frame-height, 0px) + 28px)',
            }}
        >
            <Container maxWidth="lg">
                <StyledToolbar variant="dense" disableGutters>
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
                        {/*Some margin before the Favicon*/}
                        <Box sx={{ ml: 1 }} />
                        <FaviconRow />
                        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                            <Button href={"/#go-features"} variant="text" color="info" size="small">
                                Features
                            </Button>
                            <Button href={"/#go-testimonials"} variant="text" color="info" size="small">
                                Testimonials
                            </Button>
                            <Button href={"/#go-pricing"} variant="text" color="info" size="small">
                                Pricing
                            </Button>
                            <Button href={"/#go-faq"} variant="text" color="info" size="small" sx={{ minWidth: 0 }}>
                                FAQ
                            </Button>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: 1,
                            alignItems: 'center',
                        }}
                    >
                        <Button href={"/sign-in"} color="primary" variant="text" size="small">
                            Sign in
                        </Button>
                        <Button href={"/sign-up"} color="primary" variant="contained" size="small">
                            Sign up
                        </Button>
                        <ColorModeIconDropdown />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1 }}>
                        <ColorModeIconDropdown size="medium" />
                        <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor="top"
                            open={open}
                            onClose={toggleDrawer(false)}
                            PaperProps={{
                                sx: {
                                    top: 'var(--template-frame-height, 0px)',
                                },
                            }}
                        >
                            <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <IconButton onClick={toggleDrawer(false)}>
                                        <CloseRoundedIcon />
                                    </IconButton>
                                </Box>

                                <CustomLink href={"/#go-features"}>
                                    <MenuItem>Features</MenuItem>
                                </CustomLink>

                                <CustomLink href={"/#go-testimonials"}>
                                    <MenuItem>Testimonials</MenuItem>
                                </CustomLink>

                                <CustomLink href={"/#go-pricing"}>
                                    <MenuItem>Pricing</MenuItem>
                                </CustomLink>

                                <CustomLink href={"/#go-faq"}>
                                    <MenuItem>FAQ</MenuItem>
                                </CustomLink>
                                <Divider sx={{ my: 3 }} />
                                <MenuItem>
                                    <Button href={"/sign-up"} color="primary" variant="contained" fullWidth>
                                        Sign up
                                    </Button>
                                </MenuItem>
                                <MenuItem>
                                    <Button href={"/sign-in"} color="primary" variant="outlined" fullWidth>
                                        Sign in
                                    </Button>
                                </MenuItem>
                            </Box>
                        </Drawer>
                    </Box>
                </StyledToolbar>
            </Container>
        </AppBar>
    );
}
