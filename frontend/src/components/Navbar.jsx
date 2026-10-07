import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Connect Hub
        </Link>
        <div className="flex gap-4 items-center">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <Link to="/discover" className="hover:text-primary">
            Discover
          </Link>
          <Link to="/chat" className="hover:text-primary">
            Chat
          </Link>
          <Link to={`/profile/${user?._id}`} className="hover:text-primary">
            {user?.username}
          </Link>
          <button
            onClick={handleLogout}
            className="bg-primary text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
