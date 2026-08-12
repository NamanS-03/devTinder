import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Shared request helper: hits the given endpoint and normalizes errors so
// every auth thunk doesn't have to repeat its own try/catch.
const authRequest = async (url, payload, { rejectWithValue }) => {
  try {
    const res = await api.post(url, payload);
    return res.data;
  } catch (err) {
    return rejectWithValue(
      err?.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const loginUser = createAsyncThunk(
  "auth/login",
  ({ email, password }, thunkAPI) =>
    authRequest("/login", { email, password }, thunkAPI)
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  ({ firstName, lastName, email, password }, thunkAPI) =>
    authRequest("/signup", { firstName, lastName, email, password }, thunkAPI)
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  (_, thunkAPI) => authRequest("/logout", {}, thunkAPI)
);

// Fetches the logged-in user's profile, used to hydrate the navbar avatar
// (and other user-dependent UI) on app load / route change.
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/profile/view");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load profile."
      );
    }
  }
);

const initialState = {
  user: null,
  // Tracks whether we've already attempted a profile fetch (success or
  // failure) so components don't keep re-requesting /profile/view on every
  // remount/re-render while there's no session - e.g. right after logout.
  profileChecked: false,
  loginLoading: false,
  loginError: "",
  signupLoading: false,
  signupError: "",
  signupSuccess: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages: (state) => {
      state.loginError = "";
      state.signupError = "";
      state.signupSuccess = "";
    },
    // Lets other parts of the app (e.g. the profile edit form) sync the
    // logged-in user in the store immediately after an update, without
    // waiting on a refetch.
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = "";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload?.data || null;
        state.profileChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
      })
      .addCase(signupUser.pending, (state) => {
        state.signupLoading = true;
        state.signupError = "";
        state.signupSuccess = "";
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.signupLoading = false;
        state.signupSuccess = action.payload?.message || "Signed up successfully!";
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.signupLoading = false;
        state.signupError = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        // We know for certain there's no session now - skip re-fetching
        // until something (e.g. a new login) says otherwise.
        state.profileChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if the request fails, clear local user state so the UI
        // reflects a logged-out session.
        state.user = null;
        state.profileChecked = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.user = action.payload?.data || null;
        state.profileChecked = true;
      })
      .addCase(fetchUserProfile.rejected, (state) => {
        state.user = null;
        state.profileChecked = true;
      });
  },
});

export const { clearAuthMessages, setUser } = authSlice.actions;
export default authSlice.reducer;
