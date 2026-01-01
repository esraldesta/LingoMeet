'use client';

import { useState, useEffect } from 'react';
import { Search, Star, Clock, DollarSign, Filter, CheckCircle } from 'lucide-react';
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
  totalSessions: number;
  isVerified: boolean;
  user: {
    email: string;
    image?: string;
  };
  _count: {
    reviews: number;
    bookings: number;
  };
}

interface ProfessionalsResponse {
  professionals: Professional[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    language: '',
    level: '',
    minRating: '',
    verified: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProfessionals = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.language && { language: filters.language }),
        ...(filters.level && { level: filters.level }),
        ...(filters.minRating && { minRating: filters.minRating }),
        ...(filters.verified && { verified: 'true' }),
      });

      const response = await fetch(`/api/professionals?${params}`);
      const data: ProfessionalsResponse = await response.json();
      
      setProfessionals(data.professionals);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [filters]);

  const filteredProfessionals = professionals.filter(professional =>
    professional.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Professional Language Tutors
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get personalized guidance from verified language professionals
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">All Languages</option>
                    <option value="english">English</option>
                    <option value="spanish">Spanish</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="italian">Italian</option>
                    <option value="portuguese">Portuguese</option>
                    <option value="chinese">Chinese</option>
                    <option value="japanese">Japanese</option>
                    <option value="korean">Korean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Rating</label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="verified" className="text-sm font-medium">
                    Verified Professionals Only
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, language, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {filteredProfessionals.map((professional) => (
                    <div key={professional.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {professional.user.image ? (
                            <img src={professional.user.image} alt={professional.displayName} className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                              {professional.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{professional.displayName}</h3>
                            {professional.isVerified && (
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                            {professional.bio || 'No bio available'}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {professional.languages.map((lang) => (
                              <span key={lang} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                                {lang}
                              </span>
                            ))}
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm">
                              {professional.level}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span>{professional.rating.toFixed(1)}</span>
                              <span>({professional.reviewCount} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{professional.totalSessions} sessions</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>${professional.pricePerMinute}/min</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/professionals/${professional.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/book-session?professional=${professional.id}`}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors text-center"
                          >
                            Book Session
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredProfessionals.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300">
                      No professionals found matching your criteria.
                    </p>
                  </div>
                )}

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => fetchProfessionals(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => fetchProfessionals(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
