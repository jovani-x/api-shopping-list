import express from "express";
import friendController from "@/controllers/friendController.js";

const router = express.Router();

// get all friends
router.get("/", friendController.getAllUsers);
// get user requests
router.get("/requests", friendController.getUserRequests);
// get user requests 'become friend'
router.get("/requests/become-friend", friendController.getUserRequests);
// get user
router.get("/:id", friendController.getUser);
// invite
router.post("/invite", friendController.inviteUser);
// send friend request
router.post("/becomefriend", friendController.becomeFriend);
// approve friendship
router.put("/:id/friendship/request", friendController.approveFriendship);
// delete friends (a few)
router.delete("/few/friendship", friendController.deleteUsers);
// decline friendship
router.delete("/:id/friendship/request", friendController.declineFriendship);
// delete friend
router.delete("/:id/friendship", friendController.deleteUser);

export default router;
