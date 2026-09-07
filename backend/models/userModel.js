import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer';

// Create User Schema
const userSchema = mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		isAdmin: {
			type: Boolean,
			required: true,
			default: false,
		},
		isVerified: { 
			type: Boolean,
			required: true,
			default: false,
		},
    	emailToken: {
			type: String,
		},
		resetPasswordToken: {
			type: String,
		},
		resetPasswordExpire: {
			type: Date,
		},
		resetPin: {
			type: String, // Store the hashed PIN here
		},
		resetPinExpire: {
			type: Date, // Store the expiration time for the PIN
		},
	},
	{
		timestamps: true,
	}
)

// To match enteredPassword with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password)
}

// To encrypt password upon registration
userSchema.pre('save', async function (next) {
	// First check if password is modified
	if (!this.isModified('password')) {
		next()
	}

	const salt = await bcrypt.genSalt(10)
	this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
