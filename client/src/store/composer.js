import { createSlice } from "@reduxjs/toolkit";

import { signedOut } from "./auth";

const closed = { open: false, post: null };

const composerSlice = createSlice({
  name: "composer",
  initialState: closed,
  reducers: {
    // Pass a post to edit it, or nothing to write a new one.
    openComposer: (_state, { payload }) => ({
      open: true,
      post: payload ?? null,
    }),
    closeComposer: () => closed,
  },
  extraReducers: (builder) => builder.addCase(signedOut, () => closed),
});

export const { openComposer, closeComposer } = composerSlice.actions;
export default composerSlice.reducer;
