export type Room = {
  id: string
  name: string
  owner_id: string
  is_public: boolean
  invite_token: string | null
  created_at: string
}

export type CreateRoomInput = {
  name: string
  isPublic?: boolean
}

export type RoomSession = {
  id: string
  room_id: string
  started_at: string
  ended_at: string | null
}

export type SessionMember = {
  joined_at: string
  focus_minutes: number
  user: {
    id: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export type RoomMembers = {
  session: RoomSession | null
  members: SessionMember[]
}