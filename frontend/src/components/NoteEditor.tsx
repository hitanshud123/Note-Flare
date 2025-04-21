import { Box, TextField, Typography, Button, IconButton } from "@mui/material";
import type { Note } from "../api/notesApi";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

interface NoteEditorProps {
  note: Note | null;
  onNoteChange: (note: Note, retry?: boolean) => void;
  saveStatus?: "saved" | "saving" | "error";
  activeCollaborators: boolean;
}

const NoteEditor = ({
  note,
  onNoteChange,
  saveStatus,
  activeCollaborators,
}: NoteEditorProps) => {
  if (!note) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography p={2} variant="body2" color="text.secondary">
          Select a note to start editing
        </Typography>
      </Box>
    );
  }

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value.trim();

    if (e.key === "Enter" && value.length > 0) {
      (e.target as HTMLInputElement).value = "";
      if (note.tags?.includes(value)) {
        return;
      }
      const updatedTags = [...(note.tags || []), value];
      onNoteChange({ ...note, tags: updatedTags });
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "816px",
          position: "relative",
        }}
      >
        {/* Active collaborators indicator */}
        {activeCollaborators && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                bgcolor: "green",
                borderRadius: "50%",
              }}
            />
            <Typography variant="body2" color="text.primary">
              Active Collaborators
            </Typography>
          </Box>
        )}

        {/* Title */}
        <TextField
          fullWidth
          variant="standard"
          value={note.title}
          onChange={(e) => onNoteChange({ ...note, title: e.target.value })}
          sx={{
            mb: 2,
            mt: 1,
            "& .MuiInputBase-input": {
              fontSize: "1.25rem",
              fontWeight: 500,
            },
          }}
        />

        {/* Tags */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 1,
          }}
        >
          {note.tags?.map((tag, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: "action.selected",
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {tag}
                <IconButton
                  size="small"
                  onClick={() => {
                    const updatedTags = note.tags?.filter(
                      (_, i) => i !== index,
                    );
                    onNoteChange({
                      ...note,
                      tags: updatedTags,
                    });
                  }}
                  sx={{
                    padding: 0,
                    marginLeft: 0.5,
                  }}
                >
                  <CloseIcon
                    fontSize="inherit"
                    style={{ fontSize: "0.875rem" }}
                  />
                </IconButton>
              </Typography>
            </Box>
          ))}
          <TextField
            variant="standard"
            placeholder="Add tags (press enter to add)"
            onKeyDown={handleTagInput}
            sx={{
              flex: 1,
              minWidth: "120px",
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                color: "text.secondary",
              },
            }}
          />
        </Box>
        {saveStatus === "saving" && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Saving...
            </Typography>
          </Box>
        )}
        {saveStatus === "error" && (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <IconButton
              size="small"
              onClick={() => onNoteChange(note, true)}
              color="error"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="error">
              Error saving note
            </Typography>
          </Box>
        )}
        {saveStatus === "saved" && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="success">
              Note saved
            </Typography>
          </Box>
        )}

        {/* Body */}
        <TextField
          fullWidth
          multiline
          minRows={20}
          maxRows={20}
          value={note.body}
          onChange={(e) => onNoteChange({ ...note, body: e.target.value })}
          sx={{
            "& .MuiInputBase-input": {
              fontSize: "1rem",
              lineHeight: 1.5,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default NoteEditor;
