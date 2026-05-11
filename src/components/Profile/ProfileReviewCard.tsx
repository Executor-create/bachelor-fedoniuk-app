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
      <AiFillStar key={i} className="text-yellow-400" />
    ) : (
      <AiOutlineStar key={i} className="text-zinc-600" />
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
    <div className="bg-(--third-color) border border-gray-700 rounded-xl overflow-hidden p-4 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
      <div className="flex gap-4">
        {/* Game Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={
              gameImage ||
              'https://images.unsplash.com/photo-1542751371-2d3a6a9b4a6d?auto=format&fit=crop&w=150&q=60'
            }
            alt={gameTitle}
            className="w-24 h-24 rounded-lg object-cover"
          />
        </div>

        {/* Review Content */}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-2">{gameTitle}</h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">{renderStars(rating)}</div>
            <span className="text-xs text-gray-400">{rating.toFixed(1)}</span>
          </div>

          {/* Review Text */}
          <p className="text-gray-300 text-sm leading-relaxed mb-2 line-clamp-2">
            {reviewText}
          </p>

          {/* Date */}
          {date && <p className="text-xs text-gray-500">{date}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfileReviewCard;
