import mongoose from "mongoose";

const dependencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const fileSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["react", "javascript"],
      required: true,
    },
    source: {
      type: String,
      enum: ["workspace", "practice"],
      default: "workspace",
      index: true,
    },
    practiceQuestionId: {
      type: String,
      default: null,
      index: true,
    },
    activeFile: {
      type: String,
      default: "/src/App.jsx",
    },
    dependencies: [dependencySchema],
    files: [fileSchema],
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ ownerId: 1, updatedAt: -1 });

export const Project = mongoose.model("Project", projectSchema);
