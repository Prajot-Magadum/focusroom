const redis = require('../config/redis');
const AppError = require('../utils/AppError');

const DEFAULT_DURATIONS = {
  focus: 25 * 60,
  break: 5 * 60,
};

const TIMER_TTL_SECONDS = 60 * 60 * 12; // safety net so stale timers expire

function timerKey(roomId) {
  return `room:${roomId}:timer`;
}

function computeRemaining(state) {
  if (!state.isRunning || !state.startedAt) {
    return state.remainingSeconds;
  }
  const elapsed = (Date.now() - new Date(state.startedAt).getTime()) / 1000;
  return Math.max(0, Math.round(state.remainingSeconds - elapsed));
}

async function saveTimer(roomId, state) {
  await redis.set(timerKey(roomId), JSON.stringify(state), 'EX', TIMER_TTL_SECONDS);
  return state;
}

async function getTimer(roomId) {
  const raw = await redis.get(timerKey(roomId));

  if (!raw) {
    return null;
  }

  const state = JSON.parse(raw);
  return { ...state, remainingSeconds: computeRemaining(state) };
}

async function startTimer(roomId, { phase = 'focus', durationMinutes } = {}) {
  if (phase !== 'focus' && phase !== 'break') {
    throw new AppError('phase must be "focus" or "break"', 400);
  }

  const durationSeconds = durationMinutes
    ? Math.round(durationMinutes * 60)
    : DEFAULT_DURATIONS[phase];

  const state = {
    roomId,
    phase,
    durationSeconds,
    remainingSeconds: durationSeconds,
    startedAt: new Date().toISOString(),
    isRunning: true,
    updatedAt: new Date().toISOString(),
  };

  return saveTimer(roomId, state);
}

async function pauseTimer(roomId) {
  const state = await getTimer(roomId);

  if (!state) {
    throw new AppError('No timer running for this room', 404);
  }

  if (!state.isRunning) {
    return state;
  }

  return saveTimer(roomId, {
    ...state,
    isRunning: false,
    startedAt: null,
    updatedAt: new Date().toISOString(),
  });
}

async function resumeTimer(roomId) {
  const state = await getTimer(roomId);

  if (!state) {
    throw new AppError('No timer to resume for this room', 404);
  }

  if (state.isRunning) {
    return state;
  }

  if (state.remainingSeconds <= 0) {
    throw new AppError('Timer has already finished', 400);
  }

  return saveTimer(roomId, {
    ...state,
    isRunning: true,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

async function resetTimer(roomId) {
  await redis.del(timerKey(roomId));
}

async function completeTimer(roomId) {
  const state = await getTimer(roomId);

  if (!state) {
    return null; // already completed by another client, or never started
  }

  if (state.remainingSeconds > 0) {
    throw new AppError('Timer has not finished yet', 400);
  }

  await redis.del(timerKey(roomId));
  return state;
}

module.exports = {
  getTimer,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer,
  completeTimer,
};