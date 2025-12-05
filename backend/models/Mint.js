const mongoose = require('mongoose');

const mintSchema = new mongoose.Schema(
  {
    txHash: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: String,
      required: true,
      lowercase: true,
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
    },
    amount: {
      type: String,
      required: true,
    },
    tokenSymbol: {
      type: String,
      default: 'SMT',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    gasUsed: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mint', mintSchema);