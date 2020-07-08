const mongoose = require("mongoose")

const stateDetail = new mongoose.Schema({
    confirmed: {
        type: Number,
        default: 0
    },
    deaths: {
        type: Number,
        default: 0
    },
    recovered: {
        type: Number,
        default: 0
    },
    loc: {
        type: String,
        default: 0,
        unique: true
    },
    new_cases: {
        type: Number,
        default: 0
    },
})

const State = mongoose.model('state',stateDetail)
module.exports = State