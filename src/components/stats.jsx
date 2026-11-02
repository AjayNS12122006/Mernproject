function Stats() {
  return (
    <section className="mt-32 px-10">
      <h1 className="text-4xl font-bold text-center mb-16">
        Trusted Protection
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-[#171717] border border-gray-700 rounded-3xl p-10 text-center">
          <h1 className="text-5xl font-bold text-green-500">10K+</h1>
          <p className="text-gray-400 mt-4">Safe Walks Completed</p>
        </div>

        <div className="bg-[#171717] border border-gray-700 rounded-3xl p-10 text-center">
          <h1 className="text-5xl font-bold text-green-500">5K+</h1>
          <p className="text-gray-400 mt-4">Trusted Contacts Connected</p>
        </div>

        <div className="bg-[#171717] border border-gray-700 rounded-3xl p-10 text-center">
          <h1 className="text-5xl font-bold text-green-500">99.9%</h1>
          <p className="text-gray-400 mt-4">Reliable Alerts</p>
        </div>
      </div>
    </section>
  );
}

export default Stats;