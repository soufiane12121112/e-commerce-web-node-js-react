import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (userEmail, token) => {
    const verificationLink = `${process.env.BASE_URL}/api/users/verify-email/${token}`;

    const mailOptions = {
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Vérification de votre email',
        html: `<p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
               <a href="${verificationLink}">Vérifier mon email</a>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email de vérification envoyé');
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
};
