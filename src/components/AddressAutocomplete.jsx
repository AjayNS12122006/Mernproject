import { useState, useEffect, useRef } from "react";
import { searchPlaces } from "../utils/geocode";

// A standalone address autocomplete input — unlike DestinationSearch, this
// doesn't touch WalkContext at all, so it's safe to reuse anywhere (e.g.
// saving a Home/Office address on the Profile page) without affecting the
// existing walk-tracking data flow. Still biases results to the user's
// current location using a one-off geolocation read.
function AddressAutocomplete({ value, onChange, placeholder = "Search an address..." }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const positionRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        positionRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      },
      () => {
        // Silently ignore — search just falls back to unbiased results.
      }
    );
  }, []);

  const handleTextChange = (text) => {
    onChange({ label: text, lat: null, lon: null });
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(text, positionRef.current, 8);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (place) => {
    onChange({ label: place.label, lat: place.lat, lon: place.lon });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value?.label || ""}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-[#222] p-4 rounded-xl outline-none"
      />
      {loading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          ...
        </span>
      )}

      {open && suggestions.length > 0 && (
        <ul className="absolute z-[500] mt-2 w-full bg-[#1c1c1c] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer text-sm border-b border-gray-800 last:border-b-0"
            >
              📍 <span className="text-gray-300">{place.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AddressAutocomplete;