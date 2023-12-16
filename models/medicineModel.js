const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

const medicineModel = mongoose.model("Medicine", medicineSchema);
module.exports = medicineModel;
