import React from "react";
import { Box, Typography } from "@mui/material";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box component="header" sx={{ p: 3 }}>
        <Box
          sx={{
            maxWidth: "md",
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/logo.png"
            alt="Note Flare Logo"
            style={{
              width: "64px",
              height: "64px",
              objectFit: "contain",
              marginBottom: "10px",
            }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Note Flare
          </Typography>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          p: 3,
          textAlign: "center",
        }}
      ></Box>
    </Box>
  );
};

export default AuthLayout;
