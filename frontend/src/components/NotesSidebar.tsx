import { useState } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  InputBase,
  Menu,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
  Typography,
  Tooltip,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { styled, alpha } from "@mui/material/styles";
import type { Note } from "../api/notesApi";
import ShareNoteModal from "./ShareNoteModal";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  flex: 1,
  marginRight: theme.spacing(1),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: "100%",
  },
}));

interface NotesSidebarProps {
  notes: Note[];
  selectedNote: Note | null;
  onNoteSelect: (note: Note) => void;
  sx?: any;
  handleDeleteNote: (noteId: string) => void;
  handleShareNote: (
    noteId: string,
    usernames: string[],
    errorCallback: (error: boolean) => void,
  ) => void;
}

const NotesSidebar = ({
  notes,
  selectedNote,
  onNoteSelect,
  sx,
  handleDeleteNote,
  handleShareNote,
}: NotesSidebarProps) => {
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [noteToShare, setNoteToShare] = useState<Note | null>(null);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleTagFilterChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  };

  const allTags = Array.from(
    new Set([
      ...notes.flatMap((note) => note.tags),
      ...(notes.some((note) => note.sharedNote) ? ["shared with me"] : []),
    ]),
  );

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.body.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => {
        if (tag === "shared with me") {
          return note.sharedNote;
        }
        return note.tags.includes(tag);
      });

    return matchesSearch && matchesTags;
  });

  const handleShareClick = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    setNoteToShare(note);
    setShareModalOpen(true);
  };

  const handleDeleteClick = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    handleDeleteNote(note.id);
  };

  const handleDownloadClick = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    const content = `Title: ${note.title}\n\nTags: ${note.tags.join(", ")}\n\nBody:\n${note.body}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.grey[100],
          borderRight: "1px solid",
          borderColor: "divider",
          ...sx,
        }}
      >
        {/* Search and filter bar */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search notes..."
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Search>

            <IconButton
              size="small"
              onClick={handleFilterClick}
              color={selectedTags.length > 0 ? "primary" : "default"}
              disabled={allTags.length === 0}
            >
              <FilterListIcon />
            </IconButton>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <MenuItem disabled>Filter by Tags</MenuItem>
              <Divider />
              <Box sx={{ px: 2, py: 1 }}>
                <FormGroup>
                  {allTags.map((tag) => (
                    <FormControlLabel
                      key={tag}
                      control={
                        <Checkbox
                          checked={selectedTags.includes(tag)}
                          onChange={() => handleTagFilterChange(tag)}
                          size="small"
                        />
                      }
                      label={tag}
                    />
                  ))}
                </FormGroup>
              </Box>
            </Menu>
          </Box>
        </Box>
        <Divider />

        {/* Notes list */}
        <List sx={{ width: "100%", pt: 0 }}>
          {filteredNotes.map((note) => (
            <ListItemButton
              key={note.id}
              selected={selectedNote?.id === note.id}
              onMouseEnter={() => setHoveredNoteId(note.id)}
              onMouseLeave={() => setHoveredNoteId(null)}
              onClick={() => onNoteSelect(note)}
              sx={{
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                "&.Mui-selected": {
                  backgroundColor: "#E0E0E0",
                  "&:hover": {
                    backgroundColor: "#E0E0E0",
                  },
                },
              }}
            >
              <Box sx={{ width: "100%" }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {note.title}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(note.dateCreated)}
                    </Typography>
                  }
                />
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    mt: 1,
                    flexWrap: "wrap",
                  }}
                >
                  {(note.sharedNote
                    ? [...note.tags, "shared with me"]
                    : note.tags
                  ).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        backgroundColor: (theme) => theme.palette.primary.light,
                        color: (theme) => theme.palette.primary.contrastText,
                      }}
                    />
                  ))}
                </Box>
              </Box>
              {(hoveredNoteId === note.id || selectedNote?.id === note.id) && (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Share Note">
                    <IconButton
                      size="small"
                      onClick={(e) => handleShareClick(note, e)}
                    >
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Note">
                    <IconButton
                      size="small"
                      onClick={(e) => handleDownloadClick(note, e)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Note">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => handleDeleteClick(note, e)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      <ShareNoteModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        note={noteToShare}
        handleShareNote={handleShareNote}
      />
    </>
  );
};

export default NotesSidebar;
