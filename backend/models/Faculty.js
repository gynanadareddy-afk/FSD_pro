const mongoose = require('mongoose');

const researchAreaSchema = new mongoose.Schema({
    area_name: { type: String, required: true },
    description: { type: String, default: '' }
});

const facultySchema = new mongoose.Schema(
    {
        first_name: { type: String, required: true, trim: true },
        last_name: { type: String, required: true, trim: true },
        designation: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        profile_image: { type: String, default: null },
        bio: { type: String, trim: true },
        phone: { type: String, trim: true },
        is_active: { type: Boolean, default: true },
        research_areas: [researchAreaSchema],
        department: { type: String, default: 'Computer Science', trim: true },
        education_qualifications: { type: String, trim: true },
        publications_count: { type: Number, default: 0 }
    },
    { 
        versionKey: false, 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

facultySchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

facultySchema.index({ email: 1 });
facultySchema.index({ last_name: 1, first_name: 1 });
facultySchema.index({ is_active: 1 });
facultySchema.index({ designation: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
