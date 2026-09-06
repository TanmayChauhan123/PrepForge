const express = require("express");
const InterviewSession = require("../models/InterviewSession");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new interview-practice session
router.post("/", protect, async (req, res) => {
  try {
    const { jobRole, experienceLevel, questions } = req.body;

    if (!jobRole || !questions || questions.length === 0) {
      return res.status(400).json({
        message: "Job role and at least one question are required",
      });
    }

    const session = await InterviewSession.create({
      user: req.user._id,
      jobRole,
      experienceLevel,
      questions,
    });

    res.status(201).json({
      message: "Interview session created successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get all sessions created by the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Save an answer and feedback for one question
router.patch("/:sessionId/questions/:questionId", protect, async (req, res) => {
  try {
    const { userAnswer, feedback, score } = req.body;

    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
      });
    }

    const question = session.questions.id(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    if (userAnswer !== undefined) {
      question.userAnswer = userAnswer;
    }

    if (feedback !== undefined) {
      question.feedback = feedback;
    }

    if (score !== undefined) {
      question.score = score;
    }

    await session.save();

    res.json({
      message: "Answer updated successfully",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
