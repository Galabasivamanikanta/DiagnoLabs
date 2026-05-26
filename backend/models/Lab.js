const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Apollo Diagnostics"
    email: { type: String, unique: true, sparse: true }, // Sparse allows null for discovered labs
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    pincode: { type: String },

    // The Network Logic
    servicePincodes: [{ type: String }],

    // Physical location (GeoJSON)
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },

    // ALL-INDIA CODES & SOURCE TRACKING
    scale: { type: String, enum: ['small', 'medium', 'large'], default: 'small' },
    source: { type: String, enum: ['google', 'osm', 'nabl', 'manual'], default: 'manual' },
    nabl: { type: Boolean, default: false },
    labType: { type: String, enum: ['standalone', 'hospital', 'chain', 'clinic', 'govt'], default: 'standalone' },
    googlePlaceId: { type: String, unique: true, sparse: true },
    
    // Performance & Trust
    pricingMultiplier: { type: Number, default: 1.0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    
    // Ops
    openingTime: { type: String, default: "08:00 AM" },
    closingTime: { type: String, default: "08:00 PM" },
    openingHours: [{ type: String }],
    tags: [{ type: String }],
    
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// CRITICAL INDEXES FOR NATIONWIDE PERFORMANCE
labSchema.index({ location: '2dsphere' });
labSchema.index({ city: 1, state: 1 });
labSchema.index({ scale: 1 });
labSchema.index({ nabl: 1 });
labSchema.index({ source: 1 });

module.exports = mongoose.model('Lab', labSchema);


