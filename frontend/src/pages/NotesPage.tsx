import { useState, useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { useIsMobile } from "../hooks/useIsMobile";
import Header from "../components/Header";
import NotesSidebar from "../components/NotesSidebar";
import NoteEditor from "../components/NoteEditor";
import { useAuth } from "../contexts/AuthContext";
import {
  Note,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
} from "../api/notesApi";

const NotesPage = () => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [activeCollaborators, setActiveCollaborators] =
    useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const isMobile = useIsMobile();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { notes, sharedNotes } = await fetchNotes();

        const allNotes = [
          ...notes.map((note: Note) => ({
            ...note,
            sharedNote: false,
          })),
          ...sharedNotes.map((note: Note) => ({
            ...note,
            sharedNote: true,
          })),
        ].sort(
          (a, b) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime(),
        );

        setNotes(allNotes);
        if (allNotes.length > 0) {
          setSelectedNote(allNotes[0]);
          setSelectedNoteId(allNotes[0].id);
        } else {
          setSelectedNote(null);
          setSelectedNoteId(null);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (wsTimeoutRef.current) {
        clearTimeout(wsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedNote && user) {
      const ws = new WebSocket(
        `${process.env.REACT_APP_WS_URL}?noteId=${selectedNoteId}&userId=${user.id}`,
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection opened");
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "collaborators") {
            setActiveCollaborators(message.otherCollaborators === true);
          } else if (message.type === "update") {
            if (selectedNoteId === message.noteId) {
              const updatedNote = {
                ...selectedNote,
                body: message.text,
                title: message.title,
                tags: message.tags,
              };
              setNotes(
                notes.map((note) =>
                  note.id === message.noteId ? updatedNote : note,
                ),
              );
              setSelectedNote(updatedNote);
            }
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      return () => {
        setActiveCollaborators(false);
        ws.close();
      };
    }
  }, [selectedNoteId, user]);

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setSelectedNoteId(note.id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = {
        title: "Untitled Note",
        body: "",
        tags: [],
      };

      const createdNote = await createNote(newNote);

      setNotes([createdNote, ...notes]);
      handleNoteSelect(createdNote);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
      if (updatedNotes.length > 0) {
        setSelectedNote(updatedNotes[0]);
        setSelectedNoteId(updatedNotes[0].id);
      } else {
        setSelectedNote(null);
        setSelectedNoteId(null);
      }
      if (isMobile) {
        setShowSidebar(true);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleShareNote = async (
    noteId: string,
    usernames: string[],
    errorCallback: (error: boolean) => void,
  ) => {
    try {
      const sharedNote = await shareNote(noteId, usernames);
      setNotes(
        notes.map((note) =>
          note.id === noteId
            ? { ...note, sharedWith: sharedNote.sharedWith }
            : note,
        ),
      );
      errorCallback(false);
    } catch (error) {
      errorCallback(true);
      console.error("Error sharing note:", error);
    }
  };

  const handleBackToSidebar = () => {
    if (isMobile) {
      setShowSidebar(true);
    }
  };

  const handleNoteChange = async (
    updatedNote: Note,
    retry: boolean = false,
  ) => {
    setNotes(
      notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
    );
    setSelectedNote(updatedNote);

    if (activeCollaborators) {
      if (wsTimeoutRef.current) {
        clearTimeout(wsTimeoutRef.current);
      }

      wsTimeoutRef.current = setTimeout(() => {
        const change = {
          type: "update",
          noteId: updatedNote.id,
          title: updatedNote.title,
          tags: updatedNote.tags,
          position: 0,
          text: updatedNote.body,
          timestamp: Date.now(),
        };
        try {
          if (wsRef.current) {
            wsRef.current.send(JSON.stringify(change));
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }, 50);
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus("saving");

    saveTimeoutRef.current = setTimeout(
      async () => {
        try {
          await updateNote(updatedNote.id, updatedNote);
          setSaveStatus("saved");
        } catch (error) {
          console.error("Error saving note:", error);
          setSaveStatus("error");
        }
      },
      retry ? 0 : 1000,
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Header
        onCreateNote={handleCreateNote}
        onBackToList={handleBackToSidebar}
        showBackButton={isMobile && !showSidebar}
      />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {(!isMobile || showSidebar) && (
          <NotesSidebar
            notes={notes}
            selectedNote={selectedNote}
            onNoteSelect={handleNoteSelect}
            handleDeleteNote={handleDeleteNote}
            handleShareNote={handleShareNote}
            sx={{
              width: isMobile ? "100%" : 400,
              maxWidth: isMobile ? "100%" : "40%",
              flexShrink: 0,
              height: "100%",
              overflow: "auto",
            }}
          />
        )}

        {(!isMobile || !showSidebar) && (
          <Box
            sx={{
              flex: 1,
              width: "100%",
              overflow: "auto",
            }}
          >
            <NoteEditor
              note={selectedNote}
              onNoteChange={handleNoteChange}
              saveStatus={saveStatus}
              activeCollaborators={activeCollaborators}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default NotesPage;
