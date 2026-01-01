'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Search,
  Filter,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface Professional {
  id: string;
  displayName: string;
  bio: string;
  languages: string[];
  certifications: string[];
  experience: string;
  level: string;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  totalSessions: number;
  isVerified: boolean;
  verificationDate: string | null;
  createdAt: string;
  user: {
    email: string;
    name: string;
    image?: string;
  };
  _count: {
    reviews: number;
    bookings: number;
  };
}

interface AdminStats {
  totalProfessionals: number;
  pendingApproval: number;
  approvedProfessionals: number;
  deactivatedProfessionals: number;
  totalRevenue: number;
  totalSessions: number;
}

export default function AdminDashboard() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalProfessionals: 0,
    pendingApproval: 0,
    approvedProfessionals: 0,
    deactivatedProfessionals: 0,
    totalRevenue: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProfessionals();
    calculateStats();
  }, [statusFilter]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/admin/professionals?${params}`, {
        headers: {
          'Authorization': 'Bearer admin-token', // Mock admin token
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfessionals(data.professionals);
      } else {
        console.error('Failed to fetch professionals');
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = professionals.length;
    const pending = professionals.filter(p => !p.isVerified).length;
    const approved = professionals.filter(p => p.isVerified).length;
    const deactivated = professionals.filter(p => !p.isVerified && new Date(p.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
    
    const totalRevenue = professionals.reduce((sum, p) => sum + (p.totalSessions * p.pricePerMinute * 0.25), 0);
    const totalSessions = professionals.reduce((sum, p) => sum + p.totalSessions, 0);

    setStats({
      totalProfessionals: total,
      pendingApproval: pending,
      approvedProfessionals: approved,
      deactivatedProfessionals: deactivated,
      totalRevenue,
      totalSessions,
    });
  };

  const handleProfessionalAction = async (professionalId: string, action: string) => {
    setActionLoading(professionalId);
    
    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token',
        },
        body: JSON.stringify({
          action,
          reason: `Admin action: ${action}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchProfessionals();
        console.log(data.message);
      } else {
        console.error('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const viewProfessionalDetails = async (professionalId: string) => {
    try {
      const response = await fetch(`/api/admin/professionals/${professionalId}`, {
        headers: {
          'Authorization': 'Bearer admin-token',
        },
      });

      if (response.ok) {
        const professional = await response.json();
        setSelectedProfessional(professional);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching professional details:', error);
    }
  };

  const filteredProfessionals = professionals.filter(professional =>
    professional.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (professional: Professional) => {
    if (!professional.isVerified) {
      const daysSinceCreation = Math.floor((new Date().getTime() - new Date(professional.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 30) {
        return <Badge variant="destructive">Deactivated</Badge>;
      }
      return <Badge variant="secondary">Pending Approval</Badge>;
    }
    return <Badge variant="default">Approved</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-8 h-8" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage professional tutors and platform statistics
            </p>
          </div>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Professionals</p>
                  <p className="text-2xl font-bold">{stats.totalProfessionals}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Approval</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingApproval}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Sessions</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Platform Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professionals Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Professional Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, email, or language..."
                  value={searchTerm}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Professionals Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left p-4">Professional</th>
                    <th className="text-left p-4">Languages</th>
                    <th className="text-left p-4">Price/Min</th>
                    <th className="text-left p-4">Sessions</th>
                    <th className="text-left p-4">Rating</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfessionals.map((professional) => (
                    <tr key={professional.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            {professional.user.image ? (
                              <img src={professional.user.image} alt={professional.displayName} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                {professional.displayName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{professional.displayName}</div>
                            <div className="text-sm text-gray-500">{professional.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {professional.languages.slice(0, 2).map((lang) => (
                            <Badge key={lang} variant="outline" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {professional.languages.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{professional.languages.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{professional.pricePerMinute}</span>
                        </div>
                      </td>
                      <td className="p-4">{professional.totalSessions}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{professional.rating.toFixed(1)}</span>
                          <span className="text-gray-500">({professional.reviewCount})</span>
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(professional)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => viewProfessionalDetails(professional.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {!professional.isVerified && (
                            <Button
                              size="sm"
                              onClick={() => handleProfessionalAction(professional.id, 'approve')}
                              disabled={actionLoading === professional.id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {actionLoading === professional.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleProfessionalAction(professional.id, professional.isVerified ? 'deactivate' : 'reject')}
                            disabled={actionLoading === professional.id}
                          >
                            {actionLoading === professional.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProfessionals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300">
                  No professionals found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Details Modal */}
        {showDetails && selectedProfessional && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Professional Details</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {selectedProfessional.user.image ? (
                      <img src={selectedProfessional.user.image} alt={selectedProfessional.displayName} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                        {selectedProfessional.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedProfessional.displayName}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedProfessional.user.email}</p>
                    <div className="mt-1">{getStatusBadge(selectedProfessional)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedProfessional.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfessional.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedProfessional.experience || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Level</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedProfessional.level}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Price/Min</h4>
                    <p className="text-gray-600 dark:text-gray-300">${selectedProfessional.pricePerMinute}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Total Sessions</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedProfessional.totalSessions}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Rating</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedProfessional.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({selectedProfessional.reviewCount})</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Member Since</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {new Date(selectedProfessional.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  {!selectedProfessional.isVerified && (
                    <Button
                      onClick={() => handleProfessionalAction(selectedProfessional.id, 'approve')}
                      disabled={actionLoading === selectedProfessional.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === selectedProfessional.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  )}
                  
                  <Button
                    variant="destructive"
                    onClick={() => handleProfessionalAction(selectedProfessional.id, selectedProfessional.isVerified ? 'deactivate' : 'reject')}
                    disabled={actionLoading === selectedProfessional.id}
                  >
                    {actionLoading === selectedProfessional.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {selectedProfessional.isVerified ? 'Deactivate' : 'Reject'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
