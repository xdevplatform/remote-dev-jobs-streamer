import express from "express";
import RulesController from "../controllers/rules";

const router = express.Router();

router.get("/rules", RulesController.getRules);
router.post("/rules", RulesController.changeRules);

export default router;
