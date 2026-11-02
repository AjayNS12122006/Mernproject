function Features() {
  const features = [
    {
      title: "Live Location",
      desc: "Real-time GPS tracking for your journey.",
      icon: "📍",
    },
    {
      title: "Auto SOS",
      desc: "Emergency alerts when ETA expires.",
      icon: "⚠️",
    },
    {
      title: "Trusted Circle",
      desc: "Add family and friends as emergency contacts.",
      icon: "👨‍👩‍👧",
    },
    {
      title: "Destination ETA",
      desc: "Set expected arrival time and route.",
      icon: "🛣️",
    },
  ];

  return (
    <section className="mt-28 px-10">
      <h1 className="text-4xl font-bold text-center mb-12">
        Core Features
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#171717] border border-gray-700 rounded-3xl p-8 hover:border-green-500 duration-300"
          >
            <div className="text-5xl mb-6">{feature.icon}</div>

            <h2 className="text-2xl font-bold mb-4">
              {feature.title}
            </h2>

            <p className="text-gray-400">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;