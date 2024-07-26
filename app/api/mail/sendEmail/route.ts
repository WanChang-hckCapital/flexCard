import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, subject, text } = await req.json() as { email: string; subject: string; text: string; };

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // need to verify no-reply email in gmail settings > account > add another email
        const info = await transporter.sendMail({
            from: `"HCK Capital Technology" <no-reply@hckcapital.net>`,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("info", info);

        return NextResponse.json({ success: true, message: 'Email sent', info });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message });
    }
}
