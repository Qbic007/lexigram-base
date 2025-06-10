import express from 'express';
import mongoose from 'mongoose';
import dictionaryRoutes from './routes/dictionary.routes';

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://root:example@mongodb:27017/lexigram?authSource=admin';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Routes
app.use('/api/dictionary', dictionaryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Dictionary service is running on port ${port}`);
}); 