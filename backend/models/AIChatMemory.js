const mongoose = require('mongoose');

const aiChatMemorySchema = new mongoose.Schema({
    queryPattern: { type: String, required: true },
    learnedResponse: { type: String, required: true },
    category: { type: String, default: 'General' },
    keywords: [{ type: String }],
    confidenceScore: { type: Number, default: 1.0 },
    usageCount: { type: Number, default: 1 },
    verifiedByDoctor: { type: Boolean, default: false },
    sourceRole: { type: String, default: 'patient' }
}, { timestamps: true });

module.exports = mongoose.model('AIChatMemory', aiChatMemorySchema);
