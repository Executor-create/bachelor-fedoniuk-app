import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import { fetchUsers, type NormalizedUser } from '../api/users';

type Message = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
};

type RoomMessagePayload = {
  id: string | number;
  content: string;
  createdAt?: string;
  userId?: string | number;
  roomId?: string;
};

const CHAT_STORAGE_KEY_PREFIX = 'chat_messages_by_room';

const Chat = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<NormalizedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<
    Record<string, Message[]>
  >({});

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const activeRoomRef = useRef<string | null>(null);
  const pendingHistoryRoomRef = useRef<string | null>(null);

  const buildDirectRoomId = (a: string, b: string) =>
    `dm:${[a, b].sort().join(':')}`;

  const activeUser = users.find((u) => u.id === activeUserId) ?? null;
  const activeRoomId =
    user?.id && activeUserId ? buildDirectRoomId(user.id, activeUserId) : null;
  const activeMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeRoomId, activeMessages]);

  useEffect(() => {
    if (!user?.id) {
      setMessagesByRoom({});
      return;
    }

    const storageKey = `${CHAT_STORAGE_KEY_PREFIX}:${user.id}`;
    const raw = localStorage.getItem(storageKey);

    if (!raw) {
      setMessagesByRoom({});
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, Message[]>;
      setMessagesByRoom(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setMessagesByRoom({});
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `${CHAT_STORAGE_KEY_PREFIX}:${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(messagesByRoom));
  }, [messagesByRoom, user?.id]);

  useEffect(() => {
    activeRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    const loadUsers = async () => {
      if (!user?.id) return;

      setUsersLoading(true);
      setUsersError(null);

      try {
        const response = await fetchUsers(100);
        const otherUsers = response.data.filter((u) => u.id !== user.id);
        setUsers(otherUsers);

        if (!activeUserId && otherUsers.length > 0) {
          setActiveUserId(otherUsers[0].id);
        }
      } catch (error) {
        console.error('Failed to load users for chat', error);
        setUsersError('Unable to load users. Please try again.');
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [user?.id, activeUserId]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!activeRoomId) return;

    if (joinedRoomId !== activeRoomId) {
      console.error('Not joined to selected room yet');
      return;
    }

    try {
      if (socketRef.current && user?.id) {
        socketRef.current.emit(
          'sendMessage',
          { content: trimmed, userId: user.id, roomId: activeRoomId },
          (ack: { status: 'ok' | 'error'; message?: string }) => {
            if (ack?.status === 'error') {
              console.error('Message send failed:', ack.message);
            }
          },
        );
      }
    } catch (err) {
      console.error('Socket emit failed', err);
    }

    setInput('');
  };

  useEffect(() => {
    const socket = io(API_BASE_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setJoinedRoomId(null);
    });

    socket.on('joinedRoom', (roomId: string) => {
      setJoining(false);
      setJoinedRoomId(roomId);

      pendingHistoryRoomRef.current = roomId;
      socket.emit('getRoomMessages', roomId);
    });

    socket.on('leftRoom', (roomId: string) => {
      setJoinedRoomId((prev) => (prev === roomId ? null : prev));
    });

    socket.on(
      'roomMessages',
      (
        payload:
          | RoomMessagePayload[]
          | { status: 'error'; message?: string }
          | null,
      ) => {
        if (!payload) return;

        if (!Array.isArray(payload)) {
          if (payload.status === 'error') {
            console.error('Failed to load room messages:', payload.message);
          }
          return;
        }

        const roomId =
          pendingHistoryRoomRef.current ||
          (payload[0] && typeof payload[0].roomId === 'string'
            ? payload[0].roomId
            : null);

        if (!roomId) return;

        const normalized = payload.map((msg) => ({
          id: String(msg.id ?? Date.now()),
          fromMe: String(msg.userId) === String(user?.id),
          text: msg.content ?? '',
          time: msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
        }));

        setMessagesByRoom((prev) => ({
          ...prev,
          [roomId]: normalized,
        }));

        pendingHistoryRoomRef.current = null;
      },
    );

    socket.on('connect_error', (error) => {
      console.error('Socket connect error', error);
      setJoining(false);
    });

    socket.on('message', (msg: any) => {
      const roomKey =
        typeof msg?.roomId === 'string' && msg.roomId
          ? msg.roomId
          : activeRoomRef.current;

      if (!roomKey) return;

      const incoming: Message = {
        id: String(msg.id ?? Date.now()),
        fromMe: String(msg.userId) === String(user?.id),
        text: msg.content ?? String(msg),
        time: msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
      };

      setMessagesByRoom((prev) => ({
        ...prev,
        [roomKey]: [...(prev[roomKey] || []), incoming],
      }));
    });

    socket.on('disconnect', () => {
      setJoinedRoomId(null);
      setJoining(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!socketRef.current || !activeRoomId) return;

    if (joinedRoomId === activeRoomId) return;

    if (joinedRoomId && joinedRoomId !== activeRoomId) {
      socketRef.current.emit('leaveRoom', joinedRoomId);
    }

    setJoining(true);
    socketRef.current.emit('joinRoom', activeRoomId);
  }, [activeRoomId, joinedRoomId]);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />

      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto px-8 pt-8 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="w-full max-w-6xl mx-auto flex gap-6 h-[calc(100vh-116px)]">
            <aside className="w-80 flex flex-col gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full">
                <div className="p-4 border-b border-zinc-800">
                  <h3 className="text-white font-semibold">Messages</h3>
                  <p className="text-xs text-zinc-400">Users</p>
                </div>

                <div className="p-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                  {usersLoading && (
                    <p className="text-sm text-zinc-500">Loading users...</p>
                  )}

                  {usersError && (
                    <p className="text-sm text-red-400">{usersError}</p>
                  )}

                  {!usersLoading && !usersError && users.length === 0 && (
                    <p className="text-sm text-zinc-500">No users found.</p>
                  )}

                  {!usersLoading &&
                    !usersError &&
                    users.map((chatUser) => {
                      const roomId =
                        user?.id && chatUser.id
                          ? buildDirectRoomId(user.id, chatUser.id)
                          : null;
                      const lastMessage = roomId
                        ? (messagesByRoom[roomId] || []).slice(-1)[0]
                        : null;

                      return (
                        <button
                          key={chatUser.id}
                          onClick={() => setActiveUserId(chatUser.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-zinc-800 transition ${
                            activeUserId === chatUser.id ? 'bg-zinc-800' : ''
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-white overflow-hidden">
                            {chatUser.avatar ? (
                              <img
                                src={chatUser.avatar}
                                alt={chatUser.username}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              chatUser.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white font-medium truncate">
                                {chatUser.username}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 truncate">
                              {lastMessage?.text ?? 'Start a conversation'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </aside>

            <section className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">
                    {activeUser?.username ?? 'Select a user'}
                  </h3>
                </div>
                <div className="text-xs text-zinc-400">Online</div>
              </div>

              <div
                ref={scrollRef}
                className="p-4 flex-1 overflow-y-auto space-y-3"
              >
                {activeMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12">
                    <span className="text-4xl opacity-20">💬</span>
                    <p className="text-sm text-zinc-500">
                      No messages yet. Say hello!
                    </p>
                  </div>
                )}

                {activeMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[70%] ${m.fromMe ? 'ml-auto' : ''}`}
                  >
                    <div
                      className={`px-4 py-2 rounded-2xl ${m.fromMe ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-200'}`}
                    >
                      {m.text}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') send();
                    }}
                    disabled={!activeRoomId || joinedRoomId !== activeRoomId}
                    placeholder="Write a message..."
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={send}
                    disabled={!activeRoomId || joinedRoomId !== activeRoomId}
                    className="bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-700 disabled:text-zinc-400 text-white px-4 py-2 rounded-full text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
