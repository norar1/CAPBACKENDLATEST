import express from 'express';
import {CreateAcc, GetAcc, UdpateAcc, DeleteAcc, LoginAcc, LogoutAcc} from "../controller/Account.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/createAcc', CreateAcc);

router.get('/getAcc', auth, GetAcc);

router.put("/updateAcc/:id", auth, UdpateAcc);

router.delete("/deleteAcc/:id", auth, DeleteAcc);

router.post("/Login", LoginAcc);

router.post("/logout", auth, LogoutAcc);

export default router;