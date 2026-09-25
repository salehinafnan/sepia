import { ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  errorMessage,
  useCreatePostMutation,
  useUpdatePostMutation,
} from "../../api";
import { API_URL } from "../../config";
import { prepareImage } from "../../lib/image";
import { toast } from "../../lib/toast";
import { selectUser } from "../../store/auth";
import { closeComposer } from "../../store/composer";
import Button, { IconButton } from "../ui/Button";
import Dialog, { panelClass } from "../ui/Dialog";
import Field, { inputClass } from "../ui/Field";
import Spinner from "../ui/Spinner";

const parseTags = (value) =>
  [
    ...new Set(
      value
        .split(/[\s,]+/)
        .map((tag) => tag.replace(/^#+/, ""))
        .filter(Boolean),
    ),
  ].slice(0, 10);

const Composer = ({ post, onClose }) => {
  const [image, setImage] = useState(
    post?.image ? { preview: API_URL + post.image } : null,
  );
  const [preparingImage, setPreparingImage] = useState(false);
  const [error, setError] = useState(null);
  const [createPost, { isLoading: creating }] = useCreatePostMutation();
  const [updatePost, { isLoading: updating }] = useUpdatePostMutation();
  const titleId = useId();

  const pickImage = async (file) => {
    if (!file) return;
    setError(null);
    setPreparingImage(true);
    try {
      const dataUrl = await prepareImage(file);
      setImage({ preview: dataUrl, dataUrl });
    } catch (err) {
      setError(err.message);
    }
    setPreparingImage(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      title: form.get("title"),
      message: form.get("message"),
      tags: parseTags(form.get("tags")),
      // A new data URL replaces the image, null removes it and undefined keeps it.
      selectedFile: image ? image.dataUrl : null,
    };

    const request = post
      ? updatePost({ id: post._id, ...values })
      : createPost(values);
    try {
      await request.unwrap();
    } catch (err) {
      return setError(errorMessage(err));
    }
    toast(post ? "Post updated" : "Post shared");
    onClose();
  };

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby={titleId}
      className={`${panelClass} max-w-lg`}
    >
      <form onSubmit={submit}>
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {post ? "Edit post" : "New post"}
          </h2>
          <IconButton label="Close" onClick={onClose} className="-mr-2">
            <X size={18} />
          </IconButton>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                pickImage(event.dataTransfer.files[0]);
              }}
              className="relative flex aspect-16/10 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 text-center text-sm text-stone-500 transition-colors outline-offset-2 hover:bg-stone-100 has-focus-visible:outline-2 has-focus-visible:outline-sepia-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-400 dark:hover:bg-stone-900"
            >
              {image ? (
                <img
                  src={image.preview}
                  alt="Selected"
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <>
                  <ImagePlus size={24} aria-hidden="true" className="mb-1" />
                  <span className="font-medium text-stone-700 dark:text-stone-200">
                    Add a photo
                  </span>
                  <span className="text-xs">
                    Drop an image here or click to browse
                  </span>
                </>
              )}
              {preparingImage && (
                <span className="absolute inset-0 grid place-items-center bg-white/70 dark:bg-stone-950/70">
                  <Spinner />
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  pickImage(event.target.files[0]);
                  event.target.value = "";
                }}
              />
            </label>
            {image && (
              <IconButton
                label="Remove photo"
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-white/90 text-stone-700 shadow-sm backdrop-blur hover:bg-white dark:bg-stone-900/90 dark:text-stone-200"
              >
                <X size={16} />
              </IconButton>
            )}
          </div>

          <Field label="Title">
            <input
              name="title"
              required
              maxLength={100}
              defaultValue={post?.title}
              className={inputClass}
            />
          </Field>
          <Field label="Caption">
            <textarea
              name="message"
              rows={4}
              maxLength={2000}
              defaultValue={post?.message}
              className={`${inputClass} resize-y`}
            />
          </Field>
          <Field label="Tags" hint="Separate tags with spaces or commas.">
            <input
              name="tags"
              defaultValue={post?.tags.join(" ")}
              placeholder="film travel"
              className={inputClass}
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-200 px-6 py-4 dark:border-stone-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={creating || updating}
            disabled={preparingImage}
          >
            {post ? "Save changes" : "Share"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

const Form = () => {
  const { open, post } = useSelector((state) => state.composer);
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  if (!open || !user) return null;
  return (
    <Composer
      key={post?._id ?? "new"}
      post={post}
      onClose={() => dispatch(closeComposer())}
    />
  );
};

export default Form;
