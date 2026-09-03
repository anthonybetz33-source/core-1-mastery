import { useEffect, useMemo, useState } from "react";
import { BookOpen, CheckCircle2, ExternalLink, PlayCircle, RotateCcw } from "lucide-react";

const PLAYLIST_ID = "PLG49S3nxzAnnes8ZGI-OBlKEukHCX46N8";
const STORAGE_KEY = "core1-messer-course-progress-v1";

const sections = [
  { id: "s0", label: "0", title: "Exam orientation", range: "1 video", topics: "How the A+ Core 1 / Core 2 exams work" },
  { id: "s1", label: "1", title: "Mobile devices", range: "4 videos", topics: "Laptop hardware, mobile configuration, connectivity and management" },
  { id: "s2", label: "2", title: "Networking", range: "13 videos", topics: "IP, ports, wireless, services, DNS, DHCP, VLANs/VPNs, devices, addressing and tools" },
  { id: "s3", label: "3", title: "Hardware", range: "32 videos", topics: "Displays, cables, connectors, memory, storage, motherboards, CPUs, expansion cards, power and printers" },
  { id: "s4", label: "4", title: "Virtualization & cloud", range: "4 videos", topics: "Virtualization concepts/services and cloud models/characteristics" },
  { id: "s5", label: "5", title: "Troubleshooting", range: "6 videos", topics: "Hardware, storage, displays, mobile devices, networks and printers" },
];

const anchors = [
  ["Mobile", "Laptop Hardware"],
  ["Networking", "Introduction to IP"],
  ["Hardware", "Display Types"],
  ["Cables", "Network Cables"],
  ["Motherboards", "Motherboard Form Factors"],
  ["Expansion", "Expansion Cards"],
  ["Power", "Computer Power"],
  ["Cloud", "Cloud Models"],
  ["Troubleshooting", "Troubleshooting Hardware"],
];

export function MesserCourseView() {
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const [showIndex, setShowIndex] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setWatched(JSON.parse(saved));
    } catch {
      // Ignore malformed local progress and start clean.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watched));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }, [watched]);

  const watchedCount = Object.values(watched).filter(Boolean).length;
  const progress = Math.round((watchedCount / 63) * 100);
  const courseUrl = "https://www.professormesser.com/free-a-plus-training/220-1201/220-1201-video/220-1201-training-course/";
  const playlistUrl = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;
  const indexRows = useMemo(() => anchors, []);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/30">
        <div className="border-b border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <PlayCircle className="h-3.5 w-3.5" /> Embedded video course
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">Professor Messer • A+ Core 1</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                The complete free 220-1201 V15 video playlist, embedded directly into Core 1 Mastery. Watch here, then jump straight into the matching drills and labs.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[310px]">
              <Stat value="63" label="videos" />
              <Stat value="10h 11m" label="runtime" />
              <Stat value={`${progress}%`} label="tracked" />
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Course progress</span>
              <span>{watchedCount} / 63 marked complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">
          <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed?listType=playlist&list=${PLAYLIST_ID}&rel=0&modestbranding=1`}
              title="Professor Messer A+ 220-1201 Core 1 video playlist"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">Player not loading?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Some browsers, extensions, or network filters block embedded YouTube. The official playlist is always one tap away.</p>
              </div>
              <a href={playlistUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white px-4 py-3 text-xs font-black text-slate-950 transition hover:bg-slate-200">
                <ExternalLink className="h-4 w-4" /> Open playlist
              </a>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href={playlistUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              <ExternalLink className="h-4 w-4" /> Open full playlist on YouTube
            </a>
            <a href={courseUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              <BookOpen className="h-4 w-4" /> Open official course index
            </a>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Course map</p>
              <h2 className="mt-1 text-xl font-black text-white">All Core 1 sections</h2>
            </div>
            <button onClick={() => setShowIndex((v) => !v)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/10">
              {showIndex ? "Hide details" : "Show details"}
            </button>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {sections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-black text-white">{section.label}</span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white">{section.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{section.range}</p>
                    {showIndex && <p className="mt-2 text-sm leading-5 text-slate-400">{section.topics}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">The player uses the official playlist, so Core 1 Mastery does not copy or rehost Professor Messer's videos.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Study loop</p>
              <h2 className="mt-1 text-xl font-black text-white">Watch → Drill</h2>
            </div>
            <button onClick={() => setWatched({})} title="Reset course progress" className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {indexRows.map(([label, title]) => {
              const key = label.toLowerCase();
              const done = !!watched[key];
              return (
                <button key={label} onClick={() => setWatched((p) => ({ ...p, [key]: !p[key] }))} className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-3 text-left transition hover:bg-white/[.06]">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${done ? "bg-white text-slate-950" : "bg-white/10 text-slate-400"}`}>
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
                    <span className="block truncate text-sm font-bold text-slate-200">{title}</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{done ? "done" : "mark"}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">Progress is stored locally on this device. YouTube controls playback position.</p>
        </div>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[.04] px-3 py-3">
      <div className="text-lg font-black text-white sm:text-xl">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
