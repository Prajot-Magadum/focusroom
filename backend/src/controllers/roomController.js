const roomService = require('../services/roomService');
const sessionService = require('../services/sessionService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const create = asyncHandler(async (req, res) => {
  const { name, isPublic } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new AppError('Room name is required', 400);
  }

  const room = await roomService.createRoom(req.user.id, {
    name: name.trim(),
    isPublic,
  });

  res.status(201).json({ success: true, data: room });
});

const list = asyncHandler(async (req, res) => {
  const rooms = await roomService.listRooms(req.user.id);
  res.status(200).json({ success: true, data: rooms });
});

const getById = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: room });
});

const remove = asyncHandler(async (req, res) => {
  await roomService.deleteRoom(req.params.id, req.user.id);
  res.status(204).send();
});

const join = asyncHandler(async (req, res) => {
  const result = await sessionService.joinRoom(req.params.id, req.user.id);
  const membersData = await sessionService.getActiveMembers(req.params.id);
  req.app.get('io')?.to(req.params.id).emit('room:members', membersData);
  res.status(200).json({ success: true, data: result });
});

const leave = asyncHandler(async (req, res) => {
  await sessionService.leaveRoom(req.params.id, req.user.id);
  const membersData = await sessionService.getActiveMembers(req.params.id);
  req.app.get('io')?.to(req.params.id).emit('room:members', membersData);
  res.status(204).send();
});

const members = asyncHandler(async (req, res) => {
  const result = await sessionService.getActiveMembers(req.params.id);
  res.status(200).json({ success: true, data: result });
});

module.exports = {
  create,
  list,
  getById,
  remove,
  join,
  leave,
  members,
};