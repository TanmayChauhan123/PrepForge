const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobRole: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      default: "Fresher",
    },

    interviewType: {
      type: String,
      enum: ["Technical", "Behavioral"],
      default: "Technical",
    },

    topic: {
      type: String,
      default: "",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        userAnswer: {
          type: String,
          default: "",
        },
        feedback: {
          type: String,
          default: "",
        },
        score: {
          type: Number,
          min: 0,
          max: 10,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
