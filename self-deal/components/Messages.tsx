"use client";
import React, { useState, useRef, useEffect, JSX } from "react";
import {
  Send,
  Paperclip,
  Image,
  MoreVertical,
  Search,
  ArrowLeft,
  Loader2,
  Menu,
  Settings,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";

// Mock user for demo purposes


// Type definitions
interface Chat {
  _id: string;
  user: string;
  users: User[];
  lastMessage: string;
  freelancer: string;
  gig: string;
  totalAmount: number;
  status: "pending" | "paid" | "processing" | "delivered" | "completed" | "cancelled";
  transactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username: string;
  password?: string;
  userType: "freelancer" | "client";
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBanned: boolean;
  isActive: boolean;
  loginAttempts: number;
  lockUntil?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  location?: string;
  lastSeen: string;
}

interface Message {
  _id: string;
  conversation?: string;
  sender: string;
  receiver: string;
  content: string;
  attachments?: Array<{
    url: string;
    type: string;
    name: string;
  }>;
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read" | "error";
  createdAt: string;
  updatedAt: string;
  sending?: boolean;
}

interface UIChat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  users: User[];
  createdAt: string;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<UIChat | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [chats, setChats] = useState<UIChat[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use mock user instead of Redux
  const {user} = useAppSelector((state) => state.userAuth);

  const API_BASE = "/api";

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?._id) {
      fetchMessagesList();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  // Auto-refresh messages every 5 seconds for selected chat
  useEffect(() => {
    if (!selectedChat?.id) return;

    const intervalId = setInterval(() => {
      fetchMessages(selectedChat.id);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [selectedChat?.id]);

  const getDurationString = (lastSeen: string): string => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diff = now.getTime() - lastSeenDate.getTime();

    if (diff < 5 * 60 * 1000) {
      return "Active";
    } else if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))} minutes ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))} hours ago`;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))} days ago`;
    } else if (diff < 30 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (7 * 24 * 60 * 60 * 1000))} weeks ago`;
    } else {
      return `${Math.floor(diff / (30 * 24 * 60 * 60 * 1000))} months ago`;
    }
  };

  const transformChatToUIChat = (chat: Chat): UIChat => {
    const otherUser = chat.users.find((u) => u._id !== user._id) || chat.users[0];

    return {
      id: chat._id,
      name: `${otherUser.firstName} ${otherUser.lastName}`,
      avatar: otherUser.avatar || "/default-avatar.png",
      lastMessage: chat.lastMessage || "No messages yet",
      timestamp: new Date(chat.updatedAt).toLocaleDateString(),
      unreadCount: 0,
      online: false,
      users: chat.users,
      createdAt: chat.createdAt,
    };
  };

  const fetchMessagesList = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chats && Array.isArray(data.chats)) {
          const transformedChats = data.chats.map(transformChatToUIChat);
          setChats(transformedChats);
        }
      } else {
        console.error("Failed to fetch messages list");
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching messages list:", error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string): Promise<void> => {
    
    try {
      const response = await fetch(`${API_BASE}/messages?id=${chatId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data: Message[] = await response.json();
        setMessages((prev) => ({
          ...prev,
          [chatId]: data,
        }));
      } else {
        console.error("Failed to fetch messages for chat:", chatId);
        setMessages((prev) => ({
          ...prev,
          [chatId]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages((prev) => ({
        ...prev,
        [chatId]: [],
      }));
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChatSelect = (chat: UIChat): void => {
    setSelectedChat(chat);
    if (isMobileView) {
      setSidebarOpen(false);
    }
    if (!messages[chat.id]) {
      setLoadingMessages(true);
      fetchMessages(chat.id);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const receiverId = selectedChat.users.find((u) => u._id !== user._id)?._id || "";
    
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversation: selectedChat.id,
      sender: user._id,
      receiver: receiverId,
      content: newMessage,
      type: "text",
      status: "sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sending: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMessage],
    }));

    const messageContent = newMessage;
    setNewMessage("");
    setSending(true);

    try {
      const response = await fetch(`${API_BASE}/message/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          conversation: selectedChat.id,
          chatId: selectedChat.id,
          content: messageContent,
          type: "text",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessages((prev) => ({
          ...prev,
          [selectedChat.id]: result.messages || prev[selectedChat.id],
        }));
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).map((msg) =>
          msg._id === optimisticMessage._id
            ? { ...msg, status: "error" as const, sending: false }
            : msg
        ),
      }));
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isImage: boolean = false
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file || !selectedChat || sending) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversation", selectedChat.id);
    formData.append("chatId", selectedChat.id);
    formData.append("type", isImage ? "image" : "file");

    const receiverId = selectedChat.users.find((u) => u._id !== user._id)?._id || "";
    
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      conversation: selectedChat.id,
      sender: user._id,
      receiver: receiverId,
      content: isImage ? URL.createObjectURL(file) : file.name,
      attachments: [
        {
          url: isImage ? URL.createObjectURL(file) : "",
          type: file.type,
          name: file.name,
        },
      ],
      type: isImage ? "image" : "file",
      status: "sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sending: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMessage],
    }));

    setSending(true);

    try {
      const response = await fetch(`${API_BASE}/message/send`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();

        setMessages((prev) => ({
          ...prev,
          [selectedChat.id]: (prev[selectedChat.id] || []).map((msg) =>
            msg._id === optimisticMessage._id
              ? { ...result.message, sending: false }
              : msg
          ),
        }));

      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).filter(
          (msg) => msg._id !== optimisticMessage._id
        ),
      }));
    } finally {
      setSending(false);
      if (isImage && optimisticMessage.content) {
        URL.revokeObjectURL(optimisticMessage.content);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const renderMessage = (message: Message): JSX.Element => {
    // Fixed: Properly check if current user is the sender
    
    const isMe = message.sender === user._id;
    const isError = message.status === "error";

    return (
      <div
        key={message._id}
        className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"} px-1`}
      >
        <div className={`max-w-xs lg:max-w-md`}>
          {message.type === "text" && (
            <div
              className={`px-4 py-2 rounded-3xl relative shadow-sm ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                  : isMe
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "bg-gray-100 text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
              {message.sending && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
          )}

          {message.type === "image" && (
            <div className="rounded-2xl overflow-hidden relative shadow-lg max-w-sm">
              <img
                src={message.attachments?.[0]?.url || message.content}
                alt="Shared image"
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-image.png";
                }}
              />
              {message.sending && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                </div>
              )}
            </div>
          )}

          {message.type === "file" && (
            <div
              className={`px-4 py-3 rounded-2xl border relative shadow-sm ${
                isMe
                  ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                  : "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              }`}
            >
              <div className="flex items-center">
                <Paperclip className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {message.attachments?.[0]?.name || message.content}
                </span>
              </div>
              {message.sending && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
          )}

          <div className={`mt-1 px-1 ${isMe ? "text-right" : "text-left"}`}>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex">
      {/* Chat List Sidebar */}
      <div
        className={`${
          isMobileView
            ? sidebarOpen
              ? "w-full"
              : "hidden"
            : selectedChat
            ? "w-80"
            : "w-full max-w-md"
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {isMobileView && selectedChat && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors lg:hidden"
                >
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
              <h1 className="text-2xl font-normal text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchMessagesList}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title="Refresh"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                ) : (
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors dark:text-white"
              placeholder="Search conversations"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-6">
              <p className="text-gray-500 dark:text-gray-400">
                No conversations yet
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const friend =
                chat.users.find((u) => u._id !== user._id) || chat.users[0];
              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedChat?.id === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-r-3 border-r-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.avatar || "/default-avatar.png"}
                        alt={`${friend.firstName} ${friend.lastName}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                          {`${friend.firstName} ${friend.lastName}`}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {chat.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-full min-w-[20px] h-5">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`flex-1 flex flex-col ${
          isMobileView && sidebarOpen ? "hidden" : ""
        }`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {isMobileView && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors lg:hidden"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  )}
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-medium text-gray-900 dark:text-white text-lg">
                      {selectedChat.name}
                    </h2>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {(() => {
                        const friend = selectedChat.users.find((u) => u._id !== user._id);
                        return friend?.lastSeen ? getDurationString(friend.lastSeen) : "";
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fetchMessages(selectedChat.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Refresh messages"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto py-4 px-4 bg-gray-50 dark:bg-gray-800">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {messages[selectedChat.id]?.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Attach file"
                >
                  <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={sending}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title="Attach image"
                >
                  <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    disabled={sending}
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-3xl bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm dark:text-white"
                    style={{ minHeight: "44px", maxHeight: "120px" }}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                  disabled={!newMessage.trim() || sending}
                  title="Send message"
                >
                  {sending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => handleFileUpload(e, false)}
              className="hidden"
              accept="*/*"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, true)}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-normal text-gray-900 dark:text-white mb-3">
                Welcome to Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Select a conversation from the sidebar to start messaging with
                your contacts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;