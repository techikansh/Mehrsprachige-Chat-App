import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  prefferedLanguage: string | null;
  avatar: string | null;
  status: string | null;
  lastSeen: Date | null;
  contacts: any[];

  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: null,
  firstName: null,
  lastName: null,
  email: null,
  prefferedLanguage: null,
  avatar: null,
  status: null,
  lastSeen: null,
  contacts: [],
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: string;
        email: string;
        token: string;
        firstName?: string;
        lastName?: string;
        prefferedLanguage?: string;
        avatar?: string;
        status?: string;
        lastSeen?: Date;
        contacts?: any[];
      }>
    ) => {
      state.id = action.payload.id;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      if (action.payload.firstName) state.firstName = action.payload.firstName;
      if (action.payload.lastName) state.lastName = action.payload.lastName;
      if (action.payload.prefferedLanguage)
        state.prefferedLanguage = action.payload.prefferedLanguage;
      if (action.payload.avatar) state.avatar = action.payload.avatar;
      if (action.payload.status) state.status = action.payload.status;
      if (action.payload.lastSeen) state.lastSeen = action.payload.lastSeen;
      if (action.payload.contacts) state.contacts = action.payload.contacts;

      localStorage.setItem("token", action.payload.token);
    },
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.firstName = null;
      state.lastName = null;
      state.prefferedLanguage = null;
      state.avatar = null;
      state.status = null;
      state.lastSeen = null;
      state.contacts = [];
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
