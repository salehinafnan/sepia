import { Heart, Pencil, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import {
  toastError,
  useDeletePostMutation,
  useSetLikedMutation,
} from "../../../api";
import { API_URL } from "../../../config";
import { timeAgo } from "../../../lib/time";
import { toast } from "../../../lib/toast";
import { selectUser } from "../../../store/auth";
import { openComposer } from "../../../store/composer";
import Avatar from "../../ui/Avatar";
import Button, { IconButton } from "../../ui/Button";
import Dialog, { panelClass } from "../../ui/Dialog";

const LONG_MESSAGE = 220;

const Post = ({ post, priority = false }) => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [setLiked, { isLoading: liking }] = useSetLikedMutation();
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();
  const [dialog, setDialog] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const deleteTitleId = useId();

  const isAuthor = user?._id === post.creator;
  const liked = Boolean(user && post.likes.includes(user._id));
  const imageUrl = post.image && !imageFailed ? API_URL + post.image : null;
  const tags = post.tags.map((tag) => tag.trim()).filter(Boolean);
  const closeDialog = () => setDialog(null);

  const toggleLike = () => {
    if (!user) return navigate("/auth");
    if (!liking)
      setLiked({ id: post._id, liked: !liked, userId: user._id })
        .unwrap()
        .catch(toastError);
  };

  const remove = async () => {
    try {
      await deletePost(post._id).unwrap();
      toast("Post deleted");
    } catch (error) {
      toastError(error);
      closeDialog();
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200 transition-shadow hover:shadow-xl hover:shadow-stone-900/5 dark:bg-stone-900 dark:ring-stone-800 dark:hover:shadow-black/30">
      {imageUrl && (
        <button
          type="button"
          onClick={() => setDialog("image")}
          aria-label={`View image for ${post.title}`}
          className="block aspect-4/3 overflow-hidden bg-stone-100 outline-offset-[-2px] focus-visible:outline-2 focus-visible:outline-sepia-500 dark:bg-stone-800"
        >
          <img
            src={imageUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <header className="flex items-center gap-3">
          <Avatar name={post.name} />
          <div className="min-w-0 text-sm leading-tight">
            <p className="truncate font-medium">{post.name}</p>
            <time
              dateTime={post.createdAt}
              title={new Date(post.createdAt).toLocaleString()}
              className="text-stone-500 dark:text-stone-400"
            >
              {timeAgo(post.createdAt)}
            </time>
          </div>
        </header>

        <div>
          <h2 className="text-lg leading-snug font-semibold tracking-tight text-balance break-words">
            {post.title}
          </h2>
          {post.message && (
            <p
              className={`mt-1.5 text-sm/relaxed break-words whitespace-pre-line text-stone-600 dark:text-stone-300 ${expanded ? "" : "line-clamp-4"}`}
            >
              {post.message}
            </p>
          )}
          {post.message?.length > LONG_MESSAGE && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1 text-sm font-medium text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-sepia-50 px-2.5 py-0.5 text-xs font-medium text-sepia-700 dark:bg-sepia-950 dark:text-sepia-300"
              >
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <footer className="-mx-2 mt-auto flex items-center justify-between">
          <button
            type="button"
            onClick={toggleLike}
            aria-pressed={liked}
            title={user ? undefined : "Sign in to like posts"}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-stone-500 tabular-nums transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sepia-500 active:scale-95 dark:text-stone-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <Heart
              size={18}
              aria-hidden="true"
              className={liked ? "fill-rose-500 text-rose-500" : ""}
            />
            <span className="sr-only">Like</span>
            {post.likes.length > 0 && post.likes.length}
          </button>

          {isAuthor && (
            <div className="flex gap-0.5">
              <IconButton
                label="Edit post"
                onClick={() => dispatch(openComposer(post))}
              >
                <Pencil size={16} />
              </IconButton>
              <IconButton
                label="Delete post"
                onClick={() => setDialog("delete")}
                className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
              >
                <Trash2 size={16} />
              </IconButton>
            </div>
          )}
        </footer>
      </div>

      {dialog === "image" && (
        <Dialog onClose={closeDialog} aria-label={post.title}>
          <div className="relative">
            <img
              src={imageUrl}
              alt={post.title}
              onClick={closeDialog}
              className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] rounded-xl object-contain"
            />
            <IconButton
              label="Close"
              onClick={closeDialog}
              className="absolute top-3 right-3 bg-stone-950/50 text-white backdrop-blur hover:bg-stone-950/70 hover:text-white dark:text-white"
            >
              <X size={18} />
            </IconButton>
          </div>
        </Dialog>
      )}

      {dialog === "delete" && (
        <Dialog
          onClose={closeDialog}
          aria-labelledby={deleteTitleId}
          className={`${panelClass} max-w-sm`}
        >
          <div className="p-6">
            <h2
              id={deleteTitleId}
              className="text-lg font-semibold tracking-tight"
            >
              Delete this post?
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              “{post.title}” will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={closeDialog}>
                Cancel
              </Button>
              <Button variant="danger" loading={deleting} onClick={remove}>
                Delete
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </article>
  );
};

export default Post;
