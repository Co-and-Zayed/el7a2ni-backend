const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { sendMail } = require("../utils/sendMail");

const patientSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date_of_birth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE"],
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  healthRecords: {
    type: [String],
    default: [],
    required: true,
  },
  emergencyContactName: {
    type: String,
    required: true,
  },
  emergencyContactNumber: {
    type: String,
    required: true,
  },
  // health package
  healthPackage: {
    type: Schema.Types.ObjectId,
    ref: "Package",
  },
  healthPackageStatus: {
    type: String,
    enum: ["SUBSCRIBED", "UNSUBSCRIBED", "CANCELLED"],
  },
  healthPackageRenewalDate: {
    type: Date,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  medicalHistory: {
    type: [String],
    default: [],
  },
  cart: [
    {
      medicine: {
        type: Schema.Types.ObjectId, // Reference to the Medicine model
        ref: "Medicines", // Reference to the "Medicine" collection
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  familyMembers: [
    {
      id: {
        type: Schema.Types.ObjectId,
        ref: "familyMembers",
        // | "patient",
      },
      type: {
        type: String,
        enum: ["GUEST", "EXISTING"],
        required: true,
      },
      relation: {
        type: String,
        enum: ["HUSBAND", "WIFE", "CHILD"],
        required: true,
      },
    },
  ],
});

// Define a virtual property to compute the 'age' based on 'date_of_birth'.
patientSchema.virtual("age").get(function () {
  const today = new Date();
  const date_of_birth = this.date_of_birth;
  const age = today.getFullYear() - date_of_birth.getFullYear();

  // Adjust age if the birthday has not occurred this year yet.
  const monthDiff = today.getMonth() - date_of_birth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < date_of_birth.getDate())
  ) {
    age--;
  }

  return age;
});

patientSchema.post(['save', 'updateOne', 'update', 'findOneAndUpdate'], async function(doc) {
  if (doc.wallet > 0) {
    sendMail(doc.email, 'Yout Wallet Has Been Updated', 'Your wallet has been updated, please check your new balance');
    const notification = new Notification({
      title: 'Yout Wallet Has Been Updated',
      description: 'Your wallet has been updated, please check your new balance',
      type: "PATIENT"
    });

    await notification.save();
  }
});

const patientModel = mongoose.model("Patient", patientSchema);
module.exports = patientModel;
