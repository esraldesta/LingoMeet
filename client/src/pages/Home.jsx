import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";
import API from "../api/axios";
import { useGroups } from "../context/GroupContext";
import { Card } from "../components/ui/card";
import SearchGroup from "../components/SearchGroup";

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
const GroupCard = ({ group, avatars, max }) => {
  return (
    <div className="bg-secondary shadow-md rounded-lg p-1 flex flex-col justify-between w-[300px] max-w-sm m-4">
      <div className="grid grid-cols-2">
        <h2 className="text-lg font-semibold mb-4">{group.title}</h2>

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
      <Link
        to={`/call/${group._id}`}
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
      API.get(`/?queryName=language&searchQuery=${word}`)
        .then((res) => {
          console.log("res.data", res.data.data);

          setGroups(res.data.data);
        })
        .catch((err) => {
          console.log("err", err);
        });
  };
  useEffect(() => {
    API.get("/")
      .then((res) => {
        console.log("res.data", res.data.data);

        setGroups(res.data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  }, []);
  return (
    <div>
      <div className="flex gap-1 justify-end p-2 relative mt-5">
        <span className="absolute right-2 -top-3 text-sm text-primary">Most searched languages</span>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("")}}>Any</Button>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("eng")}}>Eng</Button>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("spa")}}>Spa</Button>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("fr")}}>Fr</Button>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("tig")}}>Tig</Button>
        <Button size="xs" variant="secondary" onClick={()=>{handleSearchButton("amh")}}>Amh</Button>

      </div>

      <div className="flex flex-wrap justify-center">
        {groups &&
              ( groups.length <= 0?
                <Card className="p-5 m-5">
                  No Group Found
                </Card>:

                groups.map((group, index) => (
                  <GroupCard
                    key={index}
                    group={group}
                    avatars={[
                      { name: "Ryan Florence", src: "https://bit.ly/ryan-florence" },
                      { name: "Segun Adebayo", src: "https://bit.ly/sage-adebayo" },
                      { name: "Kent Dodds", src: "https://bit.ly/kent-c-dodds" },
                      {
                        name: "Prosper Otemuyiwa",
                        src: "https://bit.ly/prosper-baba",
                      },
                      { name: "Christian Nwamba", src: "https://bit.ly/code-beast" },
                    ]}
                    max={3} // Customize how many avatars to show
                  />
                ))
              )
          
          }


      </div>
    </div>
  );
};

export default Home;
