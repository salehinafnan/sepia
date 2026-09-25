import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { API_URL } from "../config";
import { toast } from "../lib/toast";
import { signedIn, signedOut } from "../store/auth";

const fetchWithToken = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth?.token;
    // The feed is public; leaving the header off spares it a CORS preflight.
    if (token && endpoint !== "getPosts")
      headers.set("Authorization", `Bearer ${token}`);
  },
});

const baseQuery = async (args, api, extraOptions) => {
  const result = await fetchWithToken(args, api, extraOptions);
  if (result.error?.status === 401 && api.getState().auth) {
    api.dispatch(signedOut());
    toast("Your session expired, please sign in again");
  }
  return result;
};

export const errorMessage = (error) =>
  error?.data?.message ??
  "Something went wrong. Check your connection and try again.";

// Signed-out sessions are already reported by baseQuery.
export const toastError = (error) => {
  if (error?.status !== 401) toast(errorMessage(error));
};

const startSession = async (_arg, { dispatch, queryFulfilled }) => {
  try {
    const { data } = await queryFulfilled;
    dispatch(signedIn(data));
  } catch {
    // Shown by the sign-in form.
  }
};

const updateFeed = (recipe) =>
  api.util.updateQueryData("getPosts", undefined, (feed) => {
    recipe(feed.pages);
  });

const updateFeedPost = (id, recipe) =>
  updateFeed((pages) => {
    const post = pages.flatMap((page) => page.posts).find((p) => p._id === id);
    if (post) recipe(post);
  });

export const api = createApi({
  baseQuery,
  endpoints: (build) => ({
    getPosts: build.infiniteQuery({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ pageParam }) =>
        pageParam ? `/posts?cursor=${pageParam}` : "/posts",
    }),
    createPost: build.mutation({
      query: (post) => ({ url: "/posts", method: "POST", body: post }),
      async onQueryStarted(_post, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(updateFeed((pages) => pages[0]?.posts.unshift(data)));
        } catch {
          // Shown by the composer.
        }
      },
    }),
    updatePost: build.mutation({
      query: ({ id, ...post }) => ({
        url: `/posts/${id}`,
        method: "PATCH",
        body: post,
      }),
      async onQueryStarted(_post, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            updateFeedPost(data._id, (post) => Object.assign(post, data)),
          );
        } catch {
          // Shown by the composer.
        }
      },
    }),
    deletePost: build.mutation({
      query: (id) => ({ url: `/posts/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            updateFeed((pages) => {
              for (const page of pages)
                page.posts = page.posts.filter((post) => post._id !== id);
            }),
          );
        } catch {
          // Shown by the post.
        }
      },
    }),
    setLiked: build.mutation({
      query: ({ id, liked }) => ({
        url: `/posts/${id}/like`,
        method: liked ? "PUT" : "DELETE",
      }),
      // Optimistic: the heart flips at once and settles on the server's answer.
      async onQueryStarted(
        { id, liked, userId },
        { dispatch, queryFulfilled },
      ) {
        const optimistic = dispatch(
          updateFeedPost(id, (post) => {
            post.likes = liked
              ? [...post.likes, userId]
              : post.likes.filter((like) => like !== userId);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(updateFeedPost(id, (post) => (post.likes = data.likes)));
        } catch {
          optimistic.undo();
        }
      },
    }),
    signIn: build.mutation({
      query: (credentials) => ({
        url: "/user/signin",
        method: "POST",
        body: credentials,
      }),
      onQueryStarted: startSession,
    }),
    signUp: build.mutation({
      query: (details) => ({
        url: "/user/signup",
        method: "POST",
        body: details,
      }),
      onQueryStarted: startSession,
    }),
    googleSignIn: build.mutation({
      query: (credential) => ({
        url: "/user/google",
        method: "POST",
        body: { credential },
      }),
      onQueryStarted: startSession,
    }),
  }),
});

export const {
  useGetPostsInfiniteQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSetLikedMutation,
  useSignInMutation,
  useSignUpMutation,
  useGoogleSignInMutation,
} = api;
