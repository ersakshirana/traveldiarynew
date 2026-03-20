import {
  MdAdd,
  MdClose,
  MdDeleteOutline,
  MdUpdate,
  MdTitle,
  MdTextFields,
  MdImage,
  MdLocationOn,
  MdCalendarToday,
  MdCategory,
  MdPhotoLibrary,
} from "react-icons/md";
import DataSelector from "../../../component/input/DataSelector";
import { useState, useCallback } from "react";
import ImageSelector from "../../../component/input/ImageSelector";
import TagInput from "../../../component/input/TagInput";
import axiosinstance from "../../../utils/axiosinstance";
import moment from "moment";
import { toast } from "react-toastify";
import UploadImage from "../../../utils/UploadImage";

function AddEditTravelStories({
  type,
  storyInfo,
  onClose,
  getAllTravelStories,
}) {
  const [title, setTitle] = useState(storyInfo?.title || "");
  const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
  const [story, setStory] = useState(storyInfo?.story || "");
  const [visitedLocation, setVisitedLocation] = useState(
    storyInfo?.visitedLocation || []
  );
  const [visitedDate, setVisitedDate] = useState(storyInfo?.createdOn || null);
  const [error, setError] = useState("");
  
  // Rich content support
  const [contentBlocks, setContentBlocks] = useState(storyInfo?.content || []);
  const [imageUrls, setImageUrls] = useState(storyInfo?.imageUrls || []);
  
  // Category support
  const [category, setCategory] = useState(storyInfo?.category || "story");
  
  // Drag state for image upload
  const [isDragging, setIsDragging] = useState(false);

  // Add new content block
  const addContentBlock = (blockType) => {
    const newBlock = {
      type: blockType,
      text: "",
      order: contentBlocks.length,
    };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  // Update content block
  const updateContentBlock = (index, field, value) => {
    const updatedBlocks = [...contentBlocks];
    updatedBlocks[index][field] = value;
    setContentBlocks(updatedBlocks);
  };

  // Remove content block
  const removeContentBlock = (index) => {
    const updatedBlocks = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(updatedBlocks);
  };

  // Upload multiple images
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const uploadedUrls = [...imageUrls];
      for (const file of files) {
        const response = await UploadImage(file);
        if (response.imageurl) {
          uploadedUrls.push(response.imageurl);
        }
      }
      setImageUrls(uploadedUrls);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    }
  };

  // Handle drag events for image upload
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    try {
      const uploadedUrls = [...imageUrls];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const response = await UploadImage(file);
          if (response.imageurl) {
            uploadedUrls.push(response.imageurl);
          }
        }
      }
      setImageUrls(uploadedUrls);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    }
  }, [imageUrls]);

  // Remove image from gallery
  const removeImageUrl = (index) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
  };

  const UpdateTravelStory = async () => {
    const storyId = storyInfo._id;
    try {
      let imageurl = "";
      let postdata = {
        title,
        story,
        imageUrl: storyInfo.imageUrl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
        content: contentBlocks,
        imageUrls: imageUrls,
        category,
      };

      if (typeof storyImg === "object") {
        const imageUploadRes = await UploadImage(storyImg);
        imageurl = imageUploadRes.imageurl || "";

        postdata = {
          ...postdata,
          imageUrl: imageurl,
        };
      }

      const response = await axiosinstance.put(
        "/edit-story/" + storyId,
        postdata
      );
      if (response.data && response.data.story) {
        toast.success("Story Updated successfully");
        getAllTravelStories();
        onClose();
      }
    } catch (error) {
      if (error && error.data && error.data.message) {
        setError(error.data.message);
      } else {
        setError("An unexpected error occured .try again!");
      }
    }
  };

  const AddNewTravelStory = async () => {
    try {
      let imageurl = "";
      if (storyImg) {
        const imgupload = await UploadImage(storyImg);
        imageurl = imgupload.imageurl || "";
      }

      const response = await axiosinstance.post("/add-travel-story", {
        title,
        story,
        imageUrl: imageurl || "",
        visitedLocation,
        visitedDate: visitedDate
          ? moment(visitedDate).valueOf()
          : moment().valueOf(),
        content: contentBlocks,
        imageUrls: imageUrls,
        category,
      });
      if (response.data && response.data.story) {
        toast.success("Story added successfully");
        getAllTravelStories();
        onClose();
      }
    } catch (error) {
      if (error && error.data && error.data.message) {
        setError(error.data.message);
      } else {
        setError("An unexpected error occured .try again!");
      }
    }
  };
  
  const handleAddOrUpdateClick = () => {
    if (!title.trim()) {
      setError("Please enter the title");
      return;
    }
    if (!story && contentBlocks.length === 0) {
      setError("Please enter the story or add content blocks");
      return;
    }
    setError("");
    if (type === "Add") {
      AddNewTravelStory();
    } else {
      UpdateTravelStory();
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await axiosinstance.delete("/delete-image", {
        params: {
          imageUrl: storyInfo.imageUrl,
        },
      });
      if (response.data) {
        const storyid = storyInfo._id;

        const postdata = {
          title,
          story,
          imageUrl: "",
          visitedLocation,
          visitedDate: moment().valueOf(),
        };
        const updt = await axiosinstance.put(
          "/edit-story/" + storyid,
          postdata
        );
        setStoryImg(null);
      }
    } catch (error) {
      console.log(error);
      if (error && error.data && error.data.message) {
        setError(error.data.message);
      } else {
        setError("An unexpected error occured .try again!");
      }
    }
  };

  // Category options with icons
  const categories = [
    { id: 'travel', label: 'Travel', icon: '✈️', color: 'bg-blue-100 text-blue-700' },
    { id: 'event', label: 'Event', icon: '🎉', color: 'bg-purple-100 text-purple-700' },
    { id: 'blog', label: 'Blog', icon: '📝', color: 'bg-green-100 text-green-700' },
    { id: 'story', label: 'Story', icon: '📖', color: 'bg-orange-100 text-orange-700' },
  ];

  return (
    <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          {type === "Add" ? (
            <>
              <MdAdd className="text-2xl" />
              Create New Story
            </>
          ) : (
            <>
              <MdUpdate className="text-2xl" />
              Update Story
            </>
          )}
        </h2>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <MdClose className="text-2xl text-white" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Category Selection - Styled as pills */}
        <div>
          <label className="input-label flex items-center gap-2 mb-3">
            <MdCategory className="text-cyan-600" />
            CATEGORY
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  category === cat.id 
                    ? 'bg-cyan-500 text-white shadow-md transform scale-105' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input - Large and prominent */}
        <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-4">
          <label className="input-label flex items-center gap-2 mb-2">
            <MdTitle className="text-cyan-600" />
            TITLE
          </label>
          <input
            type="text"
            className="w-full text-2xl font-bold text-slate-800 outline-none bg-transparent placeholder-slate-400"
            placeholder="Give your story an amazing title..."
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>

        {/* Date & Location Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Selector */}
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="input-label flex items-center gap-2 mb-2 text-sm">
              <MdCalendarToday className="text-cyan-600" />
              VISITED DATE
            </label>
            <DataSelector date={visitedDate} setdate={setVisitedDate} />
          </div>
          
          {/* Location Tags */}
          <div className="bg-slate-50 rounded-xl p-4">
            <label className="input-label flex items-center gap-2 mb-2 text-sm">
              <MdLocationOn className="text-cyan-600" />
              VISITED LOCATIONS
            </label>
            <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
          </div>
        </div>

        {/* Cover Image - Single Image */}
        <div>
          <label className="input-label flex items-center gap-2 mb-3">
            <MdImage className="text-cyan-600" />
            COVER IMAGE
          </label>
          <ImageSelector
            image={storyImg}
            setimage={setStoryImg}
            handleDeleteImage={handleDeleteImage}
          />
        </div>

        {/* Multiple Images Gallery */}
        <div>
          <label className="input-label flex items-center gap-2 mb-3">
            <MdPhotoLibrary className="text-cyan-600" />
            PHOTO GALLERY
            <span className="text-xs font-normal text-slate-400">(Add more images to your story)</span>
          </label>
          
          {/* Drag and Drop Zone */}
          <div 
            className={`border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
              isDragging 
                ? 'border-cyan-500 bg-cyan-50 scale-[1.02]' 
                : 'border-slate-300 hover:border-cyan-400 bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleImageUpload}
              className="hidden"
              id="multi-image-upload"
            />
            <label 
              htmlFor="multi-image-upload" 
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mb-3">
                <MdAdd className="text-3xl text-cyan-600" />
              </div>
              <p className="text-slate-700 font-medium">
                Drag & drop images here
              </p>
              <p className="text-slate-400 text-sm mt-1">
                or click to browse (supports multiple files)
              </p>
            </label>
            
            {/* Image Gallery Preview */}
            {imageUrls.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">
                    {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''} added
                  </span>
                  <button 
                    onClick={() => setImageUrls([])}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {imageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="relative group aspect-square rounded-lg overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => removeImageUrl(index)}
                          className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        >
                          <MdDeleteOutline className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Story Text */}
        <div>
          <label className="input-label flex items-center gap-2 mb-3">
            <MdTextFields className="text-cyan-600" />
            YOUR STORY
          </label>
          <textarea
            className="w-full text-sm text-slate-800 outline-none bg-slate-50 p-4 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all resize-none"
            placeholder="Write about your experience..."
            rows={6}
            value={story}
            onChange={({ target }) => setStory(target.value)}
          />
        </div>

        {/* Content Blocks Builder */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4">
          <label className="input-label flex items-center gap-2 mb-3">
            <MdTitle className="text-cyan-600" />
            CONTENT BLOCKS
            <span className="text-xs font-normal text-slate-400">(Optional: Add rich content)</span>
          </label>
          
          {/* Block Type Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => addContentBlock('heading')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-cyan-50 transition-all text-slate-700"
            >
              <MdTitle /> 
              <span className="text-sm font-medium">Heading</span>
            </button>
            <button
              onClick={() => addContentBlock('paragraph')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-cyan-50 transition-all text-slate-700"
            >
              <MdTextFields />
              <span className="text-sm font-medium">Paragraph</span>
            </button>
            <button
              onClick={() => addContentBlock('image')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-cyan-50 transition-all text-slate-700"
            >
              <MdImage />
              <span className="text-sm font-medium">Image Block</span>
            </button>
          </div>
          
          {/* Content Blocks */}
          <div className="space-y-3">
            {contentBlocks.map((block, index) => (
              <div 
                key={index} 
                className="relative bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:border-cyan-300 transition-colors"
              >
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {block.type}
                  </span>
                  <button
                    onClick={() => removeContentBlock(index)}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    <MdDeleteOutline className="text-lg" />
                  </button>
                </div>
                
                {block.type === 'heading' && (
                  <input
                    type="text"
                    placeholder="Enter heading..."
                    className="w-full text-lg font-bold outline-none bg-transparent pr-16"
                    value={block.text}
                    onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                  />
                )}
                
                {block.type === 'paragraph' && (
                  <textarea
                    placeholder="Enter paragraph..."
                    className="w-full text-sm outline-none bg-transparent resize-none pr-16"
                    rows={3}
                    value={block.text}
                    onChange={(e) => updateContentBlock(index, 'text', e.target.value)}
                  />
                )}
                
                {block.type === 'image' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        if (e.target.files[0]) {
                          const response = await UploadImage(e.target.files[0]);
                          if (response.imageurl) {
                            updateContentBlock(index, 'imageUrl', response.imageurl);
                          }
                        }
                      }}
                      className="text-sm mb-2"
                    />
                    {block.imageUrl && (
                      <img
                        src={block.imageUrl}
                        alt="Content"
                        className="w-full h-48 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {contentBlocks.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-4">
              No content blocks added yet. Use the buttons above to add headings, paragraphs, or images.
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <button
          onClick={onClose}
          className="px-6 py-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex items-center gap-3">
          {type === "Edit" && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-1"
            >
              <MdDeleteOutline /> Delete
            </button>
          )}
          <button 
            onClick={handleAddOrUpdateClick}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
          >
            {type === "Add" ? (
              <>
                <MdAdd /> Add Story
              </>
            ) : (
              <>
                <MdUpdate /> Update Story
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddEditTravelStories;
