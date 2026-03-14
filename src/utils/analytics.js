import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-YX93B1WRN9";

const getGA = () => {
  // Try all possible ways the library might be exported/wrapped
  if (ReactGA && typeof ReactGA.initialize === 'function') return ReactGA;
  if (ReactGA && ReactGA.default && typeof ReactGA.default.initialize === 'function') return ReactGA.default;
  return null;
};

const initGA = () => {
  try {
    const ga = getGA();
    if (ga) {
      ga.initialize(MEASUREMENT_ID);
      console.log("GA4 Initialized successfully");
    } else {
      console.warn("GA4 library found but initialize function is missing", ReactGA);
    }
  } catch (error) {
    console.error("Failed to initialize GA4:", error);
  }
};

const logEvent = (category, action, label) => {
  try {
    const ga = getGA();
    if (ga && typeof ga.event === 'function') {
      ga.event({
        category: category,
        action: action,
        label: label,
      });
    }
  } catch (error) {
    console.warn("Failed to log GA4 event:", error);
  }
};

export default { initGA, logEvent };
