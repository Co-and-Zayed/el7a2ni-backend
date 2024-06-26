const appointmentModel = require("../../../../models/appointmentModel");
const patientModel = require("../../../../models/patientModel");
const doctorModel = require("../../../../models/doctorModel");
const familyMembersModel = require("../../../../models/familyMembersModel");
const { default: mongoose } = require("mongoose");
const userModel = require("../../../../models/userModel");
const { create } = require("../../../../models/refreshTokensModel");
const { payWithWallet } = require("../patient/patientController");
const { refundToWallet } = require("../patient/patientController");

// POST create a new appointment
// Params: patientId, doctorId, date, status
const createAppointment = async (req, res) => {
  const { username } = req.user;
  const { patientId, doctorId, date, patientType, amount, method } = req.body;

  const dateObject = new Date(date);

  const dateOnly = dateObject.toISOString().split("T")[0];
  const time = dateObject.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (!patientId || !doctorId || !date) {
    return res.status(400).json({
      message: "Please provide all required fields: patientId, doctorId, date",
    });
  }

  try {
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Find the slot in the doctor's model
    const slot = doctor.slots.find(
      (slot) =>
        slot.date.toISOString().split("T")[0] === dateOnly &&
        slot.time === time &&
        !slot.booked
    );

    if (!slot) {
      return res.status(400).json({ message: "Slot not available" });
    }
    if (method === "wallet") {
      await payWithWallet(req, res);
    }

    const patient = await patientModel.findOne({ username });
    // Set the slot as booked
    slot.booked = true;

    const appointment = new appointmentModel({
      patientId: patientId,
      doctorId: doctorId,
      date: date,
      status: "UPCOMING",
      patientType: patientType,
      price: amount,
    });

    // Save the updated doctor with the booked slot
    await doctor.save();

    const newAppointment = await appointment.save();

    res.status(200).json({
      appointment: {
        ...newAppointment._doc,
        time: newAppointment.time,
      },
      user: patient,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAppointments = async (req, res) => {
  const { type, username } = req.user;
  var id;
  if (type === "PATIENT") {
    const patient = await patientModel.findOne({ username: username });
    id = patient._id;
  } else {
    const doctor = await doctorModel.findOne({ username: username });
    id = doctor._id;
  }
  // convert id to ObjectId

  // get family members of this patient and get their appointments

  try {
    var appointments = [];
    console.log("CHECKPOINT 1");
    if (type === "PATIENT") {
      const patient = await patientModel.findOne(id).select("-password").lean();
      appointments = await appointmentModel
        .find({ patientId: id })
        .lean()
        .select("-patientId");

      // console.log("Patient", patient);
      // const familyMembers = await patient.familyMembers;
      // for (let i = 0; i < familyMembers.length; i++) {
      //   const familyMember = familyMembers[i];
      //   const familyMemberAppointments = await appointmentModel
      //     .find({ patientId: familyMember.id })
      //     .lean()
      //     .select("-patientId");

      //   for (let i = 0; i < familyMemberAppointments.length; i++) {
      //     const appointment = familyMemberAppointments[i];

      //     const doctor = await doctorModel
      //       .findById(appointment.doctorId)
      //       .select("-password")
      //       .lean();

      //     familyMemberAppointments[i] = {
      //       ...appointment,
      //       patient: familyMember,
      //       doctor,
      //       time: appointment.time,
      //     };
      //   }
      //   appointments.push(...familyMemberAppointments);
      // }
      for (let i = 0; i < appointments.length; i++) {
        const appointment = appointments[i];

        const doctor = await doctorModel
          .findById(appointment.doctorId)
          .select("-password")
          .lean();

        appointments[i] = {
          ...appointment,
          patient,
          doctor,
          time: appointment.time,
        };
      }
    } else {
      console.log("CHECKPOINT 2");
      appointments = await appointmentModel
        .find({ doctorId: id })
        .lean()
        .select("-doctorId");

      const doctor = await doctorModel.findById(id).select("-password").lean();

      for (let i = 0; i < appointments.length; i++) {
        const appointment = appointments[i];

        const patient =
          appointment.patientType && appointment.patientType === "GUEST"
            ? await familyMembersModel
                .findById(appointment.patientId)
                .select("-password")
                .lean()
            : await patientModel
                .findById(appointment.patientId)
                .select("-password")
                .lean();

        appointments[i] = {
          ...appointment,
          patient,
          doctor,
          time: appointment.time,
        };
      }
    }

    // Loop through appointments to check and update status
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];

      // Combine the date and virtual time for the appointment
      const currDate = new Date();
      const appointmentDate = new Date(appointment.date);

      // Check if the appointment date and time have passed
      if (
        appointmentDate < currDate &&
        !["CANCELLED", "RESCHEDULED", "COMPLETED"].includes(appointment.status)
      ) {
        // Update the status to "COMPLETED"
        await appointmentModel.findByIdAndUpdate(
          appointment._id,
          { status: "COMPLETED" },
          { new: true }
        );
        appointments[i].status = "COMPLETED"; // Update in-memory data
      }
    }

    console.log("CHECKPOINT 3");
    const appointmentsWithTime = appointments.map((appointment) => {
      return {
        ...appointment, // Use toObject() to get the document data
        time: appointment.time, // Include the virtual "time" property
      };
    });
    console.log("CHECKPOINT 4");
    // sort appointments by date
    appointmentsWithTime.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
    res.json(appointmentsWithTime);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { patientId, doctorId, date, time, status, method } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No appointment with id: ${id}`);
  }
  const updatedAppointment = {
    patientId,
    doctorId,
    date,
    time,
    status,
  };
  await appointmentModel.findByIdAndUpdate(id, updatedAppointment, {
    new: true,
  });
  if (method === "wallet" && status === "CANCELLED") {
    await refundToWallet(req, res);
  }
  res.json({
    updatedAppointment,
    // ,user: patientModel.findOne({ username: req.user.username }),
  });
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send(`No appointment with id: ${id}`);
  }
  await appointmentModel.findByIdAndRemove(id);
  res.json({ message: "Appointment deleted successfully." });
};

//Checking if the date and time for an appointment is valid to be created
//(Should be used in create and update appointment)

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment,
};
