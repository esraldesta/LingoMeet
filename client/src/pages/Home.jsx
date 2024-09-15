import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Ellipsis } from "lucide-react";

// AvatarGroup component
const AvatarGroup = ({ avatars, max }) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className="flex -space-x-2 mx-auto">
      {displayedAvatars.map((avatar, index) => (
        <img
          key={index}
          className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
          src={avatar.src}
          alt={avatar.name}
        />
      ))}
      {remainingCount > 0 && (
        <div className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200 text-sm flex items-center justify-center">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

// GroupCard component
const GroupCard = ({ groupName, avatars, max }) => {
  return (
    <div className="bg-secondary shadow-md rounded-lg p-1 flex flex-col justify-between w-[300px] max-w-sm m-4">
      <div className="grid grid-cols-2">
        <h2 className="text-lg font-semibold mb-4">{groupName}</h2>

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
                  <img
                    className="w-20 h-20 mb-1 rounded-full shadow-lg"
                    src="https://bit.ly/ryan-florence"
                    alt="Bonnie image"
                  />
                  <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
                    Bonnie Green
                  </h5>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Visual Designer
                  </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Avatar group */}
      <AvatarGroup avatars={avatars} max={max} />

      {/* Join button */}
      <Link to="/call" className="mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg">
        Join
      </Link>
    </div>
  );
};

// App component (example usage)
const Home = () => {
  const groups = [
    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    },

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    },

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    }
    ,

    ,

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    }

    ,

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    }

    ,

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    }

    ,

    {
      name: "Group A",
      avatars: [
        { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
        { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
        { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
        { name: "Prosper Otemuyiwa", src: "https://bit.ly/prosper-baba" },
        { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
      ],
    },
    {
      name: "Group B",
      avatars: [
        { name: "Alice", src: "https://bit.ly/alice-profile" },
        { name: "Bob", src: "https://bit.ly/bob-profile" },
        { name: "Charlie", src: "https://bit.ly/charlie-profile" },
      ],
    },
  ];

  return (
    <div>
      <form className="max-w-md mx-auto">
        <label
          htmlFor="default-search"
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search English, Chinese..."
            required
          />
          <button
            type="submit"
            className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Search
          </button>
        </div>
      </form>
      <div className="flex gap-1 justify-center pt-2">
      <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
        <Button size="xs" >Eng</Button>
      </div>

      <div className="flex flex-wrap justify-center">
        {groups.map((group, index) => (
          <GroupCard
            key={index}
            groupName={group.name}
            avatars={group.avatars}
            max={3} // Customize how many avatars to show
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
