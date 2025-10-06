import express from "express";
import { CreateFire, GetFire, UpdateFire, DeleteFire } from "../controller/FireIncident.js";

const router = express.Router();

router.post("/createFire", CreateFire);

router.get("/getFire", GetFire);

router.put("/updateFire/:id", UpdateFire);

router.delete("/deleteFire/:id", DeleteFire);

export default router;
