const express = require("express");
const router = express.Router();
const { uploadS3 } = require("../../../../utils/uploadMultipleFiles");

const {
  getDoctors,
  getDoctordetails,
  filterDoctors,
  getHealthPackages,
  subscribeToPackage,
  viewPackages,
  getPackagePrice,
  subscribeToPackageForGuest,
  subscribeToPackageForFamilyPatient,
  viewSubscribedPackage,
  viewSubscribedPackageforFamilyMember,
  unsubscribeFromPackage,
  unsubscribeFromPackageforFamily,
  payWithWallet,
  updateMedicalHistory,
  deleteMedicalHistory,
  resetPassword,
  getHealthRecords,
  changePassword,
  cancelAppointment,
  rescheduleAppointment,
  followUpAppointment,
  getFamilyMemberAppointments,
  getMyDoctors,
  updateWallet,
  getAll,
  getNotifications,
  getAllPrescriptions,
} = require("./patientController");

const { authenticateToken } = require("../../../../routes/auth/authController");

/////////////
// MOSTAFA //
/////////////
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
  updateAppointmentData,
} = require("../appointment/appointmentController");

const {
  addFamilyMember,
  getFamilyMembers,
} = require("./familyMemberController");

//GET list of all doctors or doctors by searching name and/or speciality

router.post("/getDoctors", authenticateToken("PATIENT"), getDoctors);

router.post("/getMyDoctors", authenticateToken("PATIENT"), getMyDoctors);

//POST filter doctors by speciality and/or availability on a specific date and time
router.post("/filterDoctors", authenticateToken("PATIENT"), filterDoctors);

// Appointment Routes
router.post("/createAppointment", authenticateToken(), createAppointment);

router.get("/getAppointments", authenticateToken("PATIENT"), getAppointments);

router.put("/updateAppointment/:id", authenticateToken(), updateAppointment);

router.delete(
  "/deleteAppointment/:id",
  authenticateToken("PATIENT"),
  deleteAppointment
);

// Family Member Routes
router.post("/addFamilyMember", authenticateToken("PATIENT"), addFamilyMember);

router.get("/getFamilyMembers", authenticateToken("PATIENT"), getFamilyMembers);

router.post("/payWithWallet", authenticateToken("PATIENT"), payWithWallet);

router.get('/notifications', getNotifications);

///////////
// ZEINA //
///////////
router.post(
  "/getDoctordetails",
  authenticateToken("PATIENT"),
  getDoctordetails
);
router.get(
  "/getHealthPackages",
  authenticateToken("PATIENT"),
  getHealthPackages
);
router.post(
  "/subscribeToPackage",
  //authenticateToken("PATIENT"),
  subscribeToPackage
);
router.post("/viewPackages", authenticateToken("PATIENT"), viewPackages);
router.post(
  "/getPackagePrice",
  //authenticateToken("PATIENT"),
  getPackagePrice
);
router.post(
  "/subscribeToPackageForGuest",
  //authenticateToken("PATIENT"),
  subscribeToPackageForGuest
);
router.post(
  "/subscribeToPackageForFamilyPatient",
  authenticateToken("PATIENT"),
  subscribeToPackageForFamilyPatient
);
router.post(
  "/viewSubscribedPackage",
  //authenticateToken("PATIENT"),
  viewSubscribedPackage
);
router.post(
  "/viewSubscribedPackageforFamilyMember",
  authenticateToken("PATIENT"),
  viewSubscribedPackageforFamilyMember
);
router.post(
  "/unsubscribeFromPackage",
  authenticateToken("PATIENT"),
  unsubscribeFromPackage
);
router.post(
  "/unsubscribeFromPackageforFamily",
  authenticateToken("PATIENT"),
  unsubscribeFromPackageforFamily
);

router.post(
  "/updateMedicalHistory",
  authenticateToken("PATIENT"),
  uploadS3.array("files", 20),
  updateMedicalHistory
);

router.post(
  "/deleteMedicalHistory",
  authenticateToken("PATIENT"),
  deleteMedicalHistory
);

// Reset Password
router.post("/resetPassword", authenticateToken("PATIENT"), resetPassword);

router.get("/getHealthRecords", authenticateToken("PATIENT"), getHealthRecords);
// Change Password
router.post("/changePassword", authenticateToken("PATIENT"), changePassword);

// Cancel Appointment
router.put(
  "/cancelAppointment",
  // authenticateToken("PATIENT"),
  authenticateToken(),
  cancelAppointment
);

// Reschedule Appointment
router.put(
  "/rescheduleAppointment",
  authenticateToken("PATIENT"),
  rescheduleAppointment
);

//Follow up Appointment
router.post(
  "/followUpAppointment",
  // authenticateToken("PATIENT"),
  followUpAppointment
);

// Get Family Members appointments

router.get(
  "/getFamilyMemberAppointments",
  authenticateToken("PATIENT"),
  getFamilyMemberAppointments
);

// get All prescriptions
router.post(
  "/getAllPrescriptions",
  //authenticateToken("PATIENT"),
  getAllPrescriptions
);

module.exports = router;
