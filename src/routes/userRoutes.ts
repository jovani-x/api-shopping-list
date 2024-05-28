import express from "express";
import userController from "@/controllers/userController.js";

const router = express.Router();

// login
router.post("/login", userController.signin);
// logout
router.post("/logout", userController.signout);
// register
router.post("/register", userController.signup);
// forget
router.post("/forget", userController.forget);

export default router;
