import passport from "passport";
import { User } from "../models";
import { Strategy, ExtractJwt } from "passport-jwt";
import { SECRET as secretOrKey } from "../constants";

const opts = {
    secretOrKey,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
    new Strategy(opts, async ({ id }, done) => {
        try {
            let user = await User.findById(id);
            if (!user) {
                throw new Error('유저를 찾을 수  없습니다.');
            }
            return done(null, user.getUserInfo());
        } catch (error) {
            done(null, false);
        }
    })
);