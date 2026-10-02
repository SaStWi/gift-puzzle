import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  progress: {
    solvedHashes: {
      type: [String],
      default: []
    },
    siteState: {
      tokens: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      unlocked: { type: [String], default: ['archive', 'base2', 'base3'] },
      completed: { type: [String], default: [] },
      achievements: { type: [String], default: [] },
      profilePic: { type: String, default: '/favicon.ico' }
    }
  }
});

export default mongoose.model('User', userSchema);
