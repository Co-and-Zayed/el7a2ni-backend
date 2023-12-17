const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../../routes/auth/authController");
const {
  viewAllContracts,
  acceptContract,
  rejectContract,
  viewAllNotifications,
  archiveMedicine,
  unarchiveMedicine,
  viewSalesReport,
} = require("./pharmacistController");

const { resetPassword } = require("./pharmacistController");
// After regestration accept or reject contract
router.get(
  "/viewAllContracts",
  authenticateToken("PHARMACIST"),
  viewAllContracts
);

router.put("/acceptContract", authenticateToken("PHARMACIST"), acceptContract);

router.put("/rejectContract", authenticateToken("PHARMACIST"), rejectContract);

router.post("/resetPassword", authenticateToken("PHARMACIST"), resetPassword);


router.get("/viewAllNotifications", viewAllNotifications);

router.post(
  "/archiveMedicine",
  //authenticateToken("PHARMACIST"),
  archiveMedicine
);

router.post(
  "/unarchiveMedicine",
  //authenticateToken("PHARMACIST"),
  unarchiveMedicine
);

router.post(
  "/viewSalesReport",
  //authenticateToken("PHARMACIST"),
  viewSalesReport
);

module.exports = router;
