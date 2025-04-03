const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        comments: [commentSchema],
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true,
    }
);

const PostModel = model('Post', PostSchema);
module.exports = PostModel;
