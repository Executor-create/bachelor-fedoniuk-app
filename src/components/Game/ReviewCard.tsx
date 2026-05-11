import React from 'react';
import { AiFillStar, AiOutlineStar, AiOutlineHeart } from 'react-icons/ai';

type Review = {
  id: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  rating: number;
  text: string;
  likes?: number;
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

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <img
          src={
            review.authorAvatar ||
            'https://avatars.dicebear.com/api/initials/' +
              encodeURIComponent(review.authorName) +
              '.svg'
          }
          alt={review.authorName}
          className="w-12 h-12 rounded-full object-cover"
        />

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-100">
                  {review.authorName}
                </span>
                <span className="text-xs text-zinc-500">{review.date}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {renderStars(review.rating)}
              </div>
              <span className="text-xs text-zinc-400 ml-2">
                {review.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <p className="mt-3 text-zinc-300 leading-relaxed">{review.text}</p>

          <div className="mt-4 flex items-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <AiOutlineHeart className="text-zinc-400" />
              <span>{review.likes ?? 0}</span>
            </div>
            <button className="text-zinc-400 underline text-sm">
              Helpful?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
