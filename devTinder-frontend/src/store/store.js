import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import uiReducer from "./uiSlice";
import feedReducer from "./feedSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    feed: feedReducer,
  },
});

export default store;
