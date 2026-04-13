const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true, 
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        subject: { type: String, default: '', trim: true },
        message: { type: String, required: true, trim: true },
        phone: { type: String, default: '', trim: true },
        message_type: { 
            type: String, 
            enum: ['general', 'admission', 'research', 'complaint', 'other'],
            default: 'general' 
        },
        status: { 
            type: String, 
            enum: ['unread', 'read', 'replied', 'closed'],
            default: 'unread' 
        },
        priority: { 
            type: String, 
            enum: ['low', 'medium', 'high'],
            default: 'medium' 
        }
    },
    { 
        versionKey: false, 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

contactMessageSchema.index({ status: 1 });
contactMessageSchema.index({ message_type: 1 });
contactMessageSchema.index({ created_at: -1 });
contactMessageSchema.index({ priority: 1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
