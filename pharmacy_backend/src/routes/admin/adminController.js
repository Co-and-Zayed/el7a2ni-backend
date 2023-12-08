require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const adminModel = require("../../../../models/adminModel");

const refreshTokensModel = require("../../../../models/refreshTokensModel");
const userModel = require("../../../../models/userModel");
const patientModel = require("../../../../models/patientModel");
const pharmacistModel = require("../../../../models/pharmacistModel");
const contractModel = require("../../../../models/contractModel");
const appointmentModel = require("../../../../models/appointmentModel");
const familyMembersModel = require("../../../../models/familyMembersModel");
const salesModel = require("../../../../models/salesModel");

const { createUserTokens } = require("../../../../routes/auth/authController");

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await adminModel.findOne({ username });
    res.status(200).json({
      user: user,
      tokens: await createUserTokens({
        username: username,
        type: "ADMIN",
        issuedAt: new Date(),
      }),
    });
  } catch (err) {
    res.status(400).json({ message: "User not found" });
  }
};

const resetPassword = async (req, res) => {
  const { password } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Access",
    });
  }

  const admin = await adminModel.findOne({ username: user.username });

  admin.password = password;
  await admin.save();

  return res.json({
    success: true,
    message: "Password Reset",
  });
};

const deletePatient = async (req, res) => {
  const { username } = req.body;
  var deleted = [];
  try {
    await userModel.deleteMany({ username });

    await patientModel.deleteMany({ username });

    await appointmentModel.deleteMany({ patientUsername: username });

    await familyMembersModel.deleteMany({ patientUsername: username });

    await refreshTokensModel.deleteMany({ username });

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: "An Error Occured", err: err });
  }
};

const deletePharmacist = async (req, res) => {
  const { username } = req.body;
  try {
    await userModel.deleteMany({ username });
    await pharmacistModel.deleteMany({ username });
    await refreshTokensModel.deleteMany({ username });
    res.status(200).json({
      message: "Pharmacist deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: "An error occurred", err: err });
  }
};

const deleteAdmin = async (req, res) => {
  const { username } = req.body;

  try {
    await adminModel.deleteMany({ username });
    await userModel.deleteMany({ username });
    await refreshTokensModel.deleteMany({ username });
    res.status(200).json({
      message: "Admin deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: "User not found", err: err });
  }
};

const createAdmin = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      message: "Please provide all required fields",
    });
  }

  const admin = new adminModel({
    username: username,
    email: email,
    password: password,
  });

  const user = new userModel({
    name: username,
    username: username,
    type: "ADMIN",
  });

  try {
    await user.save();
  } catch (err) {
    return res.json({ message: err.message, status: 409, collection: "user" });
  }

  try {
    await admin.save();
    return res.status(201).json(user);
  } catch (err) {
    return res.json({ message: err.message, status: 409, collection: "admin" });
  }
};

const viewPharmacists = async (req, res) => {
  try {
    const allPharmacists = await pharmacistModel.find().select("-password");
    res.status(200).json(allPharmacists);
  } catch (err) {
    res.status(400).json({ message: "Error occured", err: err });
  }
};

const viewPatients = async (req, res) => {
  try {
    const allPatients = await patientModel.find().select("-password");
    res.status(200).json(allPatients);
  } catch (err) {
    res.status(400).json({ message: "Error occured", err: err });
  }
};

const acceptPharmacist = async (req, res) => {
  const { username } = req.body;
  try {
    const updatedPharmacist = await pharmacistModel.findOneAndUpdate(
      { username: username },
      { $set: { status: "WAITING" } },
      { new: true }
    );

    if (!updatedPharmacist) {
      return res.status(404).json({ message: "Pharmacist not found." });
    }

    return res.json(updatedPharmacist);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const rejectPharmacist = async (req, res) => {
  const { username } = req.body;
  try {
    const updatedPharmacist = await pharmacistModel.findOneAndUpdate(
      { username: username },
      { $set: { status: "REJECTED" } },
      { new: true }
    );

    if (!updatedPharmacist) {
      return res.status(404).json({ message: "Pharmacist not found." });
    }

    return res.json(updatedPharmacist);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const sendContract = async (req, res) => {
  const { username } = req.body;
  try {
    const pharmacist = await pharmacistModel.findOne({ username: username });
    const contract = new contractModel({
      username: username,
      hourlyRate: pharmacist.hourlyRate,
      clinicRate: 0.1 * pharmacist.hourlyRate,
      role: "PHARMACIST",
    });
    const updatedpharmacist = await pharmacistModel.findOneAndUpdate(
      { username: username },
      { $set: { contractID: contract._id } },
      { new: true }
    );
    const newContract = await contract.save();
    res.status(201).json(newContract);
  } catch (err) {
    res.json({ message: err.message, status: 409 });
  }
};

const viewSalesReport = async (req, res) => {
  const monthNumber = req.body.month;

  // Validate month number (1 to 12)
  if (monthNumber < 1 || monthNumber > 12) {
    return res.status(400).json({ error: "Invalid month number" });
  }

  // Assuming 'monthNumber' is a number representing the month (1 to 12)
  const startOfMonth = new Date(new Date().getFullYear(), monthNumber - 1, 1);
  const endOfMonth = new Date(
    new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)
  );

  try {
    const sales = await salesModel.find({
      date: {
        $gte: startOfMonth,
        $lt: endOfMonth,
      },
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginAdmin,
  createAdmin,
  deletePatient,
  deletePharmacist,
  deleteAdmin,
  viewPharmacists,
  viewPatients,
  acceptPharmacist,
  rejectPharmacist,
  sendContract,
  resetPassword,
  viewSalesReport,
};
