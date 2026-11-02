function PhoneMockup() {
  return (
    <div className="flex justify-center mt-20">
      <div className="bg-[#1A1A1A] border border-gray-700 rounded-[40px] p-6 w-[320px]">

        <div className="bg-[#111111] h-64 rounded-3xl flex items-center justify-center text-gray-500">
          Map Preview
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-[#111111] rounded-xl p-3 text-center">
            <h2 className="text-2xl font-bold">12</h2>
            <p className="text-gray-400 text-sm">min ETA</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-3 text-center">
            <h2 className="text-xl font-bold">1.2 km</h2>
            <p className="text-gray-400 text-sm">remaining</p>
          </div>

          <div className="bg-[#111111] rounded-xl p-3 text-center">
            <h2 className="text-green-500 font-bold">Safe</h2>
            <p className="text-gray-400 text-sm">status</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-400 mb-3">Watching you</p>

          <div className="flex gap-3">
            <div className="bg-green-200 text-black rounded-full w-12 h-12 flex items-center justify-center">
              MA
            </div>

            <div className="bg-purple-200 text-black rounded-full w-12 h-12 flex items-center justify-center">
              RK
            </div>

            <div className="bg-gray-200 text-black rounded-full w-12 h-12 flex items-center justify-center">
              +2
            </div>
          </div>
        </div>

        <button className="w-full mt-8 border border-gray-600 py-4 rounded-2xl text-xl font-bold">
          SOS — SEND ALERT
        </button>

      </div>
    </div>
  );
}

export default PhoneMockup;