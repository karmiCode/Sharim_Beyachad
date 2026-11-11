const mongoose = require("mongoose")

const permissionSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    nameLookup: {
        type: String,
        required: true,
        unique: true,
        select: false
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    validActions: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Permission", permissionSchema)
