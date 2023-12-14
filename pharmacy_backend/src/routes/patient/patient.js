const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../../routes/auth/authController");
const { resetPassword } = require("./patientController");
const { addToCartFromPrescription } = require("./patientController");

router.post("/resetPassword", authenticateToken("PATIENT"), resetPassword);

router.post(
  "/addToCartFromPrescription",
  //authenticateToken("PATIENT"),
  addToCartFromPrescription
);

module.exports = router;
