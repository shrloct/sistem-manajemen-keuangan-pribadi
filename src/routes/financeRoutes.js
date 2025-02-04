const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getCategoryStats,
  getFinances,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceReport,
} = require("../controllers/financeController");

router.get("/", protect, getFinances);

router.post("/", protect, createFinance);

router.put("/:id", protect, updateFinance);

router.delete("/:id", protect, deleteFinance);

router.get("/report", protect, getFinanceReport);

router.get("/category-stats", protect, getCategoryStats);

module.exports = router;
