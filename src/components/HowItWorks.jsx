function HowItWorks() {
  const steps = [
    {
      icon: "👨‍👩‍👧",
      title: "Add Contacts",
      desc: "Add trusted family and friends.",
    },
    {
      icon: "📍",
      title: "Set Destination",
      desc: "Choose your destination and ETA.",
    },
    {
      icon: "🚶",
      title: "Start Walk",
      desc: "Share your journey in real time.",
    },
    {
      icon: "✅",
      title: "Reach Safely",
      desc: "Mark yourself safe or trigger Auto SOS.",
    },
  ];

  return (
    <section id="how-it-works" className="mt-32 px-10">
      <h1 className="text-4xl font-bold text-center mb-16">
        How It Works
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="bg-[#171717] border border-gray-700 rounded-3xl p-8 text-center hover:border-green-500 duration-300"
          >
            <div className="text-5xl mb-5">{step.icon}</div>

            <h2 className="text-2xl font-bold mb-3">
              {step.title}
            </h2>

            <p className="text-gray-400">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;