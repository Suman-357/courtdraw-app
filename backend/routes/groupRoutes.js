const express = require('express');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

router.post('/', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/:id', groupController.getGroup);
router.get('/:id/ledger', groupController.getGroupLedger);

// Admin only routes
router.use(authMiddleware.restrictTo('superadmin', 'admin'));
router.post('/:id/members', groupController.addMemberManually);
router.patch('/:groupId/members/:memberId/status', groupController.toggleMemberStatus);
router.patch('/:id/settings', groupController.updateGroupSettings);

module.exports = router;
