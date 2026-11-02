function ExtraFeatures() {
  const extras = [
    { icon: "🎙️", title: "Audio SOS Recording" },
    { icon: "📞", title: "Fake Call Escape" },
    { icon: "🛣️", title: "Safe Route AI" },
    { icon: "🛡️", title: "Community Safety Zones" },
    { icon: "🔋", title: "Low Battery SOS" },
    { icon: "📜", title: "Walk History" },
    { icon: "🎤", title: "Voice Trigger" },
    { icon: "📳", title: "Shake to SOS" },
  ];

  return (
    <section className="mt-28 px-10">
      <h1 className="text-4xl font-bold text-center mb-12">
        Advanced Features
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {extras.map((item, index) => (
          <div
            key={index}
            className="bg-[#171717] border border-gray-700 rounded-3xl p-8 hover:border-green-500 duration-300"
          >
            <div className="text-5xl mb-5">{item.icon}</div>

            <h2 className="text-xl font-bold">
              {item.title}
            </h2>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExtraFeatures;