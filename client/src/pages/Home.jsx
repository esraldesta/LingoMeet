import React from 'react';

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
      <div>
      <h2 className="text-lg font-semibold mb-4">{groupName}</h2>
        
      </div>
      
      {/* Avatar group */}
      <AvatarGroup avatars={avatars} max={max} />

      {/* Join button */}
      <button className="mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg">
        Join
      </button>
    </div>
  );
};

// App component (example usage)
const Home = () => {
  const groups = [
    {
      name: 'Group A',
      avatars: [
        { name: 'Ryan Florence', src: 'https://bit.ly/ryan-florence' },
        { name: 'Segun Adebayo', src: 'https://bit.ly/sage-adebayo' },
        { name: 'Kent Dodds', src: 'https://bit.ly/kent-c-dodds' },
        { name: 'Prosper Otemuyiwa', src: 'https://bit.ly/prosper-baba' },
        { name: 'Christian Nwamba', src: 'https://bit.ly/code-beast' },
      ],
    },

    {
      name: 'Group A',
      avatars: [
        { name: 'Ryan Florence', src: 'https://bit.ly/ryan-florence' },
        { name: 'Segun Adebayo', src: 'https://bit.ly/sage-adebayo' },
        { name: 'Kent Dodds', src: 'https://bit.ly/kent-c-dodds' },
        { name: 'Prosper Otemuyiwa', src: 'https://bit.ly/prosper-baba' },
        { name: 'Christian Nwamba', src: 'https://bit.ly/code-beast' },
      ],
    },

    {
      name: 'Group A',
      avatars: [
        { name: 'Ryan Florence', src: 'https://bit.ly/ryan-florence' },
        { name: 'Segun Adebayo', src: 'https://bit.ly/sage-adebayo' },
        { name: 'Kent Dodds', src: 'https://bit.ly/kent-c-dodds' },
        { name: 'Prosper Otemuyiwa', src: 'https://bit.ly/prosper-baba' },
        { name: 'Christian Nwamba', src: 'https://bit.ly/code-beast' },
      ],
    },
    {
      name: 'Group B',
      avatars: [
        { name: 'Alice', src: 'https://bit.ly/alice-profile' },
        { name: 'Bob', src: 'https://bit.ly/bob-profile' },
        { name: 'Charlie', src: 'https://bit.ly/charlie-profile' },
      ],
    },
  ];

  return (
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
  );
};

export default Home;
