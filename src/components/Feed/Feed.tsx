import FeedComposer from './FeedComposer';

const Feed = () => {
  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <h2 className="text-3xl font-bold font-google bg-gradient-to-br from-(--primary-color) to-(--secondary-color) bg-clip-text text-transparent">
          Your Feed
        </h2>
        <div className="space-y-4">
          <FeedComposer />
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-600">
            <span className="text-4xl opacity-30">🎮</span>
            <p className="text-sm">No posts yet. Be the first to share!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
