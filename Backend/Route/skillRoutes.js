const express = require('express');
const skillController = require('../Controller/skillController');
const auth = require('../Auth/middleware');

const router = express.Router();

// Get all skills (for search)
router.get('/', auth, skillController.getAllSkills);

// Get user's skills
router.get('/my-skills', auth, skillController.getUserSkills);

// Add new skill
router.post('/', auth, skillController.createSkill);

// Update skill
router.put('/:id', auth, skillController.updateSkill);

// Delete skill
router.delete('/:id', auth, skillController.deleteSkill);

module.exports = router;