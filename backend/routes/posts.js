const express = require("express");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all posts (feed)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username avatar")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create post
router.post("/", auth, async (req, res) => {
  try {
    const { content, image } = req.body;
    if (!content) return res.status(400).json({ message: "Content required" });
    const post = await Post.create({ author: req.user, content, image });
    const populated = await post.populate("author", "username avatar");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like / Unlike
router.put("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(req.user);
    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user);
    } else {
      post.likes.push(req.user);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete post
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user)
      return res.status(403).json({ message: "Not authorized" });

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
