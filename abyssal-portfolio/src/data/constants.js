import {
  Shield,
  Server,
  Cpu,
  Layers,
  Database,
  GitBranch,
  Code2,
  Globe,
} from "lucide-react";

export const FALLBACK_REPOSITORIES = [
  {
    id: "csirs-core",
    name: "C-SIRS",
    full_name: "fatihatulikrimah41-lgtm/C-SIRS",
    description:
      "Cyber Security Incident Response System — Platform orkestrasi deteksi anomali jaringan, mitigasi insiden real-time, dan audit forensik terpadu berbasis arsitektur zero-trust.",
    language: "Java",
    stargazers_count: 48,
    forks_count: 12,
    updated_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(), // ~2 jam yang lalu
    html_url: "https://github.com",
    topics: [
      "cyber-security",
      "incident-response",
      "zero-trust",
      "java-enterprise",
    ],
  },
  {
    id: "abyssal-sec-engine",
    name: "Abyssal-Guard-IDS",
    full_name: "fatihatulikrimah41-lgtm/Abyssal-Guard-IDS",
    description:
      "Mesin Intrusion Detection System (IDS) berkinerja tinggi dengan analisis paket mendalam dan kompleksitas algoritmik O(log n) untuk pemindaian lalu lintas skala tinggi.",
    language: "Node.js",
    stargazers_count: 39,
    forks_count: 8,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    html_url: "https://github.com",
    topics: [
      "intrusion-detection",
      "network-security",
      "nodejs",
      "cryptography",
    ],
  },
  {
    id: "distributed-ledger-auth",
    name: "FirstPrinciples-Auth-Core",
    full_name: "fatihatulikrimah41-lgtm/FirstPrinciples-Auth-Core",
    description:
      "Infrastruktur autentikasi mikroservis dengan rotasi token kriptografi asimetris, pembatasan laju terdistribusi, dan penyimpanan sesi terenkripsi di PostgreSQL.",
    language: "TypeScript",
    stargazers_count: 34,
    forks_count: 9,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(),
    html_url: "https://github.com",
    topics: ["authentication", "postgresql", "express", "system-architecture"],
  },
  {
    id: "umg-algo-benchmark",
    name: "Algorithmic-Complexity-Suite",
    full_name: "fatihatulikrimah41-lgtm/Algorithmic-Complexity-Suite",
    description:
      "Kerangka kerja evaluasi struktur data dan efisiensi memori untuk pemrosesan graf skala besar serta optimasi query basis data relasional & NoSQL.",
    language: "Java",
    stargazers_count: 29,
    forks_count: 6,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    html_url: "https://github.com",
    topics: ["algorithms", "data-structures", "java", "optimization"],
  },
  {
    id: "vscodium-portable-sec",
    name: "VSCodium-Portable-SecOps",
    full_name: "fatihatulikrimah41-lgtm/VSCodium-Portable-SecOps",
    description:
      "Konfigurasi lingkungan pengembangan terisolasi (VSCodium Portable Environment) dengan hardening telemetri nol, linter keamanan statis, dan toolchain portabel.",
    language: "Shell",
    stargazers_count: 52,
    forks_count: 15,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    html_url: "https://github.com",
    topics: ["vscodium", "devsecops", "portable-environment", "hardening"],
  },
  {
    id: "hybrid-telemetry-api",
    name: "Telemetry-Nexus-API",
    full_name: "fatihatulikrimah41-lgtm/Telemetry-Nexus-API",
    description:
      "REST & WebSocket API Gateway menggunakan Node.js, Express, dan MongoDB untuk agregasi log keamanan terpusat dengan latensi sub-15 milidetik.",
    language: "JavaScript",
    stargazers_count: 27,
    forks_count: 5,
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 165).toISOString(),
    html_url: "https://github.com",
    topics: ["nodejs", "express", "mongodb", "realtime-telemetry"],
  },
];

export const TECH_STACK_ITEMS = [
  {
    name: "Java",
    category: "Backend & Enterprise Security",
    metric: "JVM High-Concurrency & Cryptography",
    level: "96%",
    desc: "Pengembangan sistem skala enterprise, manajemen memori ketat, serta implementasi algoritma keamanan siber dan struktur data kompleks.",
    icon: Shield,
  },
  {
    name: "Node.js",
    category: "Event-Driven Runtime",
    metric: "Non-Blocking I/O Architecture",
    level: "95%",
    desc: "Orkestrasi layanan mikro real-time, pemrosesan aliran data telemetri berkecepatan tinggi, dan otomasi daemon sistem.",
    icon: Server,
  },
  {
    name: "Express",
    category: "API Gateway & Middleware",
    metric: "Zero-Trust Routing & Rate-Limiting",
    level: "94%",
    desc: "Perancangan RESTful API tangguh dengan lapisan validasi skema, mitigasi injeksi payload, dan autentikasi berbasis token.",
    icon: Cpu,
  },
  {
    name: "React",
    category: "SPA & WebGL Interface",
    metric: "State-Driven UI & 3D Telemetry",
    level: "95%",
    desc: "Rekayasa antarmuka Single Page Application berkinerja tinggi dengan manajemen state terukur dan visualisasi WebGL interaktif.",
    icon: Layers,
  },
  {
    name: "PostgreSQL",
    category: "Relational Database",
    metric: "ACID Compliance & Indexing",
    level: "92%",
    desc: "Desain skema relasional ternormalisasi, optimasi query kompleks, pengindeksan B-Tree/GIN, dan integritas data transaksional.",
    icon: Database,
  },
  {
    name: "MongoDB",
    category: "Document Store / NoSQL",
    metric: "High-Throughput Log Aggregation",
    level: "90%",
    desc: "Penyimpanan dokumen terdistribusi untuk pencatatan insiden siber berkecepatan tinggi dan agregasi analitik real-time.",
    icon: GitBranch,
  },
  {
    name: "Tailwind CSS",
    category: "Design System Engine",
    metric: "Abyssal Glassmorphism UI",
    level: "97%",
    desc: "Sistem desain berbasis token utilitas presisi tinggi dengan performa render optimal dan responsivitas lintas perangkat.",
    icon: Code2,
  },
  {
    name: "HTML5",
    category: "Semantic Web Core",
    metric: "WebGL Canvas & Security Standards",
    level: "98%",
    desc: "Struktur semantik standar industri, integrasi kanvas perangkat keras akselerasi GPU, serta kebijakan Content Security Policy (CSP).",
    icon: Globe,
  },
];

export const ROADMAP_YEARS = [
  {
    year: "Tahun 01",
    title: "Fondasi First-Principles & Kompleksitas Algoritmik",
    detail:
      "Penguasaan logika komputasi diskrit, struktur data tingkat lanjut di Java, serta analisis efisiensi asimtotik Big-O untuk kode bebas bottleneck.",
  },
  {
    year: "Tahun 02",
    title: "Rekayasa Sistem Terdistribusi & Basis Data Hibrida",
    detail:
      "Arsitektur API full-stack dengan Node.js, Express, PostgreSQL, dan MongoDB. Penerapan pola desain modular dan ketahanan transaksi.",
  },
  {
    year: "Tahun 03",
    title: "Keamanan Siber Defensif & Orkestrasi Insiden",
    detail:
      "Pembangunan sistem deteksi anomali (C-SIRS), pengamanan protokol komunikasi, hardening lingkungan kerja, dan audit kerentanan aplikasi.",
  },
  {
    year: "Tahun 04",
    title: "Kepemimpinan Teknis & Skala Produksi Investor-Grade",
    detail:
      "Konsolidasi arsitektur siap pakai untuk kebutuhan korporasi, optimasi infrastruktur cloud (Render/Docker), dan konsultasi rekayasa strategis.",
  },
];

export const ABYSS_TRACKS = [
  {
    id: 1,
    title: "Sunlit Tropic Stream",
    artist: "M.A. Synth Lab • Upbeat & Radiant",
    duration: "04:18",
    freqBase: 261.63,
    // C Major 6/9: Very happy, open, and energetic (Higher octave)
    chord: [261.63, 329.63, 392.0, 440.0, 587.33],
  },
  {
    id: 2,
    title: "Euphoric Cyber-Reef",
    artist: "Bioluminescent Core • Triumphant",
    duration: "03:52",
    freqBase: 311.13,
    // Eb Major 9: Uplifting, bouncy, and bright
    chord: [311.13, 392.0, 466.16, 587.33, 698.46],
  },
  {
    id: 3,
    title: "Neon Velocity Spark",
    artist: "Gresik Engineering • Shimmering Highs",
    duration: "05:04",
    freqBase: 349.23,
    // F Major Add 9: Pure positive energy and sparkle
    chord: [349.23, 440.0, 523.25, 783.99, 880.0],
  },
];
