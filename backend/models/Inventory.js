const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, enum: ['Kit', 'Syringe', 'Vial', 'PPE', 'Other'], required: true },
    quantity: { type: Number, required: true, default: 0 },
    minimumStockLevel: { type: Number, required: true, default: 10 },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
