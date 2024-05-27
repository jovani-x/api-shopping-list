import userController from "../controllers/userController.js";
import express from "express";

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
