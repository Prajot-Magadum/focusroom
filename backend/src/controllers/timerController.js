const timerService = require('../services/timerService');
const sessionService = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

async function assertActiveMember(req) {
  const isMember = await sessionService.isActiveMember(req.params.id, req.user.id);

  if (!isMember) {
    throw new AppError('Join the room before controlling the timer', 403);
  }
}

function broadcast(req, state) {
  req.app.get('io')?.to(req.params.id).emit('timer:update', state);
}

const get = asyncHandler(async (req, res) => {
  const state = await timerService.getTimer(req.params.id);
  res.status(200).json({ success: true, data: state });
});

const start = asyncHandler(async (req, res) => {
  await assertActiveMember(req);

  const { phase, durationMinutes } = req.body || {};
  const state = await timerService.startTimer(req.params.id, { phase, durationMinutes });

  broadcast(req, state);
  res.status(200).json({ success: true, data: state });
});

const pause = asyncHandler(async (req, res) => {
  await assertActiveMember(req);

  const state = await timerService.pauseTimer(req.params.id);

  broadcast(req, state);
  res.status(200).json({ success: true, data: state });
});

const resume = asyncHandler(async (req, res) => {
  await assertActiveMember(req);

  const state = await timerService.resumeTimer(req.params.id);

  broadcast(req, state);
  res.status(200).json({ success: true, data: state });
});

const reset = asyncHandler(async (req, res) => {
  await assertActiveMember(req);

  await timerService.resetTimer(req.params.id);

  broadcast(req, null);
  res.status(204).send();
});

const complete = asyncHandler(async (req, res) => {
  await assertActiveMember(req);

  const completedState = await timerService.completeTimer(req.params.id);

  if (completedState && completedState.phase === 'focus') {
    const minutes = Math.round(completedState.durationSeconds / 60);
    await sessionService.creditFocusMinutes(req.params.id, minutes);
  }

  broadcast(req, null);
  req.app.get('io')?.to(req.params.id).emit('timer:completed', completedState);

  res.status(200).json({ success: true, data: completedState });
});

module.exports = {
  get,
  start,
  pause,
  resume,
  reset,
  complete,
};