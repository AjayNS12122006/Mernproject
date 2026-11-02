import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="flex justify-between items-center px-10 py-6">
      <Link to="/" className="text-2xl font-bold text-green-500">
        SafetyWalk
      </Link>

      <ul className="hidden md:flex gap-8 text-gray-300">
        <li>Features</li>
        <li>Roadmap</li>
        <li>Github</li>
      </ul>

      <Link
        to={user ? "/dashboard" : "/login"}
        className="border border-gray-600 px-5 py-2 rounded-xl hover:bg-green-500 hover:text-black transition"
      >
        {user ? "Dashboard" : "Get Started"}
      </Link>
    </nav>
  );
}

export default Navbar;
