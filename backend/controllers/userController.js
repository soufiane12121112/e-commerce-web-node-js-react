import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer';
import sendEmail from '../utils/sendEmail.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/emailService.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body

	const user = await User.findOne({ email })

	if (user && (await user.matchPassword(password))) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token: generateToken(user._id),
		})
	} else {
		res.status(401)
		throw new Error('Invalid email or password')
	}
})


// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Générer un token de vérification
    const emailToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const user = await User.create({
        name,
        email,
        password, // Tu peux gérer le hash dans un middleware pre('save') du modèle Mongoose
        emailToken, // Stocker temporairement le token
        isVerified: false, // Initialement non vérifié
    });

    if (user) {
        // Envoyer l'email de vérification
        await sendVerificationEmail(user.email, emailToken);

        res.status(201).json({
    		_id: user._id,
    		name: user.name,
    		email: user.email,
    		isAdmin: user.isAdmin,
    		token: generateToken(user._id),
	});
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});
// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id)
	if (user) {
		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
		})
	} else {
		res.status(404)
		throw new Error('User Not Found')
	}
})
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id)
	if (user) {
		user.name = req.body.name || user.name
		user.email = req.body.email || user.email
		if (req.body.password) {
			user.password = req.body.password
		}

		const updatedUser = await user.save()

		res.status(201).json({
			message: 'User created! Please check your email to verify your account.',
		});
	} else {
		res.status(404)
		throw new Error('User Not Found')
	}
})
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
	const users = await User.find()
	res.json(users)
})
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error in deleteUser:', error.message);
        res.status(500).json({ message: 'Server error: Unable to delete user' });
    }
});
// @desc    Get user bu ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id).select('-password')
	if (user) {
		res.json(user)
	} else {
		res.status(404)
		throw new Error('User not found')
	}
})
// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.params.id)
  
	if (user) {
	  // Update fields
	  user.name = req.body.name || user.name
	  user.email = req.body.email || user.email
	  user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin
	  user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified // Update isVerified field
  
	  // Save the updated user
	  const updatedUser = await user.save()
  
	  res.json({
		_id: updatedUser._id,
		name: updatedUser.name,
		email: updatedUser.email,
		isAdmin: updatedUser.isAdmin,
		isVerified: updatedUser.isVerified, // Return updated isVerified
	  })
	} else {
	  res.status(404)
	  throw new Error('User Not Found')
	}
  })


export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Vérifier si l'email est fourni
    if (!email) {
        res.status(400);
        throw new Error("Veuillez fournir une adresse email.");
    }

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("Utilisateur non trouvé.");
    }

    // Générer un code PIN à 6 chiffres
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Hacher le code PIN pour le stocker dans la base de données
    const hashedPin = crypto.createHash('sha256').update(resetPin).digest('hex');

    // Sauvegarder le code PIN haché et son expiration
    user.resetPin = hashedPin;
    user.resetPinExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Construire le message pour envoyer le code PIN
    const message = `Vous avez demandé une réinitialisation de votre mot de passe. Voici votre code PIN de réinitialisation : ${resetPin}. Ce code est valable 10 minutes.\n\nSi vous n'avez pas demandé cela, ignorez cet email.`;

    try {
        // Utiliser la fonction sendEmail pour envoyer le PIN
        await sendEmail({
            to: user.email,
            subject: 'Code PIN de réinitialisation de mot de passe',
            text: message,
        });

        res.status(200).json({ message: 'Code PIN envoyé avec succès.' });
    } catch (error) {
        // Annuler les changements dans la base de données en cas d'erreur
        user.resetPin = undefined;
        user.resetPinExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(500);
        throw new Error("Impossible d'envoyer l'email de réinitialisation.");
    }
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const resetToken = req.params.token; // Récupère le token depuis l'URL

    if (!resetToken) {
        return res.status(400).json({ message: 'Token requis.' });
    }

    // Hash le token pour le comparer avec celui stocké
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }, // Vérifie l'expiration
    });

    if (!user) {
        return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    // Met à jour le mot de passe SANS le hasher manuellement (Mongoose s'en charge)
    user.password = password;

    // Supprime le token après utilisation
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // Ici, le hook `pre('save')` va hasher le mot de passe

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès !' });
});



export const sendResetPin = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un code PIN à 6 chiffres
    const resetPin = Math.floor(100000 + Math.random() * 900000).toString();

    // Hacher le code PIN pour le stocker dans la base de données
    const hashedPin = crypto.createHash('sha256').update(resetPin).digest('hex');

    user.resetPin = hashedPin;
    user.resetPinExpire = Date.now() + 10 * 60 * 1000; // Expiration après 10 minutes

    await user.save();

    // Utilisation de la fonction sendEmail pour envoyer le code PIN
    const message = `Votre code PIN de réinitialisation est : ${resetPin}. Ce code est valable 10 minutes.`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Votre code PIN de réinitialisation',
            text: message,
        });
        res.json({ message: 'Code PIN envoyé par e-mail !' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'e-mail' });
    }
};



export const verifyPin = asyncHandler(async (req, res) => {
    const { email, pin } = req.body;

    if (!email || !pin) {
        return res.status(400).json({ message: 'Email et PIN sont requis.' });
    }

    // Hash le PIN pour le comparer avec celui stocké
    const hashedPin = crypto.createHash('sha256').update(pin).digest('hex');

    const user = await User.findOne({
        email,
        resetPin: hashedPin,
        resetPinExpire: { $gt: Date.now() }, // Vérifie l'expiration du PIN
    });

    if (!user) {
        return res.status(400).json({ message: 'PIN invalide ou expiré.' });
    }

    // Génère un token sécurisé (chaîne aléatoire)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash le token avant de le stocker
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Stocke le token et définit une expiration (30 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    await user.save();

    // Renvoie le token brut au frontend
    res.status(200).json({ token: resetToken, message: 'PIN validé. Vous pouvez réinitialiser votre mot de passe.' });
});

export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        user.isVerified = true;
        user.emailToken = undefined; // Supprimer le token
        await user.save();

        res.json({ message: 'Email successfully verified!' });
    } catch (error) {
        res.status(400);
        throw new Error('Invalid or expired token');
    }
});


export {
	authUser,
	registerUser,
	getUserProfile,
	updateUserProfile,
	getUsers,
	deleteUser,
	getUserById,
	updateUser,
}
