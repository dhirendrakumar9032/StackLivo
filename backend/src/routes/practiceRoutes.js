import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { PracticeProgress } from "../models/PracticeProgress.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/progress",
  asyncHandler(async (request, response) => {
    const progress = await PracticeProgress.find({ ownerId: request.user._id }).sort({ updatedAt: -1 });
    response.json({ progress });
  })
);

router.patch(
  "/progress/:questionId",
  asyncHandler(async (request, response) => {
    const progress = await PracticeProgress.findOneAndUpdate(
      {
        ownerId: request.user._id,
        questionId: request.params.questionId,
      },
      {
        status: request.body.status || "in-progress",
        notes: request.body.notes || "",
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    response.json({ progress });
  })
);

export default router;
