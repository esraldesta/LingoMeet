import { getAllProfessionals } from "@/app/actions/professional";
import Link from "next/link";
import { Star, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalFilters } from "@/components/professionals/ProfessionalFilters";

// Helper to display price nicely
const formatPrice = (price: any, currency: string) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(price));
};

export default async function ProfessionalsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const filters = {
    language: typeof searchParams.language === 'string' ? searchParams.language : undefined,
    minPrice: typeof searchParams.minPrice === 'string' ? Number(searchParams.minPrice) : undefined,
    maxPrice: typeof searchParams.maxPrice === 'string' ? Number(searchParams.maxPrice) : undefined,
    minRating: typeof searchParams.minRating === 'string' ? Number(searchParams.minRating) : undefined,
  };

  const professionals = await getAllProfessionals(filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <ProfessionalFilters />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
             <h1 className="text-3xl font-bold mb-2">Language Professionals</h1>
             <p className="text-muted-foreground">Find the perfect tutor for your language journey.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <div key={pro.id} className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden flex-shrink-0">
                    {pro.user.image ? (
                      <img src={pro.user.image} alt={pro.user.name} className="w-full h-full object-cover" />
                    ) : (
                      pro.user.name.substring(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg line-clamp-1">{pro.user.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-1">{pro.headline || "Language Professional"}</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <p className="text-sm line-clamp-2 min-h-[40px]">{pro.bio || "No bio available."}</p>
                  
                  <div className="flex flex-wrap gap-2 min-h-[24px]">
                     {Array.isArray(pro.languages) && (pro.languages as any[]).slice(0, 3).map((lang: any, i: number) => (
                       <span key={i} className="inline-flex items-center px-2 py-1 rounded-full bg-secondary text-xs">
                         <Languages className="w-3 h-3 mr-1" />
                         {lang.language} ({lang.level})
                       </span>
                     ))}
                     {Array.isArray(pro.languages) && (pro.languages as any[]).length > 3 && (
                        <span className="text-xs text-muted-foreground flex items-center">+{ (pro.languages as any[]).length - 3} more</span>
                     )}
                  </div>

                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-medium">{pro.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({pro.reviewCount})</span>
                    </div>
                    <div className="font-semibold text-primary">
                      {formatPrice(pro.pricePerMinute, pro.currency)}/min
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Link href={`/professionals/${pro.id}`} className="w-full">
                    <Button className="w-full">View Profile & Book</Button>
                  </Link>
                </div>
              </div>
            ))}

            {professionals.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">No professionals found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria.</p>
                <Link href="/auth/pro-signup">
                  <Button variant="outline">Are you a teacher? Join us!</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
