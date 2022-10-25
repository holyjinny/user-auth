import cors from 'cors';
import consola from 'consola';
import express from 'express';
import mongoose from 'mongoose';
import { json } from 'body-parser';

// Import Constants
import { DB, PORT } from './constants';

// Router
import userApis from './apis/users';

// express init
const app = express();

// Apply Middlewares
app.use(cors());
app.use(json());

// Inject Sub router and apis
app.use('/users', userApis);

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