import React, { useState } from 'react';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';

type Props = {
  game: { name: string; genres: string[]; background_image?: string };
  onClose: () => void;
  onSubmit: (payload: { rating: number; text: string }) => void;
};

const MAX_CHARS = 1000;

const ReviewForm: React.FC<Props> = ({ game, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(0);
  const [text, setText] = useState<string>('');
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    setRatingError(null);
    setTextError(null);

    if (rating === 0) {
      setRatingError('Please select a rating');
      console.warn('[ReviewForm] blocked submit: missing rating');
      return;
    }
    if (text.trim().length === 0) {
      setTextError('Please write a short review');
      console.warn('[ReviewForm] blocked submit: missing text');
      return;
    }

    try {
      setSubmitting(true);
      console.debug('[ReviewForm] submitting', {
        rating,
        textLength: text.length,
      });
      await onSubmit({ rating, text: text.trim() });
    } catch (err) {
      console.error('[ReviewForm] submit error', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <form
        className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={game.background_image || 'https://via.placeholder.com/64'}
              alt={game.name}
              className="w-16 h-16 rounded-md object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                {game.name}
              </h3>
              <p className="text-sm text-zinc-500">{game.genres.join(', ')}</p>
            </div>
          </div>

          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>

          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              return (
                <button
                  key={i}
                  onClick={() => handleStarClick(val)}
                  type="button"
                  className="p-1"
                >
                  {val <= rating ? (
                    <AiFillStar className="text-yellow-500" size={32} />
                  ) : (
                    <AiOutlineStar className="text-zinc-400" size={32} />
                  )}
                </button>
              );
            })}
          </div>
          {ratingError && (
            <p className="text-xs text-red-500 mt-1">{ratingError}</p>
          )}

          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Your Review <span className="text-red-500">*</span>
          </label>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            rows={8}
            className="w-full rounded-md border border-zinc-200 p-4 text-sm text-zinc-800 bg-zinc-50 focus:outline-none"
            placeholder="What did you think about this game? Share your experience, gameplay, story, graphics, or anything that stood out to you..."
          />
          {textError && (
            <p className="text-xs text-red-500 mt-1">{textError}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-zinc-500">
              {text.length} / {MAX_CHARS} characters
            </p>
          </div>

          <div className="mt-6 p-4 bg-violet-50 rounded-md border border-violet-100 text-sm text-zinc-700">
            <strong className="block mb-2">
              Tips for writing a great review:
            </strong>
            <ul className="list-disc pl-5 text-xs text-zinc-600">
              <li>Be specific about what you liked or disliked</li>
              <li>Mention gameplay mechanics, story, graphics, or sound</li>
              <li>Keep it respectful and constructive</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-md bg-zinc-100 text-sm text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-md text-white text-sm font-semibold ${submitting ? 'bg-violet-400' : 'bg-violet-600 hover:bg-violet-500'}`}
            >
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
