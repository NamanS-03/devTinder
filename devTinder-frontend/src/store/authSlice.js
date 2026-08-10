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

const initialState = {
  user: null,
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
      });
  },
});

export const { clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;
