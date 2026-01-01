'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, CheckCircle, AlertCircle, GraduationCap, Globe, Award, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  displayName: string;
  bio: string;
  languages: string[];
  certifications: string[];
  experience: string;
  accent: string;
  level: string;
  pricePerMinute: string;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const accents = ['American', 'British', 'Australian', 'Canadian', 'Indian', 'European', 'Latin American', 'Neutral'];

export default function ProfessionalSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    displayName: '',
    bio: '',
    languages: [],
    certifications: [],
    experience: '',
    accent: '',
    level: '',
    pricePerMinute: '',
    availability: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: '',
      endTime: '',
      isAvailable: false,
    })),
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      setFormData({
        ...formData,
        languages: [...formData.languages, newLanguage],
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter(lang => lang !== language),
    });
  };

  const addCertification = () => {
    if (newCertification && !formData.certifications.includes(newCertification)) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification],
      });
      setNewCertification('');
    }
  };

  const removeCertification = (certification: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(cert => cert !== certification),
    });
  };

  const updateAvailability = (dayIndex: number, field: 'startTime' | 'endTime' | 'isAvailable', value: string | boolean) => {
    const updatedAvailability = [...formData.availability];
    updatedAvailability[dayIndex] = {
      ...updatedAvailability[dayIndex],
      [field]: value,
    };
    setFormData({
      ...formData,
      availability: updatedAvailability,
    });
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.displayName && formData.bio && formData.languages.length > 0 && formData.level;
      case 2:
        return formData.experience && formData.pricePerMinute && parseFloat(formData.pricePerMinute) > 0;
      case 3:
        return formData.availability.some(slot => slot.isAvailable && slot.startTime && slot.endTime);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {

      const professionalData = {
        displayName: formData.displayName,
        bio: formData.bio,
        languages: formData.languages,
        certifications: formData.certifications,
        experience: formData.experience,
        accent: formData.accent,
        level: formData.level,
        pricePerMinute: parseFloat(formData.pricePerMinute),
      };

      const response = await fetch('/api/professionals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(professionalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create professional profile');
      }

      const professional = await response.json();

      // Set availability
      if (professional.id) {
        const availabilityResponse = await fetch(`/api/professionals/${professional.id}/availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            availability: formData.availability.filter(slot => slot.isAvailable),
          }),
        });

        if (!availabilityResponse.ok) {
          console.warn('Failed to set availability, but profile was created');
        }
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting professional profile:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Application Submitted!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Your professional application has been submitted successfully. Our admin team will review your profile and you'll be notified once approved.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                <li>• Admin review (1-2 business days)</li>
                <li>• Background verification</li>
                <li>• Profile approval</li>
                <li>• You can start accepting sessions</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Link href="/dashboard" className="block">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">Back to Home</Button>
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
            <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Become a Professional Tutor
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Share your language expertise and help learners achieve fluency
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {step}
                </div>
                <div className={`flex-1 h-1 mx-2 ${
                  step < 3 ? (currentStep > step ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700') : ''
                }`} />
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6" />
                {currentStep === 1 && 'Basic Information'}
                {currentStep === 2 && 'Experience & Pricing'}
                {currentStep === 3 && 'Availability'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-red-800 dark:text-red-200">{error}</span>
                </div>
              )}

              {currentStep === 1 && (
                <>
                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e: any) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder="How should students address you?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e: any) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell students about your teaching style, experience, and what makes you unique..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Languages You Teach *</Label>
                    <div className="flex gap-2 mb-2">
                      <Select value={newLanguage} onValueChange={setNewLanguage}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select languages" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={addLanguage} disabled={!newLanguage}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.languages.map((lang) => (
                        <span key={lang} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {lang}
                          <button
                            onClick={() => removeLanguage(lang)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="level">Teaching Level *</Label>
                    <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your teaching level" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="accent">Accent (Optional)</Label>
                    <Select value={formData.accent} onValueChange={(value: any) => setFormData({ ...formData, accent: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your accent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No accent preference</SelectItem>
                        {accents.map((accent) => (
                          <SelectItem key={accent} value={accent.toLowerCase()}>
                            {accent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div>
                    <Label htmlFor="experience">Experience *</Label>
                    <Textarea
                      id="experience"
                      value={formData.experience}
                      onChange={(e: any) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="Describe your teaching experience, years of practice, specializations..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Certifications (Optional)</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newCertification}
                        onChange={(e: any) => setNewCertification(e.target.value)}
                        placeholder="e.g., TEFL Certificate, Master's in Linguistics"
                      />
                      <Button onClick={addCertification} disabled={!newCertification}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.certifications.map((cert) => (
                        <span key={cert} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {cert}
                          <button
                            onClick={() => removeCertification(cert)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="pricePerMinute">Price per Minute (USD) *</Label>
                    <Input
                      id="pricePerMinute"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.pricePerMinute}
                      onChange={(e: any) => setFormData({ ...formData, pricePerMinute: e.target.value })}
                      placeholder="e.g., 0.20"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Typical range: $0.10 - $1.00 per minute
                    </p>
                    {formData.pricePerMinute && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <div>25 minutes: ${(parseFloat(formData.pricePerMinute) * 25).toFixed(2)}</div>
                          <div>50 minutes: ${(parseFloat(formData.pricePerMinute) * 50).toFixed(2)}</div>
                          <div>60 minutes: ${(parseFloat(formData.pricePerMinute) * 60).toFixed(2)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div>
                    <Label>Weekly Availability *</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the days and times you're available for sessions
                    </p>
                    <div className="space-y-3">
                      {dayNames.map((day, index) => (
                        <div key={day} className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-lg">
                          <div className="w-24">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.availability[index].isAvailable}
                                onChange={(e: any) => updateAvailability(index, 'isAvailable', e.target.checked)}
                              />
                              <span className="font-medium">{day}</span>
                            </label>
                          </div>
                          {formData.availability[index].isAvailable && (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <Input
                                  type="time"
                                  value={formData.availability[index].startTime}
                                  onChange={(e: any) => updateAvailability(index, 'startTime', e.target.value)}
                                  className="w-32"
                                />
                                <span>to</span>
                                <Input
                                  type="time"
                                  value={formData.availability[index].endTime}
                                  onChange={(e: any) => updateAvailability(index, 'endTime', e.target.value)}
                                  className="w-32"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep === 3 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep() || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!validateStep()}
                  >
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
