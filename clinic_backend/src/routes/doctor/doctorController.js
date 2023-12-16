const appointmentModel = require("../../../../models/appointmentModel");
const doctorModel = require("../../../../models/doctorModel");
const patientModel = require("../../../../models/patientModel");
const contractModel = require("../../../../models/contractModel");
const prescriptionsModel = require("../../../../models/prescriptionsModel.js");
const medicineModel = require("../../../../models/medicineModel");

//GET a patient's information and health records
const getPatientInfo = async (req, res) => {
  // we will be getting the ID by selecting the name

  const _id = req.body._id;
  try {
    const patient = await patientModel.findById(_id);
    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const viewSettings = async (req, res) => {
  // we will be getting the ID by selecting the name

  const _id = req.body._id;
  try {
    const doctor = await doctorModel.findById(_id);
    res.status(200).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//GET list of all patients
const getPatients = async (req, res) => {
  const { username } = req.user;
  const doctor = await doctorModel.findOne({ username });
  console.log("FOUND DOCTOR");
  try {
    //  Find all appointments with the specified doctor's email
    const appointments = await appointmentModel.find({ doctorId: doctor._id });
    const patientIds = appointments.map((appointment) => appointment.patientId);

    // Find patients using the extracted patient emails
    const patients = await patientModel.find({ _id: { $in: patientIds } });
    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

//GET patients based on upcomimg appointments
const getUpcomingAptmnts = async (req, res) => {
  try {
    const { username } = req.body;

    // Find all upcoming appointments with the specified doctor's email
    const upcomingAppointments = await appointmentModel.find({
      doctorUsername: username,
      status: "UPCOMING",
    });
    const patientEmails = upcomingAppointments.map(
      (appointment) => appointment.patientEmail
    );

    const patients = await patientModel.find({ email: { $in: patientEmails } });
    res.status(200).json(patients);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

//GET patients by searching name find({name : req.body.name})
const getPatientsByName = async (req, res) => {
  const name = req.body.name;
  try {
    const patient = await patientModel.find({ name: name });
    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//PATCH email, hourly rate, affiliation

const editSettings = async (req, res) => {
  const _id = req.body._id;
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { _id: _id },
      { ...req.body }
    );

    res.status(200).json(doctor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const resetpassword = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauhtorized Access",
    });
  }

  const doctor = await doctorModel.findOne({ username: user?.username });

  doctor.password = password;
  await doctor.save();

  return res.json({
    succes: true,
    message: "Password reset",
  });
};

const viewAllContracts = async (req, res) => {
  const { username } = req.user;
  try {
    const contract = await contractModel.find({ doctorUsername: username });
    res.status(200).json(contract);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const acceptContract = async (req, res) => {
  const { _id } = req.body;
  const { username } = req.user;
  try {
    const contract = await contractModel.findOneAndUpdate(
      { _id: _id },
      { status: "ACCEPTED" },
      { new: true }
    );
    const doctor = await doctorModel.findOneAndUpdate(
      { username: username },
      { status: "ACCEPTED" },
      { new: true }
    );
    res.status(200).json({ contract, doctor });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const rejectContract = async (req, res) => {
  const { _id } = req.body;
  const { username } = req.user;

  try {
    const contract = await contractModel.findOneAndUpdate(
      { _id: _id },
      { status: "REJECTED" },
      { new: true }
    );
    const doctor = await doctorModel.findOneAndUpdate(
      { username: username },
      { status: "REJECTED" },
      { new: true }
    );
    res.status(200).json({ contract, doctor });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const addHealthRecordForPatient = async (req, res) => {
  const { username } = req.user;
  const { patientId, healthRecord } = req.body;

  console.log(patientId);

  try {
    const doctor = await doctorModel.find({ username });

    if (!doctor) {
      res.status(404).json({ message: "doctor not found" });
      return;
    }

    const patient = await patientModel.findById(patientId);
    console.log(patient);

    if (!patient) {
      res.status(404).json({ message: "patient not found" });
      return;
    }

    const healthRecords = patient.healthRecords;
    healthRecords.push(healthRecord);

    const savedPatient = await patient.save();

    res.status(200).json({ savedPatient });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const doctor = await doctorModel.findOne({ username: user?.username });

  if (doctor.password !== oldPassword) {
    return res.status(400).json({
      success: false,
      message: "Old Password is incorrect",
    });
  }

  doctor.password = newPassword;
  await doctor.save();

  return res.json({
    success: true,
    message: "Password Changed Successfully!",
  });
};
const getAllPrescriptions = async (req, res) => {
  const username = req.body.username;

  try {
    const prescription = await prescriptionsModel.find({
      doctorUsername: username,
    });

    if (!prescription) {
      res.status(404).json({ message: " No Prescriptions Found" });
    }

    res.status(200).json(prescription);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updatePrescription = async (req, res) => {
  const prescriptionID = req.body.prescriptionID;
  const updatedDosage = req.body.dosage;
  const updatedDuration = req.body.duration;
  const updatedQuantity = req.body.quantity;
  const medicineID = req.body.medicineID; // Convert to lowercase and trim whitespace

  try {
    // Find the prescription by ID
    const prescription = await prescriptionsModel.findById(prescriptionID);
    const medicineInModel = await medicineModel.findById(medicineID);
    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Find the medicine in the prescription
    const medicine = prescription.medicines.find(
      (m) => m.name === medicineInModel.name
    );

    //Check if the medicine was found
    if (!medicine) {
      return res
        .status(404)
        .json({ error: "Medicine not found in the prescription" });
    }

    // Update the dosage
    if (!(updatedDosage === "")) medicine.dosage = updatedDosage;
    if (!(updatedDuration === "")) medicine.duration = updatedDuration;
    if (!(updatedQuantity === "")) {medicine.quantity = updatedQuantity;
      medicine.remainingQuantity = updatedQuantity;
    }

    // Save the updated prescription
    await prescription.save();

    res.status(200).json({
      message: "Prescriptions Dosage Updated Successfully",
      prescription,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const addPrescription = async (req, res) => {
  const patient = await patientModel.findOne({
    username: req.body.patientUsername,
  });
  const prescription = new prescriptionsModel({
    patientUsername: req.body.patientUsername,
    patientName: patient.name,
    doctorUsername: req.body.doctorUsername,
    doctorName: req.body.doctorName,
    date: Date.now(),
    filled: false,
    medicines: req.body.medicines,
  });
  try {
    const newPrescription = await prescription.save();
    res.status(200).json(newPrescription);
  } catch (err) {
    res.status(500).json({ message: "Error creating a prescription" });
  }
};
const getAvailableMedicines = async (req, res) => {
  try {
    const medicines = await medicineModel.find({ status: "AVAILABLE" });
    res.status(200).json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error creating a prescription" });
  }
};

const addMedicineToPrescription = async (req, res) => {
  const medicineID = req.body.id;
  const dosage = req.body.dosage;
  const quantity = req.body.quantity;
  const duration = req.body.duration;
  const prescriptionID = req.body.prescriptionID;
  try {
    const prescription = await prescriptionsModel.findById(prescriptionID);
    const medicine = await medicineModel.findById(medicineID);
    prescription.medicines.push({
      medicineID: medicineID,
      name: medicine.name,
      dosage: dosage,
      quantity: quantity,
      remainingQuantity: quantity,
      duration: duration,
    });

    // Save the updated patient data
    await prescription.save();

    res.status(200).json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Error adding to a prescription" });
  }
};
const deleteMedicineFromPrescription = async (req, res) => {
  const medicineID = req.body.id;
  const prescriptionID = req.body.prescriptionID;
  try {
    const prescription = await prescriptionsModel.findById(prescriptionID);
    prescription.medicines = prescription.medicines.filter(
      (m) => m.medicineID.toString() !== medicineID
    );

    // Save the updated patient data
    await prescription.save();

    res.status(200).json(prescription);
  } catch (err) {
    res.status(500).json({ message: "Error deleting to a prescription" });
  }
};

module.exports = {
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
  getAllPrescriptions,
  addPrescription,
  getAvailableMedicines,
  addMedicineToPrescription,
  deleteMedicineFromPrescription,
  updatePrescription,
};
