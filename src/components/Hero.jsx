import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Hero() {
  const { user } = useAuth();

  const scrollToHowItWorks = (e) => {
    e.preventDefault();
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="text-center mt-20 px-4">
      <h1 className="text-5xl md:text-7xl font-bold">
        Walk safe.
      </h1>

      <h1 className="text-5xl md:text-7xl font-bold text-green-500 mt-2">
        Every time.
      </h1>

      <p className="text-gray-400 mt-8 text-lg md:text-xl max-w-3xl mx-auto">
        Share your journey in real time. If you don't reach your destination
        on time, your contacts get notified automatically.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to={user ? "/dashboard" : "/register"}
          className="bg-green-600 hover:bg-green-700 transition px-8 py-3 rounded-xl font-bold"
        >
          {user ? "Go to Dashboard" : "Get Started Free"}
        </Link>

        <button
          onClick={scrollToHowItWorks}
          className="border border-gray-600 hover:border-gray-400 transition px-6 py-3 rounded-xl"
        >
          See How It Works
        </button>
      </div>
    </section>
  );
}

export default Hero;
