import express from "express";
import {
  getContacts,
  addContact,
  deleteContact,
} from "../controllers/contactController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getContacts);
router.post("/", protect, addContact);
router.delete("/:id", protect, deleteContact);

export default router;
