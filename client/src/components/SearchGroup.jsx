import { useState } from "react";
import API from "../api/axios";
import { useGroups } from "../context/GroupContext";

export default function SearchGroup() {
  const [search, setSearch] = useState("");
  const { setGroups } = useGroups();

  const handleSearch = (e) => {
    e.preventDefault();
    API.get(`/?queryName=language&searchQuery=${search}`)
      .then((res) => {
        console.log("res.data", res.data.data);

        setGroups(res.data.data);
      })
      .catch((err) => {
        console.log("err", err);
      });
  };

  return (
    <form className="max-w-md " onSubmit={handleSearch}>
      <div className="relative ">

        <input
          type="text"
          id="default-search"
          className="block w-full py-2 ps-2 mr-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pr-7"
          placeholder="v2 Search Eng, Chi..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <button
          type="submit"
          className="text-white absolute end-2 bottom-2.5"
        >
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
        </button>
      </div>
    </form>
  );
}
