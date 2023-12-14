const pharmacistModel = require("../../../../models/pharmacistModel");
const contractModel = require("../../../../models/contractModel");
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
// const filterSalesReport = async (req, res) => {
//   const { month, medicine, date } = req.body;

//   // Validate month number (1 to 12)
//   if (month && (month < 1 || month > 12)) {
//     return res.status(400).json({ error: "Invalid month number" });
//   }

//   // Validate date format if provided
//   if (date) {
//     const isValidDate = !isNaN(Date.parse(date));
//     if (!isValidDate) {
//       return res.status(400).json({ error: "Invalid date format" });
//     }
//   }

//   // Build query based on filters
//   const query = {};
//   if (month) {
//     const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
//     const endOfMonth = new Date(
//       new Date(startOfMonth).setMonth(startOfMonth.getMonth() + 1)
//     );
//     query.date = {
//       $gte: startOfMonth,
//       $lt: endOfMonth,
//     };
//   }

//   if (medicine) {
//     query.medicine = medicine; // Assuming 'medicine' is the field to filter by
//   }

//   if (date) {
//     query.date = new Date(date);
//   }

//   try {
//     const sales = await salesModel.find(query);

//     res.status(200).json(sales);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = {
  resetPassword,
  viewAllContracts,
  acceptContract,
  rejectContract,
  archiveMedicine,
  unarchiveMedicine,
  viewSalesReport,
  // filterSalesReport,
};
