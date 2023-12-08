const appointmentModel = require("../../../../models/appointmentModel");
const doctorModel = require("../../../../models/doctorModel");
const patientModel = require("../../../../models/patientModel");
const contractModel = require("../../../../models/contractModel");
const { create } = require("../../../../models/refreshTokensModel");

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

//POST Doctor choose available slots
const chooseSlots = async (req, res) => {
  const { doctorId, startTime, endTime } = req.body;

  try {
    // Convert date and times to Date objects
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    // Calculate the number of slots
    const numberOfSlots = Math.ceil((endDate - startDate) / (60 * 60 * 1000));

    // Find the doctor
    const doctor = await doctorModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Generate slots
    const slotsToAdd = Array.from({ length: numberOfSlots }, (_, index) => {
      const slotDate = new Date(startDate);
      slotDate.setHours(startDate.getHours() + index, 0, 0, 0);

      const slotTime = slotDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        date: slotDate.toISOString().split("T")[0],
        time: slotTime,
        booked: false,
      };
    });

    // Check for existing slots in the doctor's document
    const existingSlots = doctor.slots.map((slot) => ({
      date: slot.date,
      time: slot.time,
    }));

    // Filter out slots that already exist in the doctor's slots array
    const uniqueSlots = slotsToAdd.filter(
      (slotToAdd) =>
        !existingSlots.some(
          (existingSlot) =>
            existingSlot.date.toISOString().split("T")[0] === slotToAdd.date &&
            existingSlot.time === slotToAdd.time
        )
    );

    // Add unique slots to the doctor's document
    await doctorModel.findByIdAndUpdate(
      doctorId,
      { $addToSet: { slots: { $each: uniqueSlots } } },
      { new: true }
    );

    // Fetch and return the updated doctor
    const updatedDoctor = await doctorModel.findById(doctorId);
    res.status(200).json(updatedDoctor);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

//PUT Doctor can cancel appointment
const cancelAppointment = async (req, res) => {
  const { _id } = req.body;
  try {
    const appointment = await appointmentModel.findOneAndUpdate(
      { _id: _id },
      { status: "CANCELLED" },
      { new: true }
    );

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

// PUT Doctor can reschedule appointment
const rescheduleAppointment = async (req, res) => {
  const { date, doctorId, _id } = req.body;
  const { patientId, patientType } = req.body;

  const dateObject = new Date(date);

  const dateOnly = dateObject.toISOString().split("T")[0];
  const time = dateObject.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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

    // Set the slot as booked
    slot.booked = true;

    await appointmentModel.findOneAndUpdate(
      { _id: _id },
      { status: "RESCHEDULED" },
      { new: true }
    );
    const newAppointment = new appointmentModel({
      patientId: patientId,
      date: date,
      doctorId: doctorId,
      status: "UPCOMING",
      patientType: patientType,
    });

    // Save the new appointment
    const savedAppointment = await newAppointment.save();

    // Save the updated doctor with the marked slot
    await doctor.save();

    res.status(200).json(savedAppointment);
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
  cancelAppointment,
  rescheduleAppointment,
  chooseSlots,
};
