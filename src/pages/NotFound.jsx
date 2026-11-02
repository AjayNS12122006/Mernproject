import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl font-bold text-green-500 mb-4">404</h1>
      <p className="text-xl text-gray-300 mb-2">This page doesn't exist.</p>
      <p className="text-gray-500 mb-8 max-w-md">
        The link you followed might be broken, or the page may have been moved.
      </p>
      <Link
        to="/"
        className="bg-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFound;
