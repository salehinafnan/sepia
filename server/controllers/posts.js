import { HttpError } from "../middleware/errors.js";
import PostMessage from "../models/postMessage.js";
import User from "../models/user.js";
import { pageSchema, postSchema } from "../validation.js";

const IMAGE_DATA_URL = /^data:(image\/(?:png|jpe?g|webp|gif|avif));base64,/;

// Feed projection: everything but the image bytes, which getPostImage serves.
const feedFields = {
  title: 1,
  message: 1,
  name: 1,
  creator: 1,
  tags: 1,
  likes: 1,
  createdAt: 1,
  updatedAt: 1,
  hasImage: {
    $gt: [{ $strLenBytes: { $ifNull: ["$selectedFile", ""] } }, 0],
  },
};

const toPublicPost = ({
  _id,
  title,
  message,
  name,
  creator,
  tags,
  likes,
  createdAt,
  updatedAt,
  hasImage,
}) => ({
  _id,
  title,
  message,
  name,
  creator,
  tags,
  likes,
  createdAt,
  updatedAt,
  // Versioned URL so the image can be cached forever and busted on edit.
  image: hasImage
    ? `/posts/${_id}/image?v=${new Date(updatedAt ?? createdAt).getTime()}`
    : null,
});

const accessError = async (id) =>
  (await PostMessage.exists({ _id: id }))
    ? new HttpError(403, "You can only change your own posts")
    : new HttpError(404, "Post not found");

export const getPosts = async (req, res) => {
  const { cursor, limit } = pageSchema.parse(req.query);
  const posts = await PostMessage.find(
    cursor ? { _id: { $lt: cursor } } : {},
    feedFields,
  )
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  res.json({
    posts: posts.slice(0, limit).map(toPublicPost),
    nextCursor: posts.length > limit ? posts[limit - 1]._id : null,
  });
};

export const getPostImage = async (req, res) => {
  const post = await PostMessage.findById(req.params.id, "selectedFile").lean();
  const match = post?.selectedFile?.match(IMAGE_DATA_URL);
  if (!match) throw new HttpError(404, "Image not found");

  res
    .set("Cache-Control", "public, max-age=31536000, immutable")
    .type(match[1].replace("jpg", "jpeg"))
    .send(Buffer.from(post.selectedFile.slice(match[0].length), "base64"));
};

export const createPost = async (req, res) => {
  const { selectedFile, ...fields } = postSchema.parse(req.body);
  const author = await User.findById(req.userId, "name").lean();
  if (!author) throw new HttpError(401, "Please sign in to continue");

  const post = await PostMessage.create({
    ...fields,
    selectedFile: selectedFile || undefined,
    name: author.name,
    creator: req.userId,
  });
  res
    .status(201)
    .json(
      toPublicPost({ ...post.toObject(), hasImage: Boolean(selectedFile) }),
    );
};

export const updatePost = async (req, res) => {
  const { selectedFile, ...fields } = postSchema.parse(req.body);
  const update = { $set: fields };
  if (selectedFile) update.$set.selectedFile = selectedFile;
  if (selectedFile === null) update.$unset = { selectedFile: 1 };

  const post = await PostMessage.findOneAndUpdate(
    { _id: req.params.id, creator: req.userId },
    update,
    { returnDocument: "after", projection: feedFields },
  ).lean();
  if (!post) throw await accessError(req.params.id);
  res.json(toPublicPost(post));
};

export const deletePost = async (req, res) => {
  const { deletedCount } = await PostMessage.deleteOne({
    _id: req.params.id,
    creator: req.userId,
  });
  if (!deletedCount) throw await accessError(req.params.id);
  res.status(204).end();
};

const setLiked = (liked) => async (req, res) => {
  const post = await PostMessage.findByIdAndUpdate(
    req.params.id,
    { [liked ? "$addToSet" : "$pull"]: { likes: req.userId } },
    // Likes don't touch updatedAt, which versions the image URL.
    { returnDocument: "after", projection: { likes: 1 }, timestamps: false },
  ).lean();
  if (!post) throw new HttpError(404, "Post not found");
  res.json({ _id: post._id, likes: post.likes });
};

export const likePost = setLiked(true);
export const unlikePost = setLiked(false);
