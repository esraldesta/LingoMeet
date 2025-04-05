import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Ellipsis, Languages } from "lucide-react";
import { useEffect } from "react";
import API from "../api/axios";
import { useGroups } from "../context/GroupContext";
import { Card } from "../components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MostSearched } from "@/constants";
import { Group } from "@/types";

async function fetchGroups() {
  return await API.get("/");
}

// App component (example usage)
const Home = () => {
  const { data, error, isPending } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
  });

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div className="flex gap-1 justify-end p-2 relative mt-5">
        <span className="absolute right-2 -top-3 text-sm text-primary">
          Most searched languages
        </span>
        <Button size="xs" variant="secondary">
          Any
        </Button>
        {MostSearched.map((language) => (
          <Button size="xs" key={language.value} variant="secondary">
            {language.label}
          </Button>
        ))}
      </div>

      {/* {JSON.stringify(data)} */}
      <div className="flex flex-wrap justify-center">
        {data.data.length === 0 && <p>No Group Found</p>}
        {data.data.map((group: Group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
};

export default Home;

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// AvatarGroup component
const AvatarGroup = () => {
  const max = getRandomArbitrary(2, 5);
  const total = [1, 2, 3, 4, 5, 6, 7, 8];
  const displayedAvatars = total.slice(0, max);
  const remainingCount = total.length - max;

  return (
    <div className="flex -space-x-2 mx-auto mt-3">
      {displayedAvatars.map((index) => (
        <div
          key={index}
          className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 dark:bg-primary text-sm flex items-center justify-center"
        >
          TM
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 dark:bg-primary text-sm flex items-center justify-center">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// GroupCard component
const GroupCard = ({ group }: { group: Group }) => {
  return (
    <div className="bg-secondary shadow-md rounded-lg p-1 flex flex-col justify-between w-[300px] max-w-sm m-4">
      <div className="grid grid-cols-2">
        <h2 className="text-lg font-semibold text-left mb-4 ml-2">
          {group.topic}
        </h2>

        <div className="flex justify-end items-start mr-2">
          <Popover>
            <PopoverTrigger asChild>
              <button>
                <Ellipsis />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-xs-0 w-fit mr-1">
              <div>
                <p className="text-center pb-1">Group Owner</p>
                <div className="flex flex-col items-center pb-1">
                  {/* <img
                    className="w-20 h-20 mb-1 rounded-full shadow-lg"
                    src="https://bit.ly/ryan-florence"
                    alt="Bonnie image"
                  /> */}
                  <div className="h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 dark:bg-primary text-sm flex items-center justify-center">
                    TM
                  </div>
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                    Anonymous
                  </h5>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Description
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col items-start ml-2">
        <div>
          Language:
          <div className="flex gap-2 flex-wrap">
            {group.languages.map((language) => (
              <span className="font-semibold mb-4 text-primary">
                {language}
              </span>
            ))}
          </div>
        </div>

        <div>
          Topic:
          <span className="text-sm font-semibold mb-4"> {group.topic}</span>
        </div>
      </div>
      {/* Avatar group */}
      <AvatarGroup />

      {/* Join button */}
      <Link
        to={`/call/${group.id}`}
        className="mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
      >
        Join
      </Link>
    </div>
  );
};

// const groups = [
//   {
//     name: "Group A",
//     avatars: [
//       { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
//       { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
//       { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
//       { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
//       { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
//     ],
//   },
//   ]
