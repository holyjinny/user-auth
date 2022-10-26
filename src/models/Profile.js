import { Schema, model } from "mongoose";

const ProfileSchema = new Schema(
    {
        account: {
            // const User = model("users", UserSchema); DB 참조
            ref: 'users',
            type: Schema.Types.ObjectId,
        },
        avatar: {
            type: String,
            required: false,
        },
        social: {
            google: {
                type: String,
                required: false,
            },
            naver: {
                type: String,
                required: false,
            },
            kakao: {
                type: String,
                required: false,
            },
            github: {
                type: String,
                required: false,
            },
        }
    },
    { timestamps: true }
);

const Profile = model('profiles', ProfileSchema);

export default Profile;