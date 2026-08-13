import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Fetches the connection requests received by the logged-in user that are
// still pending (status "interested"), used to populate the requests page.
export const fetchReceivedRequests = createAsyncThunk(
  "requests/fetchReceived",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/receivedRequest");
      return res.data?.data || [];
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load requests."
      );
    }
  }
);

const initialState = {
  requests: [],
  loading: false,
  error: "",
};

const requestSlice = createSlice({
  name: "requests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default requestSlice.reducer;
