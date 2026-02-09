import express, { Request, Response } from 'express';
const router = express.Router();
import Usercontroller from '../Controller/UserController';


router.post("/LoginUser", Usercontroller.Login);
router.post("/VerifyOtp", Usercontroller.VerifyOtp);
router.post("/SignUpUser", Usercontroller.SignUpUser);
router.post("/VerifyPassword", Usercontroller.VerifyPassword);

router.get("/test", (req, res)=>{
    res.json("Testing api by user")
});
export default router