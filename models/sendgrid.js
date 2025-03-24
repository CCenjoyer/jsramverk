const sgMail = require("@sendgrid/mail");
const API_KEY = process.env.SG_API_KEY_2;
const FROM_EMAIL = process.env.FROM_EMAIL;

// Set API Key
sgMail.setApiKey(API_KEY);

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    console.log(API_KEY);
    try {
        const msg = {
            to, // Recipient email
            from: FROM_EMAIL, // Your verified sender email
            subject,
            text,
            html,
        };
        await sgMail.send(msg);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error.response?.body || error);
    }
};

module.exports = sendEmail;
