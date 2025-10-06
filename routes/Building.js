import express from "express";
import {
  CreatePermit,
  GetPermit,
  UpdatePermit,
  DeletePermit,
  SearchPermits,
  UpdateStatus,
  UpdatePaymentStatus,
  GetPermitsByStatus,
} from "../controller/Building.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/CreatePermit", auth, CreatePermit);

router.get("/GetPermit", GetPermit);

router.put("/UpdatePermit/:id", UpdatePermit);

router.delete("/DeletePermit/:id", DeletePermit);

router.get("/search", SearchPermits);

router.put("/UpdateStatus/:id", UpdateStatus);

router.put("/UpdatePaymentStatus/:id", UpdatePaymentStatus);

router.get("/GetPermitsByStatus/:status", GetPermitsByStatus);

export default router;