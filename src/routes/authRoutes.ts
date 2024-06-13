import express from "express";
import authController from "@/controllers/authController.js";

const router = express.Router();

// login
router.post("/login", authController.signin);
// logout
router.post("/logout", authController.signout);
// register
router.post("/register", authController.signup);
// forget
router.post("/forget", authController.forget);

export default router;
