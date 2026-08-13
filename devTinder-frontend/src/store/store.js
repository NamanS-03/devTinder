import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    feed: feedReducer,
    requests: requestReducer,
  },
});

export default store;
