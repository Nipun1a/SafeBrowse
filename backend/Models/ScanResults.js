const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true
    },
    domain: {
        type: String,
        required: true,
        index: true
    },

    score: {
        type: Number,
        required: true
    },

    threatDetails: {
        googleSafeBrowsing: {
            type: String,
            enum: ['clean', 'malware', 'phishing', 'unknown'],
            default: 'unknown'
        },
        virusTotal: {
            malicious: { type: Number, default: 0 },
            harmless: { type: Number, default: 0 }
        },
        sslValid: {
            type: Boolean,
            default: false
        }
    },

    ipAddress: {
        type: String
    },

    status: {
        type: String,
        enum: ['completed', 'failed'],
        default: 'completed'
    },

    scannedAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date
    }

}, {
    timestamps: true
});

// Auto delete old scans after 24 hours
scanResultSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ScanResult', scanResultSchema);