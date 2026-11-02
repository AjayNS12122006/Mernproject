import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import AddressAutocomplete from "../components/AddressAutocomplete";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../api";

function Profile() {
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [address, setAddress] = useState("");
  const [home, setHome] = useState({ label: "", lat: null, lon: null });
  const [office, setOffice] = useState({ label: "", lat: null, lon: null });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile(token);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setBloodGroup(data.bloodGroup || "");
        setAddress(data.address || "");
        setHome(data.home?.label ? data.home : { label: "", lat: null, lon: null });
        setOffice(data.office?.label ? data.office : { label: "", lat: null, lon: null });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfile();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await updateProfile(
        { name, phone, bloodGroup, address, home, office },
        token
      );
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-[#0F0F10] min-h-screen text-white">
        <Sidebar />
        <div className="flex-1 p-8">
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[#0F0F10] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">
          Profile
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6 max-w-3xl">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6 max-w-3xl">
            {message}
          </div>
        )}

        <div className="bg-[#171717] rounded-3xl p-8 max-w-3xl">

          <div className="mb-5">
            <label className="block mb-2 text-gray-400">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ajay"
              className="w-full bg-[#222] p-4 rounded-xl outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-gray-400">
              Email
            </label>

            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-[#1a1a1a] text-gray-500 p-4 rounded-xl outline-none cursor-not-allowed"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-gray-400">
              Phone Number
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full bg-[#222] p-4 rounded-xl outline-none"
            />
          </div>

          <div className="mb-5">
            <label className="block mb-2 text-gray-400">
              Blood Group
            </label>

            <input
              type="text"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              placeholder="O+"
              className="w-full bg-[#222] p-4 rounded-xl outline-none"
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-400">
              Address
            </label>

            <textarea
              rows="4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Address"
              className="w-full bg-[#222] p-4 rounded-xl outline-none"
            />
          </div>

          {/* Saved places — quick-select destinations on Start Walk */}
          <div className="mb-5">
            <label className="block mb-2 text-gray-400">
              🏠 Home Address
            </label>
            <p className="text-gray-500 text-xs mb-2">
              Saved so you can select "Home" as a destination in one tap on Start Walk.
            </p>
            <AddressAutocomplete
              value={home}
              onChange={setHome}
              placeholder="Search your home address..."
            />
          </div>

          <div className="mb-8">
            <label className="block mb-2 text-gray-400">
              🏢 Office Address
            </label>
            <p className="text-gray-500 text-xs mb-2">
              Saved so you can select "Office" as a destination in one tap on Start Walk.
            </p>
            <AddressAutocomplete
              value={office}
              onChange={setOffice}
              placeholder="Search your office address..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 px-8 py-4 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
