import React, { useMemo, useState, useEffect } from "react";

import vapTrait from "./assets/traits/vaporeon.png";
import jolTrait from "./assets/traits/jolteon.png";
import glaTrait from "./assets/traits/glaceon.png";
import espTrait from "./assets/traits/espeon.png";
import umbTrait from "./assets/traits/umbreon.png";
import leafTrait from "./assets/traits/leafeon.png";
import sylTrait from "./assets/traits/sylveon.png";
import flaTrait from "./assets/traits/flareon.png";

/*************************
 * Eevee Quiz — Single Page App (5 sections)
 * Tech: React + Tailwind (no external deps)
 * Pages/Sections:
 * 1) Welcome
 * 2) Personal Assessment (Intro + Quiz)
 * 3) Your Results (Energy + Pokémon)
 * 4) This is You
 * 5) Your Mini Collection (4x4 placeholders)
 *
 * Notes:
 * - No trademarked art used here. All imagery is placeholder-only.
 * - Content (questions, evolutions, palettes) separated below for easy editing.
 *************************/

// ---------- Data ----------
const EVOS = [
  "vaporeon",
  "jolteon",
  "flareon",
  "espeon",
  "umbreon",
  "leafeon",
  "glaceon",
  "sylveon",
] as const;

const EVO_META: Record<(typeof EVOS)[number], {
  label: string;
  energy: string;
  hook: string;
  palette: { bg: string; card: string; accent: string };
  img: string;           
  traitCard?: string;  
  traitCardLabel?: string;   
  traitLine?: string;
}> = {
  vaporeon: {
    label: "Vaporeon",
    energy: "Water Energy",
    hook: "Adaptable, calm under pressure, and great at flowing around obstacles.",
    palette: { bg: "from-sky-50 to-sky-100", card: "bg-white", accent: "text-sky-700" },
    img: "/evos/Vaporeon.png",
    traitCard: vapTrait,
    traitCardLabel: "Vaporeon V, Evolving Skies SWSH181",
    traitLine: "You dissolve boundaries, flowing between worlds with ease – emotion is your language.",
  },
  jolteon: {
    label: "Jolteon",
    energy: "Electric Energy",
    hook: "Quick-thinking, curious, and inventive—brings spark to every group.",
    palette: { bg: "from-yellow-50 to-amber-100", card: "bg-white", accent: "text-amber-700" },
    img: "/evos/Jolteon.png",
    traitCard: jolTrait,
    traitCardLabel: "Jolteon V, Evolving Skies SWSH183",
    traitLine: "You live in motion – ideas crackle through you before anyone else can see the storm coming.",
  },
  flareon: {
    label: "Flareon",
    energy: "Fire Energy",
    hook: "Bold, proactive, and passionate; energizes teams and charges ahead.",
    palette: { bg: "from-rose-50 to-orange-100", card: "bg-white", accent: "text-orange-700" },
    img: "/evos/Flareon.png",
    traitCard: flaTrait, 
    traitCardLabel: "Flareon V, Evolving Skies SWSH179",
    traitLine: "You burn bright and true – passion is your instinct, creating is your spark.",
  },
  espeon: {
    label: "Espeon",
    energy: "Psychic Energy",
    hook: "Intuitive, reflective, and quietly confident—sees patterns early.",
    palette: { bg: "from-fuchsia-50 to-violet-100", card: "bg-white", accent: "text-violet-700" },
    img: "/evos/Espeon.png",
    traitCard: espTrait,
    traitCardLabel: "Espeon V, Evolving Skies 180/203",
    traitLine: "You are guided by the unseen – intuitive, visionary, guided by the unseen threads of truth.",
  },
  umbreon: {
    label: "Umbreon",
    energy: "Dark Energy",
    hook: "Observant, composed, and resilient—thrives in ambiguity.",
    palette: { bg: "from-neutral-50 to-slate-200", card: "bg-white", accent: "text-slate-800" },
    img: "/evos/Umbreon.png",
    traitCard: umbTrait,
    traitCardLabel: "Umbreon V, Evolving Skies 189/203",
    traitLine: "You thrive in the unseen – mysterious, protective, and drawn to the depths others avoid.",
  },
  leafeon: {
    label: "Leafeon",
    energy: "Grass Energy",
    hook: "Grounded, steady, and nurturing—growth through consistency.",
    palette: { bg: "from-emerald-50 to-green-100", card: "bg-white", accent: "text-emerald-700" },
    img: "/evos/Leafeon.png",
    traitCard: leafTrait,
    traitCardLabel: "Leafeon V, Evolving Skies 167/203",
    traitLine: "You move with quiet growth – rooted yet reaching, turning sunlight into new beginnings.",
  },
  glaceon: {
    label: "Glaceon",
    energy: "Ice Energy",
    hook: "Clear, focused, and precise—keeps cool under pressure.",
    palette: { bg: "from-cyan-50 to-blue-100", card: "bg-white", accent: "text-cyan-700" },
    img: "/evos/Glaceon.png",
    traitCard: glaTrait,
    traitCardLabel: "Glaceon V, Evolving Skies 175/203",
    traitLine: "Calm and composed, you shimmer with quiet strength – serenity wrapped in precision.",
  },
  sylveon: {
    label: "Sylveon",
    energy: "Fairy Energy",
    hook: "Empathetic connector with warm, supportive presence.",
    palette: { bg: "from-pink-50 to-rose-100", card: "bg-white", accent: "text-pink-700" },
    img: "/evos/Sylveon.png",
    traitCard: sylTrait,
    traitCardLabel: "Sylveon V, Evolving Skies 184/203",
    traitLine: "You disarm the world with tenderness – your strength lies in connection, not control.",
  },
};


// --- New question types ---
const RAW_COLLECTIONS = import.meta.glob(
  "./assets/collections/*/*.{png,jpg,jpeg,webp,gif}",
  { eager: true, query: "?url", import: "default" }
) as Record<string, string>;

type EvoKey = typeof EVOS[number];
const COLLECTIONS: Record<EvoKey, string[]> = {
  vaporeon: [], jolteon: [], flareon: [], espeon: [],
  umbreon: [], leafeon: [], glaceon: [], sylveon: [],
};

for (const [path, url] of Object.entries(RAW_COLLECTIONS)) {
  const clean = path.replaceAll("\\", "/");       
  const m = clean.match(/assets\/collections\/([^/]+)\//);
  if (m) {
    const evo = m[1].toLowerCase() as EvoKey;
    if (COLLECTIONS[evo]) COLLECTIONS[evo].push(url);
  }
}
(Object.keys(COLLECTIONS) as EvoKey[]).forEach(k => COLLECTIONS[k].sort());


type ChoiceOption = {
  id: string;
  label: string;
  weight: Partial<Record<EvoKey, number>>;
};

type ChoiceQuestion = {
  id: string;
  kind: "choice";
  prompt: string;
  options: ChoiceOption[];
};

type TextQuestion = {
  id: string;
  kind: "text";
  prompt: string;
  placeholder?: string;
};

type AnyQuestion = ChoiceQuestion | TextQuestion;

// === Personality Assessment (12 choice + 3 text) ===
const QUESTIONS: AnyQuestion[] = [
  {
    id: "q1",
    kind: "choice",
    prompt: "What type of energy do you exude when you first meet someone?",
    options: [
      { id: "a", label: "Bold and Bright",       weight: { flareon: 2, jolteon: 1 } },
      { id: "b", label: "Calm and Thoughtful",   weight: { vaporeon: 2, espeon: 1 } },
      { id: "c", label: "Energetic and Spontaneous", weight: { jolteon: 2, flareon: 1 } },
      { id: "d", label: "Grounded and Steady",   weight: { leafeon: 2, umbreon: 1 } },
    ],
  },
  {
    id: "q2",
    kind: "choice",
    prompt: "Which of these best describes your creative style?",
    options: [
      { id: "a", label: "Experimental", weight: { jolteon: 2, flareon: 1 } },
      { id: "b", label: "Collaborative", weight: { sylveon: 2 } },
      { id: "c", label: "Methodical", weight: { glaceon: 2 } },
      { id: "d", label: "Dreamy", weight: { espeon: 2, sylveon: 1 } },
    ],
  },
  {
    id: "q3",
    kind: "choice",
    prompt: "How do you approach challenges?",
    options: [
      { id: "a", label: "Face them head-on", weight: { flareon: 2 } },
      { id: "b", label: "Strategize first",  weight: { espeon: 2, glaceon: 1 } },
      { id: "c", label: "Go with the flow",  weight: { vaporeon: 2 } },
      { id: "d", label: "Avoid conflict",    weight: { umbreon: 2 } },
    ],
  },
  {
    id: "q4",
    kind: "choice",
    prompt: "Which phrase best describes your creative rhythm?",
    options: [
      { id: "a", label: "I follow sparks of inspiration", weight: { jolteon: 2, flareon: 1 } },
      { id: "b", label: "I build steadily over time",     weight: { leafeon: 2 } },
      { id: "c", label: "I remix pre-existing projects",  weight: { glaceon: 2, espeon: 1 } },
      { id: "d", label: "I thrive in collaborative spaces", weight: { sylveon: 2 } },
    ],
  },
  {
    id: "q5",
    kind: "choice",
    prompt: "How do you express your inner world?",
    options: [
      { id: "a", label: "Through visuals and aesthetics",         weight: { espeon: 2, sylveon: 1 } },
      { id: "b", label: "Through words and storytelling",         weight: { umbreon: 1, espeon: 1, sylveon: 1 } },
      { id: "c", label: "Through movement or performance",        weight: { flareon: 2, jolteon: 1 } },
      { id: "d", label: "Through quiet acts of care and presence", weight: { leafeon: 2, vaporeon: 1 } },
    ],
  },
  {
    id: "q6",
    kind: "choice",
    prompt:
      "What motivates you to collect? Collectibles can include cards, clothes, memories, ideas, etc.",
    options: [
      { id: "a", label: "Nostalgia",        weight: { vaporeon: 1, umbreon: 1, leafeon: 1 } },
      { id: "b", label: "Dopamine",         weight: { jolteon: 2, flareon: 1 } },
      { id: "c", label: "Monetary Value",   weight: { glaceon: 2 } },
      { id: "d", label: "Self-Expression",  weight: { sylveon: 2, espeon: 1 } },
    ],
  },
  {
    id: "q7",
    kind: "choice",
    prompt:
      "How do you want others to feel when they see your collection (or personal brand)?",
    options: [
      { id: "a", label: "Inspired",   weight: { flareon: 2, jolteon: 1 } },
      { id: "b", label: "Understood", weight: { espeon: 2 } },
      { id: "c", label: "Impressed",  weight: { glaceon: 2 } },
      { id: "d", label: "Connected",  weight: { sylveon: 2, vaporeon: 1 } },
    ],
  },
  {
    id: "q8",
    kind: "choice",
    prompt:
      "Which Pokémon type(s) feels most aligned with you right now?",
    options: [
      { id: "a", label: "Water & Grass",    weight: { vaporeon: 2, leafeon: 2 } },
      { id: "b", label: "Psychic & Fairy",  weight: { espeon: 2, sylveon: 2 } },
      { id: "c", label: "Fire & Electric",  weight: { flareon: 2, jolteon: 2 } },
      { id: "d", label: "Ice & Dark",       weight: { glaceon: 2, umbreon: 2 } },
    ],
  },
  {
    id: "q9",
    kind: "choice",
    prompt:
      "What kind of “trainer role” do you play in your world or your creative practice?",
    options: [
      { id: "a", label: "The Reflector",  weight: { umbreon: 2, espeon: 1 } },
      { id: "b", label: "The Challenger", weight: { flareon: 2, jolteon: 1 } },
      { id: "c", label: "The Healer",     weight: { sylveon: 2, leafeon: 1 } },
      { id: "d", label: "The Visionary",  weight: { espeon: 2 } },
      { id: "e", label: "The Collector",  weight: { glaceon: 1, vaporeon: 1, umbreon: 1 } },
    ],
  },
  {
    id: "q10",
    kind: "choice",
    prompt:
      "What part of yourself feels the most rare: the part you want to protect or show more often?",
    options: [
      { id: "a", label: "The part I want to protect", weight: { umbreon: 2, vaporeon: 1 } },
      { id: "b", label: "The part I want to show more", weight: { sylveon: 2, flareon: 1 } },
    ],
  },
  {
    id: "q11",
    kind: "choice",
    prompt: "What season of your journey are you currently in?",
    options: [
      { id: "a", label: "Beginning Something New",  weight: { jolteon: 2, flareon: 1 } },
      { id: "b", label: "Growing and Refining",     weight: { leafeon: 2 } },
      { id: "c", label: "Letting Go and Reassessing", weight: { umbreon: 2 } },
      { id: "d", label: "Resting and Recharging",   weight: { vaporeon: 2, glaceon: 1 } },
    ],
  },
  {
    id: "q12",
    kind: "choice",
    prompt: "When your energy feels out of sync, what helps you realign?",
    options: [
      { id: "a", label: "Spending time alone",        weight: { umbreon: 2, espeon: 1 } },
      { id: "b", label: "Connecting with others",     weight: { sylveon: 2 } },
      { id: "c", label: "Creating something new",     weight: { flareon: 2, jolteon: 1 } },
      { id: "d", label: "Returning to familiar comforts", weight: { vaporeon: 2, leafeon: 1 } },
    ],
  },

  {
    id: "q13",
    kind: "text",
    prompt:
      "What are you currently evolving toward in your work, creativity, or life?",
    placeholder: "Type a short response…",
  },
  {
    id: "q14",
    kind: "text",
    prompt:
      "What Pokémon card do you wish represented you but doesn’t yet? What would need to change?",
    placeholder: "Type a short response…",
  },
  {
    id: "q15",
    kind: "text",
    prompt:
      "What phrase or motto captures the energy you want to bring forward in your next steps?",
    placeholder: "Type a short response…",
  },
];

// Some questions we consider "decisive" for tie-breaks
const DECISIVE = new Set(["q5", "q12"]);

// ---------- Utils ----------
function scoreAnswers(answerMap: Record<string, { weight: Partial<Record<(typeof EVOS)[number], number>> }>) {
  const tally: Record<string, number> = {};
  Object.entries(answerMap).forEach(([qid, opt]) => {
    if (!opt) return;
    const mult = DECISIVE.has(qid) ? 1.5 : 1;
    Object.entries(opt.weight || {}).forEach(([k, v]) => {
      tally[k] = (tally[k] || 0) + (v || 0) * mult;
    });
  });
  const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const winner = entries[0]?.[0] ?? null;
  const top3 = entries.slice(0, 3);
  return { tally, winner, top3 };
}

// Smooth scroll helper
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Intersection observer hook for active nav
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) setActive(visible[0].target.id);
      },
      {
        root: null,
        rootMargin: "-40% 0px -50% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    const nodes: HTMLElement[] = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => n !== null);

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

// ---------- UI Bits ----------
const Nav = ({ sections }: { sections: { id: string; label: string }[] }) => {
  const active = useActiveSection(sections.map((s) => s.id));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b-2 border-black/20 bg-[#F5F5F5]/80 backdrop-blur-md shadow-[0_4px_0_#000]/30">
      <div className="mx-auto max-w-screen-2xl h-16 px-6 flex items-center">

        {/* Pixel Title */}
        <div className="font-retro text-[10px] md:text-xs tracking-wider select-none text-[#1A1A1A]">
          Your Pokémon ✧
        </div>

        <div className="flex-1" />

        {/* Game Boy Bubble Menu */}
        <div
          role="tablist"
          aria-label="Site sections"
          className="flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar
                     rounded-full bg-white/80 border-2 border-black/40 px-3 py-1 shadow-[0_3px_0_#000]"
        >
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
                onClick={() => scrollToId(s.id)}
                className={`font-retro text-[9px] md:text-[11px] px-3.5 py-1 rounded-full transition
                            border-2 shadow-[0_2px_0_#000]
                  ${isActive
                    ? "bg-[#FADDEB] border-black text-black"
                    : "bg-white border-black/50 text-black hover:bg-[#FADDEB]/50"
                  }`}
              >
                {isActive ? `✧ ${s.label}` : s.label}
              </button>
            );
          })}
        </div>

      </div>
    </nav>
  );
};

const Section = ({ id, children, className = "" }: { id: string; children: React.ReactNode; className?: string }) => (
  <section id={id} className={`min-h-[100svh] w-full ${className}`}>{children}</section>
);

const Progress = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div className="h-full bg-black transition-all" style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
);

const PlaceholderPolaroid = ({
  title,
  subtitle,
  imgSrc,
}: {
  title: string;
  subtitle?: string;
  imgSrc?: string; // NEW
}) => (
  <div className="mx-auto w-full max-w-md rounded-xl border bg-white shadow-sm overflow-hidden">
    <div className="aspect-square w-full grid place-items-center bg-gradient-to-b from-white to-gray-50">
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={title}
          className="w-full h-full object-contain p-4"
          loading="lazy"
        />
      ) : (
        <div className="text-center">
          <div className="text-4xl">✧</div>
          <div className="text-sm text-gray-500 mt-2">Image placeholder</div>
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="text-xl font-semibold">{title}</h3>
      {subtitle && <p className="mt-2 text-gray-700 leading-relaxed">{subtitle}</p>}
    </div>
  </div>
);

// 4x4 binder grid with placeholders
const BinderGrid16 = ({
  images = [],
  theme = "pink",
}: {
  images?: string[];
  theme?: "pink" | "violet" | "emerald" | "slate" | "sky" | "amber" | "cyan";
}) => {
  const themeBorder: Record<string, string> = {
    pink: "border-pink-300",
    violet: "border-violet-300",
    emerald: "border-emerald-300",
    slate: "border-slate-300",
    sky: "border-sky-300",
    amber: "border-amber-300",
    cyan: "border-cyan-300",
  };

  const cells = images.slice(0, 16);
  const pad = Math.max(0, 16 - cells.length);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cells.map((src, i) => (
        <div
          key={i}
          className={`aspect-[3/4] rounded-xl border ${themeBorder[theme]} bg-white/90 overflow-hidden
                      shadow hover:shadow-md transition`}
        >
          <img src={src} alt="" className="w-full h-full object-contain p-2" />
        </div>
      ))}
      {Array.from({ length: pad }).map((_, i) => (
        <div
          key={`pad-${i}`}
          className={`aspect-[3/4] rounded-xl border ${themeBorder[theme]} bg-white/70
                      flex items-center justify-center text-xs text-gray-500`}
        >
          Coming Soon
        </div>
      ))}
    </div>
  );
};


// ---------- Main App ----------
export default function App() {
  const sections = [
    { id: "welcome", label: "Welcome" },
    { id: "assessment", label: "Personal Assessment" },
    { id: "results", label: "Your Results" },
    { id: "you", label: "This is You" },
    { id: "collection", label: "Your Mini Collection" },
  ];

  const [answers, setAnswers] = useState<Record<string, { id: string; label: string; weight: any }>>({});
  const [name, setName] = useState("");
  const answered = Object.keys(answers).length;
  const progress = answered / QUESTIONS.length;

  const { winner, top3 } = useMemo(() => scoreAnswers(answers), [answers]);
  const activeMeta = winner ? EVO_META[winner as keyof typeof EVO_META] : null;

  return (
    <div className="relative min-h-screen w-full text-gray-900">
      {/* Background image layer */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {/* Put /public/bg-city.jpg here (download the image into /public first) */}
        <div className="absolute inset-0 bg-[url('/eevee3.jpg')] bg-cover bg-center bg-fixed" />
        {/* Soft glassy wash for readability */}
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />
      </div>

      <Nav sections={sections} />

      {/* 1) WELCOME */}
      <Section
        id="welcome"
        className="grid place-items-center pt-20 pb-50 text-center" 
      >
        <div className="max-w-4xl mx-auto px-6 mt-72 md:mt-56 lg:mt-64">

          {/* Retro Title */}
          <h1 className="font-retro text-[0.1rem] md:text-[1.23rem] leading-tight text-gray-900 drop-shadow-[0_1px_0_#ffffff]">
            <span className="animate-fade-in">Every trainer has a story,</span><br />
            <span className="opacity-0 animate-fade-in-delayed block">
              but every story begins with a spark within.
            </span>
          </h1>
          

          {/* Retro Tagline */}
          <p className="font-retro font-crisp text-[0.5rem] md:text-[0.7rem] text-gray-800 mt-4 opacity-95">
            Discover your personalized Pokémon, energy type, and card collection.
          </p>

          {/* Retro Button */}
          <div className="mt-96 inline-block prism-border"> 
            <button
              onClick={() => scrollToId("assessment")}
              className="retro-btn glow-button font-retro font-crisp text-[0.75rem] px-6 py-3 transition hover:translate-y-[1px] active:translate-y-[3px]"
            >
              Begin Your Journey ✦
            </button>
          </div>

        </div>
      </Section>

      {/* 2) PERSONAL ASSESSMENT (Intro + Quiz) */}
      <Section id="assessment" className="pt-20">
        {/* Intro panel */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="rounded-2xl bg-black text-white p-8 shadow">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold">Personal Assessment ₊✩‧₊˚౨ৎ˚₊✩‧₊</h2>
                <p className="mt-2 text-white/80">Discover your personal unique Pokémon assets through the following questions..</p>
              </div>
              <button onClick={() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" })} 
              className="glow-button px-5 py-3 rounded-xl bg-white text-black font-semibold border-2 border-black shadow-[0_4px_0_#000]
                         transition hover:translate-y-[1px] active:translate-y-[3px]"
              >
                Click to continue ✦
              </button>
            </div>
          </div>
        </div>

        {/* Quiz section */}
        <div id="quiz" className="max-w-3xl mx-auto px-6 pb-16">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Progress value={progress} />
              <span className="text-sm tabular-nums">{Math.round(progress * 100)}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{answered} / {QUESTIONS.length} answered</p>
          </div>

          <div className="grid gap-6">
            {QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="p-5 bg-black text-white rounded-2xl border-2 border-black shadow-[0_4px_0_#000]"
              >
                <h3 className="text-lg font-semibold mb-4">{q.prompt}</h3>

                {/* Choice vs Text */}
                {"kind" in q && q.kind === "choice" ? (
                  <div className="grid gap-2">
                    {q.options.map((opt) => {
                      const selected = answers[q.id]?.id === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`cursor-pointer rounded-xl px-4 py-3 border-2 font-retro text-[0.8rem]
                                      transition-all duration-200 shadow-[0_3px_0_#000]
                                      ${selected
                                        ? "bg-white text-black border-pink-400 sylveon-glow"
                                        : "bg-neutral-900 text-white border-neutral-700 hover:border-pink-300 hover:sylveon-glow-soft"}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            className="mr-2"
                            checked={selected}
                            onChange={() =>
                              setAnswers((s) => ({ ...s, [q.id]: opt }))
                            }
                          />
                          {opt.label}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <input
                      type="text"
                      placeholder={(q as any).placeholder || "Type your answer…"}
                      value={answers[q.id]?.label || ""}
                      onChange={(e) =>
                        setAnswers((s) => ({
                          ...s,
                          [q.id]: { id: "text", label: e.target.value, weight: {} },
                        }))
                      }
                      className="w-full rounded-xl px-4 py-3 bg-white text-black border-2 border-black
                                 font-retro text-[0.8rem] shadow-[0_3px_0_#000]
                                 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => scrollToId("results")}
              disabled={answered < QUESTIONS.length}
              className="
                sylveon-glow
                px-5 py-3 rounded-2x1 font-retro text-[0.85rem]
                bg-black text-white border-2 border-black
                shadow-[0_4px_0_#000]
                disabled:opacity-40 disabled:shadow-none disabled:translate-y-0
                translation active:translate-y-[3px] active:shadow-none
              "
            >
              See my result
            </button>
            <button onClick={() => setAnswers({})} className="px-5 py-3 rounded-2xl border font-semibold">Reset</button>
          </div>
        </div>
      </Section>

      {/* 3) YOUR RESULTS (Energy + Pokémon) */}
      <Section id="results" className={`pt-20 bg-gradient-to-b ${activeMeta?.palette.bg || "from-pink-50 to-rose-100"}`}>
        <div className="max-w-5xl mx-auto px-6 py-12 grid gap-12">
          {/* Energy */}
          <div id="energy" className="grid place-items-center">
            <div className={`w-full max-w-xl rounded-2xl border ${activeMeta?.palette.card || "bg-white"} bg-white shadow-sm p-6"`}>
              <div className="mb-3 text-xs font-semibold tracking-widest text-center">YOUR ENERGY TYPE</div>
              <div className="grid gap-3 text-center">
                <div className="text-4xl">✶</div>
                <h3 className={`text-2xl font-semibold ${activeMeta?.palette.accent || ""}`}>{activeMeta?.energy || "Your Energy"}</h3>
                <p className="text-gray-700">{activeMeta?.hook || "Answer the questions to reveal your energy."}</p>
              </div>
            </div>
          </div>

          {/* Pokémon */}
          <div id="pokemon" className="grid place-items-center">
            <PlaceholderPolaroid title={activeMeta?.label || "Your Pokémon"} subtitle={activeMeta?.hook} imgSrc={activeMeta?.img} />
            {top3?.length ? (
              <div className="mt-4 text-sm text-gray-600">
                Close contenders: {top3.map(([k]) => EVO_META[k as keyof typeof EVO_META]?.label).filter(Boolean).slice(1).join(", ")}
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      {/* 4) THIS IS YOU */}
      <Section id="you" className="pt-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-16 grid gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center">This is You</h2>
          <div className="mx-auto w-full max-w-md rounded-xl border bg-white shadow-sm p-5">
            <div className="mb-4">
              <label className="text-sm text-gray-600">Your name (optional)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your name"
                className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <div className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border bg-white shadow-lg mb-4">
              {activeMeta?.traitCard ? (
                <img
                  src={activeMeta.traitCard}
                  alt={`${activeMeta.label} Trait Card`}
                  className="w-full h-full object-contain p-4"
                  loading="lazy"
                />
              ) : (
              <div className="text-center">
                <div className="text-4xl">☽</div>
                <div className="text-sm text-gray-500 mt-2">Trait card placeholder</div>
              </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold">
                {name ? `${name}'s Traits` : "Your Traits"}
              </h3>
              
              <div className="mt-2 font-medium text-[0.95rem]">
                {activeMeta?.traitCardLabel || "Your signature card will appear here."}
              </div>

              {activeMeta?.traitLine && (
                <p className="mt-1 text-gray-600 text-sm leading-relaxed">
                  {activeMeta.traitLine}
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* 5) YOUR MINI COLLECTION (4x4 placeholders) */}
      <Section id="collection" className="pt-20">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">Your Mini Collection</h2>
          <p className="text-center text-gray-600 mb-8">A themed 4×4 binder page curated for your result.</p>
          {(() => {
            const theme =
              (winner as any) === "espeon"   ? "violet"  :
              (winner as any) === "sylveon"  ? "pink"    :
              (winner as any) === "leafeon"  ? "emerald" :
              (winner as any) === "glaceon"  ? "cyan"    :
              (winner as any) === "umbreon"  ? "slate"   :
              (winner as any) === "vaporeon" ? "sky"     :
              (winner as any) === "jolteon"  ? "amber"   :
              (winner as any) === "flareon"  ? "amber"  :
              "pink";

            const binderImages = winner ? COLLECTIONS[winner as (typeof EVOS)[number]] : [];
            
            return (
              <div className="grid place-items-center">
                <BinderGrid16 images={binderImages} theme={theme} />
                {!winner && (
                  <div className="mt-4 text-sm text-gray-500">
                    Answer the questions to reveal a curated 4×4!
                  </div>
                )}
                {winner && binderImages.length === 0 && (
                  <div className="mt-4 text-sm text-gray-500">
                    No images found for {EVO_META[winner as keyof typeof EVO_META].label}.
                    Add files to <code className="px-1 py-0.5 bg-gray-100 rounded">src/assets/collections/{winner}</code>.
                  </div>
                )}  
              </div>
            );
          })()}
          </div>
      </Section>

      <footer className="py-10 text-center text-xs text-gray-500">
        © Senior Capstone Project | Anna Yim.
      </footer>
    </div>
  );
}
