'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Event } from '@/types/event';
import Link from 'next/link';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentDateRef = useRef(currentDate);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const weekStart = startOfWeek(currentDateRef.current);
      const weekEnd = endOfWeek(currentDateRef.current);
      
      const response = await fetch(`/api/events?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    currentDateRef.current = currentDate;
    fetchEvents();
  }, [currentDate, fetchEvents]);

  const handlePreviousWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  const weekStart = startOfWeek(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <CalendarIcon className="h-5 w-5" />
            <div className="ml-3 mr-3">
              <h1 className="text-sm font-medium leading-none">Calendar</h1>
              <div className="text-xs text-muted-foreground mt-1">
                {format(weekStart, 'MMM d')} - {format(endOfWeek(currentDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handleNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {error && (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        )}
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading events...
          </div>
        ) : (
          <div className="grid grid-cols-8 h-full">
            {/* Time column */}
            <div className="border-r">
              <div className="h-[60px] border-b flex items-center justify-center text-sm font-medium">
                Time
              </div>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b flex items-center justify-center text-sm text-muted-foreground"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Days columns */}
            {days.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r last:border-r-0 relative">
                <div className="h-[60px] border-b flex items-center justify-center text-sm font-medium">
                  {format(day, 'EEE')}
                  <br />
                  {format(day, 'd')}
                </div>
                <div className="relative" style={{ height: '1440px' }}>
                  {getEventsForDay(day).map((event) => (
                    <div key={event.id} className="relative w-full" style={{
                      position: 'absolute',
                      top: `${(new Date(event.start_time).getHours() * 60 + new Date(event.start_time).getMinutes())}px`,
                      left: 0,
                      right: 0,
                      zIndex: 1
                    }}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/calendar/events/${event.id}`}
                              className="p-2 text-xs rounded-md block hover:opacity-90 transition-opacity w-full"
                              style={{
                                height: `${((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / (1000 * 60))}px`,
                                backgroundColor: event.color || '#00603A',
                                color: 'white'
                              }}
                            >
                              <div className="font-medium">{event.title}</div>
                              <div className="text-white/80">
                                {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                              </div>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.start_time), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs">
                                {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 