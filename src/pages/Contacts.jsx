import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { getContacts, addContact as apiAddContact, deleteContact as apiDeleteContact } from "../api";

function Contacts() {
  const { token } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getContacts(token);
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadContacts();
  }, [token]);

  const addContact = async () => {
    if (!name || !phone || !relation) {
      setError("Fill all fields");
      return;
    }

    const compactPhone = phone.trim().replace(/[\s().-]/g, "");
    const normalizedPhone = compactPhone.startsWith("+")
      ? compactPhone
      : `+91${compactPhone.replace(/^0/, "")}`;
    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setError("Enter a valid phone number, for example +919876543210");
      return;
    }

    try {
      const newContact = await apiAddContact({ name, phone: normalizedPhone, email, relation }, token);
      setContacts([...contacts, newContact]);
      setName("");
      setPhone("");
      setEmail("");
      setRelation("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const removeContact = async (id) => {
    try {
      await apiDeleteContact(id, token);
      setContacts(contacts.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex bg-[#0F0F10] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-8">
        <h1 className="text-4xl font-bold mb-8">
          Emergency Contacts
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        <div className="bg-[#171717] rounded-3xl p-8 mb-8">

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#222] p-4 rounded-xl mb-4"
          />

          <div className="mb-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#222] p-4 rounded-xl"
            />
            <p className="text-gray-400 text-sm mt-2">
              Use international format, for example +919876543210. The contact must have WhatsApp.
            </p>
          </div>

          <input
            type="email"
            placeholder="Email (for email alerts)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#222] p-4 rounded-xl mb-4"
          />

          <input
            type="text"
            placeholder="Relation"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full bg-[#222] p-4 rounded-xl mb-4"
          />

          <button
            onClick={addContact}
            className="bg-green-600 px-6 py-3 rounded-xl"
          >
            + Add Contact
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading contacts...</p>
        ) : contacts.length === 0 ? (
          <div className="bg-[#171717] rounded-3xl p-6">
            <p className="text-gray-400">No contacts yet. Add your first trusted contact above.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {contacts.map((contact) => (
              <div
                key={contact._id}
                className="bg-[#171717] rounded-3xl p-6 relative"
              >
                <button
                  onClick={() => removeContact(contact._id)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
                  title="Delete contact"
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold">
                  {contact.name}
                </h2>

                <p className="text-gray-400 mt-3">
                  📞 {contact.phone}
                </p>

                {contact.email && (
                  <p className="text-gray-400 mt-1">
                    ✉️ {contact.email}
                  </p>
                )}

                <p className="text-green-500 mt-2">
                  {contact.relation}
                </p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Contacts;
