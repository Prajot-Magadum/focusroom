const express = require('express');
const requireAuth = require('../middleware/auth');
const roomController = require('../controllers/roomController');
const timerController = require('../controllers/timerController');

const router = express.Router();

router.use(requireAuth);

router.post('/', roomController.create);
router.get('/', roomController.list);
router.get('/:id', roomController.getById);
router.delete('/:id', roomController.remove);
router.post('/:id/join', roomController.join);
router.post('/:id/leave', roomController.leave);
router.get('/:id/members', roomController.members);

router.get('/:id/timer', timerController.get);
router.post('/:id/timer/start', timerController.start);
router.post('/:id/timer/pause', timerController.pause);
router.post('/:id/timer/resume', timerController.resume);
router.post('/:id/timer/reset', timerController.reset);
router.post('/:id/timer/complete', timerController.complete);

module.exports = router;