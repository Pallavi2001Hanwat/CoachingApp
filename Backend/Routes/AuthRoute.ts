import express, { Request, Response } from 'express';
const router = express.Router();
import Usercontroller from '../Controller/UserController';

/* App Routes */
router.post("/LoginUser", Usercontroller.LoginFromApp);
router.post("/VerifyOtp", Usercontroller.VerifyOtp);
router.post("/SignUpUser", Usercontroller.SignUpUser);
router.post("/VerifyPassword", Usercontroller.VerifyPassword);

/* Admin Website Routes */
router.post("/LoginUserFromWeb", Usercontroller.LoginFromWeb);



router.get("/test", (req, res)=>{
    res.json("Testing api by user")
});
export default router