import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { GrMapLocation } from "react-icons/gr";
import moment from "moment/moment";
import { useState } from "react";
import axiosinstance from "../../../utils/axiosinstance";

const TravelstoryCard = ({
  imageUrl,
  title,
  date,
  story,
  visitedLocation,
  isFavorite,
  onFavoriteClick,
  onClick,
  creatorName,
  likeCount = 0,
  storyId,
  isLiked = false,
}) => {
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
  const [currentIsLiked, setCurrentIsLiked] = useState(isLiked);

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    try {
      const response = await axiosinstance.put(`/like-story/${storyId}`);
      if (response.data) {
        setCurrentLikeCount(response.data.story.likeCount);
        setCurrentIsLiked(response.data.isLiked);
      }
    } catch (error) {
      console.log("Error liking story:", error);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg hover:shadow-slate-200 transition-all ease-in-out relative cursor-pointer">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-40 sm:h-56 object-cover rounded-lg"
        onClick={onClick}
      />

      <button
        className="w-12 h-12 items-center justify-center bg-white/40 rounded-lg border border-white/30 absolute top-4 right-4 flex flex-col gap-1"
        onClick={handleLikeClick}
      >
        {currentIsLiked ? (
          <FaHeart className="text-red-500 text-xl animate-pulse" />
        ) : (
          <FaRegHeart className="text-white text-xl" />
        )}
        <span className="text-xs text-white font-medium">{currentLikeCount}</span>
      </button>
      
      {/* Creator Name Badge */}
      {creatorName && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-white text-xs font-medium">by {creatorName}</span>
        </div>
      )}
      
      <div className="p-4" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h6 className="flex-sm font-medium text-lg">{title}</h6>
            <span className="text-xs text-slate-500">
              {date ? moment(date).format("Do MMM YYYY") : "-"}
            </span>
          </div>
        </div>

        <p className="text-x5 text-slate-600 mt-2">{story?.slice(0, 60)}</p>
        <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded-mt-3 px-2 py-1 mt-2">
          <GrMapLocation className="text-sm" />
          {visitedLocation.map((item, index) =>
            visitedLocation.length == index + 1 ? `${item}` : `${item},`
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelstoryCard;
