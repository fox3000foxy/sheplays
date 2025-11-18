"use client";
import { useEffect, useState } from "react";

interface Playmate {
  id: number;
  discord_id: string;
  username: string;
  display_name: string;
  bio: string;
  age: number;
  games: string[];
  languages: string[];
  style: string;
  audio_sample_url: string;
  price_15min: number;
  price_30min: number;
  price_60min: number;
  available_status: number;
  status: string;
  total_sessions: number;
  rating: number;
  review_count: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  tags: string[];
  created_at: number;
  client_id: string;
}

interface TimeSlot {
  date: string;
  time: string;
  timestamp: number;
  availableDurations: number[];
}

export default function PlaymatesClient() {
  const [playmates, setPlaymates] = useState<Playmate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedPlaymate, setSelectedPlaymate] = useState<Playmate | null>(null);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [user, setUser] = useState<any>(null);
  const [isTalent, setIsTalent] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showTalentBlockedPrompt, setShowTalentBlockedPrompt] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [completedSessionsByTalent, setCompletedSessionsByTalent] = useState<Map<string, any>>(new Map());
  const [reviewedSessions, setReviewedSessions] = useState<Set<string>>(new Set());
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSession, setReviewSession] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [reviewTags, setReviewTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPlaymates();
    checkAuth();
  }, [sortBy]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);

        // Vérifier si l'utilisateur est un talent
        const talentCheckRes = await fetch(`/api/db/talent/check/${userData.id}`);
        const talentCheck = await talentCheckRes.json();
        setIsTalent(talentCheck.isTalent || false);

        // Charger les favoris si l'utilisateur est un client
        if (!talentCheck.isTalent) {
          loadFavorites(userData.id);
          loadCompletedSessions(userData.id);
          loadReviewedSessions(userData.id);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    }
  };

  const loadCompletedSessions = async (userId: string) => {
    try {
      const res = await fetch(`/api/db/client/sessions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const completed = data.history?.filter((s: any) => s.status === 'completed') || [];
        const sessionsByTalent = new Map<string, any>();
        completed.forEach((session: any) => {
          const talentId = session.talent_discord_id || session.talent_id;
          if (!sessionsByTalent.has(talentId)) {
            sessionsByTalent.set(talentId, session);
          }
        });
        setCompletedSessionsByTalent(sessionsByTalent);
      }
    } catch (error) {
      console.error("Error loading completed sessions:", error);
    }
  };

  const loadReviewedSessions = async (userId: string) => {
    try {
      const res = await fetch(`/api/db/client/reviewed-sessions/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setReviewedSessions(new Set(data.reviewedSessionIds || []));
      }
    } catch (error) {
      console.error("Error loading reviewed sessions:", error);
    }
  };

  const loadFavorites = async (userId: string) => {
    try {
      const res = await fetch(`/api/favoris/${userId}`);
      if (res.ok) {
        const data = await res.json();
        const favSet = new Set<string>(data.favorites.map((f: any) => f.discord_id));
        setFavorites(favSet);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (talentDiscordId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const isFavorite = favorites.has(talentDiscordId);

    try {
      if (isFavorite) {
        // Supprimer des favoris
        const res = await fetch("/api/favoris", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: user.id,
            talentDiscordId,
          }),
        });

        if (res.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.delete(talentDiscordId);
          setFavorites(newFavorites);
        }
      } else {
        // Ajouter aux favoris
        const res = await fetch("/api/favoris", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: user.id,
            talentDiscordId,
          }),
        });

        if (res.ok) {
          const newFavorites = new Set(favorites);
          newFavorites.add(talentDiscordId);
          setFavorites(newFavorites);
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchPlaymates = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        ...(search && { search }),
      });
      const res = await fetch(`/api/playmates?${params}`);
      const data = await res.json();
      setPlaymates(data.talents || []);
    } catch (error) {
      console.error("Error fetching playmates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchPlaymates();
  };

  const fetchReviews = async (discordId: string) => {
    try {
      const res = await fetch(`/api/playmates/${discordId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const openReviews = (playmate: Playmate) => {
    setSelectedPlaymate(playmate);
    setShowReviews(true);
    fetchReviews(playmate.discord_id);
  };

  const fetchAvailableSlots = async (discordId: string, startDate: Date) => {
    try {
      const dateString = startDate.toISOString().split("T")[0];
      const res = await fetch(`/api/playmates/${discordId}/availability?startDate=${dateString}&days=7`);
      const data = await res.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  const openBooking = (playmate: Playmate) => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    // Empêcher les talents de réserver
    if (isTalent) {
      setShowTalentBlockedPrompt(true);
      return;
    }

    setSelectedPlaymate(playmate);
    setShowBooking(true);
    setSelectedSlot(null);
    setSelectedDuration(30);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monday = getMonday(today);
    setCurrentWeekStart(monday);
    fetchAvailableSlots(playmate.discord_id, monday);
  };

  const changeWeek = (direction: number) => {
    if (!selectedPlaymate) return;
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    const monday = getMonday(newDate);
    setCurrentWeekStart(monday);
    fetchAvailableSlots(selectedPlaymate.discord_id, monday);
  };

  const handleBooking = async () => {
    if (!user) {
      setShowLoginPrompt(true);
      setShowBooking(false);
      return;
    }

    if (!selectedPlaymate || !selectedSlot) {
      alert("Veuillez sélectionner un créneau horaire");
      return;
    }

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.id,
          talentId: selectedPlaymate.discord_id,
          duration: selectedDuration,
          scheduledStart: selectedSlot.timestamp,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Réservation effectuée avec succès !");
        setShowBooking(false);
        setSelectedSlot(null);
      } else {
        alert(data.error || "Erreur lors de la réservation");
      }
    } catch (error) {
      alert("Erreur lors de la réservation");
    }
  };

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getDaySlots = (dayIndex: number) => {
    // dayIndex: 0=Lundi, 1=Mardi, ..., 6=Dimanche (dans notre calendrier)
    // currentWeekStart est déjà un lundi
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + dayIndex);
    const dateString = date.toISOString().split("T")[0];
    return availableSlots.filter((slot) => slot.date === dateString);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-lg ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-600"}`}>
            ★
          </span>
        ))}
        <span className="text-sm text-muted ml-2">
          {rating.toFixed(1)} ({playmates.find((p) => p.rating === rating)?.review_count || 0} avis)
        </span>
      </div>
    );
  };

  const creditsToEuros = (credits: number) => {
    return (credits / 100).toFixed(2);
  };

  const openReviewModal = (playmate: Playmate) => {
    const session = completedSessionsByTalent.get(playmate.discord_id);
    if (!session) return;

    setReviewSession({
      ...session,
      talent_id: playmate.discord_id,
      talent_name: playmate.display_name,
    });
    setReviewRating(5);
    setReviewComment("");
    setReviewTags([]);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewSession || !user) return;

    try {
      const res = await fetch(`/api/playmates/${reviewSession.talent_id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.id,
          sessionId: reviewSession.id,
          rating: reviewRating,
          comment: reviewComment,
          tags: reviewTags,
        }),
      });

      if (res.ok) {
        alert("Avis déposé avec succès !");
        setShowReviewModal(false);
        // Ajouter la session aux avis déposés
        const newReviewed = new Set(reviewedSessions);
        newReviewed.add(reviewSession.id);
        setReviewedSessions(newReviewed);
        // Recharger les playmates pour mettre à jour les notes
        fetchPlaymates();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors du dépôt de l'avis");
      }
    } catch (error) {
      alert("Erreur lors du dépôt de l'avis");
    }
  };

  const toggleReviewTag = (tag: string) => {
    if (reviewTags.includes(tag)) {
      setReviewTags(reviewTags.filter((t) => t !== tag));
    } else {
      setReviewTags([...reviewTags, tag]);
    }
  };

  const availableReviewTags = [
    "Sympathique",
    "Bonne communication",
    "Drôle",
    "Compétent",
    "À l'heure",
    "Patient",
    "Motivant",
    "Créatif",
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">Nos Playmates</h1>

        {/* Tabs - Only show if user is connected and not a talent */}
        {user && !isTalent && (
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-6 py-2 rounded font-medium transition ${
                !showFavorites
                  ? "bg-white text-dark"
                  : "bg-surface border border-border hover:border-white/40"
              }`}
            >
              Tous les talents
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-6 py-2 rounded font-medium transition ${
                showFavorites
                  ? "bg-white text-dark"
                  : "bg-surface border border-border hover:border-white/40"
              }`}
            >
              Mes favoris ({favorites.size})
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface border border-border rounded-lg p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Rechercher une playmate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-4 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
              >
                <option value="rating">Mieux notées</option>
                <option value="sessions">Plus de sessions</option>
                <option value="name">Nom (A-Z)</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-white text-dark rounded font-medium hover:bg-white/90 transition"
            >
              Rechercher
            </button>
          </div>
        </div>

        {/* Playmates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playmates
            .filter((playmate) => !showFavorites || favorites.has(playmate.discord_id))
            .map((playmate) => {
              const isFavorite = favorites.has(playmate.discord_id);
              return (
            <div key={playmate.id} className="bg-dark border border-border rounded-lg overflow-hidden hover:border-white/40 transition">
              <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={`/api/discord/avatar/${playmate.discord_id}`}
                    alt={playmate.display_name}
                    className="h-16 w-16 rounded-full border-2 border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{playmate.display_name}</h3>
                    <p className="text-xs text-muted">
                      {playmate.age} ans {playmate.style && `• ${playmate.style}`}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {playmate.available_status === 1 ? (
                        <span className="text-xs text-green-400">● En ligne</span>
                      ) : (
                        <span className="text-xs text-gray-500">● Hors ligne</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>{renderStars(playmate.rating)}</div>

                {/* Bio */}
                {playmate.bio && (
                  <p className="text-sm text-muted line-clamp-2">{playmate.bio}</p>
                )}

                {/* Languages */}
                {playmate.languages.length > 0 && (
                  <div>
                    <div className="text-xs text-muted mb-1">Langues</div>
                    <div className="flex flex-wrap gap-1">
                      {playmate.languages.slice(0, 3).map((lang) => (
                        <span key={lang} className="px-2 py-1 text-xs bg-surface border border-border rounded">
                          {lang}
                        </span>
                      ))}
                      {playmate.languages.length > 3 && (
                        <span className="px-2 py-1 text-xs text-muted">+{playmate.languages.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Games */}
                {playmate.games.length > 0 && (
                  <div>
                    <div className="text-xs text-muted mb-1">Jeux</div>
                    <div className="flex flex-wrap gap-1">
                      {playmate.games.slice(0, 2).map((game) => (
                        <span key={game} className="px-2 py-1 text-xs bg-surface border border-border rounded">
                          {game}
                        </span>
                      ))}
                      {playmate.games.length > 2 && (
                        <span className="px-2 py-1 text-xs text-muted">+{playmate.games.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Pricing */}
                <div>
                  <div className="text-xs text-muted mb-2">Tarifs</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface border border-border rounded p-2">
                      <div className="text-xs text-muted">15 min</div>
                      <div className="text-sm font-medium">{creditsToEuros(playmate.price_15min)}€</div>
                    </div>
                    <div className="bg-surface border border-border rounded p-2">
                      <div className="text-xs text-muted">30 min</div>
                      <div className="text-sm font-medium">{creditsToEuros(playmate.price_30min)}€</div>
                    </div>
                    <div className="bg-surface border border-border rounded p-2">
                      <div className="text-xs text-muted">60 min</div>
                      <div className="text-sm font-medium">{creditsToEuros(playmate.price_60min)}€</div>
                    </div>
                  </div>
                </div>

                {/* Audio Sample */}
                {playmate.audio_sample_url && (
                  <div>
                    <div className="text-xs text-muted mb-1">Échantillon vocal</div>
                    <audio controls src={`/api/audio/${playmate.audio_sample_url}`} className="w-full h-8" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openReviews(playmate)}
                      className="flex-1 px-4 py-2 bg-surface border border-border rounded text-sm hover:border-white/40 transition"
                    >
                      Voir les avis
                    </button>
                    <button
                      onClick={() => openBooking(playmate)}
                      className="flex-1 px-4 py-2 bg-white text-dark rounded text-sm font-medium hover:bg-white/90 transition"
                    >
                      Réserver
                    </button>
                  </div>
                  {user && !isTalent && (() => {
                    const session = completedSessionsByTalent.get(playmate.discord_id);
                    const hasReviewed = session && reviewedSessions.has(session.id);
                    const canReview = session && !hasReviewed;

                    return (
                      <>
                        {canReview && (
                          <button
                            onClick={() => openReviewModal(playmate)}
                            className="w-full px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/40 rounded text-sm font-medium hover:bg-green-500/30 transition"
                          >
                            ⭐ Laisser un avis
                          </button>
                        )}
                        <button
                          onClick={() => toggleFavorite(playmate.discord_id)}
                          className={`w-full px-4 py-2 rounded text-sm font-medium transition ${
                            isFavorite
                              ? "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 hover:bg-yellow-500/30"
                          }`}
                        >
                          {isFavorite ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
                        </button>
                      </>
                    );
                  })()}
                </div>

                {/* Stats */}
                <div className="text-xs text-muted text-center pt-2 border-t border-border">
                  {playmate.total_sessions} sessions complétées
                </div>
              </div>
            </div>
              );
            })}
        </div>

        {playmates.filter((p) => !showFavorites || favorites.has(p.discord_id)).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted">
              {showFavorites ? "Vous n'avez pas encore de favoris" : "Aucune playmate trouvée"}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {showReviews && selectedPlaymate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowReviews(false)}>
          <div className="bg-dark border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Avis - {selectedPlaymate.display_name}</h2>
              <button onClick={() => setShowReviews(false)} className="text-2xl">&times;</button>
            </div>

            <div className="mb-6">
              {renderStars(selectedPlaymate.rating)}
            </div>

            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-surface border border-border rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-600"}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted">{review.comment}</p>
                  )}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {review.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-dark border border-border rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-center text-muted py-8">Aucun avis pour le moment</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal with Calendar */}
      {showBooking && selectedPlaymate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" onClick={() => setShowBooking(false)}>
          <div className="bg-dark border border-border rounded-lg max-w-4xl w-full p-3 sm:p-6 my-4 sm:my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold">Réserver - {selectedPlaymate.display_name}</h2>
              <button onClick={() => setShowBooking(false)} className="text-2xl hover:text-muted">&times;</button>
            </div>

            {/* Duration Selection */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm text-muted mb-2 sm:mb-3">Durée de la session</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[15, 30, 60].map((duration) => {
                  const priceMap: Record<number, number> = {
                    15: selectedPlaymate.price_15min,
                    30: selectedPlaymate.price_30min,
                    60: selectedPlaymate.price_60min,
                  };
                  return (
                    <button
                      key={duration}
                      onClick={() => {
                        setSelectedDuration(duration);
                        setSelectedSlot(null);
                      }}
                      className={`px-2 sm:px-4 py-2 sm:py-3 rounded border-2 transition ${
                        selectedDuration === duration
                          ? "border-white bg-white/10"
                          : "border-border hover:border-white/40"
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-medium">{duration} min</div>
                      <div className="text-xs text-muted mt-1">{creditsToEuros(priceMap[duration])}€</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Week Navigation */}
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <button
                onClick={() => changeWeek(-1)}
                disabled={currentWeekStart <= new Date()}
                className="px-2 sm:px-4 py-2 bg-surface border border-border rounded text-xs sm:text-sm hover:border-white/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">← Semaine précédente</span>
                <span className="sm:hidden">← Préc.</span>
              </button>
              <span className="text-xs sm:text-sm font-medium text-center">
                {currentWeekStart.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => changeWeek(1)}
                className="px-2 sm:px-4 py-2 bg-surface border border-border rounded text-xs sm:text-sm hover:border-white/40 transition"
              >
                <span className="hidden sm:inline">Semaine suivante →</span>
                <span className="sm:hidden">Suiv. →</span>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="border border-border rounded-lg overflow-hidden mb-4 sm:mb-6 overflow-x-auto">
              <div className="grid grid-cols-7 bg-surface min-w-[600px] sm:min-w-0">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, i) => (
                  <div key={day} className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-medium border-r border-border last:border-r-0">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.charAt(0)}</span>
                    <div className="text-xs text-muted mt-1">
                      {new Date(currentWeekStart.getTime() + i * 24 * 60 * 60 * 1000).getDate()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 min-w-[600px] sm:min-w-0">
                {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                  const daySlots = getDaySlots(dayIndex);
                  const hasSlots = daySlots.length > 0;

                  return (
                    <div key={dayIndex} className="border-r border-border last:border-r-0 bg-dark/50">
                      <div className="p-1 sm:p-2 space-y-1 max-h-[250px] sm:max-h-[280px] overflow-y-auto">
                        {!hasSlots && (
                          <div className="text-center py-2 sm:py-4">
                            <span className="text-xs text-red-400">✕</span>
                          </div>
                        )}
                        {daySlots.map((slot) => {
                          const isPast = slot.timestamp < Date.now();
                          const canBook = !isPast && slot.availableDurations.includes(selectedDuration);
                          const isSelected = selectedSlot?.timestamp === slot.timestamp;

                          return (
                            <button
                              key={slot.timestamp}
                              onClick={() => canBook && setSelectedSlot(slot)}
                              disabled={!canBook || isPast}
                              className={`w-full px-1 sm:px-2 py-1 sm:py-2 rounded text-xs transition ${
                                isPast
                                  ? "bg-gray-500/10 text-gray-600 cursor-not-allowed opacity-40 border border-gray-500/20"
                                  : isSelected
                                  ? "bg-white text-dark font-medium"
                                  : canBook
                                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/40"
                                  : "bg-red-500/10 text-red-400 border border-red-500/20 cursor-not-allowed opacity-50"
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3 sm:gap-6 mb-4 sm:mb-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500/20 border border-green-500/40 rounded"></div>
                <span className="text-muted">Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500/10 border border-red-500/20 rounded"></div>
                <span className="text-muted">Indisponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-500/10 border border-gray-500/20 rounded opacity-40"></div>
                <span className="text-muted">Passé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded"></div>
                <span className="text-muted">Sélectionné</span>
              </div>
            </div>

            {/* Selected Slot Info */}
            {selectedSlot && (
              <div className="bg-surface border border-border rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="text-xs sm:text-sm font-medium mb-2">Créneau sélectionné</div>
                <div className="text-xs sm:text-sm text-muted">
                  📅 {new Date(selectedSlot.timestamp).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" à "}
                  {selectedSlot.time}
                </div>
                <div className="text-xs sm:text-sm text-muted mt-1">
                  ⏱️ Durée : {selectedDuration} minutes
                </div>
                <div className="text-xs sm:text-sm font-medium mt-2">
                  💰 Prix : {creditsToEuros(
                    selectedDuration === 15
                      ? selectedPlaymate.price_15min
                      : selectedDuration === 30
                      ? selectedPlaymate.price_30min
                      : selectedPlaymate.price_60min
                  )}€
                </div>
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-white text-dark rounded text-sm sm:text-base font-medium hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedSlot ? "Confirmer la réservation" : "Sélectionnez un créneau horaire"}
            </button>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowLoginPrompt(false)}>
          <div className="bg-dark border border-border rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold mb-3">Connexion requise</h2>
              <p className="text-muted mb-6">
                Merci de vous connecter pour réserver une session avec nos playmates.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="/api/auth/login"
                  className="w-full px-6 py-3 bg-white text-dark rounded font-medium hover:bg-white/90 transition text-center"
                >
                  Se connecter
                </a>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full px-6 py-3 bg-surface border border-border rounded hover:border-white/40 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Talent Blocked Prompt Modal */}
      {showTalentBlockedPrompt && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowTalentBlockedPrompt(false)}>
          <div className="bg-dark border border-border rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold mb-3">Réservation non disponible</h2>
              <p className="text-muted mb-6">
                Les playmates ne peuvent pas réserver de sessions. Cette fonctionnalité est réservée aux clients souhaitant jouer avec nos talents.
              </p>
              <button
                onClick={() => setShowTalentBlockedPrompt(false)}
                className="w-full px-6 py-3 bg-white text-dark rounded font-medium hover:bg-white/90 transition"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewSession && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-dark border border-border rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Laisser un avis</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-2xl hover:text-muted">&times;</button>
            </div>

            {/* Session Info */}
            <div className="bg-surface border border-border rounded p-3 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={`/api/discord/avatar/${reviewSession.talent_id}`}
                  alt="talent"
                  className="h-10 w-10 rounded-full border border-border"
                />
                <div>
                  <div className="text-sm font-medium">{reviewSession.talent_name}</div>
                  <div className="text-xs text-muted">
                    {new Date(reviewSession.scheduled_start).toLocaleDateString("fr-FR")} • {reviewSession.duration} min
                  </div>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Note</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`text-3xl transition ${star <= reviewRating ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Tags (optionnel)</label>
              <div className="flex flex-wrap gap-2">
                {availableReviewTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleReviewTag(tag)}
                    className={`px-3 py-1 rounded text-xs transition ${
                      reviewTags.includes(tag)
                        ? "bg-white text-dark"
                        : "bg-surface border border-border hover:border-white/40"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm text-muted mb-2">Commentaire (optionnel)</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                rows={4}
                maxLength={500}
              />
              <div className="text-xs text-muted mt-1 text-right">{reviewComment.length}/500</div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submitReview}
              className="w-full px-4 py-2 bg-white text-dark rounded font-medium hover:bg-white/90 transition"
            >
              Publier l'avis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
