import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import PhoneMockup from "../components/PhoneMockup";
import Features from "../components/Features";
import ExtraFeatures from "../components/ExtraFeatures";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/stats";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="bg-[#0F0F10] min-h-screen text-white">
      <Navbar />
      <Hero />
      <PhoneMockup />
      <Features />
      <ExtraFeatures />
      <HowItWorks />
      <Stats />
      <Footer />
    </div>
  );
}

export default Home;