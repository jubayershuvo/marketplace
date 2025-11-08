import mongoose from "mongoose";
import MessageModel from "@/models/Message";
import UserModel from "@/models/User";

/** Represents reply delay stats for a freelancer. */
export interface ReplyStats {
  overallAverageReadable: string;
  perUser: {
    userId: string;
    averageMs: number;
    readableDelay: string;
  }[];
}

/** Convert milliseconds into human-readable format like "2 hours", "3 days" */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  if (weeks >= 1) return `${weeks} week${weeks > 1 ? "s" : ""}`;
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""}`;
  if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  return `${seconds} second${seconds !== 1 ? "s" : ""}`;
}

/**
 * Calculates a freelancer’s average reply delay across all users and updates their profile.
 * @param userId Freelancer's MongoDB ObjectId string
 * @returns ReplyStats with readable time formats
 */
export async function calculateAverageReplyDelay(
  userId: string
): Promise<ReplyStats> {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID format.");
  }

  const freelancerId = new mongoose.Types.ObjectId(userId);

  // Fetch all messages involving this freelancer
  const messages = await MessageModel.find({
    $or: [{ sender: freelancerId }, { receiver: freelancerId }],
  })
    .sort({ createdAt: 1 })
    .lean();

  if (messages.length === 0) {
    return { overallAverageReadable: "0 second", perUser: [] };
  }

  const replyDelays: Record<string, number[]> = {};

  for (let i = 0; i < messages.length - 1; i++) {
    const current = messages[i];
    const next = messages[i + 1];

    if (!current.createdAt || !next.createdAt) continue;

    const otherUser =
      current.sender.toString() === userId
        ? current.receiver.toString()
        : current.sender.toString();

    const isClientMsg = current.sender.toString() !== userId;
    const isFreelancerReply = next.sender.toString() === userId;
    const sameReceiver = next.receiver.toString() === current.sender.toString();
    const sameConversation =
      current.conversation.toString() === next.conversation.toString();

    if (isClientMsg && isFreelancerReply && sameReceiver && sameConversation) {
      const delayMs = next.createdAt.getTime() - current.createdAt.getTime();
      if (delayMs > 0) {
        if (!replyDelays[otherUser]) replyDelays[otherUser] = [];
        replyDelays[otherUser].push(delayMs);
      }
    }
  }

  // Calculate per-user averages
  const perUser = Object.entries(replyDelays).map(([id, delays]) => {
    const avgMs = delays.reduce((a, b) => a + b, 0) / delays.length;
    return {
      userId: id,
      averageMs: avgMs,
      readableDelay: formatDuration(avgMs),
    };
  });

  // Compute overall average
  const overallAverageMs =
    perUser.length > 0
      ? perUser.reduce((a, b) => a + b.averageMs, 0) / perUser.length
      : 0;

  // Update freelancer's record
  await UserModel.findByIdAndUpdate(freelancerId, {
    replyDelay: overallAverageMs,
  });

  return {
    overallAverageReadable: formatDuration(overallAverageMs),
    perUser,
  };
}
