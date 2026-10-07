import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Discover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({}); // {userId: true/false}

  // Fetch users on load
  useEffect(() => {
    fetchUsers("");
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const url = query.trim()
        ? `/users?search=${encodeURIComponent(query)}`
        : "/users";
      const res = await API.get(url);
      setUsers(res.data);

      // Build a map of follow status
      const followMap = {};
      res.data.forEach((u) => {
        followMap[u._id] = u.followers?.includes(user?._id);
      });
      setFollowing(followMap);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId) => {
    try {
      await API.put(`/users/${targetId}/follow`);
      setFollowing((prev) => ({ ...prev, [targetId]: !prev[targetId] }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to follow");
    }
  };

  const handleMessage = (targetId) => {
    navigate(`/chat?user=${targetId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-primary mb-4">Discover People</h1>

      {/* Search bar */}
      <div className="bg-white rounded-xl shadow p-3 mb-4">
        <input
          type="text"
          placeholder="Search users by username..."
          className="w-full border rounded-lg p-2 focus:outline-primary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User list */}
      {loading ? (
        <p className="text-center text-gray-500 py-6">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-center text-gray-500 py-6">
          {search ? "No users match your search." : "No users found."}
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u._id}
              className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/profile/${u._id}`}
                    className="font-semibold text-primary hover:underline truncate block"
                  >
                    @{u.username}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">
                    {u.followers?.length || 0} followers
                  </p>
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleFollow(u._id)}
                  className={`px-3 py-1 rounded text-sm text-white ${
                    following[u._id]
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-primary hover:bg-indigo-700"
                  }`}
                >
                  {following[u._id] ? "Unfollow" : "Follow"}
                </button>
                <button
                  onClick={() => handleMessage(u._id)}
                  className="px-3 py-1 rounded text-sm bg-indigo-100 text-primary hover:bg-indigo-200"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
