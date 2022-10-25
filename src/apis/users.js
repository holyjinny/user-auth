import { join } from 'path';
import { User } from '../models';
import { Router } from 'express';
import { DOMAIN, SMTP_TEST1, SMTP_TEST2 } from '../constants';
import sendMail from '../functions/email-sender';
import { randomBytes } from 'crypto';
import Validator from '../middlewares/validator-middleware';
import { AuthenticateValidations, RegisterValidations } from '../validators';

const router = Router();

/**
 * @description To create a new User Account
 * @api /users/api/register
 * @access Public
 * @type POST
 */

router.post(
    '/api/register',
    RegisterValidations,
    Validator,
    async (req, res) => {
        try {
            let { username, email } = req.body;

            // Check if the username is taken or not
            let user = await User.findOne({ username });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: '유저 이름이 이미 존재합니다.',
                });
            }

            // Check if the user exists with that email
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: '등록된 이메일입니다. 비밀번호를 찾으시겠습니까?',
                });
            }

            user = new User({
                ...req.body,
                verificationCode: randomBytes(20).toString('hex'),
            });

            await user.save();

            // 이메일 보내기 (sendgrid or smtp) 에 대해 알아보고 적용시키기
            let html = `
            <h1>Hello, ${user.username}</h1>
            <p>Please click the following link to verify your account</p>
            <a href="${DOMAIN}users/verify-now/${user.verificationCode}">Verify Now</a>
        `;
            // 테스트 용으로 내 메일에만 보내지게 설정
            if (user.email === SMTP_TEST1 || user.email === SMTP_TEST2) {
                sendMail(user.email, '유효한 계정입니다.', 'Please verify Your Account.', html);
            };
            return res.status(201).json({
                success: true,
                message: "Welcome! 계정 생성이 완료되었습니다.",
            });
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "에러가 발생했습니다.",
            });
        }
    }
);

/**
 * @description To verify a new user's account via email
 * @api /users/verify-now/:verificationCode
 * @access PUBLIC <Only Via email>
 * @type GET
 */

router.get('/verify-now/:verificationCode', async (req, res) => {
    try {
        let { verificationCode } = req.params;
        let user = await User.findOne({ verificationCode });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access. Invalid verification code.",
            });
        }
        user.verified = true;
        user.verificationCode = undefined;
        await user.save();
        return res.sendFile(join(__dirname, '../templates/verification-success.html'));
    } catch (error) {
        console.log('ERR', error.message);
        return res.sendFile(join(__dirname, '../templates/verification-erros.html'));
    }
});

/**
 * @description To authenticate an user and get auth token
 * @api /users/api/authenticate
 * @access PUBLIC
 * @type POST
 */

router.post(
    '/api/authenticate',
    AuthenticateValidations,
    Validator,
    async (req, res) => {
        try {
            let { username, password } = req.body;
            let user = await User.findOne({ username });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "유저이름을 찾을 수 없습니다.",
                });
            }

            if (!(await user.comparePassword(password))) {
                return res.status(401).json({
                    success: false,
                    message: "비밀번호가 맞지 않습니다.",
                });
            }

            let token = await user.generateJWT();
            return res.status(200).json({
                success: true,
                user: user.getUserInfo(),
                token: `Bearer ${token}`,
                message: "환영합니다! 로그인되셨습니다.",
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "에러가 발생했습니다.",
            });
        }
    });

export default router;