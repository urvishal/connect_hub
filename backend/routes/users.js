const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get all users (with optional ?search= query)
router.get("/", auth, async (req, res) => {
  try {
    const { search } = req.query;

    const query = {
      _id: { $ne: req.user }, // exclude self
    };

    if (search && search.trim()) {
      query.username = { $regex: search.trim(), $options: "i" }; // case-insensitive
    }

    const users = await User.find(query).select(
      "username email avatar bio followers following"
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single user
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow / Unfollow
router.put("/:id/follow", auth, async (req, res) => {
  try {
    if (req.params.id === req.user)
      return res.status(400).json({ message: "Cannot follow yourself" });

    const target = await User.findById(req.params.id);
    const me = await User.findById(req.user);

    if (me.following.includes(target._id)) {
      me.following = me.following.filter(
        (id) => id.toString() !== target._id.toString()
      );
      target.followers = target.followers.filter(
        (id) => id.toString() !== me._id.toString()
      );
    } else {
      me.following.push(target._id);
      target.followers.push(me._id);
    }
    await me.save();
    await target.save();
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;