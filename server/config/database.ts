import mongoose from 'mongoose';

const URI = process.env.MONGODB_URL;

mongoose.connect(`${URI}`)
  .then(() => {
    console.log('MongoDB connection successful');
  })
  .catch((err) => {
    console.error('Connection error', err);
  });
