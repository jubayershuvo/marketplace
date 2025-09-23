import { IGig } from "@/types/Profile";
import { Star } from "lucide-react";
import React from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";

function GigCard({ gig }: { gig: IGig }) {
  const [fav, setFav] = React.useState(false);
  return (
    <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
      {/* Favorite Heart */}
      <button
        onClick={() => setFav(!fav)}
        className="absolute top-2 right-2 z-10 text-gray-400 hover:text-red-500 transition"
      >
        {fav ? <FaHeart className="text-red-500" /> : <FiHeart />}
      </button>

      {/* Thumbnail */}
      <img
        src={gig.thumbnail}
        alt={gig.title}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        {/* Gig Title */}
        <h3 className="text-lg font-semibold line-clamp-2">{gig.title}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, idx) => (
              <Star
                key={idx}
                className={`${
                  idx < Math.round(gig.rating)
                    ? "text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
              />
            ))}
          </div>
          <span>{gig.rating.toFixed(1)}</span>
          <span>({gig.reviews} reviews)</span>
        </div>

        {/* Price */}
        <p className="text-green-600 font-semibold">{gig.price}</p>
      </div>
    </div>
  );
}

export default GigCard;
