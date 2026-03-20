const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelStorySchema= new Schema({
    title: { type: String, required: true },
    content: [{
        type: { type: String, enum: ['heading', 'paragraph', 'image'], required: true },
        text: { type: String },
        imageUrl: { type: String },
        order: { type: Number, default: 0 }
    }],
    story: { type: String }, // Keep for backward compatibility
    visitedLocation: { type: [String], default: [] },
    isFavourite: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId , ref: "User", required: true },
    createdOn: { type: Date, default: Date.now },
    imageUrl: { type: String }, // Keep for backward compatibility
    imageUrls: [{ type: String }], // Multiple images
    visitedDate: { type: Date, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    category: { type: String, enum: ['travel', 'event', 'blog', 'story'], default: 'story' }
});

module.exports = mongoose.model("TravelStory", travelStorySchema);
