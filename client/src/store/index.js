import { configureStore } from "@reduxjs/toolkit";

import { api } from "../api";
import auth, { saveSession } from "./auth";
import composer from "./composer";

export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer, auth, composer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

let session = store.getState().auth;
store.subscribe(() => {
  const next = store.getState().auth;
  if (next !== session) saveSession((session = next));
});
