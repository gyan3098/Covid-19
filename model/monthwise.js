const mongoose = require("mongoose")

const monthWise = new mongoose.Schema({
    month: {
        type:String,
        required: true,
        unique: true
    },
    confirmed: {
        type: Number,
            required: true
    },
    death: {
        type: Number,
            required: true
    },
    recovered: {
        type: Number,
            required: true
    },
    new_cases: {
        type: Number,
            required: true
    },
    new_deaths: {
        type: Number,
            required: true
    },
    new_recovered: {
        type: Number,
            required: true
    }

})

const MonthCase = mongoose.model('monthcase',monthWise)
module.exports = MonthCase