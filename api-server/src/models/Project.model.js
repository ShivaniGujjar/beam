const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    gitUrl: { type: String, required: true },
    slug: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['QUEUED', 'IN_PROGRESS', 'READY', 'FAIL'], 
        default: 'QUEUED' 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

// 💡 YAHAN DHYAN DO: Pehla argument 'Project' hona chahiye, 'User' nahi!
module.exports = mongoose.model('Project', ProjectSchema);