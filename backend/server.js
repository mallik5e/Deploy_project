import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs'
import userRouter from './routes/userRoute.js'
import adminRouter from './routes/adminRoute.js'



const app = express();

app.use(cors());
app.use(express.json());

// Middleware for URL-encoded form data (text fields in form-data)
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();
connectCloudinary();

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/user',userRouter)
app.use('/api/admin',adminRouter)

const PORT = process.env.PORT || 10000;


app.get('/', (req, res) => {
    res.send('Event booking backend is running');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
