/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
import { getEvent } from "@/server/actions/events";
import { AlertTriangle } from "lucide-react";
import {
  addYears,
  eachMinuteOfInterval,
  endOfDay,
  roundToNearestMinutes,
} from "date-fns";
import { getValidTimesFromSchedule } from "@/server/actions/schedule";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clerkClient } from "@clerk/nextjs/server";

import NoTimeSlots from "@/components/NoTimeSlots";
import MeetingForm from "@/components/forms/MeetingForm";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ clerkUserId: string; eventId: string }>;
}) {
  const { clerkUserId, eventId } = await params;

  // Fetch the event details from the database using the provided user and event IDs
  const event = await getEvent(clerkUserId, eventId);
  // If event doesn't exist, show a 404 page
  if (!event)
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center gap-2 text-sm max-w-md mx-auto mt-6">
        <AlertTriangle className="w-5 h-5" />
        <span>This event doesn't exist anymore.</span>
      </div>
    );

  // Get the full user object from Clerk
  const client = await clerkClient();
  const calendarUser = await client.users.getUser(clerkUserId);

  // Define a date range from now (rounded up to the nearest 15 minutes) to 1 year later
  const startDate = roundToNearestMinutes(new Date(), {
    nearestTo: 15,
    roundingMethod: "ceil",
  });

  const endDate = endOfDay(addYears(startDate, 1)); // Set range to 1 year ahead

  // Generate valid available time slots for the event using the custom scheduler logic
  let validTimes: Date[] = [];
  try {
    validTimes = await getValidTimesFromSchedule(
      eachMinuteOfInterval({ start: startDate, end: endDate }, { step: 15 }),
      event
    );
  } catch (err: any) {
    // Render a user-facing error message when fetching calendar events (OAuth / API failures)
    return (
      <div className="max-w-md mx-auto mt-6 bg-yellow-50 border border-yellow-200 text-yellow-900 px-4 py-3 rounded-md">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5" />
          <div className="text-sm">
            <div className="font-medium">
              Unable to load calendar availability
            </div>
            <div className="mt-1 break-words">
              {err?.message ?? String(err)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              If this mentions OAuth or a Bad Request, ensure the user has
              connected their Google account and that your Clerk OAuth app is
              configured.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no valid time slots are available, show a message and an option to pick another event
  if (validTimes.length === 0) {
    return <NoTimeSlots event={event} calendarUser={calendarUser} />;
  }

  // Render the booking form with the list of valid available times
  return (
    <Card className="max-w-4xl mx-auto border-8 border-blue-200 shadow-2xl shadow-accent-foreground">
      <CardHeader>
        <CardTitle>
          Book {event.name} with {calendarUser.fullName}
        </CardTitle>
        {event.description && (
          <CardDescription>{event.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <MeetingForm
          validTimes={validTimes}
          eventId={event.id}
          clerkUserId={clerkUserId}
        />
      </CardContent>
    </Card>
  );
}
