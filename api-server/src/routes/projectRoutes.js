const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// 1. Deployment create karne ka route
router.post('/deploy', projectController.createDeployment);

// 💡 2. YAHAN GALTI THI: Ye route missing tha ya spelling alag thi
// Frontend isi ko dhoond raha hai: /api/v1/projects/deployments
router.get('/deployments', projectController.getDeployments);

module.exports = router;