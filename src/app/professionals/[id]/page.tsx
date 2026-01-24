import { getProfessionalById } from "@/app/actions/professional";
import { BookingForm } from "@/components/BookingForm";
import { Star, Languages, ShieldCheck, MapPin, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProfessionalProfilePage({ params }: Props) {
  const { id } = await params;
  const professional = await getProfessionalById(id);

  if (!professional) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/professionals">
            <Button variant="ghost" className="pl-0 gap-2 hover:bg-transparent hover:text-primary/80">
                <ArrowLeft className="w-4 h-4" />
                Back to Professionals
            </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-4xl font-bold text-primary overflow-hidden">
                 {professional.user.image ? (
                  <img src={professional.user.image} alt={professional.user.name} className="w-full h-full object-cover" />
                ) : (
                  professional.user.name.substring(0, 1).toUpperCase()
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                      {professional.user.name}
                      {professional.isVerified && <ShieldCheck className="w-6 h-6 text-blue-500" />}
                    </h1>
                    <h2 className="text-xl text-muted-foreground mb-4">{professional.headline}</h2>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500 justify-end mb-1">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold text-lg">{professional.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{professional.reviewCount} reviews</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                   {Array.isArray(professional.languages) && (professional.languages as any[]).map((lang: any, i: number) => (
                     <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                       <Languages className="w-4 h-4 mr-2" />
                       {lang.language} ({lang.level})
                     </span>
                   ))}
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">About Me</h3>
            <p className="whitespace-pre-wrap leading-relaxed">
              {professional.bio || "No bio available."}
            </p>
          </div>

          {/* Reviews */}
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-6">Reviews</h3>
            {professional.reviews.length > 0 ? (
              <div className="space-y-6">
                {professional.reviews.map((review) => (
                  <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                         <div className="font-semibold">{review.learner.name}</div>
                         <div className="flex text-yellow-500">
                             {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                             ))}
                         </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Booking */}
        <div className="lg:col-span-1">
          <BookingForm professional={professional} />
        </div>
      </div>
    </div>
  );
}
