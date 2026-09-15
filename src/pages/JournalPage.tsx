import React, { useState, useEffect, useRef } from 'react';
import {
  BookHeart,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  X,
  Save,
  Clock,
  Smile,
  Meh,
  Frown,
  TrendingUp,
  Edit3,
  Search,
} from 'lucide-react';
import { useJournal } from '../hooks/useJournal';
import type { JournalEntry, JournalMood } from '../types';

// ─── Mood Config ─────────────────────────────────────────────────────────────
const MOODS: { value: JournalMood; emoji: string; label: string; color: string; bg: string }[] = [
  { value: 'great',  emoji: '🤩', label: 'Ótimo',    color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  { value: 'good',   emoji: '😊', label: 'Bem',      color: 'text-sky-400',     bg: 'bg-sky-500/20 border-sky-500/40' },
  { value: 'okay',   emoji: '😐', label: 'Ok',       color: 'text-amber-400',   bg: 'bg-amber-500/20 border-amber-500/40' },
  { value: 'bad',    emoji: '😔', label: 'Mal',      color: 'text-orange-400',  bg: 'bg-orange-500/20 border-orange-500/40' },
  { value: 'awful',  emoji: '😩', label: 'Péssimo',  color: 'text-rose-400',    bg: 'bg-rose-500/20 border-rose-500/40' },
];

const getMood = (v?: JournalMood) => MOODS.find(m => m.value === v);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatDateFull = (d: string) => {
  const date = new Date(d + 'T12:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};

const formatDateShort = (d: string) => {
  const date = new Date(d + 'T12:00');
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const today = () => new Date().toISOString().slice(0, 10);

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// ─── Tag Input ────────────────────────────────────────────────────────────────
const TagInput: React.FC<{ tags: string[]; onChange: (tags: string[]) => void }> = ({ tags, onChange }) => {
  const [input, setInput] = useState('');
  const addTag = () => {
    const clean = input.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) onChange([...tags, clean]);
    setInput('');
  };
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs">
          #{t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-rose-400 transition-colors">
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        placeholder="+ tag"
        className="bg-transparent text-xs text-slate-400 placeholder-slate-600 focus:outline-none w-16 focus:text-slate-200"
      />
    </div>
  );
};

// ─── Entry Editor ─────────────────────────────────────────────────────────────
const EntryEditor: React.FC<{
  date: string;
  existing?: JournalEntry | null;
  onSave: (data: { date: string; title?: string; content: string; mood?: JournalMood; tags: string[] }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}> = ({ date, existing, onSave, onCancel, onDelete }) => {
  const [title, setTitle]     = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood]       = useState<JournalMood | undefined>(existing?.mood);
  const [tags, setTags]       = useState<string[]>(existing?.tags ?? []);
  const textareaRef           = useRef<HTMLTextAreaElement>(null);
  const [saved, setSaved]     = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState('');

  useEffect(() => { textareaRef.current?.focus(); }, []);

  // Auto-resize textarea
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({ date, title: title.trim() || undefined, content, mood, tags });
    setSaved(true);
    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setLastSavedAt(now);
    setTimeout(() => setSaved(false), 2000);
  };

  const words = wordCount(content);

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#0d1627]/80">
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Voltar
        </button>
        <span className="text-xs text-slate-500 capitalize">{formatDateFull(date)}</span>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
              title="Excluir entrada"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!content.trim()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              saved
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Save className="w-3 h-3" />
            {saved ? 'Salvo!' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Writing area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Título (opcional)..."
          className="w-full bg-transparent text-2xl font-bold text-slate-100 placeholder-slate-700 focus:outline-none"
        />

        {/* Mood picker */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 mr-1">Como você está?</span>
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(prev => prev === m.value ? undefined : m.value)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
                mood === m.value
                  ? m.bg
                  : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:border-slate-600 hover:text-slate-300'
              }`}
            >
              <span className="text-base leading-none">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800" />

        {/* Main content */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Como foi o seu dia? Escreva seus pensamentos, conquistas, reflexões..."
          className="w-full bg-transparent text-slate-300 text-sm leading-relaxed placeholder-slate-700 focus:outline-none resize-none min-h-[280px] font-[inherit]"
          style={{ lineHeight: '1.8' }}
        />
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-800 bg-[#0d1627]/80 space-y-2">
        {/* Tags */}
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-600" />
          <TagInput tags={tags} onChange={setTags} />
        </div>
        {/* Word count + saved indicator */}
        <div className="flex items-center justify-between text-[10px] text-slate-600">
          <span>{words} {words === 1 ? 'palavra' : 'palavras'}</span>
          {lastSavedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Salvo às {lastSavedAt}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Entry Card (list view) ───────────────────────────────────────────────────
const EntryCard: React.FC<{
  entry: JournalEntry;
  onClick: () => void;
  onDelete: () => void;
}> = ({ entry, onClick, onDelete }) => {
  const mood = getMood(entry.mood);
  const preview = entry.content.replace(/\n+/g, ' ').slice(0, 140);

  return (
    <div
      onClick={onClick}
      className="group bg-[#0d1627] border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 relative"
    >
      {/* Delete btn */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/0 hover:bg-rose-500/20 text-slate-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Date block */}
        <div className="flex flex-col items-center bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-1.5 flex-shrink-0 min-w-[44px]">
          <span className="text-[10px] text-slate-500 capitalize">
            {new Date(entry.date + 'T12:00').toLocaleDateString('pt-BR', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-slate-200 leading-none">
            {new Date(entry.date + 'T12:00').getDate().toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 capitalize">
            {new Date(entry.date + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {entry.title && (
            <h3 className="font-semibold text-slate-100 text-sm mb-0.5 truncate">{entry.title}</h3>
          )}
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
            {preview}{entry.content.length > 140 ? '...' : ''}
          </p>
        </div>
      </div>

      {/* Footer badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {mood && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${mood.bg} ${mood.color}`}>
            {mood.emoji} {mood.label}
          </span>
        )}
        {entry.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
            #{t}
          </span>
        ))}
        <span className="text-[10px] text-slate-600 ml-auto">
          {wordCount(entry.content)} palavras
        </span>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export const JournalPage: React.FC = () => {
  const { entries, loading, saveEntry, deleteEntry } = useJournal();
  const [view, setView]             = useState<'list' | 'editor'>('list');
  const [selectedDate, setSelectedDate] = useState<string>(today());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [search, setSearch]         = useState('');

  const todayEntry = entries.find(e => e.date === today());

  const openEditor = (date: string, entry?: JournalEntry | null) => {
    setSelectedDate(date);
    setSelectedEntry(entry ?? null);
    setView('editor');
  };

  const handleSave = (data: Parameters<typeof saveEntry>[0]) => {
    const saved = saveEntry(data);
    if (saved) setSelectedEntry(saved);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir esta entrada do diário?')) {
      deleteEntry(id);
      setView('list');
    }
  };

  // Navigate days in editor
  const navigateDay = (direction: -1 | 1) => {
    const d = new Date(selectedDate + 'T12:00');
    d.setDate(d.getDate() + direction);
    const newDate = d.toISOString().slice(0, 10);
    const existing = entries.find(e => e.date === newDate) ?? null;
    openEditor(newDate, existing);
  };

  // Stats
  const totalEntries  = entries.length;
  const totalWords    = entries.reduce((s, e) => s + wordCount(e.content), 0);
  const thisMonthCount = entries.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7))).length;
  const moodCounts    = MOODS.map(m => ({ ...m, count: entries.filter(e => e.mood === m.value).length }));
  const topMood       = moodCounts.reduce((a, b) => (b.count > a.count ? b : a), moodCounts[0]);

  // Filter
  const filtered = entries.filter(e => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      e.content.toLowerCase().includes(q) ||
      (e.title ?? '').toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  // ─ Editor view ──────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <div className="flex flex-col h-full -m-4 lg:-m-8" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Day nav bar */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#081425] border-b border-slate-800/60">
          <button
            onClick={() => navigateDay(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-400 capitalize font-medium">{formatDateFull(selectedDate)}</span>
          <button
            onClick={() => navigateDay(1)}
            disabled={selectedDate >= today()}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <EntryEditor
          date={selectedDate}
          existing={selectedEntry}
          onSave={handleSave}
          onCancel={() => setView('list')}
          onDelete={selectedEntry ? () => handleDelete(selectedEntry.id) : undefined}
        />
      </div>
    );
  }

  // ─ List view ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-violet-400" /> Diário
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Escreva sobre o seu dia, reflexões e pensamentos. Um registro pessoal só seu.
          </p>
        </div>
        <button
          onClick={() => openEditor(today(), todayEntry)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-violet-500/25 active:scale-95"
        >
          {todayEntry ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {todayEntry ? 'Editar hoje' : 'Escrever hoje'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Entradas totais',
            value: totalEntries,
            icon: BookHeart,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10 border-violet-500/20',
          },
          {
            label: 'Palavras escritas',
            value: totalWords.toLocaleString('pt-BR'),
            icon: TrendingUp,
            color: 'text-sky-400',
            bg: 'bg-sky-500/10 border-sky-500/20',
          },
          {
            label: 'Este mês',
            value: thisMonthCount,
            icon: Calendar,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          },
          {
            label: 'Humor frequente',
            value: totalEntries > 0 ? `${topMood.emoji} ${topMood.label}` : '—',
            icon: Smile,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-4 flex items-center gap-3 ${bg}`}>
            <Icon className={`w-6 h-6 flex-shrink-0 ${color}`} />
            <div className="min-w-0">
              <p className="text-xs text-slate-500 truncate">{label}</p>
              <p className={`text-lg font-bold ${color} truncate`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's quick-entry CTA (if no entry today) */}
      {!todayEntry && !loading && (
        <div
          onClick={() => openEditor(today())}
          className="group cursor-pointer bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border border-violet-500/25 hover:border-violet-500/50 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:shadow-violet-500/10"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <span className="text-2xl">📔</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Como foi o seu dia hoje?</p>
            <p className="text-xs text-slate-500 mt-0.5">Clique para começar a escrever sobre {formatDateShort(today())}.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
        </div>
      )}

      {/* Search */}
      {totalEntries > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar entradas, tags..."
            className="w-full bg-[#0d1627] border border-slate-800 focus:border-slate-600 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Entries list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#0d1627] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <span className="text-5xl block">📔</span>
          <h3 className="text-base font-bold text-slate-300">
            {totalEntries === 0 ? 'Seu diário está em branco' : 'Nenhuma entrada encontrada'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {totalEntries === 0
              ? 'Comece a registrar seus pensamentos, conquistas e reflexões do dia.'
              : 'Tente buscar com outras palavras ou limpe o filtro.'}
          </p>
          {totalEntries === 0 && (
            <button
              onClick={() => openEditor(today())}
              className="mt-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              Escrever primeira entrada
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onClick={() => openEditor(entry.date, entry)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
