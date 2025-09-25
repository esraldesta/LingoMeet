import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Ellipsis } from "lucide-react";
import API from "../api/axios";
import { useQuery } from "@tanstack/react-query";
import { MostSearched } from "@/constants";
import { Group } from "@/types";
import { Lock, Globe, Users, UserPlus } from "lucide-react";
import { useState } from "react";

const LIMIT = 3;

export async function fetchGroups({ page = 1, limit = 6, searchQuery = "" }): Promise<{ groups: Group[]; totalCount: number }> {
  const res = await API.get("/", {
    params: {
      page,
      limit,
      searchQuery,
    },
  });

  return res.data; // returns { groups: Group[], totalCount: number }
}

const Home = () => {
  const [page, setPage] = useState(1);

  const { data, isPending, error, isFetching } = useQuery({
    queryKey: ["groups", page],
    queryFn: () => fetchGroups({ page, limit: LIMIT }),
    // keepPreviousData: true,
  });

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const totalPages = Math.ceil(data.totalCount / LIMIT);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Language Filter */}
      <div className="flex gap-1 justify-end p-2 relative mt-5">
        <span className="absolute right-2 -top-3 text-sm text-primary">
          Most searched languages
        </span>
        <Button variant="secondary">Any</Button>
        {MostSearched.map((language) => (
          <Button key={language.value} variant="secondary">
            {language.label}
          </Button>
        ))}
      </div>

      {/* Group Cards */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {data.groups.length === 0 ? (
          <p className="text-muted-foreground">No Groups Found</p>
        ) : (
          data.groups.map((group) => <GroupCard key={group.id} group={group} />)
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-8 space-x-2">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </Button>

        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        >
          Next
        </Button>
      </div>

      {isFetching && <p className="text-center text-xs mt-2">Fetching more...</p>}
    </div>
  );
};

export default Home;


function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// Simulate avatars (placeholder)
const AvatarGroup = () => {
  const total = [1, 2, 3, 4, 5, 6];
  const max = 4;
  const displayed = total.slice(0, max);
  const remaining = total.length - max;

  return (
    <div className="flex -space-x-3 mt-2">
      {displayed.map((i) => (
        <div
          key={i}
          className="h-9 w-9 rounded-full border-2 border-background bg-muted text-xs flex items-center justify-center font-semibold shadow-sm"
        >
          TM
        </div>
      ))}
      {remaining > 0 && (
        <div className="h-9 w-9 rounded-full border-2 border-background bg-muted text-xs flex items-center justify-center font-semibold shadow-sm">
          +{remaining}
        </div>
      )}
    </div>
  );
};

function getRandomArbitrary(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

const GroupCard = ({ group }: { group: Group }) => {
  return (
    <div className="relative bg-card text-card-foreground border border-border shadow-sm hover:shadow-md rounded-xl p-4 w-[320px] max-w-sm transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold line-clamp-1">{group.topic}</h3>

        <Popover>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Ellipsis size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 mr-2 p-4 text-sm space-y-2 bg-popover text-popover-foreground border border-border">
            <p className="font-medium">Group Owner</p>
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-muted text-sm flex items-center justify-center font-bold">
                TM
              </div>
              <p className="mt-1 text-sm">Anonymous</p>
              <span className="text-xs text-muted-foreground">
                No description available
              </span>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>{getRandomArbitrary(2, 8)} / {group.maxPeople} people</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe size={16} />
          <span className="space-x-2">
            {group.languages.map((lang, i) => (
              <span key={lang.id}>
                {lang.name}
                {group.levels[i] ? ` (${group.levels[i].name})` : ""}
              </span>
            ))}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {group.isPrivate ? <Lock size={16} /> : <Globe size={16} />}
          <span>{group.isPrivate ? "Private" : "Public"}</span>
        </div>
      </div>

      {/* Avatars */}
      <AvatarGroup />

      {/* CTA Button */}
      <Link
        to={`/group/${group.id}`}
        className="mt-4 inline-flex items-center justify-center w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <UserPlus size={16} className="mr-2" />
        Join Group
      </Link>
    </div>
  );
};

