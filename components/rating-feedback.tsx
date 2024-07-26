import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    count: number;
    value: number;
    onChange: (value: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ count, value, onChange }) => {
    const stars = Array.from({ length: count }, (_, i) => i + 1);

    return (
        <div className="flex">
            {stars.map(star => (
                <Star
                    fill={star <= value ? 'yellow' : 'none'}
                    key={star}
                    onClick={() => onChange(star)}
                    className={`h-6 w-6 cursor-pointer ${star <= value ? 'text-yellow-200' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
};

export default StarRating;
