import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetches the feed of people the logged-in user hasn't connected/requested
// with yet, used to populate the home page carousel.
export const fetchFeed = createAsyncThunk(
  "feed/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/feed");
      return res.data?.loggedInUserFeed || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load feed."
      );
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: "",
};

const feedSlice = createSlice({
  name: "feed",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default feedSlice.reducer;
