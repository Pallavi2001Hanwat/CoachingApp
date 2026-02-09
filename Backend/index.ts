import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './Config/Connection';
import AdminRoute from './Routes/AdminRoute'
import AuthRoute from './Routes/AuthRoute'
import StudentRoute from './Routes/StudentRoute'
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Attach to app.locals so controllers can access it
app.locals.cloudinary = cloudinary;

// Connect to DB
connectDB();

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('API is running 🚀');
});
app.use('/admin', AdminRoute);
app.use('/', AuthRoute);
app.use('/student', StudentRoute);





app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
