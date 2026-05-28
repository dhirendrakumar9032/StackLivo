import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { Project } from "../models/Project.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { objectToDependencies, objectToFiles, serializeProject } from "../utils/projectSerializer.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const source = request.query.source ? String(request.query.source) : undefined;
    const filter = {
      ownerId: request.user._id,
    };

    if (source) {
      filter.source = source;
    }

    const projects = await Project.find(filter).sort({ updatedAt: -1 });
    response.json({ projects: projects.map(serializeProject) });
  })
);

router.post(
  "/",
  asyncHandler(async (request, response) => {
    const project = await Project.create({
      ownerId: request.user._id,
      name: request.body.name,
      type: request.body.type,
      source: request.body.source || "workspace",
      practiceQuestionId: request.body.practiceQuestionId || null,
      activeFile: request.body.activeFile,
      dependencies: objectToDependencies(request.body.dependencies),
      files: objectToFiles(request.body.files),
    });

    response.status(201).json({ project: serializeProject(project) });
  })
);

router.get(
  "/:projectId",
  asyncHandler(async (request, response) => {
    const project = await Project.findOne({
      _id: request.params.projectId,
      ownerId: request.user._id,
    });

    if (!project) {
      response.status(404).json({ message: "Project not found." });
      return;
    }

    response.json({ project: serializeProject(project) });
  })
);

router.patch(
  "/:projectId",
  asyncHandler(async (request, response) => {
    const allowedFields = [
      "name",
      "type",
      "source",
      "practiceQuestionId",
      "activeFile",
      "dependencies",
      "files",
    ];
    const patch = {};

    for (const field of allowedFields) {
      if (field in request.body) {
        patch[field] = request.body[field];
      }
    }

    if ("dependencies" in patch) {
      patch.dependencies = objectToDependencies(patch.dependencies);
    }

    if ("files" in patch) {
      patch.files = objectToFiles(patch.files);
    }

    const project = await Project.findOneAndUpdate(
      {
        _id: request.params.projectId,
        ownerId: request.user._id,
      },
      patch,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      response.status(404).json({ message: "Project not found." });
      return;
    }

    response.json({ project: serializeProject(project) });
  })
);

router.delete(
  "/:projectId",
  asyncHandler(async (request, response) => {
    const project = await Project.findOneAndDelete({
      _id: request.params.projectId,
      ownerId: request.user._id,
    });

    if (!project) {
      response.status(404).json({ message: "Project not found." });
      return;
    }

    response.status(204).send();
  })
);

export default router;
