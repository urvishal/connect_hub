const express = require("express");
const Message = require("../models/Message");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// Get conversation between two users
router.get("/:userId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post("/", auth, async (req, res) => {
  try {
    const { receiver, text } = req.body;
    const msg = await Message.create({ sender: req.user, receiver, text });
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
