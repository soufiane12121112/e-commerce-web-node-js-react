import express from 'express'
const router = express.Router()
import {
	authUser,
	registerUser,
	getUserProfile,
	updateUserProfile,
	getUsers,
	deleteUser,
	getUserById,
	updateUser,
    forgotPassword,
	resetPassword,
    sendResetPin,
    verifyPin,
	verifyEmail,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/')
    .post(registerUser) // Enregistrement et envoi de l'email de vérification
    .get(protect, admin, getUsers); // Récupération des utilisateurs (admin uniquement)
router.get('/verify-email/:token', verifyEmail); // Vérification de l'email

router.post('/login', authUser)
router
	.route('/profile')
	.get(protect, getUserProfile)
	.put(protect, updateUserProfile)
router
	.route('/:id')
	.delete(protect, admin, deleteUser)
	.get(protect, admin, getUserById)
	.put(protect, admin, updateUser)
router.post('/forgot-password', forgotPassword)
router.post('/reset-pin', sendResetPin);
router.post('/verify-pin', verifyPin);
router.post('/reset-password/:token', resetPassword);

export default router
