import { check } from "express-validator";

const title = check('title', "제목을 작성해주세요.").not().isEmpty();

const content = check('content', "게시글을 작성해주세요.").not().isEmpty();

export const postValidations = [title, content];