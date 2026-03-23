import moment from "moment";
import { useState } from "react";
import { GrMapLocation } from "react-icons/gr";
import { FaHeart, FaRegHeart, FaUser } from "react-icons/fa";
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from "react-icons/md";
import axiosinstance from "../../../utils/axiosinstance";

const ViewTravelStory = ({
  storyInfo,
  OnEditClick,
  OnDeleteClick,
  onClose,
}) => {
  const [likeCount, setLikeCount] = useState(storyInfo?.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const creatorName = storyInfo?.userId?.fullName || "Anonymous";

  const handleLike = async () => {
    try {
      const response = await axiosinstance.put(`/like-story/${storyInfo._id}`);
      if (response.data) {
        setLikeCount(response.data.story.likeCount);
        setIsLiked(response.data.isLiked);
      }
    } catch (error) {
      console.log("Error liking story:", error);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-end">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 bg-cyan-50/50 p-2 rounded-l-lg flex-wrap">
            <button className="btn-small" onClick={OnEditClick}>
              <MdUpdate className="text-lg" />
              UPDATE STORY
            </button>
            <button className="btn-small btn-delete" onClick={OnDeleteClick}>
              <MdDeleteOutline className="text-lg" />
              DELETE
            </button>
            <button className="" onClick={onClose}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex-1 flex-flex-col gap-2 py-4">
          <h1 className="text-2xl md:text-3xl text-slate-950 font-bold mb-2">
            {storyInfo && storyInfo.title}
          </h1>
          
          {/* Creator Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center">
              <FaUser className="text-white text-sm" />
            </div>
            <span className="text-sm text-slate-600">by {creatorName}</span>
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {storyInfo && moment(storyInfo.visitedDate).format("Do MMM YYYY")}
            </span>

            <div className="inline-flex items-center gap-2 text-[13px] text-cyan-600 bg-cyan-200/40 rounded px-2 py-1">
              <GrMapLocation className="text-sm" />
              {storyInfo &&
                storyInfo.visitedLocation.map((item, index) =>
                  storyInfo.visitedLocation.length == index + 1
                    ? `${item}`
                    : `${item},`
                )}
            </div>
          </div>
        </div>
        
        {/* Main Image */}
        {storyInfo?.imageUrl && (
          <img
            src={storyInfo && storyInfo.imageUrl}
            alt="selected"
            className="w-full h-[300px] object-cover rounded-lg mb-4"
          />
        )}

        {/* Multiple Images Gallery */}
        {storyInfo?.imageUrls && storyInfo.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {storyInfo.imageUrls.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Story image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Like Button and Count */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
          <button 
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors"
          >
            {isLiked ? (
              <FaHeart className="text-red-500 text-xl animate-pulse" />
            ) : (
              <FaRegHeart className="text-red-500 text-xl" />
            )}
            <span className="text-red-500 font-medium">
              {isLiked ? "Liked" : "Like"}
            </span>
          </button>
          <span className="text-slate-500 text-sm">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </span>
        </div>

        {/* Story Content */}
        <div className="prose max-w-none">
          <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">
            {storyInfo.story}
          </p>
        </div>

        {/* Rich Content (Headings and Paragraphs) */}
        {storyInfo?.content && storyInfo.content.length > 0 && (
          <div className="mt-4 space-y-4">
            {storyInfo.content.map((item, index) => (
              <div key={index}>
                {item.type === 'heading' && (
                  <h3 className="text-xl font-bold text-slate-800 mt-4">{item.text}</h3>
                )}
                {item.type === 'paragraph' && (
                  <p className="text-slate-600 leading-relaxed">{item.text}</p>
                )}
                {item.type === 'image' && item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={`Content image ${index}`} 
                    className="w-full rounded-lg mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewTravelStory;
