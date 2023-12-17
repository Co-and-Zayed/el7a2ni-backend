const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {sendMail} = require("../utils/sendMail");
const pharmacistModel = require("../models/pharmacistModel");
const Notification = require("../models/notificationModel");

// Attributes: name, picture, price, description, mainActiveIngredient, otherActiveIngredients, medicinalUse, availableQuantity, status
const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: String,
  mainActiveIngredient: {
    type: String,
    required: true,
  },
  otherActiveIngredients: {
    type: [String],
    required: true,
  },
  medicinalUse: {
    type: [String],
    required: true,
  },
  availableQuantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["AVAILABLE", "ARCHIVED"],
    default: "AVAILABLE",
  },
  type: {
    type: String,
    enum: ["OTC", "PRESCRIPTION"],
    default: "OTC",
  }
});

medicineSchema.post(['save', 'updateOne', 'update', 'findOneAndUpdate'], async function(doc) {
  if (doc.availableQuantity <= 0) {
    const pharmacists = await pharmacistModel.find();
    pharmacists.map((pharmacist) => {
      sendMail(pharmacist?.email, 'Medicine Is Out Of Stock', `${doc.name} is out of stock please remember to restock it`);
    });
    const newNotification = new Notification({
       title: 'Medicine Is Out Of Stock',
       description: `${doc.name} is out of stock please remember to restock it`,
       type: "PHARMACIST"
    });

    await newNotification.save();
  }
});

const medicineModel = mongoose.model("Medicine", medicineSchema);

module.exports = medicineModel;
