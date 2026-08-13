import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetches the logged-in user's accepted connections, used to populate the
// connections page.
export const fetchMyConnections = createAsyncThunk(
  "connections/fetchMy",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/myConnections");
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load connections."
      );
    }
  }
);

const initialState = {
  connections: [],
  loading: false,
  error: "",
};

const connectionSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyConnections.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchMyConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchMyConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default connectionSlice.reducer;
