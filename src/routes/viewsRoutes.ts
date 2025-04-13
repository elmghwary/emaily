import express from "express";
import { contactUs } from "../controllers/viewController";
const router = express.Router();
router.get("", contactUs);
router.get("/contact", contactUs);

export default router;
