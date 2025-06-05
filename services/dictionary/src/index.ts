import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import wordRoutes from './routes/word.routes';

dotenv.config();

const app = express();
app.use(express.json());

const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASS;
const host = process.env.MONGO_HOST;
const port = process.env.MONGO_PORT;
const db = process.env.MONGO_DB;
const uri = `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`;

mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));

app.use('/api/words', wordRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 