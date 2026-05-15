export type Category = {
  id: string;
  label: string;
  emoji: string;
};

export type Event = {
  id: string;
  title: string;
  /** Display label shown on cards */
  date: string;
  /** ISO date (YYYY-MM-DD) in Europe/Warsaw — used for tonight filter */
  startsOn: string;
  /** Inclusive end date for multi-day / running events */
  endsOn?: string;
  location: string;
  category: string;
  description: string;
  time: string;
  gradient: string;
  trending?: boolean;
};

export const categories: Category[] = [
  { id: "clubs", label: "Techno & clubs", emoji: "◉" },
  { id: "concerts", label: "Concerts", emoji: "♪" },
  { id: "standup", label: "Stand-up", emoji: "▣" },
  { id: "exhibitions", label: "Exhibitions", emoji: "◇" },
];

export const events: Event[] = [
  {
    id: "1",
    title: "PROZAK: Saturday Techno",
    date: "Sat 16 May 2026",
    startsOn: "2026-05-16",
    location: "Prozak 2.0, Floriańska 18",
    category: "Techno & clubs",
    description:
      "All-night techno on two floors — local residents and a secret guest from Berlin. Industrial sound, late kitchen.",
    time: "23:00",
    gradient: "from-violet-950 via-purple-900/70 to-black",
    trending: true,
  },
  {
    id: "2",
    title: "Szpitalna: Warehouse Session",
    date: "Fri 15 May 2026",
    startsOn: "2026-05-15",
    location: "Szpitalna 1, Szpitalna 1",
    category: "Techno & clubs",
    description:
      "Raw warehouse techno in a former hospital wing. Limited capacity, no phones on the dancefloor policy after midnight.",
    time: "22:30",
    gradient: "from-zinc-900 via-slate-800 to-black",
    trending: true,
  },
  {
    id: "3",
    title: "NOSPR: Brahms & Dvořák",
    date: "Sun 17 May 2026",
    startsOn: "2026-05-17",
    location: "NOSPR, ul. Pawła 2",
    category: "Concerts",
    description:
      "Kraków Philharmonic Orchestra performs Brahms’ Fourth Symphony and Dvořák’s Cello Concerto with soloist Marcin Zdunik.",
    time: "19:00",
    gradient: "from-amber-950/90 via-rose-950/40 to-black",
    trending: true,
  },
  {
    id: "4",
    title: "Tauron Arena: Khruangbin",
    date: "Wed 20 May 2026",
    startsOn: "2026-05-20",
    location: "Tauron Arena Kraków, Lema 7",
    category: "Concerts",
    description:
      "Psychedelic soul trio Khruangbin on their European tour — expect hypnotic grooves and a visually rich live show.",
    time: "20:00",
    gradient: "from-orange-950 via-red-950/50 to-black",
    trending: true,
  },
  {
    id: "5",
    title: "Stand-up: English Comedy Night",
    date: "Fri 15 May 2026",
    startsOn: "2026-05-15",
    location: "ICE Kraków Congress Centre",
    category: "Stand-up",
    description:
      "An evening of English-language stand-up with visiting comics from the UK and Poland’s expat scene. Bar open from 18:30.",
    time: "20:00",
    gradient: "from-rose-950/80 via-pink-950/40 to-black",
  },
  {
    id: "6",
    title: "Kabaret pod Wyrwigroszem",
    date: "Sat 16 May 2026",
    startsOn: "2026-05-16",
    location: "Teatr Variété, ul. św. Jana 15",
    category: "Stand-up",
    description:
      "Classic Kraków cabaret ensemble — sharp political satire, sketches, and live music. One of the city’s longest-running comedy institutions.",
    time: "19:30",
    gradient: "from-fuchsia-950/70 to-black",
  },
  {
    id: "7",
    title: "MOCAK: New Media Now",
    date: "Until 30 Aug 2026",
    startsOn: "2026-03-01",
    endsOn: "2026-08-30",
    location: "MOCAK, ul. Lipowa 4",
    category: "Exhibitions",
    description:
      "Survey of Polish new media art from the 1990s to today — video, installation, and interactive works across four galleries.",
    time: "11:00",
    gradient: "from-slate-800 via-zinc-900 to-black",
    trending: true,
  },
  {
    id: "8",
    title: "Leonardo da Vinci — The Machines",
    date: "Until 15 Jun 2026",
    startsOn: "2026-02-01",
    endsOn: "2026-06-15",
    location: "National Museum in Kraków, al. 3 Maja 1",
    category: "Exhibitions",
    description:
      "Working reconstructions of Leonardo’s inventions — flying machines, war engines, and anatomical studies. Family-friendly, audio guides included.",
    time: "10:00",
    gradient: "from-stone-800 via-neutral-900 to-black",
  },
  {
    id: "9",
    title: "Starmach Gallery: Polish Post-War",
    date: "Fri 15 May — Sun 14 Jun 2026",
    startsOn: "2026-05-15",
    endsOn: "2026-06-14",
    location: "Galeria Starmach, ul. Węgierska 5",
    category: "Exhibitions",
    description:
      "Paintings and works on paper from the Polish post-war avant-garde — Tadeusz Kantor’s circle and the Kraków Group in dialogue.",
    time: "12:00",
    gradient: "from-emerald-950/60 via-teal-950/30 to-black",
  },
  {
    id: "10",
    title: "Hype Park: Open Air Live",
    date: "Sat 16 May 2026",
    startsOn: "2026-05-16",
    location: "Hype Park, ul. Kamienna 15",
    category: "Concerts",
    description:
      "Outdoor concert series in a converted steelworks yard — indie electronic live acts, food trucks, and riverside sunsets.",
    time: "18:00",
    gradient: "from-indigo-950 via-blue-950/40 to-black",
  },
];

export const trendingEvents = events.filter((event) => event.trending);
