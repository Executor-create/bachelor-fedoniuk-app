import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { io, type Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import { fetchUsers, type NormalizedUser } from '../api/users';
import { FiMessageCircle, FiSearch, FiSend } from 'react-icons/fi';

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

function ContactSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
      <div className="h-10 w-10 rounded-full bg-zinc-800 animate-shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 rounded-full bg-zinc-800 animate-shimmer" />
        <div className="h-3 w-40 rounded-full bg-zinc-800 animate-shimmer" />
      </div>
    </div>
  );
}

const Chat = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<NormalizedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
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
  const trimmedUserQuery = userQuery.trim().toLowerCase();
  const filteredUsers = trimmedUserQuery
    ? users.filter((chatUser) => {
        const username = chatUser.username?.toLowerCase() || '';
        const tag = chatUser.tag?.toLowerCase() || '';
        return (
          username.includes(trimmedUserQuery) || tag.includes(trimmedUserQuery)
        );
      })
    : users;
  const lastActiveMessage = activeMessages[activeMessages.length - 1] || null;
  const isReadyToSend =
    !!activeRoomId && joinedRoomId === activeRoomId && !joining;
  const canSend = isReadyToSend && input.trim().length > 0;
  const presenceLabel = joining
    ? 'Connecting'
    : isReadyToSend
      ? 'Online'
      : 'Offline';

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

        <main className="page-enter relative flex-1 overflow-y-auto px-4 md:px-8 pt-8 pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 right-[-15%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.2),rgba(16,185,129,0))] blur-3xl" />
            <div className="absolute top-28 left-[-10%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.16),rgba(56,189,248,0))] blur-3xl" />
            <div className="absolute bottom-16 right-[-8%] h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.14),rgba(251,191,36,0))] blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-6">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100">
                <FiMessageCircle size={14} />
                <span>Chat</span>
              </div>
              <h1 className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Chat with your squad
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Real-time DMs for planning sessions, sharing clips, and staying
                in sync with your favorite players.
              </p>
            </div>

            <div className="w-full max-w-6xl mx-auto grid gap-6 lg:grid-cols-[320px_1fr] min-h-140 h-[calc(100vh-240px)]">
              <aside className="flex flex-col gap-4 h-full min-h-0">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-full backdrop-blur-sm">
                  <div className="p-4 border-b border-zinc-800">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-white font-semibold">Messages</h3>
                        <p className="text-xs text-zinc-400">
                          {filteredUsers.length} users
                        </p>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-100">
                        Live
                      </span>
                    </div>

                    <div className="mt-3 relative">
                      <FiSearch
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      />
                      <input
                        value={userQuery}
                        onChange={(e) => setUserQuery(e.target.value)}
                        placeholder="Search users"
                        aria-label="Search chat users"
                        className="w-full rounded-full border border-zinc-800 bg-zinc-900/70 py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                      />
                    </div>
                  </div>

                  <div className="p-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
                    {usersLoading && (
                      <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <ContactSkeleton key={index} />
                        ))}
                      </div>
                    )}

                    {usersError && (
                      <p className="text-sm text-red-400">{usersError}</p>
                    )}

                    {!usersLoading &&
                      !usersError &&
                      filteredUsers.length === 0 && (
                        <p className="text-sm text-zinc-500">
                          {trimmedUserQuery
                            ? 'No users match your search.'
                            : 'No users found.'}
                        </p>
                      )}

                    {!usersLoading &&
                      !usersError &&
                      filteredUsers.map((chatUser) => {
                        const roomId =
                          user?.id && chatUser.id
                            ? buildDirectRoomId(user.id, chatUser.id)
                            : null;
                        const lastMessage = roomId
                          ? (messagesByRoom[roomId] || []).slice(-1)[0]
                          : null;
                        const isActive = activeUserId === chatUser.id;

                        return (
                          <button
                            key={chatUser.id}
                            onClick={() => setActiveUserId(chatUser.id)}
                            className={`w-full text-left rounded-xl border px-3 py-2 transition hover:border-zinc-700/70 hover:bg-zinc-800/60 ${
                              isActive
                                ? 'border-emerald-400/40 bg-zinc-800/70'
                                : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
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
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-white font-medium truncate">
                                    {chatUser.username}
                                  </span>
                                  {lastMessage?.time && (
                                    <span className="text-[10px] text-zinc-500">
                                      {lastMessage.time}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400 truncate">
                                  {lastMessage?.text ?? 'Start a conversation'}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              </aside>

              <section className="relative flex-1 flex flex-col bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm h-full min-h-0">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-base font-semibold text-white overflow-hidden">
                      {activeUser?.avatar ? (
                        <img
                          src={activeUser.avatar}
                          alt={activeUser.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        activeUser?.username?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        {activeUser?.username ?? 'Select a user'}
                      </h3>
                      <p className="text-xs text-zinc-400">
                        {activeUser?.tag ??
                          'Choose a conversation to get started'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    {lastActiveMessage && (
                      <span className="hidden sm:inline">
                        Last message {lastActiveMessage.time}
                      </span>
                    )}
                    <span className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/70 px-3 py-1">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isReadyToSend
                            ? 'bg-emerald-400'
                            : joining
                              ? 'bg-amber-400'
                              : 'bg-zinc-500'
                        }`}
                      />
                      {presenceLabel}
                    </span>
                  </div>
                </div>

                <div
                  ref={scrollRef}
                  className="relative flex-1 overflow-y-auto px-6 py-5 min-h-0"
                >
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-x-0 top-0 h-20 bg-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-transparent" />
                  </div>

                  <div className="relative z-10 space-y-4">
                    {activeUser && joining && (
                      <div className="flex items-center justify-center">
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
                          Joining room...
                        </span>
                      </div>
                    )}

                    {!activeUser ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <span className="text-4xl opacity-20">💬</span>
                        <p className="text-sm text-zinc-500">
                          Select someone to start a conversation.
                        </p>
                      </div>
                    ) : activeMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12">
                        <span className="text-4xl opacity-20">💬</span>
                        <p className="text-sm text-zinc-500">
                          No messages yet. Say hello!
                        </p>
                      </div>
                    ) : (
                      activeMessages.map((m) => (
                        <div
                          key={m.id}
                          className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-[75%]">
                            <div
                              className={`px-4 py-2 rounded-2xl text-sm shadow-lg ${
                                m.fromMe
                                  ? 'bg-linear-to-br from-emerald-400 to-sky-500 text-zinc-950'
                                  : 'bg-zinc-800/80 text-zinc-200'
                              }`}
                            >
                              {m.text}
                            </div>
                            <div
                              className={`text-[11px] text-zinc-500 mt-1 ${
                                m.fromMe ? 'text-right' : ''
                              }`}
                            >
                              {m.time}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/70">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            send();
                          }
                        }}
                        disabled={!activeRoomId || joining}
                        placeholder={
                          activeUser
                            ? `Message ${activeUser.username}`
                            : 'Select a user to start chatting'
                        }
                        className="flex-1 bg-zinc-950/70 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-70"
                      />
                      <button
                        type="button"
                        onClick={send}
                        disabled={!canSend}
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-emerald-400 to-sky-500 text-zinc-950 hover:from-emerald-300 hover:to-sky-400"
                      >
                        <FiSend size={14} />
                        <span>Send</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Press Enter to send</span>
                      {activeUser && <span>DM with {activeUser.username}</span>}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
