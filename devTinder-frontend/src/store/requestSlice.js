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

// Accepts or rejects a received connection request, used by the Accept/
// Reject buttons on the requests page.
export const acknowledgeRequest = createAsyncThunk(
  "requests/acknowledge",
  async ({ status, requestId }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/request/receive/${status}/${requestId}`);
      return { status, requestId, data: res.data };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update request."
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
      })
      .addCase(acknowledgeRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter(
          (r) => r._id !== action.payload.requestId
        );
      });
  },
});

export default requestSlice.reducer;
