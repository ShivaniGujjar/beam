const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// Allow both endpoint aliases
router.post('/deploy', projectController.createDeployment);
router.post('/deployments', projectController.createDeployment); 

router.get('/deployments', projectController.getDeployments);
router.post('/status', projectController.updateBuildStatus);

module.exports = router;