import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
} from "@mui/material";
import { Note } from "../api/notesApi";
import { useState, useEffect } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useIsMobile } from "../hooks/useIsMobile";

interface ShareNoteModalProps {
  open: boolean;
  onClose: () => void;
  note: Note | null;
  handleShareNote: (
    noteId: string,
    usernames: string[],
    errorCallback: (error: boolean) => void,
  ) => void;
}

const ShareNoteModal = ({
  open,
  onClose,
  note,
  handleShareNote,
}: ShareNoteModalProps) => {
  const isMobile = useIsMobile();
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [usernames, setUsernames] = useState<string[]>([]);
  const [initialUsernames, setInitialUsernames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (note?.sharedWith) {
      const initial = note.sharedWith.map((user) => user.username);
      setUsernames(initial);
      setInitialUsernames(initial);
    }
    setError(null);
  }, [note, open]);

  const handleAddUsername = () => {
    if (usernameInput.trim() && !usernames.includes(usernameInput.trim())) {
      setUsernames([...usernames, usernameInput.trim()]);
      setUsernameInput("");
      setError(null);
    }
  };

  const handleRemoveUsername = (usernameToRemove: string) => {
    setUsernames(usernames.filter((username) => username !== usernameToRemove));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!note) return;

    setIsLoading(true);
    handleShareNote(note.id, usernames, (error: boolean) => {
      if (error) {
        setError("Failed to share note");
      } else {
        handleClose();
      }
      setIsLoading(false);
    });
  };

  const handleClose = () => {
    setUsernames([]);
    setInitialUsernames([]);
    setError(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="share-note-modal">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "90%" : 400,
          maxWidth: "100%",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          borderRadius: 1,
          maxHeight: isMobile ? "90vh" : "auto",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Share Note
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            fullWidth
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            placeholder="Enter username"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddUsername();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleAddUsername}
                  disabled={!usernameInput.trim()}
                  edge="end"
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />
        </Box>

        <List>
          {usernames.map((username) => (
            <ListItem
              key={username}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveUsername(username)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={username} />
            </ListItem>
          ))}
        </List>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mt: 2,
          }}
        >
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              isLoading ||
              JSON.stringify(usernames) === JSON.stringify(initialUsernames)
            }
          >
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ShareNoteModal;
