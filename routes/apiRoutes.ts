import express from "express";
import { contactUs } from "../controllers/contactController";

const router = express.Router();
router.post("/contactUs", contactUs);

export default router;
