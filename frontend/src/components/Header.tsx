import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../contexts/AuthContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onCreateNote?: () => void;
  onBackToList?: () => void;
  showBackButton?: boolean;
}

const Header = ({
  onCreateNote,
  onBackToList,
  showBackButton = false,
}: HeaderProps) => {
  const { handleLogout } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        backgroundColor: (theme) => theme.palette.primary.main,
      }}
    >
      <Toolbar>
        {showBackButton ? (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back to list"
            onClick={onBackToList}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <img
            src="/logo.png"
            alt="Note Flare Logo"
            style={{
              width: "48px",
              height: "48px",
              objectFit: "contain",
              marginRight: "5px",
              marginBottom: "5px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          />
        )}

        <Typography
          variant="h5"
          noWrap
          sx={{
            flexGrow: 1,
            fontWeight: "bold",
          }}
        >
          Note Flare
        </Typography>

        <Button
          color="inherit"
          onClick={onCreateNote}
          startIcon={<NoteAddIcon sx={{ marginBottom: "1px" }} />}
        >
          <Typography variant="button" noWrap>
            New Note
          </Typography>
        </Button>

        <IconButton color="inherit" edge="end" onClick={handleLogout}>
          <LogoutIcon sx={{ marginBottom: "1px" }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
