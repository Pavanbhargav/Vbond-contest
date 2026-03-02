import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(request:Request){
    try{
        const {userEmail,amount,upi_id,userName} = await request.json();
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            },
        });
        const mailOptions = {
            from:userEmail,
            to:process.env.EMAIL_USER,
            subject:`Amount Withdrawn from user ${userEmail}`,
            text:`User ${userName} with email ${userEmail} has withdrawn an amount of ${amount} to UPI ID ${upi_id}.`,
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true, message: 'Email sent successfully' },{status:200});
    }
    catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email' }, { status: 500 });
  }
}