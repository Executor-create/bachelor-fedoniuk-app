import FeedItem from './FeedItem';

const Feed = () => {
  const feedItems = [
    {
      id: 1,
      user: 'GamerPro',
      avatar: 'https://via.placeholder.com/40',
      content:
        "Just finished an epic gaming session! 🎮 Spent the last 6 hours grinding through the new dungeon in Elden Ring. The boss fights were absolutely insane, especially the final one. My heart was racing the entire time! If anyone needs tips for the late game content, let me know. I'm happy to help out fellow gamers!",
      timestamp: '2 hours ago',
      likes: 47,
      comments: 12,
    },
    {
      id: 2,
      user: 'GameMaster',
      avatar: 'https://via.placeholder.com/40',
      content:
        "New update for Cyberpunk 2077 is amazing! What do you think? The developers really outdid themselves this time. The new storyline expansion adds at least 20 hours of gameplay, and the graphics improvements make Night City look even more stunning. I've been exploring all the new side quests and they're incredibly well-written. Plus, the performance optimizations have made the game run so much smoother on my setup.",
      timestamp: '4 hours ago',
      likes: 83,
      comments: 24,
    },
    {
      id: 3,
      user: 'PixelWarrior',
      avatar: 'https://via.placeholder.com/40',
      content:
        "Looking for teammates for some co-op games tonight. Anyone interested? I'm thinking we could tackle some raid content in Destiny 2 or maybe try out that new survival mode in the latest zombie game everyone's been talking about. I usually play from 8 PM to midnight EST. Voice chat preferred, and it would be great if you have some experience with team-based objectives. Let's have some fun and maybe score some epic loot! 🎯",
      timestamp: '6 hours ago',
      likes: 32,
      comments: 8,
    },
  ];

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        <h2
          className="text-3xl font-bold text-white mb-6 font-google"
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary-color), var(--secondary-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Your Feed
        </h2>
        <div className="space-y-4">
          {feedItems.map((item) => (
            <FeedItem
              key={item.id}
              user={item.user}
              avatar={item.avatar}
              content={item.content}
              timestamp={item.timestamp}
              likes={item.likes}
              comments={item.comments}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Feed;
