import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    contacts: [{
            name: { type: String, required: true },
            phone: { type: String, required: true },
            isPrimary: { type: Boolean, default: false },
        }],
}, {
    timestamps: true,
});
export const User = mongoose.model('User', userSchema);
