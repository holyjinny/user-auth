import nodemailer from 'nodemailer';
import { SMTP_SERVER, SMTP_HOST, SMTP_PW } from '../constants';

// Transporter 객체 생성
let transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    secure: true,
    auth: {
        user: SMTP_HOST,
        pass: SMTP_PW,
    },
});

const sendMail = async (email, subject, text, html) => {
    try {
        const msg = {
            html: html,
            text: text,
            subject: subject,
            to: email, // 받는 사람
            from: SMTP_HOST, // 보내는 사람
        };
        // 메일 전송
        await transporter.sendMail(msg);
        console.log("메일 보내짐");
    } catch (err) {
        console.log("ERROR_MAILING", err.message);
    } finally {
        return;
    };
};

export default sendMail;