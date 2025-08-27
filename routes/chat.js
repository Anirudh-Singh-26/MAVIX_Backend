// backend/routes/chat.js
const express = require("express");
const Thread = require("../models/threads");
const getOpenaiApiResponse = require("../utils/openai");
const generateChatPDF = require("../utils/pdfGenerator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Test thread
router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "abc",
      title: "Testing Thread",
      messages: [], // add this line
    });

    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.error("Error saving thread:", err);
    res
      .status(500)
      .json({ error: "Failed to save to DB", details: err.message });
  }
});


// Get all threads
router.get("/thread",authMiddleware ,async (req, res) => {
  console.log("1")
  try {
    console.log("2");
    const allThreads = await Thread.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(allThreads);
  } catch (err) {
    console.log("3");
    console.log(err);
    res.status(500).json({ error: "Failed to Get all Threads" });
  }
});

// Get messages of an individual thread
router.get("/thread/:threadId",authMiddleware ,async (req, res) => {
  const { threadId } = req.params;
  try {
    const thread = await Thread.findOne({ threadId, user: req.user.id });
    if (!thread) {
      return res.status(404).json({ error: "Thread Not Found" });
    }
    res.json(thread.messages);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to Get the Individual thread messages" });
  }
});

// Delete a thread
router.delete("/thread/:threadId",authMiddleware ,async (req, res) => {
  const { threadId } = req.params;
  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });
    if (!deletedThread) {
      return res.status(404).json({ error: "Thread Not Found" });
    }
    res.status(200).json({ success: "Thread Successfully Deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to Delete the Thread" });
  }
});

// Individual chat/messages of the thread
// Individual chat/messages of the thread
router.post("/chat", authMiddleware, async (req, res) => {
  const { threadId, messages } = req.body;
  if (!threadId || !messages) {
    return res.status(400).json({ error: "Missing required Fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });
    const isNew = !thread; // check if new

    if (!thread) {
      // Creating new Thread in DB
      thread = new Thread({
        user: req.user.id,
        threadId,
        title: messages, // you can later replace with first 3 words or so
        messages: [{ role: "user", content: messages, createdAt: new Date() }],
      });
    } else {
      thread.messages.push({
        role: "user",
        content: messages,
        createdAt: new Date(),
      });
    }

    const assistantReply = await getOpenaiApiResponse(messages);

    thread.messages.push({
      role: "assistant",
      content: assistantReply.response,
      createdAt: new Date(),
    });

    thread.updatedAt = new Date();
    await thread.save();

    res.json({
      reply: assistantReply,
      isNew,
      thread: {
        threadId: thread.threadId,
        title: thread.title,
        updatedAt: thread.updatedAt,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed To Process the Chat" });
  }
});


// --------------------
// Download chat PDF
// --------------------
router.post("/download",async (req, res) => {
  const { threadId } = req.body;

  if (!threadId) {
    return res.status(400).json({ error: "Missing threadId" });
  }

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      return res.status(404).json({ error: "Thread Not Found" });
    }

    const chatHistory = (thread.messages || []).map((msg) => ({
      role: msg.role,
      content: msg.content,
      createdAt: msg.createdAt,
    }));

    if (!chatHistory.length) {
      return res.status(400).json({ error: "No messages to generate PDF" });
    }

    // Generate filename from first 3 words of thread title
    let titleWords = (thread.title || "chat_history").split(" ").slice(0, 3);
    let title = titleWords.join("_"); // Join with underscores
    title = title.replace(/[^a-zA-Z0-9_]/g, ""); // Remove invalid chars
    title = title || "chat_history"; // fallback
    const pdfFileName = `${title}.pdf`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${pdfFileName}"`
    );
    res.setHeader("Content-Type", "application/pdf");

    generateChatPDF(res, chatHistory, pdfFileName);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to download chat PDF" });
  }
});



module.exports = router;
