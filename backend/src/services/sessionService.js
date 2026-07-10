const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

async function ensureRoomExists(roomId) {
  const { data: room, error } = await supabase
    .from('rooms')
    .select('id')
    .eq('id', roomId)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  if (!room) {
    throw new AppError('Room not found', 404);
  }

  return room;
}

async function findActiveSession(roomId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('room_id', roomId)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return data;
}

async function getOrCreateActiveSession(roomId) {
  const existing = await findActiveSession(roomId);

  if (existing) {
    return existing;
  }

  const { data: created, error } = await supabase
    .from('sessions')
    .insert({ room_id: roomId })
    .select()
    .single();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return created;
}

async function joinRoom(roomId, userId) {
  await ensureRoomExists(roomId);
  const session = await getOrCreateActiveSession(roomId);

  const { data: existingMember, error: findError } = await supabase
    .from('session_members')
    .select('*')
    .eq('session_id', session.id)
    .eq('user_id', userId)
    .is('left_at', null)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (existingMember) {
    return { session, member: existingMember };
  }

  const { data: member, error: insertError } = await supabase
    .from('session_members')
    .insert({ session_id: session.id, user_id: userId })
    .select()
    .single();

  if (insertError) {
    throw new AppError(insertError.message, 500);
  }

  return { session, member };
}

async function leaveRoom(roomId, userId) {
  await ensureRoomExists(roomId);
  const session = await findActiveSession(roomId);

  if (!session) {
    throw new AppError('No active session for this room', 404);
  }

  const { data: member, error: findError } = await supabase
    .from('session_members')
    .select('*')
    .eq('session_id', session.id)
    .eq('user_id', userId)
    .is('left_at', null)
    .maybeSingle();

  if (findError) {
    throw new AppError(findError.message, 500);
  }

  if (!member) {
    throw new AppError('You are not an active member of this room', 400);
  }

  const { error: updateError } = await supabase
    .from('session_members')
    .update({ left_at: new Date().toISOString() })
    .eq('id', member.id);

  if (updateError) {
    throw new AppError(updateError.message, 500);
  }
}

async function getActiveMembers(roomId) {
  await ensureRoomExists(roomId);
  const session = await findActiveSession(roomId);

  if (!session) {
    return { session: null, members: [] };
  }

  const { data: members, error } = await supabase
    .from('session_members')
    .select('joined_at, focus_minutes, user:users(id, display_name, avatar_url)')
    .eq('session_id', session.id)
    .is('left_at', null)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new AppError(error.message, 500);
  }

  return { session, members };
}

async function isActiveMember(roomId, userId) {
  const session = await findActiveSession(roomId);

  if (!session) {
    return false;
  }

  const { data, error } = await supabase
    .from('session_members')
    .select('id')
    .eq('session_id', session.id)
    .eq('user_id', userId)
    .is('left_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(error.message, 500);
  }

  return !!data;
}

async function creditFocusMinutes(roomId, minutes) {
  if (!minutes || minutes <= 0) return;

  const session = await findActiveSession(roomId);
  if (!session) return;

  const { data: members, error } = await supabase
    .from('session_members')
    .select('id, focus_minutes')
    .eq('session_id', session.id)
    .is('left_at', null);

  if (error) {
    throw new AppError(error.message, 500);
  }

  await Promise.all(
    members.map((m) =>
      supabase
        .from('session_members')
        .update({ focus_minutes: (m.focus_minutes ?? 0) + minutes })
        .eq('id', m.id)
    )
  );
}

module.exports = {
  joinRoom,
  leaveRoom,
  getActiveMembers,
  isActiveMember,
  creditFocusMinutes,
};