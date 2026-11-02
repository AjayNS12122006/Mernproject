import express from "express";
import {
  getWalks,
  startWalk,
  updateLocation,
  finishWalk,
  triggerWalkSOS,
  getPublicTrack,
  deleteWalk,
} from "../controllers/walkController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route — must stay unauthenticated so shared WhatsApp links work
// for people who don't have an account.
router.get("/track/:shareToken", getPublicTrack);

router.get("/", protect, getWalks);
router.post("/start", protect, startWalk);
router.post("/:id/sos", protect, triggerWalkSOS);
router.put("/:id/location", protect, updateLocation);
router.put("/:id/finish", protect, finishWalk);
router.delete("/:id", protect, deleteWalk);

export default router;
