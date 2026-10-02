import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from './models/User.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

import { MongoMemoryServer } from 'mongodb-memory-server';

// MongoDB connection
async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<db_password>')) {
    console.log('MongoDB URI has <db_password>. Using in-memory MongoDB for testing...');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
  }
  
  mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
}
connectDB();

// --- Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    let user = await User.findOne({ $or: [{ username }, { email }] });
    if (user) return res.status(400).json({ message: 'User or Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      username,
      email,
      password: hashedPassword
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '10h' });
    res.status(201).json({ token, username: user.username, progress: user.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '10h' });
    res.json({ token, username: user.username, progress: user.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get Progress
app.get('/api/progress', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ progress: user.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Progress
app.post('/api/progress', authMiddleware, async (req, res) => {
  try {
    const { solvedHashes, siteState } = req.body;
    const user = await User.findById(req.user.id);
    if (solvedHashes) {
      user.progress.solvedHashes = solvedHashes;
    }
    if (siteState) {
      user.progress.siteState = siteState;
    }
    await user.save();
    res.json({ progress: user.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GitHub Webhook for Updates
app.post('/api/webhook/github', async (req, res) => {
  try {
    const event = req.header('x-github-event');
    if (event === 'push') {
      const users = await User.find({}, 'email');
      
      // Setup nodemailer (Using ethereal for dev/testing)
      // In production, replace with real SMTP (e.g. SendGrid, Gmail)
      let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const emailList = users.map(u => u.email).join(', ');
      
      if (emailList) {
        let info = await transporter.sendMail({
          from: '"CreativeLabs" <noreply@creativelabs.dev>',
          to: emailList,
          subject: "Game Site Update!",
          text: "A new update has been pushed to the GitHub repository. Come check out the new features!",
          html: "<b>A new update has been pushed to the GitHub repository!</b><br>Come check out the new features!",
        });
        console.log("Update emails sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      
      res.status(200).send('Emails sent');
    } else {
      res.status(200).send('Ignored event');
    }
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error processing webhook');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
