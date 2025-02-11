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
  getMonthlyStats
} = require("../controllers/financeController");

router.get("/", protect, getFinances);

router.post("/", protect, createFinance);

router.put("/:id", protect, updateFinance);

router.delete("/:id", protect, deleteFinance);

router.get("/report", protect, getFinanceReport);

router.get("/category-stats", protect, getCategoryStats);

router.get('/monthly-stats', protect, getMonthlyStats);

module.exports = router;
