const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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


const appointmentModel = mongoose.model("Appointment", appointmentSchema);
module.exports = appointmentModel;
