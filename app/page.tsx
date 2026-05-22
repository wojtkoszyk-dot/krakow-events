import { EventsApp } from "@/components/events-app";
import { loadPublicEvents } from "@/lib/events-feed";

export const dynamic = "force-dynamic";

export default async function Home() {
  const events = await loadPublicEvents();
  return <EventsApp initialEvents={events} />;
}
