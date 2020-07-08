const mongoose = require("mongoose")

const patientDetail = new mongoose.Schema({
    cur_problem: {
        type: Array,
        default: null,
        trim: true
    },
    past_problem: {
        type: Array,
        default: null,
        trim: true
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    sex: {
        type: String,
        enum: ['M','F','Other'],
        required: true
    },
    city : {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true,
        enum: ["Andhra Pradesh","Andaman and Nicobar Islands","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh","Dadar and Nagar Haveli","Daman and Diu","Delhi",
        "Lakshadweep","Puducherry","Goa","Gujarat","Haryana","Himachal Pradesh",
        "Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
        "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
        "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
                ]
    },
    phoneNumber: {
        type: Number,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    corona_positive: {
        type: Boolean,
        default: false,

    },
    address: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Profile'
    }
})

const Patient = mongoose.model('patient',patientDetail)

module.exports = Patient