import { AiFillStar, AiOutlineStar } from 'react-icons/ai';

export function renderStars(rating: number, size = 14) {
  const rounded = Math.round(rating);
  const filledStyle = { fontSize: size };
  const emptyStyle = { fontSize: size };
  return Array.from({ length: 5 }).map((_, i) =>
    i < rounded ? (
      <AiFillStar key={i} className="text-yellow-400" style={filledStyle} />
    ) : (
      <AiOutlineStar key={i} className="text-zinc-600" style={emptyStyle} />
    ),
  );
}
