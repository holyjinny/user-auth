import { Router } from 'express';
import { DOMAIN } from '../constants';
import { Post, User } from '../models';
import { userAuth } from '../middlewares/auth-guard';
import SlugGenerator from '../functions/slug-generator';
import validator from '../middlewares/validator-middleware';
import { postValidations } from '../validators/post-validators';
import { uploadPostImage as uploader } from '../middlewares/uploader';

const router = Router();

/**
 * @description To upload post image
 * @api /posts/api/post-image-upload
 * @access private
 * @type POST
 */

router.post(
    '/api/post-image-upload',
    userAuth,
    uploader.single('image'),
    async (req, res) => {
        try {
            let { file } = req;
            let filename = DOMAIN + "post-images/" + file.filename;
            return res.status(200).json({
                success: true,
                filename,
                message: "이미지가 등록되었습니다.",
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "이미지를 등록 할 수 없습니다.",
            });
        }
    }
);

/**
 * @description To create a new post by the authenticated User
 * @api /posts/api/create-post
 * @access private
 * @type POST
 */

router.post(
    '/api/create-post',
    userAuth,
    postValidations,
    validator,
    async (req, res) => {
        try {
            // Create a new Post
            let { body } = req;
            let post = new Post({
                author: req.user._id,
                ...body,
                slug: SlugGenerator(body.title),
            });
            await post.save();
            return res.status(201).json({
                post,
                success: true,
                message: "게시글이 작성되었습니다.",
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "글을 작성할 수 없습니다.",
            });
        }
    }
);

/**
 * @description To update a post by the authenticated User
 * @api /posts/api/update-post/:id
 * @access private
 * @type PUT
 */

router.put(
    '/api/update-post/:id',
    userAuth,
    postValidations,
    validator,
    async (req, res) => {
        try {
            let { id } = req.params;
            let { user, body } = req;

            // Check if the post with tje id is in the database or not?
            let post = await Post.findById(id);
            if (!post) {
                return res.status(404).json({
                    success: false,
                    message: "게시글이 존재하지 않습니다.",
                });
            }

            if (post.author.toString() !== user._id.toString()) {
                return res.status(401).json({
                    success: false,
                    message: "본인의 게시글만 수정할 수 있습니다.",
                });
            }

            post = await Post.findByIdAndUpdate(
                { author: user._id, _id: id },
                {
                    ...body,
                    slug: SlugGenerator(body.title),
                },
                { new: true },
            );
            return res.status(200).json({
                post,
                success: true,
                message: "게시글 수정이 완료되었습니다.",
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "글을 수정할 수 없습니다.",
            });
        }
    }
);

/**
 * @description To like a post by the authenticated User
 * @api /posts/api/like-post/:id
 * @access private
 * @type PUT
 */

router.put('/api/like-post/:id', userAuth, async (req, res) => {
    try {
        let { id } = req.params;
        let post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "게시글이 존재하지 않습니다.",
            });
        }

        let user = post.likes.user.map((id) => id.toString());
        if (user.includes(req.user._id.toString())) {
            return res.status(404).json({
                success: false,
                message: "이미 좋아요를 누른 게시글입니다.",
            });
        };

        post = await Post.findOneAndUpdate(
            { _id: id },
            {
                likes:
                {
                    count: post.likes.count + 1,
                    user: [...post.likes.user, req.user._id],
                }
            },
            { new: true },
        );
        return res.status(200).json({
            success: true,
            message: "게시글에 좋아요를 눌렀습니다.",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "좋아요를 누를 수 없습니다. 잠시 후에 다시 시도해주세요.",
        });
    }
});

export default router;