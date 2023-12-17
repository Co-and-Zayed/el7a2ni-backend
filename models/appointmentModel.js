const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Notification = require("../models/notificationModel");
const patientModel = require("./patientModel");
const doctorModel = require("./doctorModel");
const { sendMail } = require("../utils/sendMail");

const appointmentSchema = new Schema({
  patientId: {
    type: String,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["UPCOMING", "CANCELLED", "COMPLETED", "RESCHEDULED","REJECTED","PENDING"],
    default: "UPCOMING",
    required: true,
  },
  patientType: {
    type: String,
    enum: ["PATIENT", "GUEST"],
    default: "PATIENT",
  },
  price: {
    type: Number,
    required: true,
  },
});

// Derive time from date
appointmentSchema.virtual("time").get(function () {
  return this.date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
});


appointmentSchema.post(['save', 'updateOne', 'update', 'findOneAndUpdate'], async function (doc) {
  patient = await patientModel.findById(doc.patientId);
  doctor = await doctorModel.findById(doc.doctorId);
  if (doc.status === "CANCELLED") {

    sendMail(patient.email, 'Appointment Has Been Cancelled', `Appointment with ${doctor.name} on ${doc.date} has been cancelled`);
    sendMail(doctor.email, 'Appointment Cancelled', `Appointment with ${patient.name} on ${doc.date} has been cancelled`);

    const patientNotification = new Notification({
      title: 'Appointment Has Been Cancelled',
      description: `Appointment with ${doctor.name} on ${doc.date} has been cancelled`,
      type: "PATIENT"
    });
    await patientNotification.save();

    const doctorNotification = new Notification({
      title: 'Appointment Has Been Cancelled',
      description: `Appointment with ${patient.name} on ${doc.date} has been cancelled`,
      type: "DOCTOR"
    });
    doctorNotification.save();
  }
  else {
    sendMail(patient.email, 'Appointment Has Been Postponed', `Appointment with ${doctor.name} on ${doc.date} has been Postponed`);
    sendMail(doctor.email, 'Appointment Postponed', `Appointment with ${patient.name} on ${doc.date} has been postponed`);

    const patientNotification = new Notification({
      title: 'Appointment Has Been Postponed',
      description: `Appointment with ${doctor.name} on ${doc.date} has been postponed`,
      type: "PATIENT"
    });
    await patientNotification.save();

    const doctorNotification = new Notification({
      title: 'Appointment Has Been Postponed',
      description: `Appointment with ${patient.name} on ${doc.date} has been postponed`,
      type: "DOCTOR"
    });
    doctorNotification.save();
  }
});


const appointmentModel = mongoose.model("Appointment", appointmentSchema);
module.exports = appointmentModel;
