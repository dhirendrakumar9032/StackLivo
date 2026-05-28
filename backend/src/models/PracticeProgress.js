import mongoose from "mongoose";

const practiceProgressSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed"],
      default: "in-progress",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

practiceProgressSchema.index({ ownerId: 1, questionId: 1 }, { unique: true });

export const PracticeProgress = mongoose.model("PracticeProgress", practiceProgressSchema);
