import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../api";

function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const data = await registerUser(form);

      login(
        { _id: data._id, name: data.name, email: data.email },
        data.token
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Server error. Make sure backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1a1a1f] rounded-2xl p-8 shadow-xl border border-white/10">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">Join Safety Walk Companion</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="w-full bg-[#0F0F10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full bg-[#0F0F10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              required
              className="w-full bg-[#0F0F10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Login link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
