import { useEffect, useState } from "react";
import API from "../api/axios";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await API.get("/posts");
        setPosts(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <CreatePost onCreated={(p) => setPosts([p, ...posts])} />
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts yet. Be the first!</p>
      ) : (
        posts.map((p) => (
          <PostCard
            key={p._id}
            post={p}
            onDelete={(id) => setPosts(posts.filter((x) => x._id !== id))}
          />
        ))
      )}
    </div>
  );
}
