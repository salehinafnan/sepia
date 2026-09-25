import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useGetPostsInfiniteQuery } from "../../api";
import { selectUser } from "../../store/auth";
import { openComposer } from "../../store/composer";
import Button, { ButtonLink } from "../ui/Button";
import Spinner from "../ui/Spinner";
import Post from "./Post/Post";

const grid = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

const Notice = ({ title, children, action }) => (
  <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-stone-700">
    <h2 className="font-semibold">{title}</h2>
    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
      {children}
    </p>
    <div className="mt-6">{action}</div>
  </div>
);

const Skeleton = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div aria-busy="true">
      <p
        role="status"
        className="mb-6 text-sm text-stone-500 dark:text-stone-400"
      >
        {slow ? (
          "Waking up the server. The first visit in a while can take up to a minute."
        ) : (
          <span className="sr-only">Loading posts</span>
        )}
      </p>
      <div className={grid}>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800"
          >
            <div className="aspect-4/3 bg-stone-100 dark:bg-stone-800" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-4 w-2/3 rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-3 w-full rounded-full bg-stone-100 dark:bg-stone-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Posts = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useGetPostsInfiniteQuery();
  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  const sentinel = useRef(null);

  // Load the next page before the reader reaches the end.
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isFetchNextPageError) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && fetchNextPage(),
      { rootMargin: "800px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  if (isLoading) return <Skeleton />;

  if (isError && !posts.length)
    return (
      <Notice
        title="Couldn't load posts"
        action={
          <Button variant="secondary" onClick={refetch}>
            Try again
          </Button>
        }
      >
        Check your connection and try again.
      </Notice>
    );

  if (!posts.length)
    return (
      <Notice
        title="No posts yet"
        action={
          user ? (
            <Button onClick={() => dispatch(openComposer())}>
              Create a post
            </Button>
          ) : (
            <ButtonLink to="/auth">Sign in to post</ButtonLink>
          )
        }
      >
        Be the first to share a moment.
      </Notice>
    );

  return (
    <>
      <div className={grid}>
        {posts.map((post, index) => (
          <Post key={post._id} post={post} priority={index < 3} />
        ))}
      </div>
      <div ref={sentinel} className="flex justify-center py-10">
        {isFetchingNextPage && <Spinner className="size-6 text-stone-400" />}
        {isFetchNextPageError && (
          <Button variant="secondary" onClick={() => fetchNextPage()}>
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

export default Posts;
