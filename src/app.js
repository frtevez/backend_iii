import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mockRouter from './routes/mock.router.js';
import { configDotenv } from 'dotenv';

import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";



export const app = express();
configDotenv();
const PORT = process.env.PORT || 8080;
const connection = mongoose.connect(process.env.MONGO_URI)

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Adoptme API",
            version: "1.0.0",
            description: "API-REST Adoptme",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "development",
            },
            {
                url: "http://localhost:8080",
                description: "production",
            },
        ],
    },
    apis: ["./src/docs/*.yaml"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/mocks', mockRouter);

app.get('/', (req, res) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AdoptMe API</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto;
    background: linear-gradient(135deg,#0f172a,#1e293b,#020617);
    color:white;
}

.container{
    text-align:center;
    padding:50px 60px;
    border-radius:20px;
    background:rgba(255,255,255,0.05);
    backdrop-filter: blur(10px);
    box-shadow:
        0 10px 30px rgba(0,0,0,0.6),
        inset 0 0 40px rgba(255,255,255,0.03);
}

h1{
    font-size:3rem;
    margin-bottom:10px;
    letter-spacing:1px;
}

.subtitle{
    opacity:0.7;
    margin-bottom:40px;
}

button{
    padding:14px 32px;
    font-size:1rem;
    border:none;
    border-radius:999px;
    cursor:pointer;
    color:white;
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    box-shadow:
        0 6px 20px rgba(99,102,241,0.5);
    transition:all .25s ease;
}

button:hover{
    transform:translateY(-2px) scale(1.03);
    box-shadow:
        0 10px 30px rgba(139,92,246,0.7);
}

button:active{
    transform:scale(.98);
}

.footer{
    margin-top:25px;
    font-size:0.85rem;
    opacity:0.5;
}

</style>
</head>

<body>

<div class="container">
    <h1>🐾 AdoptMe API</h1>
    <p class="subtitle">Backend service for pet adoption management</p>

    <button onclick="window.location.href='/api-docs'">
        View API Documentation
    </button>

    <div class="footer">
        Powered by Express + Swagger
    </div>
</div>

</body>
</html>
`;

res.status(200).send(html);
});

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
