const Doctor = require("../../models/doctorModel.js");
const Patient = require("../../models/patientModel.js");
const Package = require("../../models/packageModel.js");
const Appointment = require("../../models/appointmentModel.js");
const patientModel = require("../../models/patientModel.js");
const packageModel = require("../../models/packageModel.js");
const familyMemberModel = require("../../models/familyMemberModel.js");
const familyMembersModel = require("../../models/familyMembersModel.js");

//GET list of all doctors or doctors by searching name and/or speciality
const getDoctors = async (req, res) => {
  try {
    // get user form request
    const user = req.user;

    if (!user) {
      res
        .status(400)
        .json({ message: "Valid user is required", req: req.body });
      return;
    }
    // Get patient
    var patient = await Patient.findOne({ username: user.username });
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    // Get patient health package
    const patientPackageId = patient.healthPackage;

    var discount = 0;

    // If the patient has a health package
    if (patientPackageId) {
      const patientPackage = await Package.findOne({ _id: patientPackageId });

      discount = patientPackage.doctor_session_discount;
    }

    let params = {};
    if (req.body.name) {
      params.name = new RegExp(req.body.name, "i");
    }
    if (req.body.specialty) {
      params.specialty = req.body.specialty;
    }

    const doctors = await Doctor.find(params).lean();

    // Add to each doctor a field called session_price which is calculated from the patient's healthPackage
    for (let i = 0; i < doctors.length; i++) {
      let doctor = doctors[i];
      let session_price = doctor.hourlyRate * 1.1;
      session_price -= session_price * discount;
      doctor.session_price = session_price;
    }

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error getting doctors:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

const filterDoctors = async (req, res) => {
  try {
    // get user from request
    const user = req.user;

    if (!user) {
      res
        .status(400)
        .json({ message: "Valid user is required", req: req.body });
      return;
    }
    // Get patient
    var patient = await Patient.findOne({ username: user.username });
    if (!patient) {
      res.status(404).json({ message: "Patient not found" });
      return;
    }

    // Get patient health package
    const patientPackageId = patient.healthPackage;

    var discount = 0;

    // If the patient has a health package
    if (patientPackageId) {
      const patientPackage = await Package.findOne({ _id: patientPackageId });

      discount = patientPackage.doctor_session_discount;
    }

    // My params are going to be specialty and a specific date and time
    // I will get the specialty from the request body
    // I will get the date and time from the request body
    // I will get the doctors that have the specialty
    // I will go to the appointments collection and get the doctors do NOT have an appointment at that date and time
    // I will return the doctors that have the specialty and do NOT have an appointment at that date and time

    const doctors = await Doctor.find(
      req.body.specialty && { specialty: req.body.specialty }
    ).lean();

    // combine date and time into a single date object
    const myDate = new Date(req.body.date);
    const time = new Date(req.body.time);

    var date = new Date(
      myDate.getFullYear(),
      myDate.getMonth(),
      myDate.getDate(),
      time.getHours()
    );
    // date.setHours(time.getHours());
    // date.setMinutes(0);
    // date.setSeconds(0);
    // date.setMilliseconds(0);

    console.log("date", date);

    // Get the doctors that have an appointment at the specified date and time
    // const appointments = await Appointment.find({
    //   date: date,
    // }).lean();

    var allApps = await Appointment.find().lean();

    // comapre each date with the date in the request
    const appointments = allApps.filter((appointment) => {
      const appDate = new Date(appointment.date);
      // console.log("appointment.date", appDate);
      // console.log("date", date);
      return appDate.toString() == date.toString();
      // console.log("res", res, "\n");
      // return res;
    });

    console.log("appointments at date: ", appointments);

    // Get the doctors that have an appointment at the specified date and time
    const doctorsWithAppointments = appointments.map(
      (appointment) => appointment.doctorUsername
    );

    console.log("doctorsWithAppointments", doctorsWithAppointments);

    // Filter out the doctors that have an appointment at the specified date and time
    const filteredDoctors = doctors.filter(
      (doctor) => !doctorsWithAppointments.includes(doctor.username)
    );

    // Add to each doctor a field called session_price which is calculated from the patient's healthPackage
    for (let i = 0; i < filteredDoctors.length; i++) {
      let doctor = filteredDoctors[i];
      let session_price = doctor.hourlyRate * 1.1;
      session_price -= session_price * discount;
      doctor.session_price = session_price;
    }

    res.status(200).json(filteredDoctors);
  } catch (error) {
    console.error("Error getting doctors:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

///////////
// ZEINA //
///////////
const getDoctordetails = async (req, res) => {
  // view doctor details by selecting the name.
  const username = req.body.username;

  try {
    const doctor = await Doctor.find({ username });

    res.status(200).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


 const getHealthPackages = async (req, res) => {
  try {
    const healthPackages = await Package.find();

    res.status(200).json(healthPackages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }  
 }
  
 const subscribeToPackage = async (req, res) => {
  const healthPackageID = req.body.package;

  const patientID = req.body.patientID;  // get the patient ID to add to it the HP
  try {
    const package = await packageModel.findById(healthPackageID);
    const currentDate = new Date();
    // Add one year to the current date
    const oneYearLater = new Date(currentDate);
    oneYearLater.setFullYear(currentDate.getFullYear() + 1);
    const patient = await patientModel.findOneAndUpdate(
      { _id: patientID},
      { healthPackage:package, healthPackageStatus:"SUBSCRIBED",healthPackageRenewalDate:oneYearLater }
    );

    res.status(200).json(patient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }  

 }

 const viewPackages = async (req, res) => {
  

  const patientID = req.body.patientID;  // get the patient ID to add to it the HP
  try {
    const patient = await patientModel.findById(patientID);
    const package = await packageModel.findOne({_id: patient.healthPackage});
    res.status(200).json(package);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }  

 }


const getPackagePriceForGuest = async (req, res) => {// called when we click "subscribe" to take us to payment page
  const patientID = req.body.patientID;
  const packageID = req.body.packageID;

  try {
    const patient = await patientModel.findById(patientID);
    const patientHealthPackage = await packageModel.findById(patient.healthPackage);
    const package = await packageModel.findById(packageID);

    let responsePackage = { ...package.toObject() }; // Create a copy of the package

    if (patientHealthPackage != null) {
      const discount = patientHealthPackage.family_discount;
      const price = package.price_per_year;
      const discountedPrice = (1 - discount) * price;

      responsePackage.discountedPrice = discountedPrice;
      console.log(discountedPrice);
    }

    res.status(200).json(responsePackage);
  } catch (err) {
    res.status(400).json({ error: err.message});
  }
};


const subscribeToPackageForGuest = async (req, res) => {// assuming payment has been finalized (hetet el stripe di kolaha khelset)
  const packageID = req.body.packageID;
  const guestID = req.body.guestID;
try {
  const currentDate = new Date();
  // Add one year to the current date
  const oneYearLater = new Date(currentDate);
  oneYearLater.setFullYear(currentDate.getFullYear() + 1);
  const guest = await familyMembersModel.findOneAndUpdate({_id:guestID}, {healthPackage:packageID, status:"SUBSCRIBED", healthPackageRenewalDate:oneYearLater} );

  res.status(200).json(package);// this is called when we click on the subscribe button to take us to the payment page (passing the needed data with us). However, the package is only added to the guest after the payment has been finalized
} catch (err) {
res.status(400).json({ error: err.message });
}  
}




module.exports = { getDoctors, getDoctordetails, filterDoctors ,getHealthPackages,subscribeToPackage,viewPackages, getPackagePriceForGuest, subscribeToPackageForGuest};
