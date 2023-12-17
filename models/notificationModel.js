const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["PATIENT", "PHARMACIST", "DOCTOR"],
        required: true
    }
});

const notificationModel = mongoose.model("Notification", notificationSchema);

module.exports = notificationModel;