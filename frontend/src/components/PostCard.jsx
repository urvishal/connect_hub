import { useState, useEffect } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const isLiked = likes.includes(user?._id);

  const handleLike = async () => {
    try {
      const res = await API.put(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      console.log(err);
    }
  };

  const loadComments = async () => {
    const res = await API.get(`/comments/${post._id}`);
    setComments(res.data);
  };

  useEffect(() => {
    if (showComments) loadComments();
  }, [showComments]);

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const res = await API.post(`/comments/${post._id}`, { text });
    setComments([...comments, res.data]);
    setText("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    await API.delete(`/posts/${post._id}`);
    onDelete(post._id);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <div className="flex justify-between items-center mb-2">
        <Link
          to={`/profile/${post.author?._id}`}
          className="font-semibold text-primary"
        >
          @{post.author?.username}
        </Link>
        {post.author?._id === user?._id && (
          <button
            onClick={handleDelete}
            className="text-sm text-red-500 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
      <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

      <div className="flex gap-4 text-sm text-gray-600 border-t pt-2">
        <button
          onClick={handleLike}
          className={
            isLiked ? "text-red-500 font-semibold" : "hover:text-red-500"
          }
        >
          ❤️ {likes.length}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="hover:text-primary"
        >
          💬 Comment
        </button>
      </div>

      {showComments && (
        <div className="mt-3 border-t pt-3">
          <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
            {comments.map((c) => (
              <div key={c._id} className="text-sm">
                <span className="font-semibold text-primary">
                  @{c.author?.username}:{" "}
                </span>
                {c.text}
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-gray-400">No comments yet</p>
            )}
          </div>
          <form onSubmit={addComment} className="flex gap-2">
            <input
              className="flex-1 border rounded p-1 text-sm"
              placeholder="Write a comment..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button className="bg-primary text-white px-3 rounded text-sm">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
