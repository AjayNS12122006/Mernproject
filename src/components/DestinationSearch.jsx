import { useState, useEffect, useRef, useContext } from "react";
import { WalkContext } from "../context/WalkContext";
import { searchPlaces } from "../utils/geocode";

function DestinationSearch({ onPickOnMap, pickingOnMap }) {
  const { destination, setDestination, setDestinationCoords, currentPosition } =
    useContext(WalkContext);

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (value) => {
    setDestination(value);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(value, currentPosition, 8);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleSelect = (place) => {
    setDestination(place.label);
    setDestinationCoords({ lat: place.lat, lon: place.lon });
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={destination}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search a destination..."
            className="w-full bg-[#222] p-4 rounded-xl outline-none"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
              ...
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onPickOnMap}
          title="Pick destination on the map"
          className={`px-4 rounded-xl font-medium whitespace-nowrap ${
            pickingOnMap
              ? "bg-blue-600 text-white"
              : "bg-[#222] text-gray-300 hover:bg-[#2a2a2a]"
          }`}
        >
          📍 {pickingOnMap ? "Tap the map..." : "Pick on map"}
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-[500] mt-2 w-full bg-[#1c1c1c] border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
          {suggestions.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 hover:bg-[#2a2a2a] cursor-pointer text-sm border-b border-gray-800 last:border-b-0"
            >
              <span className="text-white">📍 </span>
              <span className="text-gray-300">{place.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DestinationSearch;