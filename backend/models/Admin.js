const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: 3
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false // Don't include password by default in queries
        },
        first_name: {
            type: String,
            required: true,
            trim: true
        },
        last_name: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            default: '',
            trim: true
        },
        role: {
            type: String,
            enum: ['super_admin', 'admin', 'moderator'],
            default: 'admin'
        },
        is_active: {
            type: Boolean,
            default: true
        },
        department: {
            type: String,
            default: 'Computer Science',
            trim: true
        },
        last_login: {
            type: Date,
            default: null
        },
        login_count: {
            type: Number,
            default: 0
        },
        is_super_admin: {
            type: Boolean,
            default: false
        }
    },
    {
        versionKey: false,
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for full name
adminSchema.virtual('full_name').get(function() {
    return `${this.first_name} ${this.last_name}`;
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes
adminSchema.index({ username: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ is_active: 1 });
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);
