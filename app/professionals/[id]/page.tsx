'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, Clock, DollarSign, Calendar, CheckCircle, Globe, Award, BookOpen, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Professional {
  id: string;
  displayName: string;
  bio: string;
  languages: string[];
  certifications: string[];
  experience: string;
  accent: string;
  level: string;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  totalSessions: number;
  isVerified: boolean;
  verificationDate: string | null;
  user: {
    email: string;
    image?: string;
  };
  availability: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    booking: {
      learnerId: string;
    };
  }>;
  _count: {
    reviews: number;
    bookings: number;
  };
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ProfessionalProfilePage() {
  const params = useParams();
  const professionalId = params.id as string;
  
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(25);

  useEffect(() => {
    fetchProfessional();
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

  const handleBookSession = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time for your session');
      return;
    }
    
    const bookingUrl = `/book-session?professional=${professionalId}&date=${selectedDate}&time=${selectedTime}&duration=${duration}`;
    window.location.href = bookingUrl;
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

  const totalPrice = (professional.pricePerMinute * duration).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  {professional.user.image ? (
                    <img src={professional.user.image} alt={professional.displayName} className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">
                      {professional.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{professional.displayName}</h1>
                    {professional.isVerified && (
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">{professional.rating.toFixed(1)}</span>
                      <span>({professional.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-5 h-5" />
                      <span>{professional.totalSessions} sessions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold">${professional.pricePerMinute}/min</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {professional.languages.map((lang) => (
                      <span key={lang} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                        <Globe className="w-4 h-4 inline mr-1" />
                        {lang}
                      </span>
                    ))}
                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium">
                      {professional.level}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {professional.bio || 'No bio available'}
                </p>
              </div>
              
              {professional.experience && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Experience
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">{professional.experience}</p>
                </div>
              )}
              
              {professional.certifications && professional.certifications.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Certifications
                  </h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                    {professional.certifications.map((cert, index) => (
                      <li key={index}>{cert}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {professional.accent && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Accent</h3>
                  <p className="text-gray-600 dark:text-gray-300">{professional.accent}</p>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews ({professional.reviews.length})
              </h2>
              
              {professional.reviews.length > 0 ? (
                <div className="space-y-4">
                  {professional.reviews.map((review) => (
                    <div key={review.id} className="border-b dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No reviews yet</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Book a Session</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Select Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value={25}>25 minutes - ${totalPrice}</option>
                    <option value={50}>50 minutes - ${(professional.pricePerMinute * 50).toFixed(2)}</option>
                    <option value={60}>60 minutes - ${(professional.pricePerMinute * 60).toFixed(2)}</option>
                  </select>
                </div>
                
                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold">Total Price:</span>
                    <span className="text-2xl font-bold text-blue-600">${totalPrice}</span>
                  </div>
                  
                  <button
                    onClick={handleBookSession}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Book Session
                  </button>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    25% platform fee included • Free cancellation up to 24h before
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h3 className="font-semibold mb-2">Availability</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {professional.availability.length > 0 ? (
                    <div className="space-y-1">
                      {professional.availability
                        .filter(slot => slot.isAvailable)
                        .slice(0, 3)
                        .map((slot) => (
                          <div key={slot.id}>
                            {dayNames[slot.dayOfWeek]}: {slot.startTime} - {slot.endTime}
                          </div>
                        ))}
                      {professional.availability.filter(slot => slot.isAvailable).length > 3 && (
                        <div className="text-blue-600 dark:text-blue-400">
                          +{professional.availability.filter(slot => slot.isAvailable).length - 3} more days
                        </div>
                      )}
                    </div>
                  ) : (
                    <p>No availability set</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
