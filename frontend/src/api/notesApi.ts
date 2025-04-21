import axiosInstance from "./axiosInstance";

export interface Note {
  id: string;
  title: string;
  body: string;
  dateCreated: Date;
  tags: string[];
  sharedNote?: boolean;
  sharedWith?: {
    id: number;
    username: string;
  }[];
}

interface NotesResponse {
  notes: Note[];
  sharedNotes: Note[];
}

type NoteResponse = Note;

export const fetchNotes = async (): Promise<NotesResponse> => {
  const response = await axiosInstance.get<NotesResponse>("/api/notes");
  return response.data;
};

export const createNote = async (
  newNote: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await axiosInstance.post<NoteResponse>("/api/notes", newNote);
  return response.data;
};

export const updateNote = async (
  noteId: string,
  updatedNote: Partial<Note>,
): Promise<NoteResponse> => {
  const response = await axiosInstance.put<NoteResponse>(
    `/api/notes/${noteId}`,
    updatedNote,
  );

  return response.data;
};

export const deleteNote = async (noteId: string): Promise<void> => {
  await axiosInstance.delete(`/api/notes/${noteId}`);
};

export const shareNote = async (
  noteId: string,
  usernames: string[],
): Promise<NoteResponse> => {
  const response = await axiosInstance.post<NoteResponse>(
    `/api/notes/${noteId}/share`,
    { usernames },
  );
  return response.data;
};
