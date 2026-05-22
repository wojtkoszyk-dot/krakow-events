import {
  addDaysISO,
  formatDisplayDate,
  getKrakowTodayISO,
} from "@/lib/dates";
import { assignEventDescriptions } from "@/lib/event-descriptions";
import type { EventCategory } from "@/lib/taxonomy";

export type { EventCategory };

export type Event = {
  id: string;
  title: string;
  date: string;
  startsOn: string;
  endsOn?: string;
  time: string;
  venue: string;
  district: string;
  category: EventCategory;
  tags: string[];
  price: string;
  /** Original / Polish copy (imports, PL UI). */
  descriptionPl: string;
  /** English copy for EN UI; falls back to PL when missing. */
  descriptionEn: string;
  imageUrl: string;
  trending?: boolean;
  /** Set when published from an import source (e.g. Karnet). */
  sourceName?: string;
  sourceUrl?: string;
};

type EventSeed = Omit<Event, "date" | "startsOn" | "descriptionPl" | "descriptionEn"> & {
  dayOffset: number;
  spanDays?: number;
  description: string;
};

function buildEvents(): Event[] {
  const today = getKrakowTodayISO();

  const seeds: EventSeed[] = [
    {
      id: "1",
      dayOffset: 0,
      title: "Szpitalna: Warehouse Session",
      time: "22:30",
      venue: "Szpitalna 1",
      district: "Kazimierz",
      category: "nightlife",
      tags: ["techno", "rave", "electronic", "dj", "warehouse"],
      price: "45 PLN",
      description:
        "Raw warehouse techno in a former hospital wing. Limited capacity, no phones on the dancefloor after midnight.",
      imageUrl:
        "https://images.unsplash.com/photo-1571266028243-e68f8570c9e9?w=800&q=80",
      trending: true,
    },
    {
      id: "2",
      dayOffset: 0,
      title: "English Comedy Night",
      time: "20:00",
      venue: "ICE Kraków",
      district: "Grzegórzki",
      category: "comedy",
      tags: ["stand-up", "english", "live"],
      price: "60 PLN",
      description:
        "English-language stand-up with visiting comics from the UK and Poland’s expat scene. Bar from 18:30.",
      imageUrl:
        "https://images.unsplash.com/photo-1585699323581-25a0c37916a5?w=800&q=80",
    },
    {
      id: "3",
      dayOffset: 0,
      spanDays: 30,
      title: "Starmach: Polish Post-War",
      time: "12:00",
      venue: "Galeria Starmach",
      district: "Zabłocie",
      category: "culture",
      tags: ["exhibition", "gallery", "art"],
      price: "25 PLN",
      description:
        "Paintings and works on paper from the Polish post-war avant-garde — the Kraków Group in dialogue.",
      imageUrl:
        "https://images.unsplash.com/photo-1561214115-f2f40fdefe0c?w=800&q=80",
    },
    {
      id: "4",
      dayOffset: 0,
      spanDays: 90,
      title: "MOCAK: New Media Now",
      time: "11:00",
      venue: "MOCAK",
      district: "Zabłocie",
      category: "culture",
      tags: ["museum", "exhibition", "art", "new media"],
      price: "32 PLN",
      description:
        "Survey of Polish new media art — video, installation, and interactive works across four galleries.",
      imageUrl:
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80",
      trending: true,
    },
    {
      id: "5",
      dayOffset: 0,
      title: "Hawelka: Old Town Dinner",
      time: "19:00",
      venue: "Restauracja Hawelka",
      district: "Old Town",
      category: "food-drink",
      tags: ["restaurant", "polish", "live music", "date-night"],
      price: "from 85 PLN",
      description:
        "Classic Polish tasting menu in a historic cellar — pierogi, duck, and live folk music on weekends.",
      imageUrl:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    },
    {
      id: "6",
      dayOffset: 1,
      title: "NOSPR: Brahms & Dvořák",
      time: "19:00",
      venue: "NOSPR",
      district: "Grzegórzki",
      category: "music",
      tags: ["concert", "classical", "live music"],
      price: "90 PLN",
      description:
        "Philharmonic orchestra performs Brahms’ Fourth Symphony and Dvořák’s Cello Concerto.",
      imageUrl:
        "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80",
      trending: true,
    },
    {
      id: "7",
      dayOffset: 1,
      title: "PROZAK: Friday Warm-up",
      time: "23:00",
      venue: "Prozak 2.0",
      district: "Old Town",
      category: "nightlife",
      tags: ["techno", "electronic", "dj", "club"],
      price: "40 PLN",
      description:
        "Two-floor techno with local residents warming up for the weekend. Industrial room and main hall.",
      imageUrl:
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    },
    {
      id: "8",
      dayOffset: 1,
      title: "Szara Ges: Craft Beer & Tapas",
      time: "18:00",
      venue: "Szara Ges w Kuchni",
      district: "Old Town",
      category: "food-drink",
      tags: ["beer", "restaurant", "cocktails", "date-night"],
      price: "from 55 PLN",
      description:
        "Michelin-recognized kitchen meets Polish craft beers — small plates and seasonal menu on the Main Square.",
      imageUrl:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    },
    {
      id: "9",
      dayOffset: 2,
      title: "PROZAK: Saturday Techno",
      time: "23:00",
      venue: "Prozak 2.0",
      district: "Old Town",
      category: "nightlife",
      tags: ["techno", "rave", "electronic", "dj"],
      price: "50 PLN",
      description:
        "All-night techno — secret guest from Berlin, late kitchen, two dancefloors until sunrise.",
      imageUrl:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
      trending: true,
    },
    {
      id: "10",
      dayOffset: 2,
      title: "Kabaret pod Wyrwigroszem",
      time: "19:30",
      venue: "Teatr Variété",
      district: "Old Town",
      category: "comedy",
      tags: ["cabaret", "live", "polish"],
      price: "70 PLN",
      description:
        "Kraków cabaret institution — political satire, sketches, and live piano. Dress smart-casual.",
      imageUrl:
        "https://images.unsplash.com/photo-1527224857832-7ffh891fa8f0?w=800&q=80",
    },
    {
      id: "11",
      dayOffset: 2,
      title: "Hype Park: Open Air Live",
      time: "18:00",
      venue: "Hype Park",
      district: "Grzegórzki",
      category: "music",
      tags: ["indie", "electronic", "live music", "outdoor", "open air"],
      price: "80 PLN",
      description:
        "Outdoor indie-electronic in a converted steelworks yard — food trucks and Vistula sunsets.",
      imageUrl:
        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    },
    {
      id: "12",
      dayOffset: 3,
      title: "Jazz at Stara Zajezdnia",
      time: "19:30",
      venue: "Stara Zajezdnia",
      district: "Kazimierz",
      category: "music",
      tags: ["jazz", "live music"],
      price: "55 PLN",
      description:
        "Sunday jazz session in a tram depot turned brewery — local quartet and guest vocalists.",
      imageUrl:
        "https://images.unsplash.com/photo-1415201364779-f6f0bb50f551?w=800&q=80",
    },
    {
      id: "13",
      dayOffset: 3,
      title: "Forum: Sunday Market",
      time: "11:00",
      venue: "Forum Przestrzenie",
      district: "Podgórze",
      category: "food-drink",
      tags: ["market", "free", "outdoor", "dj"],
      price: "Free",
      description:
        "Riverside food market with local bakers, natural wine, and DJ sets from noon. Bring cash.",
      imageUrl:
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    },
    {
      id: "14",
      dayOffset: 4,
      title: "Tauron Arena: Khruangbin",
      time: "20:00",
      venue: "Tauron Arena Kraków",
      district: "Czyżyny",
      category: "music",
      tags: ["concert", "live music", "indie"],
      price: "from 180 PLN",
      description:
        "Psychedelic soul trio on their European tour — hypnotic grooves and a visually rich live show.",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      trending: true,
    },
    {
      id: "15",
      dayOffset: 5,
      title: "Re: Publica: Techno Tuesday",
      time: "22:00",
      venue: "Klub RE",
      district: "Kazimierz",
      category: "nightlife",
      tags: ["techno", "electronic", "dj", "club"],
      price: "35 PLN",
      description:
        "Weekly techno night in Kazimierz — rotating Polish and EU selectors, smoke and strobes.",
      imageUrl:
        "https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=800&q=80",
    },
    {
      id: "16",
      dayOffset: 5,
      title: "Stand-up PL: Open Mic",
      time: "20:30",
      venue: "Pod Baranami Cinema",
      district: "Old Town",
      category: "comedy",
      tags: ["stand-up", "open mic", "student"],
      price: "30 PLN",
      description:
        "Polish-language open mic — new material from Kraków comics, two-drink minimum in the bar.",
      imageUrl:
        "https://images.unsplash.com/photo-1505373877841-8d25f39d4666?w=800&q=80",
    },
    {
      id: "17",
      dayOffset: 6,
      spanDays: 60,
      title: "Leonardo — The Machines",
      time: "10:00",
      venue: "National Museum",
      district: "Old Town",
      category: "culture",
      tags: ["museum", "exhibition", "family"],
      price: "28 PLN",
      description:
        "Working reconstructions of Leonardo’s inventions — family-friendly, audio guides in EN/PL.",
      imageUrl:
        "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&q=80",
    },
    {
      id: "18",
      dayOffset: 7,
      title: "Piekarzy: Natural Wine Night",
      time: "18:30",
      venue: "Piekarzy i Wędliny",
      district: "Kazimierz",
      category: "food-drink",
      tags: ["wine", "cocktails", "date-night"],
      price: "from 120 PLN",
      description:
        "Natural wine pairings with charcuterie boards — sommelier on hand, reservations recommended.",
      imageUrl:
        "https://images.unsplash.com/photo-1510812431408-41bd2e49090a?w=800&q=80",
    },
    {
      id: "19",
      dayOffset: 8,
      title: "Bunkier: Contemporary Lecture",
      time: "18:00",
      venue: "Bunkier Sztuki",
      district: "Old Town",
      category: "culture",
      tags: ["gallery", "exhibition", "art", "lecture"],
      price: "18 PLN",
      description:
        "Curator talk on Central European video art — exhibition access included, Q&A in English.",
      imageUrl:
        "https://images.unsplash.com/photo-1460661419347-7a89a1b4a6b6?w=800&q=80",
    },
    {
      id: "20",
      dayOffset: 9,
      title: "Studio: Indie Night",
      time: "21:00",
      venue: "Studio Koncertowe",
      district: "Podgórze",
      category: "music",
      tags: ["indie", "live music", "concert"],
      price: "65 PLN",
      description:
        "Triple bill of Polish indie bands — early bird tickets include a craft beer at the bar.",
      imageUrl:
        "https://images.unsplash.com/photo-1454927775289-0f9d503a76f3?w=800&q=80",
    },
    {
      id: "21",
      dayOffset: 10,
      title: "Shine: Deep House",
      time: "23:30",
      venue: "Shine Club",
      district: "Kazimierz",
      category: "nightlife",
      tags: ["dance", "electronic", "dj", "club"],
      price: "40 PLN",
      description:
        "Deep house and minimal all night — intimate basement club, cash bar only.",
      imageUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    },
    {
      id: "23",
      dayOffset: 2,
      title: "Planty: Free Walking Tour",
      time: "10:00",
      venue: "Rynek Główny",
      district: "Old Town",
      category: "community",
      tags: ["free", "outdoor", "walking tour"],
      price: "Free",
      description:
        "Volunteer-led walk around the Old Town and Planty Park — tips welcome, no booking required.",
      imageUrl:
        "https://images.unsplash.com/photo-1555990798-7f1b07c90683?w=800&q=80",
    },
    {
      id: "22",
      dayOffset: 11,
      title: "Komedialnia: Improv Battle",
      time: "20:00",
      venue: "Komedialnia",
      district: "Podgórze",
      category: "comedy",
      tags: ["improv", "stand-up", "live"],
      price: "45 PLN",
      description:
        "Two teams improvise scenes from audience suggestions — fast, loud, and fully in Polish.",
      imageUrl:
        "https://images.unsplash.com/photo-1527224857832-7ff8891fa8f0?w=800&q=80",
    },
  ];

  return seeds.map((seed) => {
    const startsOn = addDaysISO(today, seed.dayOffset);
    const endsOn = seed.spanDays
      ? addDaysISO(startsOn, seed.spanDays)
      : undefined;
    const { dayOffset: _d, spanDays: _s, description, ...rest } = seed;
    const { descriptionPl, descriptionEn } = assignEventDescriptions(description, {
      title: rest.title,
      venue: rest.venue,
    });
    return {
      ...rest,
      descriptionPl,
      descriptionEn,
      startsOn,
      endsOn,
      date: endsOn
        ? `${formatDisplayDate(startsOn)} — ${formatDisplayDate(endsOn)}`
        : formatDisplayDate(startsOn),
    };
  });
}

/** Local seed data — used when Supabase has no rows or is unreachable. */
export function getMockEvents(): Event[] {
  return buildEvents();
}

/** Sync access to mock seeds (client utilities). Prefer `loadPublicEvents()` on the server. */
export function getEvents(): Event[] {
  return getMockEvents();
}
