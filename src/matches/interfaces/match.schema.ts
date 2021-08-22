import * as mongoose from 'mongoose';

export const MatchSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId },
    category: { type: mongoose.Schema.Types.ObjectId },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
    },
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    result: [
      {
        set: { type: 'string' },
      },
    ],
  },
  {
    timestamps: true,
    collection: 'matches',
  },
);
