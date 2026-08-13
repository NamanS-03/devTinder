import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";
import connectionReducer from "./connectionSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    feed: feedReducer,
    requests: requestReducer,
    connections: connectionReducer,
  },
});

export default store;
