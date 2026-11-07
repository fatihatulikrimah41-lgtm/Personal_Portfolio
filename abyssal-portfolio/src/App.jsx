import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import WebGLBackground from "./components/WebGLBackground";
import {
  FALLBACK_REPOSITORIES,
  TECH_STACK_ITEMS,
  ROADMAP_YEARS,
  ABYSS_TRACKS,
} from "./data/constants";
import {
  Terminal,
  Shield,
  Cpu,
  Code2,
  ExternalLink,
  GitBranch,
  Star,
  Activity,
  Mail,
  Menu,
  X,
  ChevronRight,
  Lock,
  Compass,
  Zap,
  Radio,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Code,
  Briefcase, // <-- Dua ikon pengganti
  Volume2,
  Play,
  Pause,
  SkipForward,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function formatRelativeTimeIndonesian(dateString) {
  if (!dateString) return "2 jam yang lalu";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = Math.max(0, now - past);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${Math.max(1, diffMins)} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays < 30) {
    return `${diffDays} hari yang lalu`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} bulan yang lalu`;
  }
}

const getEnvVar = (key, defaultVal) => {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key]
  ) {
    return import.meta.env[key];
  }
  return defaultVal;
};

// TAMBAHKAN DUA BARIS INI:
const DEFAULT_GITHUB_USERNAME = getEnvVar(
  "VITE_GITHUB_USERNAME",
  "fatihatulikrimah41-lgtm",
);
const GITHUB_API_TOKEN = getEnvVar("VITE_GITHUB_TOKEN", "");

export default function App() {
  const [activeView, setActiveView] = useState("beranda");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State Integrasi GitHub API Dinamis
  const [githubUser, setGithubUser] = useState(DEFAULT_GITHUB_USERNAME);
  const [customUsernameInput, setCustomUsernameInput] = useState(
    DEFAULT_GITHUB_USERNAME,
  );
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [repos, setRepos] = useState(FALLBACK_REPOSITORIES);
  const [latestActivityText, setLatestActivityText] = useState(
    "Aktivitas Terbaru: Memperbarui repositori C-SIRS - 2 jam yang lalu.",
  );
  const [apiStatus, setApiStatus] = useState({
    loading: true,
    mode: "INITIALIZING",
    lastSynced: "Baru saja",
  });
  const [selectedLangFilter, setSelectedLangFilter] = useState("Semua");

  // State Music Player Ambient
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioCtxRef = useRef(null);
  const oscNodesRef = useRef([]);
  const gainNodeRef = useRef(null);

  const stopAmbientAudio = useCallback(() => {
    oscNodesRef.current.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {
        /* ignore */
      }
    });
    oscNodesRef.current = [];
    setIsPlayingAudio(false);
  }, []);

  const startAmbientAudio = useCallback(
    (trackIdx = currentTrackIndex) => {
      try {
        stopAmbientAudio();
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
        const ctx = audioCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(
          0.12,
          ctx.currentTime + 1.5,
        );

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(420, ctx.currentTime);

        masterGain.connect(filter);
        filter.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        const track = ABYSS_TRACKS[trackIdx];
        const createdOscs = [];

        track.chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();

          osc.type = idx % 2 === 0 ? "sine" : "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          lfo.type = "sine";
          lfo.frequency.setValueAtTime(0.12 + idx * 0.05, ctx.currentTime);
          lfoGain.gain.setValueAtTime(1.8, ctx.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(masterGain);

          osc.start();
          lfo.start();
          createdOscs.push(osc, lfo);
        });

        oscNodesRef.current = createdOscs;
        setIsPlayingAudio(true);
      } catch (e) {
        console.error("Gagal memutar audio WebGL", e);
        setIsPlayingAudio(false);
      }
    },
    [currentTrackIndex, stopAmbientAudio],
  );

  const toggleAudioPlayback = () => {
    if (isPlayingAudio) stopAmbientAudio();
    else startAmbientAudio(currentTrackIndex);
  };

  const handleNextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % ABYSS_TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    if (isPlayingAudio) startAmbientAudio(nextIdx);
  };

  // Matikan audio jika komponen dilepas
  useEffect(() => {
    return () => stopAmbientAudio();
  }, [stopAmbientAudio]);

  // Fungsi Navigasi SPA dengan Efek Transisi Halus
  const navigateToView = useCallback(
    (viewKey) => {
      if (viewKey === activeView) {
        setMobileMenuOpen(false);
        return;
      }
      setMobileMenuOpen(false);
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveView(viewKey);
        setIsTransitioning(false);
      }, 220);
    },
    [activeView],
  ); // <-- activeView ditambahkan sebagai dependency

  // Navigasi Keyboard (Panah Kiri/Kanan) untuk Pengalaman SPA Kelas Atas
  useEffect(() => {
    const views = ["beranda", "tentang", "karya", "stack", "kontak"];
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;
      const currentIndex = views.indexOf(activeView);
      if (e.key === "ArrowRight" && currentIndex < views.length - 1) {
        navigateToView(views[currentIndex + 1]);
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateToView(views[currentIndex - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeView, navigateToView]); // <-- navigateToView ditambahkan di sini

  /**
   * LOGIKA FETCHING OTOMATIS GITHUB REST API (DENGAN DUKUNGAN TOKEN RENDER.COM)
   * Mengambil event push terbaru untuk subheadline dinamis dan daftar repositori
   * teratas berdasarkan bintang/pembaruan terkini.
   */
  const fetchGitHubTelemetry = useCallback(async (targetUsername) => {
    setApiStatus((prev) => ({ ...prev, loading: true }));

    const headers = {
      Accept: "application/vnd.github.v3+json",
    };
    if (GITHUB_API_TOKEN) {
      headers.Authorization = `Bearer ${GITHUB_API_TOKEN}`;
    }

    try {
      const [eventsRes, reposRes] = await Promise.all([
        fetch(
          `https://api.github.com/users/${encodeURIComponent(targetUsername)}/events/public?per_page=10`,
          { headers },
        ),
        fetch(
          `https://api.github.com/users/${encodeURIComponent(targetUsername)}/repos?sort=updated&per_page=12`,
          { headers },
        ),
      ]);

      let updatedActivity = null;
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData) && eventsData.length > 0) {
          const pushEvent =
            eventsData.find(
              (ev) => ev.type === "PushEvent" || ev.type === "CreateEvent",
            ) || eventsData[0];
          const rawRepoName = pushEvent?.repo?.name || "C-SIRS";
          const shortRepoName = rawRepoName.includes("/")
            ? rawRepoName.split("/")[1]
            : rawRepoName;
          const relTime = formatRelativeTimeIndonesian(pushEvent.created_at);
          updatedActivity = `Aktivitas Terbaru: Memperbarui repositori ${shortRepoName} - ${relTime}.`;
        }
      }

      if (reposRes.ok) {
        const reposData = await reposRes.json();
        if (Array.isArray(reposData) && reposData.length > 0) {
          const sortedRepos = [...reposData]
            .filter((r) => !r.fork)
            .sort((a, b) => {
              if (b.stargazers_count !== a.stargazers_count) {
                return b.stargazers_count - a.stargazers_count;
              }
              return new Date(b.updated_at) - new Date(a.updated_at);
            })
            .slice(0, 6);

          if (sortedRepos.length > 0) {
            setRepos(sortedRepos);
            if (!updatedActivity) {
              const latestRepo = sortedRepos[0];
              const relTime = formatRelativeTimeIndonesian(
                latestRepo.updated_at,
              );
              updatedActivity = `Aktivitas Terbaru: Memperbarui repositori ${latestRepo.name} - ${relTime}.`;
            }
            setLatestActivityText(updatedActivity);
            setApiStatus({
              loading: false,
              mode: "LIVE GITHUB API",
              lastSynced: new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            });
            return;
          }
        }
      }

      setRepos(FALLBACK_REPOSITORIES);
      setLatestActivityText(
        updatedActivity ||
          "Aktivitas Terbaru: Memperbarui repositori C-SIRS - 2 jam yang lalu.",
      );
      setApiStatus({
        loading: false,
        mode: "TELEMETRY STANDBY (C-SIRS)",
        lastSynced: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (error) {
      // FIX: Kita gunakan 'error' agar ESLint tidak protes, sekaligus bagus untuk debugging
      console.error("Gagal mengambil data dari GitHub API:", error);

      setRepos(FALLBACK_REPOSITORIES);
      setLatestActivityText(
        "Aktivitas Terbaru: Memperbarui repositori C-SIRS - 2 jam yang lalu.",
      );
      setApiStatus({
        loading: false,
        mode: "TELEMETRY STANDBY (C-SIRS)",
        lastSynced: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    }
  }, []); // <-- Dependencies array kosong karena state setter sudah stabil

  useEffect(() => {
    let isMounted = true; // Mencegah memory leak jika komponen di-unmount cepat

    const initFetch = async () => {
      // Dengan membungkusnya dalam async, eksekusi dianggap asinkron oleh linter
      if (isMounted) {
        await fetchGitHubTelemetry(githubUser);
      }
    };

    initFetch();

    return () => {
      isMounted = false; // Cleanup function (Best practice React 18)
    };
  }, [githubUser, fetchGitHubTelemetry]);

  // Daftar bahasa pemrograman unik untuk filter pada tampilan Karya
  const availableLanguages = useMemo(() => {
    const langs = new Set(["Semua"]);
    repos.forEach((r) => {
      if (r.language) langs.add(r.language);
    });
    return Array.from(langs);
  }, [repos]);

  const filteredRepos = useMemo(() => {
    if (selectedLangFilter === "Semua") return repos;
    return repos.filter((r) => r.language === selectedLangFilter);
  }, [repos, selectedLangFilter]);

  const navItems = [
    { id: "beranda", label: "Beranda", code: "01", icon: Compass },
    { id: "tentang", label: "Tentang", code: "02", icon: Shield },
    { id: "karya", label: "Karya", code: "03", icon: GitBranch },
    { id: "stack", label: "Tech Stack", code: "04", icon: Cpu },
    { id: "kontak", label: "Kontak", code: "05", icon: Radio },
  ];

  const handleApplyGithubUser = (e) => {
    e.preventDefault();
    const cleaned = customUsernameInput.trim();
    if (cleaned) {
      setGithubUser(cleaned);
      setShowConfigModal(false);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none flex flex-col justify-between"
      style={{
        backgroundColor: "transparent",
        color: "#FFFFFF",
        fontFamily:
          "'Inter', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* KANVAS 3D WEBGL PERSISTEN DI BACKGROUND ABSOLUT (z-index: -1) */}
      <WebGLBackground activeView={activeView} />

      {/* EFEK VIGNETTE & SCANLINE HOLOGRAFIK KAPAL RISET LAUT DALAM */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(4, 9, 20, 0.15) 0%, rgba(4, 9, 20, 0.78) 100%)",
        }}
      />

      {/* ====================================================================
            A. PERSISTENT NAVIGATION BAR (TOP HOLOGRAPHIC HUD)
            ==================================================================== */}
      <header className="relative z-30 w-full px-4 sm:px-8 pt-4 sm:pt-6 shrink-0">
        <div
          className="max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 py-3.5 flex items-center justify-between transition-all duration-300"
          style={{
            backgroundColor: "rgba(0, 26, 77, 0.38)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 229, 255, 0.32)",
            boxShadow:
              "0 0 30px rgba(0, 229, 255, 0.12), inset 0 0 15px rgba(77, 184, 255, 0.08)",
          }}
        >
          {/* Area Logo */}
          <button
            onClick={() => navigateToView("beranda")}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.85)",
                border: "1px solid #00E5FF",
                boxShadow: "0 0 15px rgba(0, 229, 255, 0.4)",
              }}
            >
              <Shield className="w-5 h-5 text-[#00E5FF]" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00E5FF] rounded-full animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm md:text-base font-bold tracking-wider text-white">
                  F.I. <span className="text-[#00E5FF]">//</span> UMC
                  <br />
                  {"INFORMATICS ENGINEERING"}
                  {/* &amp; CYBER SEC */}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#B3E5FC] opacity-85">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                <span>ABYSSAL-OS v4.2 // DEPTH: 3,840M</span>
              </div>
            </div>
          </button>

          {/* Navigasi Desktop (SPA View Triggers) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToView(item.id)}
                  className="relative px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0, 229, 255, 0.16)"
                      : "transparent",
                    color: isActive ? "#FFFFFF" : "#B3E5FC",
                    border: isActive
                      ? "1px solid rgba(0, 229, 255, 0.65)"
                      : "1px solid transparent",
                    boxShadow: isActive
                      ? "0 0 18px rgba(0, 229, 255, 0.28)"
                      : "none",
                  }}
                >
                  <span className="text-[#00E5FF] opacity-75">
                    {item.code}.
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span className="font-semibold">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Indikator API GitHub & Tombol Hamburger Mobile */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowConfigModal(true)}
              title="Konfigurasi Sumber GitHub API"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px] transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.7)",
                border: "1px solid rgba(77, 184, 255, 0.4)",
                color: "#B3E5FC",
              }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus.loading
                    ? "bg-amber-400 animate-ping"
                    : "bg-[#00E5FF]"
                }`}
              />
              <span className="truncate max-w-[140px]">@{githubUser}</span>
              <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-[#00E5FF] transition-all"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.75)",
                border: "1px solid rgba(0, 229, 255, 0.45)",
              }}
              aria-label="Buka Menu Navigasi"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Overlay Menu Hamburger Mobile (Glassmorphism Penuh) */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden mt-2 rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300"
            style={{
              backgroundColor: "rgba(4, 9, 20, 0.92)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(0, 229, 255, 0.45)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToView(item.id)}
                  className="w-full px-4 py-3 rounded-xl font-mono text-xs uppercase tracking-widest flex items-center justify-between transition-all"
                  style={{
                    backgroundColor: isActive
                      ? "rgba(0, 229, 255, 0.18)"
                      : "rgba(0, 26, 77, 0.25)",
                    border: isActive
                      ? "1px solid #00E5FF"
                      : "1px solid rgba(77, 184, 255, 0.15)",
                    color: isActive ? "#FFFFFF" : "#B3E5FC",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#00E5FF] font-bold">
                      {item.code}
                    </span>
                    <Icon className="w-4 h-4 text-[#00E5FF]" />
                    <span className="font-semibold">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#00E5FF]" />
                </button>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowConfigModal(true);
              }}
              className="mt-1 w-full px-4 py-2.5 rounded-xl font-mono text-xs flex items-center justify-center gap-2"
              style={{
                backgroundColor: "rgba(0, 26, 77, 0.45)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                color: "#B3E5FC",
              }}
            >
              <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Konfigurasi Target GitHub (@{githubUser})</span>
            </button>
          </div>
        )}
      </header>

      {/* ====================================================================
            KONTAINER UTAMA SPA (TIDAK ADA SCROLL VERTIKAL PANJANG PADA BODY)
            Setiap View dirender sebagai kartu holografik yang muncul/memudar
            di atas kanvas ikan 3D bioluminescent.
            ==================================================================== */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-5 overflow-hidden flex items-center justify-center">
        <div
          className={`w-full h-full flex items-center justify-center transition-all duration-300 ${
            isTransitioning
              ? "opacity-0 scale-[0.98] translate-y-2"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          {/* ================================================================
                VIEW 1: BERANDA (HOME)
                ================================================================ */}
          {activeView === "beranda" && (
            <div className="w-full h-full max-h-full overflow-y-auto custom-scrollbar flex flex-col justify-center items-start max-w-5xl mr-auto pr-2">
              {/* Lencana Telemetri Atas */}
              <div
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full font-mono text-xs mb-5"
                style={{
                  backgroundColor: "rgba(0, 26, 77, 0.55)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0, 229, 255, 0.45)",
                  color: "#00E5FF",
                  boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
                }}
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>SISTEM ARSITEKTUR &amp; KEAMANAN SIBER SIAP OPERASI</span>
              </div>

              {/* Kartu Holografik Utama Beranda */}
              <div
                className="w-full rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden"
                style={{
                  backgroundColor: "rgba(4, 9, 20, 0.58)",
                  backdropFilter: "blur(18px)",
                  WebkitBackdropFilter: "blur(18px)",
                  border: "1px solid rgba(0, 229, 255, 0.38)",
                  boxShadow:
                    "0 25px 60px rgba(0, 0, 0, 0.75), 0 0 40px rgba(0, 229, 255, 0.12), inset 0 0 30px rgba(0, 26, 77, 0.45)",
                }}
              >
                {/* Aksen Sudut Teknologis */}
                <div className="w-16 h-1 bg-[#00E5FF] mb-6 rounded-full shadow-[0_0_12px_#00E5FF]" />

                {/* Headline Masif Sesuai Master Prompt */}
                <h1
                  className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.08] mb-6"
                  style={{
                    color: "#FFFFFF",
                    textShadow: "0 0 35px rgba(0, 229, 255, 0.32)",
                  }}
                >
                  YOUR ENGINEERING &amp;{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #FFFFFF 0%, #00E5FF 55%, #4DB8FF 100%)",
                    }}
                  >
                    SECURITY SPRINT TEAM
                  </span>{" "}
                  ON DEMAND
                </h1>

                {/* Deskripsi Pengantar Berbahasa Indonesia Kelas Investor */}
                <p
                  className="text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed mb-6"
                  style={{ color: "#B3E5FC" }}
                >
                  Membangun infrastruktur perangkat lunak berketahanan tinggi,
                  arsitektur sistem berbasis{" "}
                  <span className="text-white font-semibold">
                    First-Principles
                  </span>
                  , dan pertahanan keamanan siber terukur. Dirancang oleh{" "}
                  <span className="text-[#00E5FF] font-semibold">
                    Fatihatul Ikrimah
                  </span>{" "}
                  untuk organisasi yang menuntut eksekusi teknis cepat, presisi
                  algoritmik, dan keandalan tingkat produksi.
                </p>

                {/* Dynamic Subheadline dari GitHub API */}
                <div
                  className="w-full max-w-2xl rounded-2xl p-3.5 sm:p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  style={{
                    backgroundColor: "rgba(0, 26, 77, 0.5)",
                    border: "1px solid rgba(77, 184, 255, 0.35)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#040914] border border-[#00E5FF]/40 text-[#00E5FF] shrink-0">
                      <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <p className="font-mono text-xs sm:text-sm text-white">
                      {latestActivityText}
                    </p>
                  </div>
                  <button
                    onClick={() => fetchGitHubTelemetry(githubUser)}
                    className="self-end sm:self-center px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 text-[#00E5FF] hover:bg-[#00E5FF]/10 transition-colors shrink-0"
                    title="Segarkan Telemetri GitHub"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${apiStatus.loading ? "animate-spin" : ""}`}
                    />
                    <span>SYNC</span>
                  </button>
                </div>

                {/* Tombol CTA Neon Cyan Bercahaya & Navigasi Sekunder */}
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigateToView("karya")}
                    className="group relative px-7 py-4 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3 hover:scale-[1.03] active:scale-[0.99]"
                    style={{
                      backgroundColor: "#00E5FF",
                      color: "#040914",
                      boxShadow:
                        "0 0 28px rgba(0, 229, 255, 0.65), 0 0 60px rgba(0, 229, 255, 0.25)",
                    }}
                  >
                    <span>Jelajahi Sistem</span>
                    <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={() => navigateToView("tentang")}
                    className="px-6 py-4 rounded-xl font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 hover:bg-[#00E5FF]/15"
                    style={{
                      backgroundColor: "rgba(0, 26, 77, 0.45)",
                      color: "#FFFFFF",
                      border: "1px solid rgba(0, 229, 255, 0.45)",
                    }}
                  >
                    <Terminal className="w-4 h-4 text-[#00E5FF]" />
                    <span>Proposisi Nilai Investor</span>
                  </button>
                </div>

                {/* Metrik Singkat di Bawah Kartu */}
                <div className="mt-8 pt-6 border-t border-[#4DB8FF]/20 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      ARSITEKTUR INTI
                    </div>
                    <div className="font-bold text-sm sm:text-base text-white mt-0.5">
                      First-Principles
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      FOKUS KEAMANAN
                    </div>
                    <div className="font-bold text-sm sm:text-base text-white mt-0.5">
                      Zero-Trust &amp; C-SIRS
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      PETA JALAN TEKNIS
                    </div>
                    <div className="font-bold text-sm sm:text-base text-white mt-0.5">
                      4-Tahun Terstruktur
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      LINGKUNGAN KERJA
                    </div>
                    <div className="font-bold text-sm sm:text-base text-[#00E5FF] mt-0.5">
                      VSCodium Portable
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
                VIEW 2: TENTANG (INVESTOR VALUE PROPOSITION)
                ================================================================ */}
          {activeView === "tentang" && (
            <div
              className="w-full max-h-full overflow-y-auto rounded-3xl p-6 sm:p-9 custom-scrollbar"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.68)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(0, 229, 255, 0.38)",
                boxShadow:
                  "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.1)",
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Kolom Kiri: Profil Eksekutif & Positioning */}
                <div className="lg:col-span-5 flex flex-col gap-5">
                  <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00E5FF] uppercase tracking-widest">
                    <Shield className="w-4 h-4" />
                    <span>02 // OTORITAS TEKNIS &amp; PROFIL EKSEKUTIF</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Fatihatul Ikrimah
                  </h2>

                  <div
                    className="rounded-2xl p-4"
                    style={{
                      backgroundColor: "rgba(0, 26, 77, 0.55)",
                      border: "1px solid rgba(0, 229, 255, 0.35)",
                    }}
                  >
                    <div className="font-mono text-xs text-[#00E5FF] uppercase">
                      AFILIASI AKADEMIK &amp; SPESIALISASI
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      S1 Teknik Informatika — Universitas Muhammadiyah Gresik
                    </div>
                    <p className="text-xs sm:text-sm text-[#B3E5FC] mt-2 leading-relaxed">
                      Pemimpin teknis pragmatis yang memadukan ketajaman
                      rekayasa perangkat lunak modern dengan disiplin keamanan
                      siber defensif maupun ofensif.
                    </p>
                  </div>

                  <p className="text-sm sm:text-base text-[#B3E5FC] leading-relaxed">
                    Berbeda dari pengembangan konvensional yang bergantung pada
                    abstraksi berlapis tanpa pemahaman dasar, setiap sistem yang
                    saya rancang dibangun melalui pendekatan{" "}
                    <span className="text-white font-semibold">
                      First-Principles System Architecture
                    </span>
                    : membedah masalah hingga ke akar fisika komputasi,
                    meminimalkan permukaan serangan siber, dan mengoptimalkan
                    kompleksitas algoritmik sejak baris kode pertama.
                  </p>

                  {/* 3 Pilar Keunggulan untuk Investor & Klien */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                    <div
                      className="p-3.5 rounded-xl flex items-start gap-3"
                      style={{
                        backgroundColor: "rgba(0, 26, 77, 0.35)",
                        border: "1px solid rgba(77, 184, 255, 0.25)",
                      }}
                    >
                      <Lock className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Keamanan Siber Terintegrasi (Security-by-Design)
                        </h4>
                        <p className="text-xs text-[#B3E5FC] mt-0.5">
                          Mitigasi risiko proaktif, enkripsi end-to-end, dan
                          arsitektur tahan uji penetrasi.
                        </p>
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl flex items-start gap-3"
                      style={{
                        backgroundColor: "rgba(0, 26, 77, 0.35)",
                        border: "1px solid rgba(77, 184, 255, 0.25)",
                      }}
                    >
                      <Zap className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Manajemen Kompleksitas Algoritmik Efisien
                        </h4>
                        <p className="text-xs text-[#B3E5FC] mt-0.5">
                          Struktur data teroptimasi untuk latensi rendah dan
                          penghematan biaya komputasi server.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Peta Jalan Teknis 4-Tahun Terstruktur */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div
                    className="rounded-2xl p-5 sm:p-6"
                    style={{
                      backgroundColor: "rgba(0, 26, 77, 0.38)",
                      border: "1px solid rgba(0, 229, 255, 0.3)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="font-mono text-xs text-[#00E5FF] uppercase tracking-wider">
                          BLUEPRINT REKAYASA TERUKUR
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                          Peta Jalan Teknis 4-Tahun Terstruktur
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-full font-mono text-xs bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40">
                        S1 INFORMATIKA UMG
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {ROADMAP_YEARS.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl relative transition-all duration-300 hover:border-[#00E5FF]"
                          style={{
                            backgroundColor: "rgba(4, 9, 20, 0.65)",
                            border: "1px solid rgba(77, 184, 255, 0.25)",
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-xs font-bold text-[#00E5FF] px-2.5 py-0.5 rounded bg-[#001A4D] border border-[#00E5FF]/40">
                              {item.year}
                            </span>
                            <CheckCircle2 className="w-4 h-4 text-[#4DB8FF]" />
                          </div>
                          <h4 className="text-sm font-bold text-white mb-1.5">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#B3E5FC] leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Ringkasan Eksekutif Bawah */}
                    <div
                      className="mt-5 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      style={{
                        backgroundColor: "rgba(4, 9, 20, 0.8)",
                        border: "1px solid rgba(0, 229, 255, 0.35)",
                      }}
                    >
                      <div>
                        <div className="font-mono text-xs text-[#00E5FF]">
                          STANDAR KOMPUTASI &amp; OPERASIONAL
                        </div>
                        <div className="text-xs sm:text-sm text-[#B3E5FC] mt-0.5">
                          Siap diterjunkan langsung untuk audit arsitektur,
                          akselerasi MVP, maupun pengamanan infrastruktur.
                        </div>
                      </div>
                      <button
                        onClick={() => navigateToView("kontak")}
                        className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all hover:scale-105"
                        style={{
                          backgroundColor: "#00E5FF",
                          color: "#040914",
                          boxShadow: "0 0 18px rgba(0, 229, 255, 0.45)",
                        }}
                      >
                        Diskusikan Proyek
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
                VIEW 3: KARYA TERPILIH (DYNAMIC PROJECTS - GITHUB API)
                ================================================================ */}
          {activeView === "karya" && (
            <div
              className="w-full h-full max-h-full flex flex-col rounded-3xl p-5 sm:p-8 overflow-hidden"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.68)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(0, 229, 255, 0.38)",
                boxShadow:
                  "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.1)",
              }}
            >
              {/* Header Tampilan Karya & Filter Bahasa */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#4DB8FF]/20 shrink-0">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF] uppercase tracking-widest">
                    <GitBranch className="w-4 h-4" />
                    <span>
                      03 // REPOSITORI TERPILIH &amp; TELEMETRI GITHUB OTOMATIS
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Karya &amp; Sistem Rekayasa Terpilih
                  </h2>
                </div>

                {/* Filter Bahasa & Status Sinkronisasi */}
                <div className="flex flex-wrap items-center gap-2">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLangFilter(lang)}
                      className="px-3 py-1.5 rounded-xl font-mono text-xs transition-all"
                      style={{
                        backgroundColor:
                          selectedLangFilter === lang
                            ? "#00E5FF"
                            : "rgba(0, 26, 77, 0.45)",
                        color:
                          selectedLangFilter === lang ? "#040914" : "#B3E5FC",
                        fontWeight: selectedLangFilter === lang ? 700 : 500,
                        border:
                          selectedLangFilter === lang
                            ? "1px solid #00E5FF"
                            : "1px solid rgba(77, 184, 255, 0.3)",
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Repositori (Scrollable secara internal di dalam kartu SPA) */}
              <div className="flex-1 overflow-y-auto pr-1 mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
                    style={{
                      backgroundColor: "rgba(0, 26, 77, 0.42)",
                      border: "1px solid rgba(0, 229, 255, 0.28)",
                      boxShadow: "inset 0 0 20px rgba(4, 9, 20, 0.6)",
                    }}
                  >
                    <div>
                      {/* Baris Atas: Nama Repo & Jumlah Bintang */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-[#040914] border border-[#00E5FF]/40 text-[#00E5FF]">
                            <Code2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors break-all">
                              {repo.name}
                            </h3>
                            <span className="font-mono text-[11px] text-[#4DB8FF]">
                              Diperbarui{" "}
                              {formatRelativeTimeIndonesian(repo.updated_at)}
                            </span>
                          </div>
                        </div>

                        <div
                          className="px-2.5 py-1 rounded-lg font-mono text-xs flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: "rgba(4, 9, 20, 0.75)",
                            border: "1px solid rgba(0, 229, 255, 0.35)",
                            color: "#00E5FF",
                          }}
                        >
                          <Star className="w-3.5 h-3.5 fill-[#00E5FF] text-[#00E5FF]" />
                          <span>{repo.stargazers_count ?? 0}</span>
                        </div>
                      </div>

                      {/* Deskripsi Repositori */}
                      <p className="text-xs sm:text-sm text-[#B3E5FC] leading-relaxed mb-4 line-clamp-3">
                        {repo.description ||
                          "Sistem perangkat lunak dan modul rekayasa keamanan siber terstruktur."}
                      </p>
                    </div>

                    {/* Footer Kartu: Bahasa Utama & Tautan GitHub */}
                    <div className="pt-3 border-t border-[#4DB8FF]/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
                        <span className="font-mono text-xs text-white font-semibold">
                          {repo.language || "Multi-Stack"}
                        </span>
                      </div>

                      <a
                        href={
                          repo.html_url || `https://github.com/${githubUser}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-[#00E5FF] hover:text-white transition-colors"
                      >
                        <span>Inspeksi Kode</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================
                VIEW 4: TECH STACK & VSCODIUM PORTABLE ENVIRONMENT
                ================================================================ */}
          {activeView === "stack" && (
            <div
              className="w-full h-full max-h-full flex flex-col rounded-3xl p-5 sm:p-8 overflow-hidden"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.68)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(0, 229, 255, 0.38)",
                boxShadow:
                  "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 229, 255, 0.1)",
              }}
            >
              {/* Header Tech Stack */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4DB8FF]/20 shrink-0">
                <div>
                  <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF] uppercase tracking-widest">
                    <Cpu className="w-4 h-4" />
                    <span>
                      04 // INSTRUMEN REKAYASA &amp; ARSITEKTUR TEKNOLOGI INTI
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Spektrum Teknologi &amp; Lingkungan Operasi
                  </h2>
                </div>

                {/* Highlight Khusus VSCodium Portable Environment */}
                <div
                  className="px-4 py-2.5 rounded-2xl flex items-center gap-3"
                  style={{
                    backgroundColor: "rgba(0, 229, 255, 0.12)",
                    border: "1px solid #00E5FF",
                    boxShadow: "0 0 20px rgba(0, 229, 255, 0.2)",
                  }}
                >
                  <Terminal className="w-5 h-5 text-[#00E5FF] shrink-0" />
                  <div>
                    <div className="font-mono text-[10px] text-[#00E5FF] uppercase tracking-wider">
                      WORKSTATION STANDAR
                    </div>
                    <div className="font-mono text-xs sm:text-sm font-bold text-white">
                      VSCodium Portable Environment
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Interaktif 8 Teknologi Inti */}
              <div className="flex-1 overflow-y-auto pr-1 mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 custom-scrollbar">
                {TECH_STACK_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.name}
                      className="rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group"
                      style={{
                        backgroundColor: "rgba(0, 26, 77, 0.42)",
                        border: "1px solid rgba(0, 229, 255, 0.3)",
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2.5 rounded-xl bg-[#040914] border border-[#00E5FF]/50 text-[#00E5FF] group-hover:shadow-[0_0_15px_#00E5FF] transition-shadow">
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-mono text-xs font-bold text-[#00E5FF] px-2.5 py-1 rounded-lg bg-[#040914]/80 border border-[#00E5FF]/30">
                            {item.level}
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-white">
                          {item.name}
                        </h3>
                        <div className="font-mono text-[11px] text-[#4DB8FF] mb-2">
                          {item.category}
                        </div>
                        <p className="text-xs text-[#B3E5FC] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-[#4DB8FF]/20">
                        <div className="flex items-center justify-between font-mono text-[10px] text-[#00E5FF]">
                          <span>SPESIFIKASI:</span>
                          <span className="text-white truncate max-w-[140px]">
                            {item.metric}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Panel Penjelasan VSCodium Portable Environment di Bagian Bawah */}
              <div
                className="mt-4 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0"
                style={{
                  backgroundColor: "rgba(4, 9, 20, 0.85)",
                  border: "1px solid rgba(77, 184, 255, 0.35)",
                }}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <Shield className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-xs sm:text-sm text-[#B3E5FC]">
                    <span className="text-white font-bold">
                      VSCodium Portable Environment:
                    </span>{" "}
                    Seluruh siklus penulisan kode dan audit keamanan dijalankan
                    pada lingkungan biner bebas telemetri pihak ketiga,
                    terenkripsi, dan dapat dideploy secara instan di berbagai
                    mesin produksi dengan konsistensi konfigurasi 100%.
                  </p>
                </div>
                <span className="font-mono text-xs text-[#00E5FF] shrink-0 uppercase">
                  ZERO-TELEMETRY SECOPS
                </span>
              </div>
            </div>
          )}

          {/* ================================================================
                VIEW 5: KONTAK (INVESTOR & CONSULTING DISPATCH)
                ================================================================ */}
          {activeView === "kontak" && (
            <div
              className="w-full max-h-full overflow-y-auto custom-scrollbar rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden"
              style={{
                backgroundColor: "rgba(4, 9, 20, 0.68)",
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
                border: "1px solid rgba(0, 229, 255, 0.42)",
                boxShadow:
                  "0 25px 60px rgba(0, 0, 0, 0.85), 0 0 45px rgba(0, 229, 255, 0.15)",
              }}
            >
              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00E5FF] uppercase tracking-widest mb-3">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>
                  05 // SALURAN KOMUNIKASI LANGSUNG &amp; OTORISASI PROYEK
                </span>
              </div>

              {/* Kalimat Penutup Persis Sesuai Master Prompt */}
              <h2
                className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4"
                style={{ textShadow: "0 0 25px rgba(0, 229, 255, 0.25)" }}
              >
                Siap untuk skala besar?{" "}
                <span className="text-[#00E5FF]">
                  Tersedia untuk Freelance &amp; Konsultasi Teknis.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-[#B3E5FC] max-w-2xl leading-relaxed mb-8">
                Hubungi saya secara langsung untuk perancangan arsitektur sistem
                dari nol, pengembangan aplikasi full-stack berkinerja tinggi,
                maupun audit dan penguatan keamanan siber organisasi Anda.
              </p>

              {/* Kartu Tautan Langsung: GitHub, Email, dan LinkedIn */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <a
                  href={`https://github.com/${githubUser}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5FF] group"
                  style={{
                    backgroundColor: "rgba(0, 26, 77, 0.48)",
                    border: "1px solid rgba(0, 229, 255, 0.32)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#040914] border border-[#00E5FF]/40 text-[#00E5FF]">
                      <Code className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#4DB8FF] group-hover:text-[#00E5FF]" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      REPOSITORI &amp; KODE
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      GitHub
                    </div>
                    <div className="font-mono text-xs text-[#00E5FF] mt-1 truncate">
                      github.com/{githubUser}
                    </div>
                  </div>
                </a>

                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=fatihatulikrimah41@gmail.com&su=Konsultasi%20Teknis%20%26%20Arsitektur%20Sistem&body=Halo%20Fatiha,%20saya%20tertarik%20untuk%20berdiskusi%20mengenai%20proyek..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5FF] group"
                  style={{
                    backgroundColor: "rgba(0, 26, 77, 0.48)",
                    border: "1px solid rgba(0, 229, 255, 0.32)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#040914] border border-[#00E5FF]/40 text-[#00E5FF]">
                      <Mail className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#4DB8FF] group-hover:text-[#00E5FF]" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      TRANSMISI SURAT ELEKTRONIK
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      Email
                    </div>
                    <div className="font-mono text-xs text-[#00E5FF] mt-1 truncate">
                      Kirim Pesan Langsung
                    </div>
                  </div>
                </a>

                <a
                  href="https://www.linkedin.com/in/fatihatul-ikrimah-51903b44a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#00E5FF] group"
                  style={{
                    backgroundColor: "rgba(0, 26, 77, 0.48)",
                    border: "1px solid rgba(0, 229, 255, 0.32)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-[#040914] border border-[#00E5FF]/40 text-[#00E5FF]">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#4DB8FF] group-hover:text-[#00E5FF]" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-[#4DB8FF]">
                      JARINGAN EKSEKUTIF
                    </div>
                    <div className="text-lg font-bold text-white mt-0.5">
                      LinkedIn
                    </div>
                    <div className="font-mono text-xs text-[#00E5FF] mt-1 truncate">
                      Fatihatul Ikrimah
                    </div>
                  </div>
                </a>
              </div>

              {/* Baris Informasi Deployment Render.com & Status Ketersediaan */}
              <div
                className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                style={{
                  backgroundColor: "rgba(0, 26, 77, 0.35)",
                  border: "1px solid rgba(77, 184, 255, 0.25)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-[#00E5FF] animate-ping" />
                  <span className="font-mono text-xs text-[#B3E5FC]">
                    STATUS RESPON:{" "}
                    <strong className="text-white">
                      &lt; 4 JAM KERJA (WIB)
                    </strong>{" "}
                    // GRESIK &amp; REMOTE GLOBAL
                  </span>
                </div>
                <button
                  onClick={() => navigateToView("beranda")}
                  className="font-mono text-xs text-[#00E5FF] hover:underline"
                >
                  Kembali ke Beranda Utama →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ====================================================================
            FOOTER TELEMETRI PERSISTEN & INDIKATOR TAMPILAN SPA
            ==================================================================== */}
      <footer className="relative z-30 w-full px-4 sm:px-8 pb-3 sm:pb-5 shrink-0">
        <div
          className="max-w-7xl mx-auto rounded-2xl px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{
            backgroundColor: "rgba(4, 9, 20, 0.72)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(77, 184, 255, 0.22)",
          }}
        >
          <div className="flex items-center gap-4 font-mono text-[11px] text-[#B3E5FC]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
              <span>WEBGL 3D ENGINE: ACTIVE (60 FPS)</span>
            </span>
            <span className="hidden md:inline text-[#4DB8FF]">|</span>
            <span className="hidden md:inline">
              GITHUB TELEMETRY:{" "}
              <strong className="text-[#00E5FF]">{apiStatus.mode}</strong>{" "}
              (SYNC: {apiStatus.lastSynced})
            </span>
          </div>

          {/* Titik Indikator Cepat Antar-Layar SPA */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateToView(item.id)}
                  className="px-2.5 py-1 rounded-lg font-mono text-[10px] transition-all"
                  style={{
                    backgroundColor: active
                      ? "#00E5FF"
                      : "rgba(0, 26, 77, 0.45)",
                    color: active ? "#040914" : "#B3E5FC",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.code}
                </button>
              );
            })}
          </div>
        </div>
      </footer>

      {/* ====================================================================
          FLOATING LIVE SPOTIFY LOUNGE WIDGET
      ==================================================================== */}
      <div className="fixed bottom-4 right-4 z-40 w-72 sm:w-80 transition-all duration-500">
        <div
          className="rounded-2xl border overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: "rgba(4, 9, 20, 0.75)",
            backdropFilter: "blur(16px)",
            borderColor: isPlayingAudio
              ? "rgba(0, 229, 255, 0.5)"
              : "rgba(77, 184, 255, 0.2)",
            boxShadow: isPlayingAudio
              ? "0 10px 30px rgba(0, 229, 255, 0.2)"
              : "0 10px 30px rgba(0,0,0,0.8)",
          }}
        >
          {/* Player Header */}
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ backgroundColor: "rgba(0, 26, 77, 0.6)" }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[#00E5FF] ${isPlayingAudio ? "bg-[#00E5FF]/20 animate-pulse" : "bg-transparent border border-[#00E5FF]/40"}`}
              >
                <Volume2 size={13} />
              </div>
              <div>
                <div className="text-xs font-bold text-white leading-none">
                  Live Spotify Lounge
                </div>
                <div className="text-[10px] font-mono text-[#00E5FF] mt-0.5">
                  Ambient Synth Engine
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleAudioPlayback}
                className="p-1.5 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/30 text-[#00E5FF] transition-colors"
                title={isPlayingAudio ? "Jeda Suara" : "Putar Suara"}
              >
                {isPlayingAudio ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                onClick={handleNextTrack}
                className="p-1.5 rounded-lg bg-[#040914]/60 hover:bg-[#00E5FF]/20 text-[#B3E5FC] hover:text-[#00E5FF] transition-colors"
                title="Lagu Berikutnya"
              >
                <SkipForward size={13} />
              </button>
              <button
                onClick={() => setIsPlayerMinimized(!isPlayerMinimized)}
                className="p-1.5 rounded-lg bg-[#040914]/60 hover:bg-[#00E5FF]/20 text-[#B3E5FC] transition-colors"
              >
                {isPlayerMinimized ? (
                  <ChevronUp size={13} />
                ) : (
                  <ChevronDown size={13} />
                )}
              </button>
            </div>
          </div>

          {/* Tracklist Body */}
          {!isPlayerMinimized && (
            <div className="p-3 bg-[#040914]/60">
              <div className="space-y-1.5">
                {ABYSS_TRACKS.map((track, idx) => {
                  const active = idx === currentTrackIndex;
                  return (
                    <button
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        startAmbientAudio(idx);
                      }}
                      className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all ${active ? "bg-[#001A4D]/80 border border-[#00E5FF]/40 text-white" : "hover:bg-[#001A4D]/40 text-[#B3E5FC]"}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[10px] text-[#00E5FF]">
                          0{idx + 1}
                        </span>
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate">
                            {track.title}
                          </div>
                          <div className="text-[10px] text-[#B3E5FC]/70 truncate">
                            {track.artist}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-[#4DB8FF] ml-2 shrink-0">
                        {active && isPlayingAudio ? "PLAYING" : track.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
            MODAL KONFIGURASI TARGET GITHUB API (UNTUK PENGUJIAN REAL-TIME)
            ==================================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div
            className="w-full max-w-md rounded-3xl p-6 relative"
            style={{
              backgroundColor: "#040914",
              border: "1px solid #00E5FF",
              boxShadow: "0 0 50px rgba(0, 229, 255, 0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 font-mono text-xs text-[#00E5FF]">
                <Sliders className="w-4 h-4" />
                <span>KONFIGURASI TELEMETRI GITHUB API</span>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-lg text-[#B3E5FC] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#B3E5FC] leading-relaxed mb-4">
              Aplikasi ini terhubung langsung ke GitHub REST API. Saat di-deploy
              ke <strong className="text-white">Render.com</strong>, Anda dapat
              mengatur variabel lingkungan{" "}
              <code className="text-[#00E5FF]">VITE_GITHUB_USERNAME</code> dan{" "}
              <code className="text-[#00E5FF]">VITE_GITHUB_TOKEN</code>. Anda
              juga dapat menguji username GitHub secara langsung di bawah ini:
            </p>

            <form
              onSubmit={handleApplyGithubUser}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block font-mono text-xs text-white mb-1.5">
                  Username GitHub Target:
                </label>
                <input
                  type="text"
                  value={customUsernameInput}
                  onChange={(e) => setCustomUsernameInput(e.target.value)}
                  placeholder="Contoh: fatihatulikrimah41-lgtm"
                  className="w-full px-4 py-2.5 rounded-xl font-mono text-sm text-white focus:outline-none"
                  style={{
                    backgroundColor: "rgba(0, 26, 77, 0.5)",
                    border: "1px solid rgba(0, 229, 255, 0.5)",
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl font-mono text-xs text-[#B3E5FC] border border-[#4DB8FF]/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-mono text-xs font-bold uppercase"
                  style={{
                    backgroundColor: "#00E5FF",
                    color: "#040914",
                  }}
                >
                  Sinkronkan API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styling Scrollbar Internal Khusus untuk Kontainer Kartu SPA */}
      <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(4, 9, 20, 0.4);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 229, 255, 0.35);
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 229, 255, 0.7);
          }
        `}</style>
    </div>
  );
}
