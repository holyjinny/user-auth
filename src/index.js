import cors from 'cors';
import { join } from 'path';
import consola from 'consola';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import { json } from 'body-parser';

// Import Constants
import { DB, PORT } from './constants';

// Import Router
import userApis from './apis/users';
import profileApis from './apis/profiles';
import postApis from './apis/posts';

// Import passport
require('./middlewares/passport-middleware');

// express init
const app = express();

// Apply Middlewares
app.use(cors());
app.use(json());
app.use(passport.initialize());
app.use(express.static(join(__dirname, './uploads')));

// Inject Sub router and apis
app.use('/users', userApis);
app.use('/profiles', profileApis);
app.use('/posts', postApis);

const main = async () => {
    try {
        // DB 연결
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        consola.success("DATABASE CONNECTED ...");

        // 서버에서 요청 수신 시작
        app.listen(PORT, () => consola.success(`Server started on port ${PORT}`));
    } catch (err) {
        consola.error(`Unable to start the server \n${err.message}`);
    }
};

main();