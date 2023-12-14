const patientModel = require("../../../../models/patientModel.js");
const prescriptionsModel = require("../../../../models/prescriptionsModel.js");
const medicineModel = require("../../../../models/medicineModel.js");

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const patient = await patientModel.findOne({ username: user.username });

  patient.password = password;
  await patient.save();

  return res.json({
    success: true,
    message: "Password Reset",
  });
};

const addToCartFromPrescription = async (req, res) => {
  const medicineID = req.body.medicinesID;
  const patientId = req.body.id;
  const prescriptionID = req.body.presID;
  try {
    // Find the patient by ID
    const patient = await patientModel.findById(patientId);
    const prescription = await prescriptionsModel.findById(prescriptionID);
    const medicine = await medicineModel.findById(medicineID);

    const prescriptionDate = prescription.updatedAt;
    // Get today's date
    const today = new Date();

    // Calculate the date three months ago
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    if (prescriptionDate < threeMonthsAgo)
      return res.status(404).json({ error: "Prescription is too old." });

    if (patient == null) {
      return res.status(404).json({ error: "Patient not found." });
    }
    if (!medicine.status === "AVAILABLE") {
      return res.status(404).json({ error: "Medicine is not Available" });
    }
    const medicineName = medicine.name;

    // Find the medicine in the prescription
    const presMedicine = prescription.medicines.find(
      (m) => m.name === medicineName
    );

    // Add medicines to the patient's cart
    patient.cart.push({
      medicine: medicine._id,
      quantity: presMedicine.quantity,
    });

    // Save the updated patient data
    await patient.save();

    res.status(200).json({
      message: "Medicines added to the patient's cart successfully.",
      cart: patient.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { resetPassword, addToCartFromPrescription };
