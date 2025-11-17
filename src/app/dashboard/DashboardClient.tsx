"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SessionUser = { id: string; username: string; avatar?: string | null };

interface DashboardClientProps {
  user: SessionUser;
  currentPath?: string;
}

interface DiscordGame {
  id: string;
  name: string;
  icon_hash: string | null;
}

const LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
  { code: "sv", name: "Svenska", flag: "🇸🇪" },
];

export default function DashboardClient({ user: initialUser }: DashboardClientProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [balance, setBalance] = useState<number>(0);
  const [availability, setAvailability] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isTalent, setIsTalent] = useState<boolean>(false);
  const [creditAmount, setCreditAmount] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"apercu" | "disponibilites" | "profil">("apercu");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [profile, setProfile] = useState<any>(null);

  // Profile fields
  const [displayName, setDisplayName] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  const [age, setAge] = useState<number>(18);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [style, setStyle] = useState<string>("");
  const [audioSampleUrl, setAudioSampleUrl] = useState<string>("");
  const [price15min, setPrice15min] = useState<number>(375);
  const [price30min, setPrice30min] = useState<number>(750);
  const [price60min, setPrice60min] = useState<number>(1500);
  const [availableStatus, setAvailableStatus] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("available");

  // Games search
  const [allGames, setAllGames] = useState<DiscordGame[]>([]);
  const [gameSearch, setGameSearch] = useState<string>("");
  const [showGameDropdown, setShowGameDropdown] = useState<boolean>(false);

  // Languages dropdown
  const [showLanguageDropdown, setShowLanguageDropdown] = useState<boolean>(false);

  // Audio recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState<number>(0);

  useEffect(() => {
    if (!initialUser) {
      router.push("/api/auth/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok) {
          router.push("/api/auth/login");
          return;
        }
        const u = await res.json();
        setUser(u);

        // Vérifier si l'utilisateur est un talent
        const talentCheckRes = await fetch(`/api/db/talent/check/${u.id}`);
        const talentCheck = await talentCheckRes.json();
        setIsTalent(talentCheck.isTalent || false);

        const bRes = await fetch(`/api/db/balance/${u.id}`);
        const b = await bRes.json();
        setBalance(b.balance || 0);

        // Charger les disponibilités uniquement si c'est un talent
        if (talentCheck.isTalent) {
          const calRes = await fetch(`/api/db/playmate/calendar/${u.id}`);
          const cal = await calRes.json();
          setAvailability(cal.availability || {});

          const profRes = await fetch(`/api/db/playmate/profile/${u.id}`);
          const prof = await profRes.json();
          if (prof.talent) {
            setProfile(prof.talent);
            setDisplayName(String(prof.talent.display_name || ""));
            setBio(String(prof.talent.bio || ""));
            setAge(Number(prof.talent.age || 18));
            setStyle(String(prof.talent.style || ""));
            setAudioSampleUrl(String(prof.talent.audio_sample_url || ""));
            setPrice15min(Number(prof.talent.price_15min || 375));
            setPrice30min(Number(prof.talent.price_30min || 750));
            setPrice60min(Number(prof.talent.price_60min || 1500));
            setAvailableStatus(Boolean(prof.talent.available_status));
            setStatus(String(prof.talent.status || "available"));

            // Parse games and languages from JSON
            try {
              const games = prof.talent.games ? JSON.parse(prof.talent.games) : [];
              setSelectedGames(Array.isArray(games) ? games : []);
            } catch {
              setSelectedGames([]);
            }

            try {
              const languages = prof.talent.languages ? JSON.parse(prof.talent.languages) : [];
              setSelectedLanguages(Array.isArray(languages) ? languages : []);
            } catch {
              setSelectedLanguages([]);
            }
          }

          // Load Discord games
          try {
            const gamesRes = await fetch("https://discord.com/api/v8/applications/detectable");
            if (gamesRes.ok) {
              const gamesData = await gamesRes.json();
              setAllGames(gamesData);
            }
          } catch (error) {
            console.error("Error loading games:", error);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        router.push("/api/auth/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [initialUser, router]);

  const handleBuyCredits = async () => {
    if (creditAmount < 5) {
      alert("Le montant minimum est de 5€");
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: creditAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      alert(error.message || "Une erreur est survenue");
      setIsProcessing(false);
    }
  };

  const calculateCredits = () => {
    return creditAmount * 100; // 1€ = 100 crédits
  };

  const weekdays = [
    { key: 1, label: "Lundi" },
    { key: 2, label: "Mardi" },
    { key: 3, label: "Mercredi" },
    { key: 4, label: "Jeudi" },
    { key: 5, label: "Vendredi" },
    { key: 6, label: "Samedi" },
    { key: 0, label: "Dimanche" },
  ];

  const [slotEditor, setSlotEditor] = useState<{ day: number; start: string; end: string } | null>(null);

  const openDefineAvailability = () => {
    setActiveTab("disponibilites");
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addSlot = () => {
    if (!slotEditor) return;
    const { day, start, end } = slotEditor;
    if (!start || !end) return;
    const next = { ...availability };
    const label = `${start}-${end}`;
    const list = next[day] ? [...next[day]] : [];
    if (!list.includes(label)) list.push(label);
    next[day] = list;
    setAvailability(next);
    setSlotEditor({ day, start: "", end: "" });
  };

  const removeSlot = (day: number, label: string) => {
    const next = { ...availability };
    next[day] = (next[day] || []).filter((l) => l !== label);
    setAvailability(next);
  };

  const saveAvailability = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/db/playmate/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, availability }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      showToast("Vos disponibilités ont bien été mises à jour", "success");
    } catch (e: any) {
      showToast(e.message || "Erreur", "error");
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    // Validation de l'âge minimum
    if (age < 18) {
      showToast("Vous devez avoir au minimum 18 ans", "error");
      return;
    }

    try {
      const res = await fetch("/api/db/playmate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          displayName,
          bio,
          age,
          games: selectedGames,
          languages: selectedLanguages,
          style,
          audioSampleUrl,
          price15min,
          price30min,
          price60min,
          availableStatus,
          status,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      showToast("Votre profil a bien été modifié", "success");
    } catch (e: any) {
      showToast(e.message || "Erreur", "error");
    }
  };

  const addLanguage = (langCode: string) => {
    if (!selectedLanguages.includes(langCode)) {
      setSelectedLanguages([...selectedLanguages, langCode]);
    }
    setShowLanguageDropdown(false);
  };

  const removeLanguage = (langCode: string) => {
    setSelectedLanguages(selectedLanguages.filter((l) => l !== langCode));
  };

  const addGame = (gameName: string) => {
    if (!selectedGames.includes(gameName)) {
      setSelectedGames([...selectedGames, gameName]);
    }
    setGameSearch("");
    setShowGameDropdown(false);
  };

  const removeGame = (gameName: string) => {
    setSelectedGames(selectedGames.filter((g) => g !== gameName));
  };

  const filteredGames = allGames.filter((game) =>
    game.name.toLowerCase().includes(gameSearch.toLowerCase())
  ).slice(0, 50);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);

        // Upload audio to server
        const formData = new FormData();
        formData.append("audio", blob, "voice-sample.webm");
        formData.append("userId", user?.id || "");

        try {
          const res = await fetch("/api/db/playmate/audio", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          if (res.ok && data.audioId) {
            setAudioSampleUrl(data.audioId);
            showToast("Échantillon audio enregistré avec succès", "success");
          }
        } catch (error) {
          showToast("Erreur lors de l'upload de l'audio", "error");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Auto-stop after 15 seconds
      const interval = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 15) {
            stopRecording();
            clearInterval(interval);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      showToast("Erreur d'accès au microphone", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const creditsToEuros = (credits: number) => {
    return (credits / 100).toFixed(2);
  };

  return (
    <div className="flex-1">
      <div className="max-w-5xl mx-auto px-6 py-10 pt-24">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {!!toast && (
          <div className={`fixed top-24 right-6 px-4 py-2 rounded shadow border bg-surface border-border`}>
            <div className={`text-sm text-white`}>{toast.message}</div>
          </div>
        )}
        {loading ? (
          <p className="mt-4 text-sm text-muted">Chargement...</p>
        ) : !user ? (
          <p className="mt-4 text-sm text-muted">Redirection vers la connexion...</p>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-3">
              <img src={`/api/discord/avatar/${user.id}`} alt={user.username} className="h-10 w-10 rounded-full border border-border" />
              <div>
                <div className="text-sm">@{user.username}</div>
                <div className="text-xs text-muted">ID: {user.id}</div>
                {isTalent && (
                  <div className="text-xs text-green-400 font-medium mt-1">✓ Talent</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && user && (
        <>
          <div className="border-b border-border">
            <div className="max-w-5xl mx-auto px-6">
              <div className="flex w-full">
                <button onClick={() => setActiveTab("apercu")} className={`flex-1 px-3 py-2 text-sm transition ${activeTab === "apercu" ? "border-b-2 border-white" : "text-muted hover:text-white"}`}>Aperçu</button>
                {isTalent && (
                  <button onClick={() => setActiveTab("disponibilites")} className={`flex-1 px-3 py-2 text-sm transition ${activeTab === "disponibilites" ? "border-b-2 border-white" : "text-muted hover:text-white"}`}>Disponibilités</button>
                )}
                {isTalent && (
                  <button onClick={() => setActiveTab("profil")} className={`flex-1 px-3 py-2 text-sm transition ${activeTab === "profil" ? "border-b-2 border-white" : "text-muted hover:text-white"}`}>Profil</button>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-6">

          {activeTab === "apercu" && (
            <div className="space-y-4">
              <div className="border border-border rounded p-4">
                <div className="text-sm">Crédits</div>
                <div className="text-xl font-medium">{balance}</div>
              </div>

              {!isTalent && (
                <div className="border border-border rounded p-4">
                  <div className="text-sm font-medium mb-3">Acheter des crédits</div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="amount" className="block text-xs text-muted mb-2">Montant (minimum 5€)</label>
                      <div className="flex items-center gap-2">
                        <input id="amount" type="number" min="5" step="1" value={creditAmount} onChange={(e) => setCreditAmount(Math.max(5, parseInt(e.target.value) || 5))} className="flex-1 px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                        <span className="text-sm text-muted">€</span>
                      </div>
                      <div className="mt-2 text-xs text-muted">= {calculateCredits()} crédits (1€ = 100 crédits)</div>
                    </div>
                    <button onClick={handleBuyCredits} disabled={isProcessing || creditAmount < 5} className="w-full px-4 py-2 bg-white text-dark font-medium rounded hover:bg-white/90 transition disabled:opacity-50 disabled:cursor-not-allowed">{isProcessing ? "Redirection..." : "Acheter"}</button>
                  </div>
                </div>
              )}

              {isTalent && (
                <div className="border border-border rounded p-4">
                  <div className="text-sm mb-2">Disponibilités</div>
                  {Object.keys(availability).length === 0 ? (
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted">Aucune disponibilité définie</div>
                      <button onClick={openDefineAvailability} className="px-3 py-2 text-sm bg-white text-dark rounded">Définir mes disponibilités</button>
                    </div>
                  ) : (
                    <div className="text-xs grid grid-cols-1 gap-2">
                      {weekdays.map((d) => (
                        <div key={d.key} className="flex gap-2">
                          <span className="min-w-24">{d.label}</span>
                          <span>{(availability[d.key] || []).join(", ") || ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "disponibilites" && isTalent && (
            <div className="space-y-4">
              <div className="border border-border rounded p-4">
                <div className="text-sm font-medium mb-4">Calendrier hebdomadaire</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {weekdays.map((d) => (
                    <div key={d.key} className="border border-border rounded p-3">
                      <div className="text-sm mb-2">{d.label}</div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {(availability[d.key] || []).map((label) => (
                            <span key={label} className="px-2 py-1 text-xs bg-surface border border-border rounded flex items-center gap-2">
                              {label}
                              <button onClick={() => removeSlot(d.key, label)} className="text-xs text-muted">×</button>
                            </span>
                          ))}
                          {(availability[d.key] || []).length === 0 && (
                            <span className="text-xs text-muted">Aucun créneau</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="time" value={slotEditor?.day === d.key ? slotEditor?.start || "" : ""} onChange={(e) => setSlotEditor({ day: d.key, start: e.target.value, end: slotEditor?.day === d.key ? slotEditor?.end || "" : "" })} className="px-2 py-1 bg-dark border border-border rounded text-xs" />
                          <span className="text-xs">→</span>
                          <input type="time" value={slotEditor?.day === d.key ? slotEditor?.end || "" : ""} onChange={(e) => setSlotEditor({ day: d.key, start: slotEditor?.day === d.key ? slotEditor?.start || "" : "", end: e.target.value })} className="px-2 py-1 bg-dark border border-border rounded text-xs" />
                          <button onClick={addSlot} className="ml-auto px-3 py-1 text-xs bg-white text-dark rounded">Ajouter</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={saveAvailability} className="px-4 py-2 bg-white text-dark rounded">Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "profil" && isTalent && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Formulaire d'édition */}
                <div className="border border-border rounded p-4 lg:order-1">
                  <div className="text-sm font-medium mb-4">Modifier mon profil</div>
                  <div className="space-y-4">
                    {/* Informations de base */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted mb-2">Nom affiché</label>
                        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Votre nom d'affichage" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-2">Âge</label>
                        <input type="number" min="18" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-muted mb-2">Bio</label>
                      <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder="Parlez un peu de vous..." maxLength={200} />
                      <div className="text-xs text-muted mt-1">{bio.length}/200 caractères</div>
                    </div>

                    <div>
                      <label className="block text-xs text-muted mb-2">Style de jeu</label>
                      <input value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Ex: Casual, Compétitif, Fun..." />
                    </div>

                    {/* Langues */}
                    <div>
                      <label className="block text-xs text-muted mb-2">Langues parlées</label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                        {selectedLanguages.map((langCode) => {
                          const lang = LANGUAGES.find((l) => l.code === langCode);
                          return (
                            <span key={langCode} className="px-3 py-1 text-sm bg-surface border border-border rounded flex items-center gap-2 hover:border-white/40 transition">
                              <span>{lang?.flag}</span>
                              <span>{lang?.name}</span>
                              <button onClick={() => removeLanguage(langCode)} className="text-xs text-muted hover:text-white ml-1">×</button>
                            </span>
                          );
                        })}
                        {selectedLanguages.length === 0 && (
                          <span className="text-xs text-muted italic">Aucune langue sélectionnée</span>
                        )}
                      </div>
                      <div className="relative">
                        <button onClick={() => setShowLanguageDropdown(!showLanguageDropdown)} className="px-3 py-2 text-xs bg-white text-dark rounded hover:bg-white/90 transition">+ Ajouter une langue</button>
                        {showLanguageDropdown && (
                          <div className="absolute z-10 mt-1 w-64 max-h-64 overflow-y-auto bg-surface border border-border rounded shadow-lg">
                            {LANGUAGES.filter((l) => !selectedLanguages.includes(l.code)).map((lang) => (
                              <button key={lang.code} onClick={() => addLanguage(lang.code)} className="w-full px-3 py-2 text-left text-sm hover:bg-dark flex items-center gap-2 transition">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Jeux */}
                    <div>
                      <label className="block text-xs text-muted mb-2">Jeux</label>
                      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                        {selectedGames.map((gameName) => (
                          <span key={gameName} className="px-3 py-1 text-sm bg-surface border border-border rounded flex items-center gap-2 hover:border-white/40 transition">
                            <span>{gameName}</span>
                            <button onClick={() => removeGame(gameName)} className="text-xs text-muted hover:text-white ml-1">×</button>
                          </span>
                        ))}
                        {selectedGames.length === 0 && (
                          <span className="text-xs text-muted italic">Aucun jeu sélectionné</span>
                        )}
                      </div>
                      <div className="relative">
                        <input type="text" value={gameSearch} onChange={(e) => {
                          setGameSearch(e.target.value);
                          setShowGameDropdown(true);
                        }} onFocus={() => setShowGameDropdown(true)} onBlur={() => setTimeout(() => setShowGameDropdown(false), 200)} placeholder="Rechercher un jeu..." className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                        {showGameDropdown && gameSearch && filteredGames.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto bg-surface border border-border rounded shadow-lg">
                            {filteredGames.map((game) => (
                              <button key={game.id} onClick={() => addGame(game.name)} className="w-full px-3 py-2 text-left text-sm hover:bg-dark transition">
                                {game.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enregistrement audio */}
                    <div>
                      <label className="block text-xs text-muted mb-2">Échantillon audio (15 sec max)</label>
                      <div className="flex items-center gap-3">
                        <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording} disabled={isRecording && recordingTime >= 15} className={`px-4 py-3 rounded-lg font-medium transition-all ${isRecording ? "bg-red-500 text-white animate-pulse" : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105"} disabled:opacity-50`}>
                          {isRecording ? `🎙️ On relâche ! (${recordingTime}s)` : "🎬 Et... Action!"}
                        </button>
                        {audioBlob && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-400">✓ Enregistré</span>
                            <audio controls src={URL.createObjectURL(audioBlob)} className="h-8" />
                          </div>
                        )}
                        {audioSampleUrl && !audioBlob && (
                          <audio controls src={`/api/audio/${audioSampleUrl}`} className="h-8" />
                        )}
                      </div>
                      <div className="text-xs text-muted mt-2">Maintenez le bouton enfoncé pour enregistrer</div>
                    </div>

                    {/* Prix */}
                    <div>
                      <label className="block text-xs text-muted mb-3">Tarifs</label>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-muted mb-2">15 minutes</label>
                          <input type="number" min="0" step="50" value={price15min} onChange={(e) => setPrice15min(Number(e.target.value))} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                          <div className="text-xs text-green-400 mt-1">= {creditsToEuros(price15min)}€</div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-2">30 minutes</label>
                          <input type="number" min="0" step="50" value={price30min} onChange={(e) => setPrice30min(Number(e.target.value))} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                          <div className="text-xs text-green-400 mt-1">= {creditsToEuros(price30min)}€</div>
                        </div>
                        <div>
                          <label className="block text-xs text-muted mb-2">60 minutes</label>
                          <input type="number" min="0" step="50" value={price60min} onChange={(e) => setPrice60min(Number(e.target.value))} className="w-full px-3 py-2 bg-dark border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/20" />
                          <div className="text-xs text-green-400 mt-1">= {creditsToEuros(price60min)}€</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border">
                      <button onClick={saveProfile} className="px-6 py-2 bg-white text-dark rounded font-medium hover:bg-white/90 transition hover:scale-105">💾 Enregistrer le profil</button>
                    </div>
                  </div>
                </div>

                {/* Preview card */}
                <div className="border border-border rounded p-4 lg:order-2 bg-gradient-to-b from-surface to-dark">
                  <div className="text-sm font-medium mb-4">Aperçu du profil</div>
                  <div className="bg-dark border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={`/api/discord/avatar/${user?.id}`} alt={displayName || user?.username} className="h-16 w-16 rounded-full border-2 border-white/20" />
                      <div className="flex-1">
                        <div className="text-lg font-medium">{displayName || "Nom affiché"}</div>
                        <div className="text-xs text-muted">@{user?.username}</div>
                        <div className="text-xs text-muted">{age} ans {style && `• ${style}`}</div>
                      </div>
                    </div>

                    {bio && (
                      <div className="text-sm text-muted border-t border-border pt-3">
                        {bio || "Votre bio apparaîtra ici..."}
                      </div>
                    )}

                    {selectedLanguages.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <div className="text-xs text-muted mb-2">Langues</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedLanguages.map((langCode) => {
                            const lang = LANGUAGES.find((l) => l.code === langCode);
                            return (
                              <span key={langCode} className="px-2 py-1 text-xs bg-surface border border-border rounded flex items-center gap-1">
                                {lang?.flag} {lang?.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedGames.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <div className="text-xs text-muted mb-2">Jeux</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGames.slice(0, 5).map((gameName) => (
                            <span key={gameName} className="px-2 py-1 text-xs bg-surface border border-border rounded">
                              {gameName}
                            </span>
                          ))}
                          {selectedGames.length > 5 && (
                            <span className="px-2 py-1 text-xs text-muted">+{selectedGames.length - 5} autres</span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-3">
                      <div className="text-xs text-muted mb-2">Tarifs</div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-surface border border-border rounded p-2">
                          <div className="text-xs text-muted">15 min</div>
                          <div className="text-sm font-medium">{creditsToEuros(price15min)}€</div>
                        </div>
                        <div className="bg-surface border border-border rounded p-2">
                          <div className="text-xs text-muted">30 min</div>
                          <div className="text-sm font-medium">{creditsToEuros(price30min)}€</div>
                        </div>
                        <div className="bg-surface border border-border rounded p-2">
                          <div className="text-xs text-muted">60 min</div>
                          <div className="text-sm font-medium">{creditsToEuros(price60min)}€</div>
                        </div>
                      </div>
                    </div>

                    {(audioBlob || audioSampleUrl) && (
                      <div className="border-t border-border pt-3">
                        <div className="text-xs text-muted mb-2">Échantillon vocal</div>
                        <audio controls src={audioBlob ? URL.createObjectURL(audioBlob) : `/api/audio/${audioSampleUrl}`} className="w-full h-8" />
                      </div>
                    )}

                    <div className="border-t border-border pt-3 text-center">
                      <button className="w-full px-4 py-2 bg-white text-dark rounded font-medium hover:bg-white/90 transition">
                        Réserver une session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </>
      )}
    </div>
  );
}