'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, DollarSign, CreditCard, User, Star, Globe } from 'lucide-react';
import Link from 'next/link';

interface Professional {
  id: string;
  displayName: string;
  bio: string;
  languages: string[];
  level: string;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  user: {
    email: string;
    image?: string;
  };
}

function BookingContent() {
  const searchParams = useSearchParams();
  const professionalId = searchParams.get('professional');
  const selectedDate = searchParams.get('date');
  const selectedTime = searchParams.get('time');
  const durationParam = searchParams.get('duration');

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: selectedDate || '',
    time: selectedTime || '',
    duration: Number(durationParam) || 25,
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    if (professionalId) {
      fetchProfessional();
    }
  }, [professionalId]);

  const fetchProfessional = async () => {
    try {
      const response = await fetch(`/api/professionals/${professionalId}`);
      const data = await response.json();
      setProfessional(data);
    } catch (error) {
      console.error('Error fetching professional:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!professional) return 0;
    return professional.pricePerMinute * bookingData.duration;
  };

  const calculatePlatformFee = () => {
    return calculatePrice() * 0.25;
  };

  const calculateTotal = () => {
    return calculatePrice() + calculatePlatformFee();
  };

  const handlePayment = async () => {
    if (!professional || !bookingData.date || !bookingData.time) {
      alert('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      const scheduledStart = new Date(`${bookingData.date}T${bookingData.time}`);
      const scheduledEnd = new Date(scheduledStart.getTime() + bookingData.duration * 60000);

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: professional.id,
          title: `${bookingData.duration}-minute ${professional.languages[0]} session`,
          description: bookingData.notes || 'Professional language session',
          language: professional.languages[0],
          maxParticipants: 1,
          pricePerMinute: professional.pricePerMinute,
          scheduledStart: scheduledStart.toISOString(),
          scheduledEnd: scheduledEnd.toISOString(),
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error('Failed to create session');
      }

      const session = await sessionResponse.json();

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professionalId: professional.id,
          sessionId: session.id,
          learnerId: 'current-user-id', // This should come from authentication
          totalPrice: calculateTotal(),
          platformFee: calculatePlatformFee(),
          professionalEarnings: calculatePrice(),
          notes: bookingData.notes,
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking');
      }

      const booking = await bookingResponse.json();
      setBookingId(booking.id);
      setBookingComplete(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <p className="text-gray-600 dark:text-gray-300">Professional not found</p>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Your session with {professional.displayName} has been booked successfully.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
              <div className="space-y-2 text-sm">
                <div><strong>Date:</strong> {bookingData.date}</div>
                <div><strong>Time:</strong> {bookingData.time}</div>
                <div><strong>Duration:</strong> {bookingData.duration} minutes</div>
                <div><strong>Total Paid:</strong> ${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Link href={`/dashboard`} className="block">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href={`/professionals/${professional.id}`} className="block">
                <Button variant="outline" className="w-full">View Professional Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href={`/professionals/${professional.id}`} className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Profile
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Book Your Session</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e: any) => setBookingData({ ...bookingData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={bookingData.time}
                        onChange={(e: any) => setBookingData({ ...bookingData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={bookingData.duration.toString()}
                      onValueChange={(value: any) => setBookingData({ ...bookingData, duration: Number(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 minutes - ${calculatePrice().toFixed(2)}</SelectItem>
                        <SelectItem value="50">50 minutes - ${(professional.pricePerMinute * 50).toFixed(2)}</SelectItem>
                        <SelectItem value="60">60 minutes - ${(professional.pricePerMinute * 60).toFixed(2)}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any specific topics or goals for this session?"
                      value={bookingData.notes}
                      onChange={(e: any) => setBookingData({ ...bookingData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Mock Payment:</strong> This is a demo payment system. In production, you would be redirected to a secure payment gateway.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Session Price ({bookingData.duration} min)</span>
                      <span>${calculatePrice().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (25%)</span>
                      <span>${calculatePlatformFee().toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || !bookingData.date || !bookingData.time}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Confirm & Pay'
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By booking, you agree to our cancellation policy and terms of service.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Professional Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      {professional.user.image ? (
                        <img src={professional.user.image} alt={professional.displayName} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                          {professional.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{professional.displayName}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{professional.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({professional.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-500" />
                      <span>{professional.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{professional.level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>${professional.pricePerMinute}/minute</span>
                    </div>
                  </div>

                  {professional.bio && (
                    <div className="mt-4 pt-4 border-t dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {professional.bio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
