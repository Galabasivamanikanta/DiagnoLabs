const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientRole: { 
        type: String, 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['Security', 'Info', 'Alert'], 
        default: 'Info' 
    },
    isRead: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
