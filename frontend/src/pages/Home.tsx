import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  Gamepad2, MessageSquare, Trophy, Code, Sparkles, CheckCircle2, Flame, Heart,
  Search, Filter, X
} from 'lucide-react';

interface FeaturedStream {
  id: string;
  name: string;
  title: string;
  game: string;
  viewers: string;
  avatar: string;
  thumbnail: string;
  tags: string[];
  description: string;
}

const FEATURED_STREAMS: FeaturedStream[] = [
  {
    id: 'globalelite',
    name: 'GlobalElite',
    title: '🏆 FINAŁY TURNIEJU FACEIT 3000 ELO | CS2 Pro League | !cfg !giveaway',
    game: 'Counter-Strike 2',
    viewers: '8,432',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    tags: ['Esport', 'Polski', 'Dropsy', '1080p60'],
    description: 'Decydujący mecz o awans do finałów regionalnych. Oglądaj na żywo z oficjalnym komentarzem!'
  },
  {
    id: 'devninja',
    name: 'DevNinja',
    title: '⚡ Kodujemy platformę livestreamingową od zera | WebSockets, RTMP & React',
    game: 'Programowanie',
    viewers: '1,204',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    tags: ['Programowanie', 'WebDev', 'TypeScript', 'Q&A'],
    description: 'Budujemy architekturę czatu o zerowych opóźnieniach i nowoczesny interfejs wzorowany na Kicku i Twitchu.'
  },
  {
    id: 'craftkreator',
    name: 'CraftKreator',
    title: '🧱 Ogromne megamiasto w trybie Hardcore! Dzień 120 z widzami na serwerze',
    game: 'Minecraft',
    viewers: '432',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    tags: ['Survival', 'Widzowie', 'Chill', 'Rodzina'],
    description: 'Budujemy zamek i farmy automatyczne. Każdy widz może dołączyć i zgarnąć upominki!'
  },
  {
    id: 'techmaniak',
    name: 'TechManiak',
    title: '🔥 Składamy potwora: RTX 5090 + Liquid Cooling | Testy w 4K 144Hz!',
    game: 'Technologia',
    viewers: '890',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80',
    tags: ['Sprzęt', 'Unboxing', 'PCMasterRace'],
    description: 'Pomiary temperatur, podkręcanie procesora i wielki giveaway podkładek dla widzów na czacie.'
  }
];

const CATEGORIES = [
  { id: 'chatting', name: 'Just Chatting', viewers: '145.8k', image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=300&auto=format&fit=crop&q=80', tags: ['IRL', 'Rozmowy'] },
  { id: 'cs2', name: 'Counter-Strike 2', viewers: '84.2k', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&auto=format&fit=crop&q=80', tags: ['FPS', 'Esport'] },
  { id: 'gtav', name: 'Grand Theft Auto V', viewers: '62.4k', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80', tags: ['Roleplay', 'Akcja'] },
  { id: 'valorant', name: 'Valorant', viewers: '48.9k', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300&auto=format&fit=crop&q=80', tags: ['Strzelanka', 'Turniej'] },
  { id: 'minecraft', name: 'Minecraft', viewers: '34.1k', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80', tags: ['Survival', 'Sandbox'] },
  { id: 'coding', name: 'Programowanie', viewers: '12.5k', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop&q=80', tags: ['Edukacja', 'Technologia'] }
];

const ALL_LIVE_STREAMS = [
  {
    id: 'globalelite',
    name: 'GlobalElite',
    title: '🏆 FINAŁY FACEIT 3000 ELO | CS2 | !cfg !crosshair',
    game: 'Counter-Strike 2',
    viewers: '8.4k',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
    tags: ['Polski', 'Esport', 'Dropsy']
  },
  {
    id: 'devninja',
    name: 'DevNinja',
    title: '⚡ AuraCast Live Streaming Architecture | React 19 + NodeMediaServer',
    game: 'Programowanie',
    viewers: '1.2k',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80',
    tags: ['WebDev', 'TypeScript', 'LiveCoding']
  },
  {
    id: 'craftkreator',
    name: 'CraftKreator',
    title: '🧱 Megamiasto Hardcore - budujemy port i doki | Dzień 120',
    game: 'Minecraft',
    viewers: '432',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=80',
    tags: ['Survival', 'ZWidzami']
  },
  {
    id: 'techmaniak',
    name: 'TechManiak',
    title: '🔥 Składamy potwora: RTX 5090 + Liquid Cooling | Q&A',
    game: 'Technologia',
    viewers: '890',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&auto=format&fit=crop&q=80',
    tags: ['PCMasterRace', 'Hardware']
  },
  {
    id: 'cyberqueen',
    name: 'CyberQueen',
    title: '✨ Radiant Ranked | Solo Duo | Chill vibes i muzyka',
    game: 'Valorant',
    viewers: '3.1k',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&q=80',
    tags: ['Radiant', 'ValorantPL', 'Dropsy']
  },
  {
    id: 'rpking',
    name: 'RP_King',
    title: '🚓 Miami Vibe RP | Nowy gang przejmuje miasto! Odcinek 89',
    game: 'Grand Theft Auto V',
    viewers: '5.2k',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    tags: ['GTA RP', 'Kryminalny', 'Polski']
  }
];

const Home: React.FC = () => {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('Wszystkie');
  const [streamSearch, setStreamSearch] = useState('');
  const [sortBy, setSortBy] = useState<'viewers' | 'name'>('viewers');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlCategory = searchParams.get('category');
  const tabParam = searchParams.get('tab');

  // Synchronizacja parametru ?tab= z filtrem
  useEffect(() => {
    if (tabParam === 'esport') setSelectedFilter('Esport');
    else if (tabParam === 'irl') setSelectedFilter('IRL');
  }, [tabParam]);

  const currentFeatured = FEATURED_STREAMS[featuredIndex] ?? FEATURED_STREAMS[0]!;

  // Automatyczna rotacja karuzeli
  useEffect(() => {
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % FEATURED_STREAMS.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setFeaturedIndex((prev) => (prev - 1 + FEATURED_STREAMS.length) % FEATURED_STREAMS.length);
  };

  const handleNext = () => {
    setFeaturedIndex((prev) => (prev + 1) % FEATURED_STREAMS.length);
  };

  // Filtrowanie i sortowanie transmisji
  const filteredStreams = ALL_LIVE_STREAMS
    .filter((s) => {
      if (urlCategory && s.game.toLowerCase() !== urlCategory.toLowerCase()) {
        return false;
      }
      if (streamSearch.trim()) {
        const query = streamSearch.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesTitle = s.title.toLowerCase().includes(query);
        const matchesGame = s.game.toLowerCase().includes(query);
        const matchesTags = s.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesTitle && !matchesGame && !matchesTags) return false;
      }
      if (selectedFilter === 'Wszystkie') return true;
      if (selectedFilter === 'Gry') return s.game !== 'Programowanie' && s.game !== 'Technologia';
      if (selectedFilter === 'IRL') return s.game === 'Just Chatting';
      if (selectedFilter === 'Esport') return s.tags.includes('Esport') || s.game === 'Counter-Strike 2' || s.game === 'Valorant';
      if (selectedFilter === 'Kreatywne') return s.game === 'Programowanie' || s.game === 'Technologia';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // Sortowanie domyślne po widzach
      const viewersA = parseFloat(a.viewers.replace('k', '000').replace('.', ''));
      const viewersB = parseFloat(b.viewers.replace('k', '000').replace('.', ''));
      return viewersB - viewersA;
    });

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 lg:p-8 space-y-8 select-none">
      
      {/* 🟢 SEKCJA 1: FEATURED SPOTLIGHT HERO CAROUSEL (Twitch & Kick Hero Player) */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#14171c] border border-[var(--border-subtle)] shadow-2xl">
        <div className="flex flex-col lg:flex-row min-h-[340px] lg:h-[400px]">
          
          {/* Lewa strona: Podgląd Wideo / Grafika z efektami */}
          <div className="relative flex-1 bg-black group overflow-hidden">
            <img 
              src={currentFeatured.thumbnail} 
              alt={currentFeatured.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:to-[#14171c]/90"></div>

            {/* Badge LIVE */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="badge-live animate-pulse">NA ŻYWO</span>
              <span className="bg-black/80 backdrop-blur-md text-white text-xs font-bold px-2 py-0.5 rounded-md border border-white/10">
                {currentFeatured.viewers} widzów
              </span>
            </div>

            {/* Przycisk Mute / Unmute */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-all border border-white/10"
              title={isMuted ? "Włącz dźwięk" : "Wycisz"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[var(--brand-primary)]" />}
            </button>
          </div>

          {/* Prawa strona: Informacje o transmisji i przyciski */}
          <div className="w-full lg:w-[420px] p-6 lg:p-8 flex flex-col justify-between bg-[#14171c] border-t lg:border-t-0 lg:border-l border-[var(--border-subtle)]">
            <div>
              {/* Streamer Avatar & Name */}
              <div className="flex items-center gap-3 mb-4">
                <Link to={`/${currentFeatured.id}`} className="relative shrink-0 group/av">
                  <img 
                    src={currentFeatured.avatar} 
                    alt={currentFeatured.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-[var(--brand-primary)] group-hover/av:scale-105 transition-transform shadow-lg"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border-2 border-[#14171c] rounded-full"></span>
                </Link>
                <div>
                  <Link to={`/${currentFeatured.id}`} className="font-bold text-base text-white hover:text-[var(--brand-primary)] flex items-center gap-1.5 transition-colors">
                    <span>{currentFeatured.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)] fill-current" />
                  </Link>
                  <p className="text-xs text-[var(--brand-primary)] font-semibold">{currentFeatured.game}</p>
                </div>
              </div>

              {/* Tytuł transmisji */}
              <Link to={`/${currentFeatured.id}`} className="block font-extrabold text-lg leading-snug text-gray-100 hover:text-[var(--brand-primary)] line-clamp-2 transition-colors mb-3">
                {currentFeatured.title}
              </Link>

              {/* Krótki opis */}
              <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                {currentFeatured.description}
              </p>

              {/* Tagi */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {currentFeatured.tags.map((tag, idx) => (
                  <span key={idx} className="text-[11px] font-semibold bg-[#20252c] text-gray-300 px-2.5 py-0.5 rounded-full border border-[var(--border-subtle)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Przyciski Akcji + Karuzela Nawigacja */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <Link 
                to={`/${currentFeatured.id}`}
                className="bg-[var(--brand-primary)] hover:opacity-90 text-[var(--brand-contrast)] font-extrabold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md group"
              >
                <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                <span>Oglądaj</span>
              </Link>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={handlePrev}
                  className="p-2 rounded-xl bg-[#20252c] hover:bg-[#2c333d] text-gray-300 hover:text-white transition-colors"
                  title="Poprzedni stream"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNext}
                  className="p-2 rounded-xl bg-[#20252c] hover:bg-[#2c333d] text-gray-300 hover:text-white transition-colors"
                  title="Następny stream"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 🟢 SEKCJA 2: FILTRY KATEGORII (Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {[
          { label: 'Wszystkie', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
          { label: 'Gry', icon: <Gamepad2 className="w-3.5 h-3.5 text-purple-400" /> },
          { label: 'IRL', icon: <MessageSquare className="w-3.5 h-3.5 text-pink-400" /> },
          { label: 'Esport', icon: <Trophy className="w-3.5 h-3.5 text-yellow-400" /> },
          { label: 'Kreatywne', icon: <Code className="w-3.5 h-3.5 text-blue-400" /> }
        ].map((filter) => (
          <button
            key={filter.label}
            onClick={() => setSelectedFilter(filter.label)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all border ${
              selectedFilter === filter.label
                ? 'bg-[var(--brand-primary)] text-[var(--brand-contrast)] border-[var(--brand-primary)] shadow-md'
                : 'bg-[var(--bg-card)] text-gray-300 border-[var(--border-subtle)] hover:border-gray-500'
            }`}
          >
            {filter.icon}
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* 🟢 SEKCJA 3: TOP KATEGORIE (Box Art Cards jak na Twitchu i Kicku) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--brand-primary)]" />
            <span>Najpopularniejsze kategorie</span>
          </h2>
          <span className="text-xs font-bold text-[var(--brand-primary)] cursor-pointer hover:underline">
            Zobacz wszystkie
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              to={`/?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col cursor-pointer"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#181b20] border border-[var(--border-subtle)] group-hover:border-[var(--brand-primary)] transition-all duration-200 group-hover:-translate-y-1 shadow-md">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-gray-200">
                  {cat.viewers} widzów
                </div>
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-gray-100 mt-2 truncate group-hover:text-[var(--brand-primary)] transition-colors">
                {cat.name}
              </h3>
              <div className="flex gap-1 mt-1">
                {cat.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-semibold text-gray-400 bg-[#1c2027] px-1.5 py-0.2 rounded border border-[var(--border-subtle)]">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 🟢 SEKCJA 4: KANAŁY NA ŻYWO (Responsive Grid z filtrowaniem i wyszukiwaniem) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-lg font-extrabold text-white">
              Transmisje na żywo <span className="text-[var(--brand-primary)]">({filteredStreams.length})</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Wyszukiwarka na liście transmisji */}
            <div className="relative min-w-[200px]">
              <input
                type="text"
                placeholder="Filtruj streamy..."
                value={streamSearch}
                onChange={(e) => setStreamSearch(e.target.value)}
                className="w-full bg-[#151c26] text-xs text-white pl-8 pr-7 py-1.5 rounded-xl border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
              {streamSearch && (
                <button
                  onClick={() => setStreamSearch('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Opcje sortowania */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Filter className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#151c26] text-white text-xs px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] outline-none focus:border-[var(--brand-primary)]"
              >
                <option value="viewers">Najwięcej widzów</option>
                <option value="name">Nazwa (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Aktywne filtry */}
        {(urlCategory || selectedFilter !== 'Wszystkie' || streamSearch) && (
          <div className="flex items-center gap-2 flex-wrap py-1">
            <span className="text-xs text-gray-400 font-semibold">Aktywne filtry:</span>
            {urlCategory && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-blue-950/80 border border-blue-500/40 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                Kategoria: {urlCategory}
                <button onClick={() => navigate('/')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedFilter !== 'Wszystkie' && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-purple-950/80 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">
                Typ: {selectedFilter}
                <button onClick={() => setSelectedFilter('Wszystkie')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {streamSearch && (
              <span className="inline-flex items-center gap-1 text-[11px] bg-gray-800 border border-gray-600 text-gray-200 px-2.5 py-0.5 rounded-full font-bold">
                Fraza: "{streamSearch}"
                <button onClick={() => setStreamSearch('')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedFilter('Wszystkie');
                setStreamSearch('');
                navigate('/');
              }}
              className="text-[11px] text-[var(--brand-primary)] hover:underline font-bold ml-1"
            >
              Wyczyść wszystkie filtry
            </button>
          </div>
        )}

        {filteredStreams.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[#12161e] border border-[var(--border-subtle)] space-y-3">
            <p className="text-sm font-bold text-gray-300">Nie znaleziono transmisji spełniających kryteria</p>
            <p className="text-xs text-gray-500">Spróbuj zmienić kategorię, wpisać inną frazę lub zresetować filtry.</p>
            <button
              onClick={() => {
                setSelectedFilter('Wszystkie');
                setStreamSearch('');
                navigate('/');
              }}
              className="px-4 py-2 bg-[var(--brand-primary)] hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Pokaż wszystkie transmisje
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredStreams.map((stream) => (
            <Link 
              key={stream.id} 
              to={`/${stream.id}`}
              className="group flex flex-col cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#16181d] border border-[var(--border-subtle)] group-hover:border-[var(--brand-primary)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_8px_25px_var(--brand-glow)]">
                <img 
                  src={stream.thumbnail} 
                  alt={stream.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <span className="badge-live">LIVE</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">
                  {stream.viewers} widzów
                </div>
              </div>

              {/* Informacje pod miniaturką */}
              <div className="flex gap-3 mt-3 items-start">
                <div className="relative shrink-0">
                  <img 
                    src={stream.avatar} 
                    alt={stream.name} 
                    className="w-10 h-10 rounded-full object-cover border border-[#2d323a] group-hover:border-[var(--brand-primary)] transition-colors"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-[var(--bg-base)] rounded-full"></span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-100 group-hover:text-[var(--brand-primary)] line-clamp-1 transition-colors">
                    {stream.title}
                  </h3>
                  <p className="text-xs text-gray-300 font-semibold mt-0.5 flex items-center gap-1">
                    <span>{stream.name}</span>
                    <CheckCircle2 className="w-3 h-3 text-[var(--brand-primary)] fill-current" />
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {stream.game}
                  </p>
                  
                  {/* Tagi */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {stream.tags.map((tag, idx) => (
                      <span key={idx} className="text-[9px] font-semibold text-gray-400 bg-[#1a1e24] px-1.5 py-0.2 rounded border border-[var(--border-subtle)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}
      </div>

      {/* 🟢 SEKCJA 5: BANER SPOŁECZNOŚCIOWY AURA-CAST (BYOM Model) */}
      <div className="rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-[#14171c] via-[#1a1e24] to-[#14171c] border border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-glow)] text-[var(--brand-primary)] text-xs font-bold border border-[var(--brand-primary)]/30">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Prawdziwa Niezależność Twórców</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            100% zysków trafia bezpośrednio do Ciebie
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Brak haraczu platformy, algorytm wspierający małych streamerów oraz model BYOM (Bring Your Own Monetization). Podłącz swój Patronite, Ko-fi czy Tiply i streamuj na własnych zasadach.
          </p>
        </div>

        <Link
          to="/auth"
          className="shrink-0 bg-[var(--brand-primary)] hover:opacity-90 text-[var(--brand-contrast)] font-extrabold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
        >
          Dołącz jako Streamer
        </Link>
      </div>

    </div>
  );
};

export default Home;