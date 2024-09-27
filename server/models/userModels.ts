import mongoose from "mongoose";

const useSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxLength: [20, "Your name is up to 20 chars long."]
    },
    email: {
        type: String,
        required: [true, "Please add your email"],
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        trim: true
    },
    avatar: {
        type: String,
        default: "https://static.thenounproject.com/png/363640-200.png"
    },
    role: {
        type: String,
        default: 'user' //admin
    },
    type: {
        type: String,
        default: 'normal' //fast
    }
},{
    timestamps: true
})

export default mongoose.model('User', useSchema)