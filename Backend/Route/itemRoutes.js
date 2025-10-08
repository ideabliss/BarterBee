const express = require('express');
const auth = require('../Auth/middleware');
const itemController = require('../Controller/itemController');

const router = express.Router();

// Get all items (for search)
router.get('/', auth, itemController.getAllItems);

// Get user's items
router.get('/my-items', auth, itemController.getUserItems);

// Add new item
router.post('/', auth, itemController.createItem);

// Update item
router.put('/:id', auth, itemController.updateItem);

// Delete item
router.delete('/:id', auth, itemController.deleteItem);

module.exports = router;