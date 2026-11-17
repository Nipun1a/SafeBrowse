const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
    url: { type: String, required: true, trim: true },
    domain: { type: String, required: true, index: true },
    score: { type: Number, required: true },
    verdict: String,
    confidence: String,
    reasons: [mongoose.Schema.Types.Mixed],
    scanVersion: Number,
    threatDetails: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    status: { type: String, enum: ['completed', 'failed'], default: 'completed' },
    scannedAt: { type: Date, default: Date.now },
    expiresAt: Date
}, { timestamps: true, bufferCommands: false });

scanResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
scanResultSchema.index({ url: 1, scanVersion: 1, expiresAt: -1 });

module.exports = mongoose.model('ScanResult', scanResultSchema);
