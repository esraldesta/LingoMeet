import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Ellipsis } from "lucide-react";
import { useEffect } from "react";
import API from "../api/axios";
import { useGroups } from "../context/GroupContext";
import { Card } from "../components/ui/card";

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
const GroupCard = ({ group }) => {
  return (
    <div className="bg-secondary shadow-md rounded-lg p-1 flex flex-col justify-between w-[300px] max-w-sm m-4">
      <div className="grid grid-cols-2">
        <h2 className="text-lg font-semibold text-left mb-4 ml-2">
          {group.title}
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
          <span className="font-semibold mb-4 text-primary">
            {" "}
            {group.language}
          </span>
        </div>

        <div>
          Topic:
          <span className="text-sm font-semibold mb-4"> {group.Topic}</span>
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

// App component (example usage)
const Home = () => {
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

  //   {
  //     name: "Group A",
  //     avatars: [
  //       { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
  //       { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
  //       { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
  //       { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
  //       { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
  //     ],
  //   }
  //   ,

  //   ,

  //   {
  //     name: "Group A",
  //     avatars: [
  //       { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
  //       { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
  //       { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
  //       { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
  //       { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
  //     ],
  //   }

  //   ,

  //   {
  //     name: "Group A",
  //     avatars: [
  //       { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
  //       { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
  //       { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
  //       { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
  //       { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
  //     ],
  //   }

  //   ,

  //   {
  //     name: "Group A",
  //     avatars: [
  //       { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
  //       { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
  //       { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
  //       { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
  //       { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
  //     ],
  //   }

  //   ,

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
  //   {
  //     name: "Group B",
  //     avatars: [
  //       { name: "Alice", src: "https://bit.ly/alice-profile" },
  //       { name: "Bob", src: "https://bit.ly/bob-profile" },
  //       { name: "Charlie", src: "https://bit.ly/charlie-profile" },
  //     ],
  //   },
  // ];
  const { groups, setGroups } = useGroups();

  const handleSearchButton = (word) => {
    API.get(`/?queryName=language&searchQuery=${word}`).then((res) => {
      setGroups(res.data.data);
    });
  };
  useEffect(() => {
    API.get("/").then((res) => {
      setGroups(res.data.data);
    });
  }, []);

  return (
    <div>
      <div className="flex gap-1 justify-end p-2 relative mt-5">
        <span className="absolute right-2 -top-3 text-sm text-primary">
          Most searched languages
        </span>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("");
          }}
        >
          Any
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("eng");
          }}
        >
          Eng
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("spa");
          }}
        >
          Spa
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("fr");
          }}
        >
          Fr
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("tig");
          }}
        >
          Tig
        </Button>
        <Button
          size="xs"
          variant="secondary"
          onClick={() => {
            handleSearchButton("amh");
          }}
        >
          Amh
        </Button>
      </div>

      <div className="flex flex-wrap justify-center">
        {groups &&
          (groups.length <= 0 ? (
            <Card className="p-5 m-5">
              <p>No Group Found</p>
              <p className="text-xs">
                Sometimes, it may take up to 30 seconds for the server to wake
                up if it’s been inactive for a while. Thank you for your
                patience!
              </p>
            </Card>
          ) : (
            groups.map((group, index) => (
              <GroupCard key={index} group={group} />
            ))
          ))}
      </div>
    </div>
  );
};

export default Home;
