import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { Client, Users } from "node-appwrite";

export async function POST(request: Request) {
    try {
        const { userEmail, userName } = await request.json();

        // 1. Initialize node-appwrite to get all admins
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string);
        
        // Optional API key, if it's there
        if (process.env.APPWRITE_API_KEY) {
            client.setKey(process.env.APPWRITE_API_KEY);
        }

        let adminEmails: string[] = [];

        try {
            if (process.env.APPWRITE_API_KEY) {
                const users = new Users(client);
                const userList = await users.list();
                // Filter users who have 'admin' label
                adminEmails = userList.users
                    .filter(u => u.labels && u.labels.includes("admin"))
                    .map(u => u.email);
            }
        } catch (e) {
            console.warn("Could not fetch users via node-appwrite:", e);
        }

        // Fallback to EMAIL_USER if list is empty or fails
        if (adminEmails.length === 0) {
            if (process.env.EMAIL_USER) {
                adminEmails.push(process.env.EMAIL_USER);
            }
        }

        if (adminEmails.length === 0) {
            throw new Error("No admin emails found to notify");
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender must be the authenticated user
            to: adminEmails.join(','),
            subject: `New Chat Request from ${userName}`,
            text: `User ${userName} (${userEmail}) wants to connect in the chat room. Please log in to the admin dashboard to assist them.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">New Chat Request</h2>
                    <p><strong>User ${userName}</strong> (${userEmail}) has requested to connect in a chat room.</p>
                    <p>Please log in to your admin dashboard to assist them.</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">This is an automated notification from the VBond system.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: 'Email sent successfully to admins' ,adminEmails}, { status: 200 });

    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
    }
}
