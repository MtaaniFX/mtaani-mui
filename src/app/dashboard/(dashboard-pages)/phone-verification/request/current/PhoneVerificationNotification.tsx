"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Alert,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { paths } from "@/lib/paths";

export interface PhoneVerificationNotificationProps {
  verificationCode: string;
  companyNumber: string;
}

const PhoneVerificationNotification: React.FC<PhoneVerificationNotificationProps> = ({
  verificationCode,
  companyNumber,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isCodeCopied, setIsCodeCopied] = useState(false);
  const [isNumberCopied, setIsNumberCopied] = useState(false);

  const handleCopy = async (textToCopy: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 3000); // Reset the state after 3 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // TODO: space the code into parts of three, that is, 
  // given `123456` then it returns `123 456`
  function spacing(s: string) {
    // const steps = 3;
    // const array: string[] = [];
    // let lastIndex = 0;
    // for (let i = steps-1; i < s.length; i += steps) {
    //   array.push(s.substring(lastIndex, i + 1));
    //   lastIndex = i;
    // }
    // return (
    //   <>
    //     {array.map((numString, index) =>
    //       index === array.length - 1 ? numString : numString + " ")
    //     }
    //   </>
    // )
    return s
  }

  return (
    <Box padding={2}>
          <Stack spacing={2}>
            {/* Title */}
            <Typography variant="h5">
              Phone Verification 
            </Typography>

            {/* Body Text */}
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              Your phone verification request has been received.<br />
              To complete your verification:
            </Typography>

            <Typography fontWeight="600" gutterBottom>
              SMS the code
            </Typography>

            {/* Verification Code Section */}
            <Box
              sx={{
                border: `2px dashed ${theme.palette.primary.main}`,
                borderRadius: 2,
                padding: 2,
                textAlign: "center",
                width: "100%",
                bgcolor: theme.palette.action.hover,
                maxWidth: "300px",
                margin: "16px auto",
                position: "relative",
              }}
            >
              {/* 6-digit code */}
              <Typography
                variant="h4"
                fontWeight="bold"
                color={theme.palette.primary.main}
                sx={{ marginBottom: 1 }}
              >
                {spacing(verificationCode)}
              </Typography>
              {/* Copy button */}
              <Tooltip title={isCodeCopied ? "Copied!" : "Copy Code"}>
                <IconButton
                  color="primary"
                  aria-label="Copy verification code"
                  onClick={() => handleCopy(verificationCode, setIsCodeCopied)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Alert severity="info" sx={{maxWidth: 'fit-content'}}>
              Your verification code will expire in{" "}<strong>30 minutes</strong>.
            </Alert>

            {/* Company's Number Section (stylized and copyable) */}
            <Typography fontWeight="bold" gutterBottom>
              To the number
            </Typography>
            <Box
              sx={{
                textAlign: "center",
                padding: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                bgcolor: theme.palette.background.paper,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "300px",
                margin: "16px auto",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: "bold",
                  // border: `2px solid ${theme.palette.success.light}`,
                  paddingX: 2,
                  paddingY: 0.5,
                  borderRadius: "8px",
                  display: "inline-block",
                  fontFamily: "monospace",
                }}
              >
                {companyNumber}
              </Typography>
              {/* Copy button */}
              <Tooltip title={isNumberCopied ? "Copied!" : "Copy Number"}>
                <IconButton
                  color="success"
                  aria-label="Copy company number"
                  sx={{ marginTop: 1 }}
                  onClick={() => handleCopy(companyNumber, setIsNumberCopied)}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Alert severity="info"  sx={{maxWidth: 'fit-content'}}>
              Send the code from your registered phone number
            </Alert>

            {/* Action/CTA */}
            <Button
                href={"/" + paths.dashboard.profile}
                variant="contained"
                size="large"
                color="primary"
                sx={{maxWidth: 'fit-content'}}
              >
                Got It!
              </Button>
          </Stack>
    </Box>
  );
};

export default PhoneVerificationNotification;
