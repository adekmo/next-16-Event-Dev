import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItems = ({ icon, alt, label }: {icon: string, alt: string, label: string}) => (
    <div className="flex-row-gap-2 items-center">
        <Image 
            src={icon}
            alt={alt}
            width={17}
            height={17}
        />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems}: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags }: { tags: string[]}) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div key={tag} className="pill">{tag}</div>
        ))}
    </div>
)

const EventDetailsPage = async ({ params }: { params: Promise<{ slug: string }>}) => {
    const slug = await params;

    let event;
    try {
        const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
            next: { revalidate: 60 }
        });

        if (!request.ok) {
            if (request.status === 404) {
                return notFound();
            }
            throw new Error(`Failed to fetch event: ${request.statusText}`);
        }

        const response = await request.json();
        event = response.event;

        if (!event) {
            return notFound();
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        return notFound();
    }

    if(!event) return notFound();

    const booking = 10;

    // const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(event.slug);
  return (
    <section id='event'>
        <div className="header">
            <h1>Event Description</h1>
            <p>{event.description}</p>
        </div>

        <div className="details">
            <div className="content">
                <Image 
                    src={event.image}
                    alt="Event Banner"
                    width={800}
                    height={800}
                    className="banner"
                />
                <section className="flex-col-gap-2">
                    <h2>Overview</h2>
                    <p>{event.overview}</p>
                </section>

                <section className="flex-col-gap-2">
                    <h2>Event Details</h2>
                    <EventDetailItems icon="/icons/calendar.svg" alt="calendar" label={event.date} />
                    <EventDetailItems icon="/icons/clock.svg" alt="clock" label={event.time} />
                    <EventDetailItems icon="/icons/location.svg" alt="location" label={event.location} />
                    <EventDetailItems icon="/icons/mode.svg" alt="mode" label={event.mode} />
                    <EventDetailItems icon="/icons/audience.svg" alt="audience" label={event.audience} />
                </section>
                <EventAgenda agendaItems={event.agenda[0]} />

                <section className="flex-col-gap-2">
                    <h2>About Organizer</h2>
                    <p>{event.organizer}</p>
                </section>

                <EventTags tags={JSON.parse(event.tags[0])} />
            </div>
            <aside className="booking">
                <div className="signup-card">
                    <h2>Book Your Spot</h2>
                    {booking > 0 ? (
                        <p className="text-sm ">
                            Join {booking} people who have already booed their spot.
                        </p>
                    ) : (
                        <p className="text-sm">Be the first to book your spot.</p>
                    )}
                </div>
                <BookEvent />
            </aside>
        </div>

        <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
                {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                    <EventCard key={similarEvent.title} {...similarEvent} />
                ))}
            </div>
        </div>
    </section>
  )
}

export default EventDetailsPage