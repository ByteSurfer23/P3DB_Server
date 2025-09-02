import express from 'express';
import { Redis } from 'ioredis';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
// Set up Redis connection
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error("REDIS_URL environment variable is not set.");
    process.exit(1);
}
const redis = new Redis(redisUrl);
const queueName = 'email_queue';
// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: "gmail", // or any SMTP service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
console.log('Worker server started. Waiting for emails in the queue...');
// Worker function to process the queue
async function processQueue() {
    try {
        // Use blocking list pop (BRPOP) to wait for an item in the queue
        // '0' means it will wait indefinitely
        const result = await redis.brpop(queueName, 0);
        if (result) {
            const [key, rawMessage] = result;
            console.log("Processing message from queue:", rawMessage);
            const mailOptions = JSON.parse(rawMessage);
            // Send the email using the local sendMail function
            await sendMail(mailOptions);
        }
    }
    catch (error) {
        console.error('Error processing queue:', error);
    }
    finally {
        // Recursively call the function to keep processing the queue
        processQueue();
    }
}
// Mail sending function
async function sendMail(body) {
    try {
        const { activeSiteDocking, blindDocking, createdAt, ligandTarget, proteinTarget, userEmail, userId, } = body;
        // Build HTML content
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
                <div style="max-width: 600px; background: white; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(90deg, #4e54c8, #8f94fb); padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 22px;">Docking Request Details</h1>
                    </div>
                    <div style="padding: 20px;">
                        <p style="font-size: 15px; color: #333;">Hello, here are the details of the docking request:</p>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; font-weight: bold;">Active Site Docking</td>
                                <td style="padding: 10px;">${activeSiteDocking ? "Yes" : "No"}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Blind Docking</td>
                                <td style="padding: 10px;">${blindDocking ? "Yes" : "No"}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; font-weight: bold;">Protein Target</td>
                                <td style="padding: 10px;">${proteinTarget}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">Ligand Target</td>
                                <td style="padding: 10px;">${ligandTarget}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; font-weight: bold;">Created At</td>
                                <td style="padding: 10px;">${createdAt}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; font-weight: bold;">User Email</td>
                                <td style="padding: 10px;">${userEmail}</td>
                            </tr>
                            <tr style="background-color: #f8f9fa;">
                                <td style="padding: 10px; font-weight: bold;">User ID</td>
                                <td style="padding: 10px;">${userId}</td>
                            </tr>
                        </table>
                    </div>
                    <div style="background-color: #f4f6f8; padding: 15px; text-align: center; font-size: 13px; color: #777;">
                        © ${new Date().getFullYear()} Docking Platform. All rights reserved.
                    </div>
                </div>
            </div>
        `;
        // Send email
        await transporter.sendMail({
            from: `"Docking Platform" <${process.env.NEXT_EMAIL}>`,
            to: "pthreedatabase@gmail.com",
            subject: "Docking Request Submitted",
            html: htmlContent,
        });
        console.log(`Email sent successfully to: pthreedatabase@gmail.com`);
    }
    catch (error) {
        console.error("Failed to send email:", error);
    }
}
// Start the queue worker
processQueue();
// Optional: Start a simple Express server to show that the worker is running
app.get('/', (req, res) => {
    res.status(200).send('Email worker is running and processing the Redis queue.');
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
//# sourceMappingURL=server.js.map