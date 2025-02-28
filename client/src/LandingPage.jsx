import AboutSection from "./components/AboutSection.jsx";
import HomeSection from "./components/HomeSection.jsx";
import LandingPageNavBar from "./components/LandingPageNavBar.jsx";
import ContactSection from "./components/ContactSection.jsx";
import LandingPageFooter from "./components/LandingPageFooter.jsx";

function LandingPage() {
  return (
    <>
      <LandingPageNavBar />
      <HomeSection />
      <AboutSection />
      <ContactSection />
      <LandingPageFooter />
    </>
  );
}

export default LandingPage;
