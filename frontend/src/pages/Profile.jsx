import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await API.get(`/users/${id}`);
      setProfile(res.data);
      setIsFollowing(res.data.followers?.includes(user?._id));
    };
    fetchProfile();
  }, [id]);

  const toggleFollow = async () => {
    await API.put(`/users/${id}/follow`);
    setIsFollowing(!isFollowing);
    setProfile({
      ...profile,
      followers: isFollowing
        ? profile.followers.filter((f) => f !== user._id)
        : [...profile.followers, user._id],
    });
  };

  if (!profile) return <p className="text-center p-6">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
            {profile.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{profile.username}</h2>
            <p className="text-gray-500">{profile.email}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-4 text-sm">
          <span>
            <b>{profile.followers?.length || 0}</b> Followers
          </span>
          <span>
            <b>{profile.following?.length || 0}</b> Following
          </span>
        </div>
        {user?._id !== profile._id && (
          <button
            onClick={toggleFollow}
            className={`mt-4 px-4 py-2 rounded text-white ${
              isFollowing ? "bg-gray-500" : "bg-primary hover:bg-indigo-700"
            }`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
}
