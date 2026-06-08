const express = require('express');
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);

router.get('/', sessionController.getSessionsByGroup);

// Admin routes
router.use(authMiddleware.restrictTo('superadmin', 'admin'));
router.post('/', sessionController.createSession);
router.patch('/:id/matches/:matchId', sessionController.recordMatch);
router.post('/:id/rematch', sessionController.addRematch);
router.patch('/:id/close', sessionController.closeSession);

module.exports = router;
