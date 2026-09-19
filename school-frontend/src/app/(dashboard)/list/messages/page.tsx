"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getClientGqlClient } from "@/lib/graphql/client";
import {
  GET_INBOX,
  GET_CONVERSATION,
  GET_USERS,
  SEND_MESSAGE,
  MARK_MESSAGE_READ,
} from "@/lib/graphql/queries";
import Cookies from "js-cookie";
import { getErrorMessage } from "@/lib/errors";
type Message = {
  id: string;
  content: string;
  sentAt: string;
  read: boolean;
  senderId: string;
  receiverId: string;
  senderName?: string;
  receiverName?: string;
};

type UserOption = {
  id: string;
  username: string;
  roleName: string;
};

const MessagesPage = () => {
  const myId = Cookies.get("userId");

  const [inbox, setInbox] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [composeText, setComposeText] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newRecipientId, setNewRecipientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const conversationPartners = useMemo(() => {
    const seen = new Map<string, { name: string; lastMessage: Message }>();
    for (const m of inbox) {
      const otherId = m.senderId === myId ? m.receiverId : m.senderId;
      const otherName = m.senderId === myId ? m.receiverName : m.senderName;
      if (!seen.has(otherId)) {
        seen.set(otherId, { name: otherName ?? "Unknown", lastMessage: m });
      }
    }
    return Array.from(seen.entries()).map(([id, v]) => ({ id, ...v }));
  }, [inbox, myId]);

  const loadInbox = async () => {
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ inbox: Message[] }>(GET_INBOX, { take: 100 });
      setInbox(data.inbox);
    } catch (err) {
      console.error("Failed to load inbox:", err);
      setError("Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const openConversation = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ conversation: Message[] }>(GET_CONVERSATION, {
        userId,
        take: 100,
      });
      setConversation(data.conversation);

      const unread = data.conversation.filter((m) => !m.read && m.receiverId === myId);
      for (const m of unread) {
        await client.request(MARK_MESSAGE_READ, { id: m.id });
      }
      if (unread.length > 0) loadInbox();
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const openNewMessage = async () => {
    setShowNewMessage(true);
    if (userOptions.length > 0) return;
    try {
      const client = await getClientGqlClient();
      const data = await client.request<{ users: UserOption[] }>(GET_USERS, {});
      setUserOptions(data.users);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleSend = async () => {
    const recipientId = selectedUserId ?? newRecipientId;
    if (!recipientId || !composeText.trim()) return;

    try {
      const client = await getClientGqlClient();
      await client.request(SEND_MESSAGE, {
        input: { content: composeText, receiverId: recipientId },
      });
      setComposeText("");
      setShowNewMessage(false);
      await loadInbox();
      if (selectedUserId || newRecipientId) {
        openConversation(recipientId);
      }
      setNewRecipientId("");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to send message."));
    }
  };

  if (loading) {
    return <div className="p-4">Loading messages...</div>;
  }

  return (
    <div className="bg-white rounded-md flex-1 m-4 mt-0 flex h-[calc(100vh-120px)]">
      {/* CONVERSATION LIST */}
      <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-lg font-semibold text-textPrimary">Messages</h1>
          <button
            onClick={openNewMessage}
            className="text-xs bg-warningLight text-warning px-3 py-1.5 rounded-full"
          >
            New
          </button>
        </div>

        {showNewMessage && (
          <div className="p-4 border-b border-gray-200 flex flex-col gap-2">
            <select
              value={newRecipientId}
              onChange={(e) => setNewRecipientId(e.target.value)}
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm"
            >
              <option value="">Select a recipient</option>
              {userOptions.map((u) => (
                <option value={u.id} key={u.id}>
                  {u.username} ({u.roleName.toLowerCase()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversationPartners.length === 0 && !showNewMessage && (
            <p className="p-4 text-sm text-gray-400">
              No messages yet. Click "New" to start a conversation.
            </p>
          )}
          {conversationPartners.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setShowNewMessage(false);
                openConversation(c.id);
              }}
              className={`w-full text-left p-4 border-b border-border hover:bg-accentLight transition ${
                selectedUserId === c.id ? "bg-lamaPurpleLight" : ""
              }`}
            >
              <div className="font-medium text-sm">{c.name}</div>
              <div className="text-xs text-gray-400 truncate">{c.lastMessage.content}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CONVERSATION THREAD */}
      <div className="hidden md:flex flex-col flex-1">
        {selectedUserId || showNewMessage ? (
          <>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {conversation.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${
                    m.senderId === myId
                      ? "bg-accent text-white self-end"
                      : "bg-gray-100 self-start"
                  }`}
                >
                  <div>{m.content}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {new Date(m.sentAt).toLocaleString()}
                  </div>
                </div>
              ))}
              {conversation.length === 0 && (
                <p className="text-sm text-gray-400">
                  No messages yet — say hello.
                </p>
              )}
            </div>

            {error && <p className="px-4 text-sm text-red-500">{error}</p>}

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={composeText}
                onChange={(e) => setComposeText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Type a message..."
                className="flex-1 ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-blue-400 text-white px-4 py-2 rounded-md text-sm"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation or start a new one.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;