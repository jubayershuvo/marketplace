"use client";
import React, { useState, useRef, useEffect, useCallback, JSX } from "react";
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
  X,
  FileText,
  Video,
  Music,
  Archive,
  Smile,
  Loader,
} from "lucide-react";
import { useAppSelector } from "@/lib/hooks";
import { User } from "@/types/Profile";
import { useRouter } from "next/navigation";

// Type definitions (keep your existing types)
interface Attachment {
  url: string;
  type: string;
  name: string;
  size?: number;
}

interface Message {
  _id: string;
  tempId?: string;
  conversation: string;
  sender: string;
  receiver?: string;
  content: string;
  attachments?: Attachment[];
  type?: "text" | "image" | "file" | "video" | "audio";
  status?: "sent" | "delivered" | "read" | "error";
  createdAt: string;
  updatedAt?: string;
  sending?: boolean;
}

interface Chat {
  _id: string;
  users: User[];
  lastMessage?: string;
  updatedAt: string;
  createdAt?: string;
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
  createdAt?: string;
}

// File type icons mapping
const getFileIcon = (mimeType: string): JSX.Element => {
  if (mimeType.startsWith("image/")) {
    return <Image className="w-4 h-4 flex-shrink-0" />;
  } else if (mimeType.startsWith("video/")) {
    return <Video className="w-4 h-4 flex-shrink-0" />;
  } else if (mimeType.startsWith("audio/")) {
    return <Music className="w-4 h-4 flex-shrink-0" />;
  } else if (mimeType.includes("pdf")) {
    return <FileText className="w-4 h-4 flex-shrink-0" />;
  } else if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar")
  ) {
    return <Archive className="w-4 h-4 flex-shrink-0" />;
  } else {
    return <FileText className="w-4 h-4 flex-shrink-0" />;
  }
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<UIChat | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [chats, setChats] = useState<UIChat[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const { user } = useAppSelector((state) => state.userAuth);

  const API_BASE = "/api";

  // Enhanced window resize handler with breakpoints
  useEffect(() => {
    const handleResize = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);

      if (!mobile) {
        setSidebarOpen(true);
      } else if (selectedChat) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedChat]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [newMessage]);

  // Fetch messages list when user changes
  useEffect(() => {
    if (user?._id) {
      fetchMessagesList();
    }
  }, [user]);

  // Smart scroll management
  useEffect(() => {
    if (!messagesContainerRef.current || !autoScroll) return;

    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    };

    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages, selectedChat, attachedFiles, attachedImages]);

  // Handle scroll events to disable auto-scroll when user scrolls up
  const handleMessagesScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    }
  }, []);

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
      return "Active now";
    } else if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (diff < 30 * 24 * 60 * 60 * 1000) {
      const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else {
      const months = Math.floor(diff / (30 * 24 * 60 * 60 * 1000));
      return `${months} month${months > 1 ? "s" : ""} ago`;
    }
  };

  const transformChatToUIChat = useCallback(
    (chat: Chat): UIChat => {
      if (!user) {
        throw new Error("User not available");
      }

      const otherUser =
        chat.users.find((u: User) => u._id !== user._id) || chat.users[0];

      return {
        id: chat._id,
        name: `${otherUser.firstName} ${otherUser.lastName}`,
        avatar: otherUser.avatar || "/default-avatar.png",
        lastMessage: chat.lastMessage || "Start a conversation",
        timestamp: new Date(chat.updatedAt).toLocaleDateString(),
        unreadCount: 0,
        online: false,
        users: chat.users,
        createdAt: chat.createdAt,
      };
    },
    [user]
  );

  const fetchMessagesList = async (): Promise<void> => {
    if (!user) return;

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
    if (!user) return;

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

        // Sort messages by createdAt to ensure consistent order
        const sortedMessages = data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        setMessages((prev) => ({
          ...prev,
          [chatId]: sortedMessages,
        }));
      } else {
        console.error("Failed to fetch messages for chat:", chatId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChatSelect = (chat: UIChat): void => {
    setSelectedChat(chat);
    setAutoScroll(true); // Re-enable auto-scroll when switching chats
    if (isMobileView) {
      setSidebarOpen(false);
    }
    if (!messages[chat.id]) {
      setLoadingMessages(true);
      fetchMessages(chat.id);
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (
      (!newMessage.trim() &&
        attachedFiles.length === 0 &&
        attachedImages.length === 0) ||
      !selectedChat ||
      sending ||
      !user
    )
      return;

    const receiverId =
      selectedChat.users.find((u: User) => u._id !== user._id)?._id || "";
    const tempId = `temp-${Date.now()}`;

    // Create optimistic message for text or files
    const optimisticMessage: Message = {
      _id: tempId,
      tempId: tempId,
      conversation: selectedChat.id,
      sender: user._id,
      receiver: receiverId,
      content:
        newMessage ||
        (attachedFiles.length > 0
          ? `Sent ${attachedFiles.length} files`
          : `Sent ${attachedImages.length} images`),
      attachments: [...attachedFiles, ...attachedImages].map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        size: file.size,
      })),
      type:
        attachedImages.length > 0
          ? "image"
          : attachedFiles.length > 0
          ? "file"
          : "text",
      status: "sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sending: true,
    };

    // Add optimistic message
    setMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), optimisticMessage],
    }));

    const messageContent = newMessage;
    setNewMessage("");
    setAttachedFiles([]);
    setAttachedImages([]);
    setSending(true);
    setAutoScroll(true); // Ensure auto-scroll after sending

    try {
      let response: Response;

      if (attachedFiles.length > 0 || attachedImages.length > 0) {
        // Send files/images
        const formData = new FormData();
        formData.append("conversation", selectedChat.id);
        formData.append("chatId", selectedChat.id);

        // Append all files
        attachedFiles.forEach((file) => formData.append("files", file));
        attachedImages.forEach((image) => formData.append("images", image));

        // Set type based on what we're sending
        if (attachedImages.length > 0) {
          formData.append("type", "image");
        } else if (attachedFiles.length > 0) {
          formData.append("type", "file");
        }

        response = await fetch(`${API_BASE}/message/send`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        // Send text message
        response = await fetch(`${API_BASE}/message/send`, {
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
      }

      if (response.ok) {
        const result = await response.json();

        if (result.newMessage) {
          // Replace optimistic message with real message from server
          setMessages((prev) => {
            const currentMessages = prev[selectedChat.id] || [];

            // Remove the optimistic message using tempId
            const filteredMessages = currentMessages.filter(
              (msg) => msg.tempId !== tempId
            );

            // Add the real message from server
            const updatedMessages = [...filteredMessages, result.newMessage]
              .filter(
                (msg, index, self) =>
                  index === self.findIndex((m) => m._id === msg._id)
              )
              .sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime()
              );

            return {
              ...prev,
              [selectedChat.id]: updatedMessages,
            };
          });
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Mark optimistic message as failed
      setMessages((prev) => ({
        ...prev,
        [selectedChat.id]: (prev[selectedChat.id] || []).map((msg) =>
          msg.tempId === tempId
            ? { ...msg, status: "error" as const, sending: false }
            : msg
        ),
      }));

      // Show error toast
      alert(error instanceof Error ? error.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    isImage: boolean = false
  ): void => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !selectedChat || sending) return;

    if (isImage) {
      setAttachedImages((prev) => [...prev, ...files]);
    } else {
      setAttachedFiles((prev) => [...prev, ...files]);
    }

    // Clear input
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeAttachedFile = (index: number, isImage: boolean): void => {
    if (isImage) {
      setAttachedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const scrollToBottom = (): void => {
    setAutoScroll(true);
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);
  };

  // Keep your existing renderMessage function, but add this improved version:
  const renderMessage = (message: Message): JSX.Element => {
    if (!user) return <></>;

    const isMe = message.sender === user._id;
    const isError = message.status === "error";
    const hasAttachments =
      message.attachments && message.attachments.length > 0;
    const hasImages =
      hasAttachments &&
      message.attachments!.some((a) => a.type.startsWith("image/"));
    const hasVideos =
      hasAttachments &&
      message.attachments!.some((a) => a.type.startsWith("video/"));
    const hasAudio =
      hasAttachments &&
      message.attachments!.some((a) => a.type.startsWith("audio/"));
    const hasFiles =
      hasAttachments &&
      message.attachments!.some(
        (a) =>
          !a.type.startsWith("image/") &&
          !a.type.startsWith("video/") &&
          !a.type.startsWith("audio/")
      );

    return (
      <div
        key={message._id}
        className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"} px-2`}
      >
        <div className={`max-w-xs lg:max-w-md xl:max-w-lg 2xl:max-w-xl`}>
          {/* Text message without attachments */}
          {message.type === "text" && !hasAttachments && (
            <div
              className={`px-4 py-3 rounded-3xl relative shadow-sm ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                  : isMe
                  ? "bg-blue-600 text-white dark:bg-blue-700"
                  : "bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
              {message.sending && (
                <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </div>
          )}

          {/* Image messages */}
          {hasImages && (
            <div className="space-y-2">
              {message.content &&
                message.content !== message.attachments?.[0]?.name && (
                  <div
                    className={`px-4 py-2 rounded-3xl ${
                      isMe
                        ? "bg-blue-600 text-white dark:bg-blue-700"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              <div
                className={`grid gap-2 ${
                  message.attachments!.length > 1
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {message.attachments!.map(
                  (attachment, index) =>
                    attachment.type.startsWith("image/") && (
                      <div
                        key={index}
                        className="rounded-2xl overflow-hidden relative shadow-lg"
                      >
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-full h-auto max-h-48 object-cover"
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
                    )
                )}
              </div>
            </div>
          )}

          {/* Video messages */}
          {hasVideos && (
            <div className="space-y-2">
              {message.content &&
                message.content !== message.attachments?.[0]?.name && (
                  <div
                    className={`px-4 py-2 rounded-3xl ${
                      isMe
                        ? "bg-blue-600 text-white dark:bg-blue-700"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              <div className="space-y-2">
                {message.attachments!.map(
                  (attachment, index) =>
                    attachment.type.startsWith("video/") && (
                      <div
                        key={index}
                        className="rounded-2xl overflow-hidden relative shadow-lg bg-black"
                      >
                        <video
                          src={attachment.url}
                          controls
                          className="w-full h-auto max-h-48"
                          preload="metadata"
                        />
                        {message.sending && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-2xl">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Audio messages */}
          {hasAudio && (
            <div className="space-y-2">
              {message.content &&
                message.content !== message.attachments?.[0]?.name && (
                  <div
                    className={`px-4 py-2 rounded-3xl ${
                      isMe
                        ? "bg-blue-600 text-white dark:bg-blue-700"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              <div className="space-y-2">
                {message.attachments!.map(
                  (attachment, index) =>
                    attachment.type.startsWith("audio/") && (
                      <div
                        key={index}
                        className={`px-4 py-3 rounded-2xl border relative shadow-sm ${
                          isMe
                            ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                            : "bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0">
                            {getFileIcon(attachment.type)}
                            <div className="ml-2 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment.name}
                              </p>
                              {attachment.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              )}
                            </div>
                          </div>
                          <audio
                            src={attachment.url}
                            controls
                            className="ml-2 h-8"
                          />
                        </div>
                        {message.sending && (
                          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* File messages */}
          {hasFiles && (
            <div className="space-y-2">
              {message.content &&
                message.content !== message.attachments?.[0]?.name && (
                  <div
                    className={`px-4 py-2 rounded-3xl ${
                      isMe
                        ? "bg-blue-600 text-white dark:bg-blue-700"
                        : "bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              <div className="space-y-2">
                {message.attachments!.map(
                  (attachment: Attachment, index) =>
                    !attachment.type.startsWith("image/") &&
                    !attachment.type.startsWith("video/") &&
                    !attachment.type.startsWith("audio/") && (
                      <div
                        key={index}
                        className={`px-4 py-3 rounded-2xl border relative shadow-sm ${
                          isMe
                            ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
                            : "bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            {getFileIcon(attachment.type)}
                            <div className="ml-2 min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">
                                {attachment.name}
                              </p>
                              {attachment.size && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(attachment.size)}
                                </p>
                              )}
                            </div>
                          </div>
                          <a
                            href={attachment.url}
                            download={attachment.name}
                            className="ml-2 p-2 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors flex-shrink-0"
                            onClick={(e) => e.stopPropagation()}
                            title="Download file"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </a>
                        </div>
                        {message.sending && (
                          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-blue-400" />
                          </div>
                        )}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Timestamp */}
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

  const renderAttachedFilesPreview = (): JSX.Element | null => {
    if (attachedFiles.length === 0 && attachedImages.length === 0) return null;

    return (
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Attached files ({attachedFiles.length + attachedImages.length})
          </span>
          <button
            onClick={() => {
              setAttachedFiles([]);
              setAttachedImages([]);
            }}
            className="text-sm text-red-500 hover:text-red-700 transition-colors"
            type="button"
          >
            Clear all
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {attachedImages.map((file, index) => (
            <div key={index} className="relative group">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeAttachedFile(index, true)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="relative group bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(file.type)}
                <div className="min-w-0">
                  <p className="text-sm truncate max-w-32">{file.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachedFile(index, false)}
                  className="text-red-500 hover:text-red-700 transition-colors flex-shrink-0"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white dark:bg-gray-900 flex overflow-hidden">
      {/* Chat List Sidebar */}
      <div
        className={`${
          isMobileView
            ? sidebarOpen
              ? "w-full absolute inset-0 z-10"
              : "hidden"
            : selectedChat
            ? "w-80 lg:w-96"
            : "w-full max-w-md lg:max-w-lg"
        } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-sm transition-all duration-300`}
      >
        {/* Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isMobileView && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  type="button"
                >
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
              <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                Messages
              </h1>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-colors dark:text-white"
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
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No conversations yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Start a conversation to see it here
              </p>
            </div>
          ) : (
            chats.map((chat) => {
              const friend =
                chat.users.find((u: User) => u._id !== user._id) ||
                chat.users[0];
              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatSelect(chat)}
                  className={`px-4 lg:px-6 py-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedChat?.id === chat.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={friend.avatar || "/default-avatar.png"}
                        alt={`${friend.firstName} ${friend.lastName}`}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
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
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium text-white bg-blue-600 rounded-full min-w-[18px] h-4">
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
        className={`flex-1 flex flex-col h-10/12 md:h-11/12 ${
          isMobileView && sidebarOpen ? "hidden" : ""
        }`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-4 lg:px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between">
                <div
                  onClick={() => {
                    router.push(
                      `/profile/${
                        selectedChat.users.find((u: User) => u._id !== user._id)
                          ?._id
                      }`
                    );
                  }}
                  className="flex cursor-pointer items-center space-x-3"
                >
                  {isMobileView && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                      type="button"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  )}
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white text-base lg:text-lg">
                      {selectedChat.name}
                    </h2>
                    <p className="text-xs lg:text-sm text-green-600 dark:text-green-400">
                      {(() => {
                        const friend = selectedChat.users.find(
                          (u: User) => u._id !== user._id
                        );
                        return friend?.lastSeen
                          ? getDurationString(friend.lastSeen)
                          : "Offline";
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={scrollToBottom}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Scroll to bottom"
                    type="button"
                  >
                    <Send className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => fetchMessages(selectedChat.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    title="Refresh messages"
                    type="button"
                  >
                    <Loader className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleMessagesScroll}
              className="flex-1 overflow-y-auto py-4 px-2 lg:px-4 bg-gray-50 dark:bg-gray-800"
            >
              {loadingMessages ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : messages[selectedChat.id]?.length > 0 ? (
                <>
                  {!autoScroll && (
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={scrollToBottom}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-full shadow-lg transition-colors flex items-center space-x-2"
                        type="button"
                      >
                        <span>New messages</span>
                        <ArrowLeft className="w-4 h-4 transform rotate-90" />
                      </button>
                    </div>
                  )}
                  {messages[selectedChat.id].map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
                    Start the conversation by sending a message to{" "}
                    {selectedChat.name}
                  </p>
                </div>
              )}
            </div>

            {/* Message Input Area */}
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 sticky bottom-0">
              {renderAttachedFilesPreview()}
              <div className="p-3 lg:p-4">
                <div className="flex items-end space-x-2 lg:space-x-3">
                  <div className="flex space-x-1 flex-shrink-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Attach files"
                      type="button"
                    >
                      <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      disabled={sending}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Attach images"
                      type="button"
                    >
                      <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      disabled={sending}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add emoji"
                      type="button"
                    >
                      <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <div className="flex-1 relative min-h-[44px] flex items-center">
                    <textarea
                      ref={textareaRef}
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm dark:text-white transition-all duration-200"
                      style={{ minHeight: "44px", maxHeight: "120px" }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    className="p-2.5 lg:p-3 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                    disabled={
                      (!newMessage.trim() &&
                        attachedFiles.length === 0 &&
                        attachedImages.length === 0) ||
                      sending
                    }
                    title="Send message"
                    type="button"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
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
                multiple
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, true)}
                className="hidden"
                multiple
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Welcome to Messages
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm lg:text-base">
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
