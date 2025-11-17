"use client";
import { useEffect, useState } from "react";

interface DiscordUsernameProps {
  userId: string;
  showAvatar?: boolean;
  avatarSize?: number;
}

export default function DiscordUsername({ userId, showAvatar = true, avatarSize = 24 }: DiscordUsernameProps) {
  const [username, setUsername] = useState<string>(`@${userId.slice(0, 8)}`);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUsername();
  }, [userId]);

  const loadUsername = async () => {
    try {
      const res = await fetch(`/api/discord/user/${userId}`);
      const data = await res.json();

      if (res.ok && data.username) {
        // Utiliser global_name si disponible, sinon username
        const displayName = data.global_name || data.username;
        setUsername(displayName);
      }
    } catch (error) {
      console.error("Error loading Discord username:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        {showAvatar && (
          <div
            className="rounded-full border border-border bg-surface animate-pulse"
            style={{ width: avatarSize, height: avatarSize }}
          />
        )}
        <span className="text-muted">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showAvatar && (
        <img
          src={`/api/discord/avatar/${userId}`}
          alt={username}
          className="rounded-full border border-border"
          style={{ width: avatarSize, height: avatarSize }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
          }}
        />
      )}
      <span>{username}</span>
    </div>
  );
}
