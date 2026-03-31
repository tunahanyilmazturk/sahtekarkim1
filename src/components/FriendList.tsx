import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserPlus, UserMinus, X, Copy, Check, Send } from 'lucide-react';
import { supabaseService, type User } from '../lib/supabase';

interface FriendListProps {
  currentUserId: string;
  currentUsername: string;
  roomId?: string;
}

export function FriendList({ currentUserId, currentUsername, roomId }: FriendListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<Record<string, User>>({});
  const [searchUsername, setSearchUsername] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = supabaseService.subscribeToUsers((users) => {
      const usersMap: Record<string, User> = {};
      users.forEach(user => {
        usersMap[user.id] = user;
      });
      setAllUsers(usersMap);
      
      if (usersMap[currentUserId]) {
        setFriends(usersMap[currentUserId].friends || []);
      }
    });

    return () => unsub();
  }, [currentUserId]);

  const addFriend = async () => {
    if (!searchUsername.trim()) return;
    
    const searchLower = searchUsername.toLowerCase().trim();
    
    if (searchLower === currentUsername.toLowerCase()) {
      setError('Kendini ekleyemezsin');
      return;
    }

    const friendEntry = Object.entries(allUsers).find(
      ([, user]) => user.username?.toLowerCase() === searchLower
    );

    if (!friendEntry) {
      setError('Kullanıcı bulunamadı');
      return;
    }

    const [friendId] = friendEntry;

    if (friends.includes(friendId)) {
      setError('Bu kullanıcı zaten arkadaşın');
      return;
    }

    const newFriends = [...friends, friendId];
    await supabaseService.updateUserFriends(currentUserId, newFriends);
    setSearchUsername('');
    setError('');
  };

  const removeFriend = async (friendId: string) => {
    const newFriends = friends.filter(f => f !== friendId);
    await supabaseService.updateUserFriends(currentUserId, newFriends);
  };

  const getFriendName = (friendId: string) => {
    return allUsers[friendId]?.username || 'Bilinmiyor';
  };

  const inviteLink = roomId ? `${window.location.origin}?room=${roomId}` : '';

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const availableUsers = Object.entries(allUsers)
    .filter(([id, user]) => 
      id !== currentUserId && 
      !friends.includes(id) &&
      user.username?.toLowerCase().includes(searchUsername.toLowerCase())
    )
    .slice(0, 5);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/25"
      >
        <UserPlus className="w-4 h-4" />
        Arkadaşlar
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-black">Arkadaşlarım</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchUsername}
                  onChange={e => setSearchUsername(e.target.value)}
                  placeholder="Kullanıcı adı ara..."
                  className="flex-1 px-4 py-3 bg-zinc-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-green-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={addFriend}
                  className="px-4 py-3 bg-green-500 text-white rounded-xl font-bold"
                >
                  <UserPlus className="w-5 h-5" />
                </motion.button>
              </div>
              {error && <p className="text-red-500 text-sm font-bold mt-2">{error}</p>}
              
              {searchUsername && availableUsers.length > 0 && (
                <div className="mt-2 space-y-1">
                  {availableUsers.map(([id, user]) => (
                    <button
                      key={id}
                      onClick={() => { setSearchUsername(user.username); setError(''); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 rounded-lg text-sm font-bold"
                    >
                      {user.username}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 overflow-y-auto max-h-60">
              {friends.length === 0 ? (
                <p className="text-center text-zinc-400 font-bold">Henüz arkadaşın yok</p>
              ) : (
                <div className="space-y-2">
                  {friends.map(friendId => (
                    <div key={friendId} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                      <span className="font-bold">{getFriendName(friendId)}</span>
                      <button
                        onClick={() => removeFriend(friendId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {roomId && (
              <div className="p-4 border-t border-zinc-100">
                <p className="text-sm font-bold text-zinc-500 mb-2">Odayı davet et</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-100 rounded-xl text-xs font-mono"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={copyInviteLink}
                    className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 ${
                      copied ? 'bg-green-500 text-white' : 'bg-zinc-900 text-white'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
