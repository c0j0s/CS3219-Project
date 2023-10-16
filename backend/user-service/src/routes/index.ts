import { Router } from "express";
import {
  deleteUserById,
  getHealth,
  getPreferencesByUserId,
  getUserByEmail,
  getUserById,
  postUser,
  updateUserById,
  updateUserPreferences,
  updateVerification,
  updatePasswordResetToken
} from "../controllers";

const router: Router = Router();

router.route("/health").get(getHealth);

router.route("/users/email").get(getUserByEmail);

router.route("/users/:userId").get(getUserById);

router.route("/users/:userId/preferences").get(getPreferencesByUserId);

router.route("/users/:userId/preferences").put(updateUserPreferences);

router.route("/users").post(postUser);

router.route("/users/:userId").put(updateUserById);

router.route("/users/updateVerification/:email").put(updateVerification)

router.route("/users/updatePasswordResetToken/:email").put(updatePasswordResetToken)

router.route("/users/:userId").delete(deleteUserById);

export default router;
