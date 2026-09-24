const express = require("express");
const InterviewSession = require("../models/InterviewSession");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
const generateWithOllama = require("../services/ollamaService");

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

// Get a single interview session
router.get("/:sessionId", protect, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        message: "Interview session not found",
      });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Generate interview questions using Ollama
router.post("/generate", protect, async (req, res) => {
  try {
    const {
      jobRole,
      experienceLevel,
      interviewType = "Technical",
      topic = "",
      difficulty = "Medium",
      count = 5,
    } = req.body;

    if (!jobRole) {
      return res.status(400).json({
        message: "Job role is required",
      });
    }

    const validExperienceLevels = ["Fresher", "Junior", "Mid", "Senior"];

    if (experienceLevel && !validExperienceLevels.includes(experienceLevel)) {
      return res.status(400).json({
        message: "Invalid experience level",
      });
    }

    const questionCount = Math.min(Math.max(Number(count), 1), 10);

    const prompt = `
You are an expert technical and behavioral interviewer for a professional interview preparation platform.

Generate exactly ${questionCount} interview questions.

Candidate Information:
Job Role: ${jobRole}
Experience Level: ${experienceLevel || "Fresher"}
Interview Type: ${interviewType}
Topic: ${topic || "General"}
Difficulty: ${difficulty}

Requirements:
- Questions must be relevant to the job role.
- Match the candidate's experience level.
- Follow the selected interview type.
- If the interview type is Technical, focus on the selected topic.
- If the interview type is Behavioral, focus on workplace situations, communication, problem-solving, teamwork, leadership, and professional behavior.
- Match the requested difficulty.
- Avoid duplicate questions.
- Make every question clear and interview-appropriate.
- Return ONLY valid JSON.
- The JSON must contain a "questions" property.
- The "questions" property must be an array of strings.
- Do not return markdown.
- Do not use code fences.
- Do not include explanations.

Return exactly ${questionCount} questions in this JSON format:

{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
  ]
}
`;

    const aiResponse = await generateWithOllama(prompt);

    let questions;

    try {
      const cleanedResponse = aiResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedResponse = JSON.parse(cleanedResponse);

      questions = parsedResponse.questions;
    } catch (parseError) {
      return res.status(500).json({
        message: "AI returned an invalid question format",
        rawResponse: aiResponse,
      });
    }

    if (
      !Array.isArray(questions) ||
      questions.length === 0 ||
      !questions.every((question) => typeof question === "string")
    ) {
      return res.status(500).json({
        message: "AI returned invalid questions",
      });
    }

    const session = await InterviewSession.create({
      user: req.user._id,
      jobRole,
      experienceLevel: experienceLevel || "Fresher",
      interviewType,
      topic,
      difficulty,
      questions: questions.map((question) => ({
        question,
      })),
    });

    res.status(201).json({
      message: "Interview questions generated successfully",
      session,
    });
  } catch (error) {
    console.error("Question generation error:", error.message);

    res.status(500).json({
      message: "Failed to generate interview questions",
      error: error.message,
    });
  }
});

// Evaluate a user's answer using Ollama
router.post(
  "/:sessionId/questions/:questionId/evaluate",
  protect,
  async (req, res) => {
    try {
      const { userAnswer } = req.body;

      if (!userAnswer || !userAnswer.trim()) {
        return res.status(400).json({
          message: "User answer is required",
        });
      }

      // Find the session belonging to the logged-in user
      const session = await InterviewSession.findOne({
        _id: req.params.sessionId,
        user: req.user._id,
      });

      if (!session) {
        return res.status(404).json({
          message: "Interview session not found",
        });
      }

      // Find the question inside the session
      const question = session.questions.id(req.params.questionId);

      if (!question) {
        return res.status(404).json({
          message: "Question not found",
        });
      }

      const prompt = `
You are an expert interview evaluator for a professional interview preparation platform.

Evaluate the candidate's answer to the interview question.

Interview Information:
Job Role: ${session.jobRole}
Experience Level: ${session.experienceLevel}
Interview Type: ${session.interviewType}
Topic: ${session.topic || "General"}
Difficulty: ${session.difficulty}

Interview Question:
${question.question}

Candidate Answer:
${userAnswer}

Evaluation Criteria:
- Technical correctness
- Relevance to the question
- Completeness
- Clarity
- Understanding of the concept

For behavioral questions, also consider:
- Communication
- Problem-solving
- Teamwork
- Professional judgment
- Use of relevant examples

Give a score from 0 to 10.

Return ONLY valid JSON in exactly this format:

{
  "score": 8,
  "feedback": "Your answer correctly explains..."
}

Rules:
- score must be a number between 0 and 10
- feedback must clearly explain what was done well
- feedback must mention important missing or incorrect points when applicable
- feedback should be constructive and useful for improvement
- do not return markdown
- do not return code fences
- do not include any additional fields
`;

      const aiResponse = await generateWithOllama(prompt);

      let evaluation;

      try {
        const cleanedResponse = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        evaluation = JSON.parse(cleanedResponse);
      } catch (parseError) {
        return res.status(500).json({
          message: "AI returned an invalid evaluation format",
          rawResponse: aiResponse,
        });
      }

      const score = Number(evaluation.score);
      const feedback = evaluation.feedback;

      if (
        !Number.isFinite(score) ||
        score < 0 ||
        score > 10 ||
        typeof feedback !== "string" ||
        !feedback.trim()
      ) {
        return res.status(500).json({
          message: "AI returned invalid evaluation data",
        });
      }

      // Save answer, feedback and score
      question.userAnswer = userAnswer;
      question.feedback = feedback;
      question.score = score;

      await session.save();

      res.json({
        message: "Answer evaluated successfully",
        question,
      });
    } catch (error) {
      console.error("Answer evaluation error:", error.message);

      res.status(500).json({
        message: "Failed to evaluate answer",
        error: error.message,
      });
    }
  },
);

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
