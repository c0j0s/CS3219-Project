import { Router } from "express";
import { getHealth } from "../controllers/handlers/get-handler";
import {
  logInByEmail,
  registerByEmail,
  logOut,
} from "../controllers/handlers/post-handler";
import {
  verifyUserEmail,
  sendPasswordResetEmail,
  changePassword,
} from "../controllers/handlers/put-handler";
import passport from "passport";
import HttpStatusCode from "../common/HttpStatusCode";
import { UserProfile } from "../common/types";

const router: Router = Router();

router.route("/health").get(getHealth);
router.route("/registerByEmail").post(registerByEmail);
router.route("/loginByEmail").post(logInByEmail);
router
  .route("/validate")
  .post(passport.authenticate("jwt", { session: false }), (req, res, next) => {
    res.status(HttpStatusCode.OK).json(req.user);
  });
router
  .route("/validateAdmin")
  .post(passport.authenticate("jwt", { session: false }), (req, res, next) => {
    const user = req.user as UserProfile;
    if (user.role !== "ADMIN") {
      res.status(HttpStatusCode.FORBIDDEN).json({
        error: "Forbidden",
        message: "You are not authorized to access this resource.",
      });
      return;
    }
    res.status(HttpStatusCode.OK).json(req.user);
  });
router.route("/logout").post(logOut);
router.route("/verifyEmail/:email/:token").put(verifyUserEmail);
router.route("/sendPasswordResetEmail/:email").put(sendPasswordResetEmail);
router.route("/changePassword/:id").put(changePassword);

export default router;
