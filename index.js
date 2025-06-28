import dotenv from 'dotenv';
import https from 'https';
dotenv.config();
import connectToMongoDB from './src/config/mongodbConnection.js';
// import connectToMongoDB from './src/config/mongodbConnection.original.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import expressEjsLayouts from 'express-ejs-layouts';
import router from './src/routes/index.js';
import cors from 'cors';



const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173"
];

app.use(cors({
  origin:  function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });
// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(expressEjsLayouts);

// Set view engine
app.set('view engine', 'ejs');
app.set('views', './views');
// Set layout
// app.set('layout', 'layouts/main');

// Routes
app.use('/', router);
// Error handling middleware


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectToMongoDB()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
    
});