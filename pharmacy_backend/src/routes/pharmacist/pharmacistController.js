const pharmacistModel = require("../../../../models/pharmacistModel");
const contractModel = require("../../../../models/contractModel");
const Notification = require("../../../../models/notificationModel");
const medicineModel = require("../../../../models/medicineModel");
const salesModel = require("../../../../models/salesModel");

const viewAllContracts = async (req, res) => {
  const { username } = req.user;
  try {
    const contract = await contractModel.find({ username: username });
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
    const pharmacist = await pharmacistModel.findOneAndUpdate(
      { username: username },
      { status: "ACCEPTED" },
      { new: true }
    );
    res.status(200).json({ contract, pharmacist });
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
    const doctor = await pharmacistModel.findOneAndUpdate(
      { username: username },
      { status: "REJECTED" },
      { new: true }
    );
    res.status(200).json({ contract, pharmacist });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
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

  const pharmacist = await pharmacistModel.findOne({ username: user.username });

  pharmacist.password = password;
  await pharmacist.save();

  return res.json({
    success: true,
    message: "Password Reset",
  });
};


const viewAllNotifications = async (req, res) => {
  const notifications = await Notification.find({type: "PHARMACIST"});

  return res.json({
    'success': true,
    'data': notifications
  });
}

const archiveMedicine = async (req, res) => {
  const { _id } = req.body;

  try {
    const medicine = await medicineModel.findOneAndUpdate(
      { _id: _id },
      { status: "ARCHIVED" },
      { new: true }
    );

    res.status(200).json(medicine);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const unarchiveMedicine = async (req, res) => {
  const { _id } = req.body;

  try {
    const medicine = await medicineModel.findOneAndUpdate(
      { _id: _id },
      { status: "AVAILABLE" },
      { new: true }
    );

    res.status(200).json(medicine);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Server error" });
  }
};

const viewSalesReport = async (req, res) => {
  try {
    let salesReport = null;
    let responseArray = [];
    const sales = await salesModel.find({});
    
    for (let i = 0; i < sales.length; i++) {
      salesReport = { ...sales[i].toObject() };
      const medicine = await medicineModel.findById(sales[i].medicineId);
      if(medicine){
        salesReport.medicineName = medicine.name;
        responseArray.push(salesReport);
      }
      
    }
    res.status(200).json(responseArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  resetPassword,
  viewAllContracts,
  acceptContract,
  rejectContract,
  viewAllNotifications,
  archiveMedicine,
  unarchiveMedicine,
  viewSalesReport,
};
