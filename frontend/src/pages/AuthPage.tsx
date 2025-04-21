import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";

const AuthPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const { handleLogin, handleSignup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await handleLogin(username, password);
      } else {
        await handleSignup(username, password);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("An error occurred during authentication");
    }
  };

  return (
    <AuthLayout>
      <Card sx={{ width: "100%", maxWidth: "400px" }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              {isLogin ? "Welcome back" : "Create an account"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isLogin
                ? "Enter your username and password to login"
                : "Enter your username and password to sign up"}
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ textAlign: "center" }}
                >
                  {error}
                </Typography>
              )}
              <TextField
                fullWidth
                type="username"
                label="Username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsername(e.target.value)
                }
                required
              />

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                required
                InputProps={{
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                {isLogin ? "Login" : "Sign up"}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <Link
                  to={isLogin ? "/signup" : "/login"}
                  style={{
                    color: "#1976d2",
                    textDecoration: "none",
                  }}
                  onClick={() => {
                    setUsername("");
                    setPassword("");
                    setError("");
                  }}
                >
                  {isLogin ? "Sign up" : "Login"}
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default AuthPage;
