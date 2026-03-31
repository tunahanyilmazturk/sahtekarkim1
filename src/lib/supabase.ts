import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase çevresel değişkenler eksik! .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface User {
  id: string;
  username: string;
  password: string;
  created_at: number;
  friends: string[];
  is_online?: boolean;
  last_seen?: number;
  games_played?: number;
  wins?: number;
  avatar?: string;
  owned_avatars?: string[];
  coins?: number;
}

export interface FriendRequest {
  id: string;
  from_user_id: string;
  from_username: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: number;
}

export interface Room {
  id: string;
  password?: string | null;
  game_settings?: any;
  status: 'waiting' | 'playing' | 'voting' | 'finished';
  current_turn_index: number;
  round: number;
  word?: string | null;
  hint?: string | null;
  category?: string | null;
  winner?: 'impostor' | 'citizens' | null;
  last_word?: string | null;
  created_at: number;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  avatar: string;
  is_host: boolean;
  score: number;
  is_ready: boolean;
  is_bot?: boolean;
  role?: 'impostor' | 'citizen' | null;
  word?: string | null;
  hint?: string | null;
}

export interface Message {
  id: string;
  room_id: string;
  player_id?: string | null;
  player_name?: string | null;
  player_avatar?: string | null;
  text: string;
  is_system: boolean;
  created_at: number;
}

export interface Vote {
  id: string;
  room_id: string;
  voter_id: string;
  voted_player_id: string;
}

export interface RoomInvite {
  id: string;
  room_id: string;
  from_user_id: string;
  from_username: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: number;
}

// Supabase service functions
export const supabaseService = {
  // User functions
  async createUser(userId: string, username: string, password: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username,
        password,
        created_at: Date.now(),
        friends: [],
        is_online: true,
        last_seen: Date.now(),
        games_played: 0,
        wins: 0
      });
    if (error) console.error('createUser error:', error);
  },

  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  },

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error) return null;
    return data;
  },

  async updateUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ is_online: isOnline, last_seen: Date.now() })
      .eq('id', userId);
    if (error) console.error('updateUserOnlineStatus error:', error);
  },

  async updateUserFriends(userId: string, friends: string[]): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ friends })
      .eq('id', userId);
    if (error) console.error('updateUserFriends error:', error);
  },

  // Avatar fonksiyonları
  async updateUserAvatar(userId: string, avatarEmoji: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ avatar: avatarEmoji })
      .eq('id', userId);
    if (error) console.error('updateUserAvatar error:', error);
  },

  async purchaseAvatar(userId: string, avatarId: string, price: number): Promise<{ success: boolean; message: string }> {
    // Önce kullanıcıyı getir
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('coins, owned_avatars')
      .eq('id', userId)
      .single();

    if (fetchError || !user) return { success: false, message: 'Kullanıcı bulunamadı' };

    const currentCoins: number = user.coins ?? 0;
    const ownedAvatars: string[] = user.owned_avatars ?? [];

    if (ownedAvatars.includes(avatarId)) {
      return { success: false, message: 'Bu avatar zaten sahipsin' };
    }
    if (currentCoins < price) {
      return { success: false, message: 'Yetersiz altın' };
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        coins: currentCoins - price,
        owned_avatars: [...ownedAvatars, avatarId],
      })
      .eq('id', userId);

    if (updateError) {
      console.error('purchaseAvatar error:', updateError);
      return { success: false, message: 'Satın alma başarısız' };
    }

    return { success: true, message: 'Avatar satın alındı!' };
  },

  async addCoins(userId: string, amount: number): Promise<void> {
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .single();
    const currentCoins = user?.coins ?? 0;
    const { error } = await supabase
      .from('users')
      .update({ coins: currentCoins + amount })
      .eq('id', userId);
    if (error) console.error('addCoins error:', error);
  },

  // Subscribe to users changes
  subscribeToUsers(callback: (users: User[]) => void): () => void {
    const channel = supabase
      .channel('users-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        supabase.from('users').select('*').then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe();

    // Initial fetch
    supabase.from('users').select('*').then(({ data }) => {
      if (data) callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Friend request functions
  async sendFriendRequest(fromUserId: string, fromUsername: string, toUserId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: fromUserId,
        from_username: fromUsername,
        to_user_id: toUserId,
        status: 'pending',
        created_at: Date.now()
      });
    if (error) console.error('sendFriendRequest error:', error);
  },

  async updateFriendRequestStatus(requestId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status })
      .eq('id', requestId);
    if (error) console.error('updateFriendRequestStatus error:', error);
  },

  async cancelFriendRequest(fromUserId: string, toUserId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'cancelled' })
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', toUserId)
      .eq('status', 'pending');
    if (error) console.error('cancelFriendRequest error:', error);
  },

  // Subscribe to friend requests changes
  subscribeToFriendRequests(userId: string, callback: (requests: FriendRequest[]) => void): () => void {
    const channel = supabase
      .channel('friend-requests-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friend_requests' }, () => {
        supabase.from('friend_requests').select('*')
          .or(`to_user_id.eq.${userId},from_user_id.eq.${userId}`)
          .then(({ data }) => {
            if (data) callback(data);
          });
      })
      .subscribe();

    // Initial fetch
    supabase.from('friend_requests').select('*')
      .or(`to_user_id.eq.${userId},from_user_id.eq.${userId}`)
      .then(({ data }) => {
        if (data) callback(data);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Room functions
  async createRoom(roomId: string, password?: string | null, gameSettings?: any): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .insert({
        id: roomId,
        password,
        game_settings: gameSettings,
        status: 'waiting',
        current_turn_index: 0,
        round: 0,
        created_at: Date.now()
      });
    if (error) console.error('createRoom error:', error);
  },

  async getRoom(roomId: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    if (error) return null;
    return data;
  },

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId);
    if (error) console.error('updateRoom error:', error);
  },

  async deleteRoom(roomId: string): Promise<void> {
    await supabase.from('messages').delete().eq('room_id', roomId);
    await supabase.from('votes').delete().eq('room_id', roomId);
    await supabase.from('players').delete().eq('room_id', roomId);
    await supabase.from('rooms').delete().eq('id', roomId);
  },

  // Subscribe to room changes
  subscribeToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'DELETE') {
          callback(null);
        } else {
          callback(payload.new as Room);
        }
      })
      .subscribe();

    // Initial fetch
    supabase.from('rooms').select('*').eq('id', roomId).single().then(({ data }) => {
      callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Player functions
  async addPlayer(player: Omit<Player, 'id'>): Promise<string> {
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const { data, error } = await supabase
      .from('players')
      .insert({ ...player, id: playerId })
      .select('id')
      .single();
    if (error) {
      console.error('addPlayer error:', error);
      return '';
    }
    return data.id;
  },

  async updatePlayer(roomId: string, playerId: string, updates: Partial<Player>): Promise<void> {
    const { error } = await supabase
      .from('players')
      .update(updates)
      .eq('room_id', roomId)
      .eq('id', playerId);
    if (error) console.error('updatePlayer error:', error);
  },

  async removePlayer(roomId: string, playerId: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('room_id', roomId)
      .eq('id', playerId);
    if (error) console.error('removePlayer error:', error);
  },

  async getPlayers(roomId: string): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);
    if (error) return [];
    return data;
  },

  // Subscribe to players changes
  subscribeToPlayers(roomId: string, callback: (players: Player[]) => void): () => void {
    const channel = supabase
      .channel(`players-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe();

    // Initial fetch
    supabase.from('players').select('*').eq('room_id', roomId).then(({ data }) => {
      if (data) callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Message functions
  async addMessage(message: Omit<Message, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert(message);
    if (error) console.error('addMessage error:', error);
  },

  // Subscribe to messages changes
  subscribeToMessages(roomId: string, callback: (messages: Message[]) => void): () => void {
    const channel = supabase
      .channel(`messages-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }).then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe();

    // Initial fetch
    supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }).then(({ data }) => {
      if (data) callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Vote functions
  async submitVote(roomId: string, voterId: string, votedPlayerId: string): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .insert({
        room_id: roomId,
        voter_id: voterId,
        voted_player_id: votedPlayerId
      })
      .select();
    if (error) {
      // Eğer duplicate key hatası varsa (oyuncu zaten oy vermişse), sessizce geç
      if (error.code !== '23505') {
        console.error('submitVote error:', error);
      }
    }
  },

  async getVotes(roomId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('room_id', roomId);
    if (error) return [];
    return data;
  },

  async clearVotes(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('room_id', roomId);
    if (error) console.error('clearVotes error:', error);
  },

  // Subscribe to votes changes
  subscribeToVotes(roomId: string, callback: (votes: Vote[]) => void): () => void {
    const channel = supabase
      .channel(`votes-${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes', filter: `room_id=eq.${roomId}` }, () => {
        supabase.from('votes').select('*').eq('room_id', roomId).then(({ data }) => {
          if (data) callback(data);
        });
      })
      .subscribe();

    // Initial fetch
    supabase.from('votes').select('*').eq('room_id', roomId).then(({ data }) => {
      if (data) callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Room invites
  async sendRoomInvite(roomId: string, fromUserId: string, fromUsername: string, toUserId: string) {
    const { error } = await supabase
      .from('room_invites')
      .insert({
        room_id: roomId,
        from_user_id: fromUserId,
        from_username: fromUsername,
        to_user_id: toUserId,
        status: 'pending',
        created_at: Date.now(),
      });
    if (error) {
      console.error('sendRoomInvite error:', error);
    }
  },

  subscribeToRoomInvites(userId: string, callback: (invites: RoomInvite[]) => void) {
    const channel = supabase
      .channel(`room_invites:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_invites',
          filter: `to_user_id=eq.${userId}`,
        },
        () => {
          supabase
            .from('room_invites')
            .select('*')
            .eq('to_user_id', userId)
            .then(({ data }) => {
              if (data) callback(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  async acceptRoomInvite(inviteId: string) {
    const { error } = await supabase
      .from('room_invites')
      .update({ status: 'accepted' })
      .eq('id', inviteId);
    if (error) {
      console.error('acceptRoomInvite error:', error);
    }
  },

  async rejectRoomInvite(inviteId: string) {
    const { error } = await supabase
      .from('room_invites')
      .update({ status: 'rejected' })
      .eq('id', inviteId);
    if (error) {
      console.error('rejectRoomInvite error:', error);
    }
  },
};

// Helper functions
export function getRandomAvatar(): string {
  const avatars = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

export function getRandomWords() {
  return [
    { word: 'Aslan', hint: 'Ormanlarin krali', category: 'Hayvanlar' },
    { word: 'Fil', hint: 'Dunyanin en buyuk karada yasayan hayvani', category: 'Hayvanlar' },
    { word: 'Kopek', hint: 'Insanin en sadik dostu', category: 'Hayvanlar' },
    { word: 'Pizza', hint: 'Italyan mucagindan yuvarlak yemek', category: 'Yemekler' },
    { word: 'Hamburger', hint: 'Etli ekmek', category: 'Yemekler' },
    { word: 'Doktor', hint: 'Hastalari tedavi eden kisi', category: 'Meslekler' },
    { word: 'Ogretmen', hint: 'Okulda ders veren kisi', category: 'Meslekler' },
    { word: 'Istanbul', hint: 'Turkiyenin en buyuk sehri', category: 'Sehirler' },
    { word: 'Ankara', hint: 'Turkiyenin baskenti', category: 'Sehirler' },
    { word: 'Araba', hint: '4 tekerlekli tasit', category: 'Ulasim' },
    { word: 'Ucak', hint: 'Havada ucan tasit', category: 'Ulasim' },
    { word: 'Telefon', hint: 'Iletisim icin kullanilan cihaz', category: 'Teknoloji' },
    { word: 'Bilgisayar', hint: 'Islem yapmak icin kullanilan cihaz', category: 'Teknoloji' },
  ];
}
