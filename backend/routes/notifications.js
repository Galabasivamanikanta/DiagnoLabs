const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth'); // Need to check if verifyToken exists

// Fetch unread notifications for a user's role
router.get('/', verifyToken, async (req, res) => {
    try {
        const role = req.user.role;
        const notifications = await Notification.find({ recipientRole: role, isRead: false }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json("Failed to fetch notifications");
    }
});

// Mark notification as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        res.status(200).json(notification);
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json("Failed to update notification");
    }
});

module.exports = router;
