const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        start_date: { type: Date, required: true },
        end_date: { type: Date, required: true },
        venue: { type: String, required: true, trim: true },
        speaker: { type: String, required: true, trim: true },
        type: { 
            type: String, 
            required: true, 
            enum: ['Workshop', 'Seminar', 'Competition', 'Guest Lecture', 'Conference', 'Other'],
            trim: true 
        },
        organizer: { type: String, trim: true },
        target_audience: { type: String, trim: true },
        registration_required: { type: Boolean, default: false },
        max_participants: { type: Number },
        current_participants: { type: Number, default: 0 },
        poster_image: { type: String, default: null },
        status: { 
            type: String, 
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming' 
        }
    },
    { 
        versionKey: false, 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

eventSchema.virtual('is_past').get(function() {
    return new Date() > this.end_date;
});

eventSchema.index({ start_date: 1 });
eventSchema.index({ end_date: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);
