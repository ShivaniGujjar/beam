const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// 1. Deployment create karne ka route (Trigger Build)
router.post('/deploy', projectController.createDeployment);

// 2. Deployment history fetch karne ka route
router.get('/deployments', projectController.getDeployments);

// 💡 3. NEW: Webhook route (GitHub Action ise call karega status update ke liye)
// Iska full URL hoga: /api/v1/projects/status (agar aapka base route yahi hai)
router.post('/status', projectController.updateBuildStatus);

module.exports = router;