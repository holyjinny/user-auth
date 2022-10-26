import { Router } from "express";
import { Profile, User } from '../models';
import { DOMAIN } from '../constants';
import uploader from '../middlewares/uploader';
import { userAuth } from '../middlewares/auth-guard';

const router = Router();

/**
 * @description To create profile of the authenticated User
 * @api /profiles/api/create-profile
 * @access Private
 * @type POST <multipart-form> request
 */

router.post(
    '/api/create-profile',
    userAuth,
    uploader.single('avatar'),
    async (req, res) => {
        try {
            let { body, file, user } = req;
            let path = DOMAIN + file.path.split('uploads/')[1];
            let profile = new Profile({
                social: body,
                account: user._id,
                avatar: path,
            });
            await profile.save();
            return res.status(201).json({
                success: true,
                message: "프로필 생성 완료.",
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "프로필 생성 실패.",
            });
        }

    }
);

/**
 * @description To get the authenticated user's profile
 * @api /profiles/api/my-profile
 * @access Private
 * @type GET
 */

router.get('/api/my-profile', userAuth, async (req, res) => {
    try {
        let profile = await Profile.findOne({ account: req.user._id }).populate(
            'account',
            // 필요한 요소들만 불러오고 싶어서 (비번은 공개 X)
            'name email username'
        );
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "고객님의 프로필이 등록되어있지 않습니다.",
            });
        }
        return res.status(200).json({
            success: true,
            profile,
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "프로필을 불러올 수 없습니다.",
        });
    }
});

/**
 * @description To update authenticated user's profile
 * @api /profiles/api/update-profile
 * @access Private
 * @type PUT <multipart-form> request
 */

router.put('/api/update-profile', userAuth, uploader.single('avatar'), async (req, res) => {
    try {
        let { body, file, user } = req;
        let path = DOMAIN + file.path.split('uploads/')[1];
        let profile = await Profile.findOneAndUpdate(
            { account: user._id },
            { social: body, avatar: path },
            { new: true }
        );
        return res.status(200).json({
            success: true,
            message: "프로필이 업데이트 되었습니다.",
            profile,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "프로필을 불러올 수 없습니다.",
        });
    }
});

/**
 * @description To get user's profile with the username
 * @api /profiles/api/profile-user/:username'
 * @access Public
 * @type GET
 */

router.get('/api/profile-user/:username', async (req, res) => {
    try {
        let { username } = req.params;
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "유저를 찾을 수 없습니다.",
            });
        }
        let profile = await Profile.findOne({ account: user._id });
        return res.status(200).json({
            profile: {
                ...profile.toObject(),
                account: user.getUserInfo(),
            },
            success: true,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "에러가 발생했습니다.",
        });
    }
});

export default router;