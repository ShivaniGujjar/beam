const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Deployment Schema update: userId link karne ke liye
const deploymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Naya Field
    projectName: String,
    gitUrl: String,
    projectSlug: String,
    deployUrl: String,
    status: { type: String, default: 'Queued' },
    createdAt: { type: Date, default: Date.now }
});