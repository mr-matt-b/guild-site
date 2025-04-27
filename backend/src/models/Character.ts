import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  realm: {
    type: String,
    required: true,
  },
  achievementPoints: {
    type: Number,
    required: true,
  },
  equippedItemLevel: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  removed: {
    type: Boolean,
    default: false,
  },
});

// Create a compound index for name and realm
characterSchema.index({ name: 1, realm: 1 }, { unique: true });

export const Character = mongoose.model("Character", characterSchema);
