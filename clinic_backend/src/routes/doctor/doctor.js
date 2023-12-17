const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../../../../routes/auth/authController");
const {
  getPatientInfo,
  getPatients,
  getPatientsByName,
  getUpcomingAptmnts,
  editSettings,
  viewSettings,
  resetpassword,
  viewAllContracts,
  acceptContract,
  rejectContract,
  addHealthRecordForPatient,
  changePassword,
  cancelAppointment,
  rescheduleAppointment,
  chooseSlots,
  handleFollowUpAppointment,
  getNotifications,
  getAllPrescriptions,
  getAvailableMedicines,
  addMedicineToPrescription,
  deleteMedicineFromPrescription,
  updatePrescription,
  addPrescription,
} = require("./doctorController");
const { getAppointments } = require("../appointment/appointmentController");

//get a patient's information and health records given patient ID
router.post("/getPatientInfo", authenticateToken("DOCTOR"), getPatientInfo);

//get list of all patients given doctor's email
router.post("/getPatients", authenticateToken("DOCTOR"), getPatients);


//PUT Doctor can choose slots
router.put(
  "/chooseSlots",
  // authenticateToken("DOCTOR"),
  chooseSlots
);

//PUT Doctor can cancel appointment
router.put(
  "/cancelAppointment",
  authenticateToken("DOCTOR"),
  cancelAppointment
);

//PUT Doctor can handle follow up appointment
router.put(
  "/handleFollowUpAppointment",
  // authenticateToken("DOCTOR"),
  handleFollowUpAppointment
);

//PUT Doctor can reschedule appointment
router.put(
  "/rescheduleAppointment",
  authenticateToken("DOCTOR"),
  rescheduleAppointment
);

router.get("/notifications", getNotifications);


//GET patients by searching name find({name : req.body.name})
router.get(
  "/getPatientsByName",
  authenticateToken("DOCTOR"),
  getPatientsByName
);

//GET patients based on upcomimg appointments
router.post(
  "/getUpcomingAptmnts",
  authenticateToken("DOCTOR"),
  getUpcomingAptmnts
);

router.post("/viewSettings", authenticateToken("DOCTOR"), viewSettings);

//PATCH email, hourly rate, affiliation
router.patch("/editSettings", authenticateToken("DOCTOR"), editSettings);

router.get("/getAppointments/", authenticateToken("DOCTOR"), getAppointments);

// After regestration accept or reject contract
router.get("/viewAllContracts", authenticateToken("DOCTOR"), viewAllContracts);

router.put("/acceptContract", authenticateToken("DOCTOR"), acceptContract);

router.put("/rejectContract", authenticateToken("DOCTOR"), rejectContract);

// Reset Password
router.post("/resetPassword", authenticateToken("DOCTOR"), resetpassword);

router.post(
  "/addHealthRecordForPatient",
  authenticateToken("DOCTOR"),
  addHealthRecordForPatient
);

router.post(
  "/getAllPrescriptions",
  //authenticateToken("DOCTOR"),
  getAllPrescriptions
);

// Change Password
router.post("/changePassword", authenticateToken("DOCTOR"), changePassword);

router.get(
  "/getAvailableMedicines",
  //authenticateToken("DOCTOR"),
  getAvailableMedicines
);
router.post(
  "/addMedicineToPrescription",
  //authenticateToken("DOCTOR"),
  addMedicineToPrescription
);

router.post(
  "/deleteMedicineFromPrescription",
  //authenticateToken("DOCTOR"),
  deleteMedicineFromPrescription
);
router.post(
  "/updatePrescription",
  //authenticateToken("DOCTOR"),
  updatePrescription
);

router.post(
  "/addPrescription",
  //authenticateToken("DOCTOR"),
  addPrescription
);
module.exports = router;
