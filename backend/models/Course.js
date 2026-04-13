const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { 
            type: String, 
            required: true, 
            unique: true, 
            uppercase: true,
            trim: true,
            match: [/^[A-Z]{2,4}\d{3,4}$/, 'Please enter a valid course code']
        },
        credits: { type: Number, required: true, min: 1, max: 10 },
        semester: { 
            type: String, 
            required: true, 
            enum: ['Fall', 'Spring', 'Summer'],
            trim: true 
        },
        description: { type: String, required: true, trim: true },
        faculty: { type: String, required: true, trim: true },
        type: { 
            type: String, 
            enum: ['core', 'elective', 'lab'],
            default: 'core' 
        },
        prerequisites: [{ type: String, trim: true }],
        syllabus: { type: String, trim: true },
        is_active: { type: Boolean, default: true }
    },
    { 
        versionKey: false, 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

courseSchema.index({ code: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ faculty: 1 });
courseSchema.index({ is_active: 1 });

module.exports = mongoose.model('Course', courseSchema);
