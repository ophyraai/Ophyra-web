import { Star } from 'lucide-react';

const sizes = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
};

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function StarRating({ rating, size = 'md', className = '' }: StarRatingProps) {
  const sizeClass = sizes[size];
  return (
    <span className={`inline-flex gap-0.5 ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`${sizeClass} ${filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
          />
        );
      })}
    </span>
  );
}
