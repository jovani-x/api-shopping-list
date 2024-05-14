import userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();
const apiAuthUrl = "";

// login
router.post(`${apiAuthUrl}/login`, userController.signin);
// logout
router.post(`${apiAuthUrl}/logout`, userController.signout);
// register
router.post(`${apiAuthUrl}/register`, userController.signup);
// forget
router.post(`${apiAuthUrl}/forget`, userController.forget);

export default router;
