import userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();
const apiAuthUrl = "";

// login
router.signin(`${apiAuthUrl}/login`, userController.signin);
// logout
router.signout(`${apiAuthUrl}/logout`, userController.signout);
// register
router.signup(`${apiAuthUrl}/register`, userController.signup);
// forget
router.forget(`${apiAuthUrl}/forget`, userController.forget);

export default router;
