const crypto = require('crypto');
const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

function generateInviteToken() {
  return crypto.randomBytes(9).toString('base64url');
}

async function createRoom(ownerId, { name, isPublic }) {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name,
      owner_id: ownerId,
      is_public: isPublic ?? true,
      invite_token: generateInviteToken(),
    })
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  return data;
}

// Rooms a user can see: every public room, plus their own private ones.
async function listRooms(userId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .or(`is_public.eq.true,owner_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
}

async function getRoomById(roomId, userId) {
  const { data: room, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (!room.is_public && room.owner_id !== userId) {
    throw new AppError('You do not have access to this room', 403);
  }

  return room;
}

async function deleteRoom(roomId, userId) {
  const { data: room, error: fetchError } = await supabase
    .from('rooms')
    .select('id, owner_id')
    .eq('id', roomId)
    .maybeSingle();

  if (fetchError) {
    throw new AppError(fetchError.message, 500);
  }

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  if (room.owner_id !== userId) {
    throw new AppError('Only the room owner can delete this room', 403);
  }

  const { error: deleteError } = await supabase
    .from('rooms')
    .delete()
    .eq('id', roomId);

  if (deleteError) {
    throw new AppError(deleteError.message, 500);
  }
}

module.exports = {
  createRoom,
  listRooms,
  getRoomById,
  deleteRoom,
};