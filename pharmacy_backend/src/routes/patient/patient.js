const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../../routes/auth/authController");
const { resetPassword } = require("./patientController");
const {
  addToCartFromPrescription,
  getMedicinesPatient,
} = require("./patientController");

router.post("/resetPassword", authenticateToken("PATIENT"), resetPassword);

router.post(
  "/addToCartFromPrescription",
  //authenticateToken("PATIENT"),
  addToCartFromPrescription
);

router.post(
  "/getMedicinesPatient",
  //authenticateToken("PATIENT"),
  getMedicinesPatient
);
module.exports = router;
