const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, trim: true },
        publish_date: { type: Date, required: true },
        author: { type: String, required: true, trim: true },
        category: { 
            type: String, 
            required: true, 
            enum: ['Achievements', 'Infrastructure', 'Recruitment', 'Announcement', 'General'],
            trim: true 
        },
        is_featured: { type: Boolean, default: false },
        image_url: { type: String, default: null },
        news_type: { 
            type: String, 
            enum: ['announcement', 'achievement', 'event_update', 'general'],
            default: 'general' 
        }
    },
    { 
        versionKey: false, 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

newsSchema.index({ publish_date: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ is_featured: 1 });
newsSchema.index({ news_type: 1 });

module.exports = mongoose.model('News', newsSchema);
