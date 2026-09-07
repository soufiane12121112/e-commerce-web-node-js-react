	import nodemailer from 'nodemailer'

	const sendEmail = async (options) => {
		const transporter = nodemailer.createTransport({
			service: 'gmail', // Utilisez le service email approprié
			auth: {
				user: process.env.EMAIL_USER, // Email d'envoi
				pass: process.env.EMAIL_PASS, // Mot de passe ou clé API
			},
		})

		const mailOptions = {
			from: process.env.EMAIL_USER,
			to: options.to,
			subject: options.subject,
			text: options.text,
		}

		await transporter.sendMail(mailOptions)
	}

	export default sendEmail
