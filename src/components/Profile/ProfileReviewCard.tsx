import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

type ProfileReviewCardProps = {
  gameTitle: string;
  gameImage?: string;
  rating: number;
  reviewText: string;
  date?: string;
};

const renderStars = (rating: number) => {
  const rounded = Math.round(rating);
  return Array.from({ length: 5 }).map((_, i) =>
    i < rounded ? (
      <AiFillStar key={i} className="text-yellow-400" size={14} />
    ) : (
      <AiOutlineStar key={i} className="text-zinc-600" size={14} />
    ),
  );
};

const ProfileReviewCard: React.FC<ProfileReviewCardProps> = ({
  gameTitle,
  gameImage,
  rating,
  reviewText,
  date,
}) => {
  return (
    <div className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-200">
      <div className="flex gap-4 p-4">
        {/* Game Thumbnail */}
        <div className="shrink-0">
          <img
            src={
              gameImage ||
              'https://images.unsplash.com/photo-1542751371-2d3a6a9b4a6d?auto=format&fit=crop&w=150&q=60'
            }
            alt={gameTitle}
            className="w-20 h-20 rounded-xl object-cover bg-zinc-800"
          />
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-snug truncate mb-2">
            {gameTitle}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              {renderStars(rating)}
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              {rating.toFixed(1)}
            </span>
          </div>

          {/* Review Text */}
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
            {reviewText}
          </p>

          {/* Date */}
          {date && <p className="text-xs text-zinc-600 mt-2">{date}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviewCard;
