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
    for (const session of sessions) {
      const allQuestionsEvaluated =
        session.questions.length > 0 &&
        session.questions.every(
          (question) =>
            question.userAnswer?.trim() &&
            typeof question.score === "number" &&
            question.feedback?.trim(),
        );

      const newStatus = allQuestionsEvaluated ? "Completed" : "In Progress";

      if (session.status !== newStatus) {
        session.status = newStatus;
        await session.save();
      }
    }

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

First, identify the key requirements of the interview question.
Then compare the candidate's answer against those requirements.

STRICT SCORING RULES:
- Score only what the candidate actually answered.
- Do not assume or infer knowledge that the candidate did not demonstrate.
- Do not give credit merely because the answer contains words related to the question.
- If the answer is gibberish, random text, meaningless text, or does not form a meaningful response, score 0.
- If the answer is completely unrelated to the question, score 0 or 1.
- If the question has multiple parts and the candidate answers only one part, the score must not exceed 5.
- If the candidate answers only a small portion of the question correctly, score 2-4.
- A partially correct answer with meaningful understanding should generally score 5-7.
- A strong answer that addresses all major requirements correctly should score 8-9.
- A 10 should be reserved for an exceptionally complete, accurate, clear, and well-explained answer.
- If the candidate provides incorrect information, reduce the score accordingly.
- Do not reward irrelevant information.
- Do not confuse confidence or writing quality with correctness.
- For technical questions, verify the actual technical claims before assigning a high score.
- For behavioral questions, evaluate the quality and relevance of the candidate's reasoning and examples.

IMPORTANT:
If the question asks multiple things, ALL major parts must be addressed for a high score.

For example, if a question asks:
1. What is X?
2. What is Y?
3. What is the difference between X and Y?
4. What are their effects on Z?

An answer addressing only item 1 must receive a low score, even if item 1 is explained well.

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
- feedback must be constructive and useful for improvement
- do not return markdown
- do not return code fences
- do not include additional fields
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
      question.evaluatedAt = new Date();

      const allQuestionsEvaluated = session.questions.every(
        (q) =>
          q.userAnswer?.trim() &&
          typeof q.score === "number" &&
          q.feedback?.trim(),
      );

      session.status = allQuestionsEvaluated ? "Completed" : "In Progress";

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

// Generate an AI hint for one interview question
router.post(
  "/:sessionId/questions/:questionId/hint",
  protect,
  async (req, res) => {
    try {
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
You are an AI interview coach for a professional interview preparation platform.

Give the candidate a helpful hint for the interview question below.

Interview Information:
Job Role: ${session.jobRole}
Experience Level: ${session.experienceLevel}
Interview Type: ${session.interviewType}
Topic: ${session.topic || "General"}
Difficulty: ${session.difficulty}

Interview Question:
${question.question}

HINT RULES:
- Give a useful hint that helps the candidate think about the answer.
- Do NOT give the complete answer.
- Do NOT directly solve the question.
- Do NOT write a model answer.
- Do NOT reveal every important detail needed for the answer.
- Guide the candidate toward the relevant concept, approach, or key idea.
- Keep the hint concise: 1-3 sentences.
- The hint should be appropriate for the difficulty level.
- The candidate should still need to think and formulate their own answer.
- Do not mention that you are an AI.
- Return ONLY valid JSON.

Return exactly this format:

{
  "hint": "Think about..."
}

Do not return markdown.
Do not return code fences.
Do not include additional fields.
`;

      const aiResponse = await generateWithOllama(prompt);

      let hintData;

      try {
        const cleanedResponse = aiResponse
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        hintData = JSON.parse(cleanedResponse);
      } catch (parseError) {
        return res.status(500).json({
          message: "AI returned an invalid hint format",
          rawResponse: aiResponse,
        });
      }

      if (typeof hintData.hint !== "string" || !hintData.hint.trim()) {
        return res.status(500).json({
          message: "AI returned invalid hint data",
        });
      }

      res.json({
        message: "Hint generated successfully",
        hint: hintData.hint.trim(),
      });
    } catch (error) {
      console.error("Hint generation error:", error.message);

      res.status(500).json({
        message: "Failed to generate hint",
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
      const numericScore = Number(score);

      if (
        score === "" ||
        score === null ||
        !Number.isFinite(numericScore) ||
        numericScore < 0 ||
        numericScore > 10
      ) {
        return res.status(400).json({
          message: "Score must be a number between 0 and 10",
        });
      }

      question.score = numericScore;
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
