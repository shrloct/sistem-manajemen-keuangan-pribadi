const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder,
} = require("../controllers/reminderController");

router.route("/").get(protect, getReminders).post(protect, createReminder);
router
  .route("/:id")
  .put(protect, updateReminderStatus)
  .delete(protect, deleteReminder);

module.exports = router;
