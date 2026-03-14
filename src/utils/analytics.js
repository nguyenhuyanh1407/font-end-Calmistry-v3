import ReactGA from "react-ga4";
// Use the library object directly
const ga = ReactGA;

const MEASUREMENT_ID = "G-YX93B1WRN9";

const initGA = () => {
  ga.initialize(MEASUREMENT_ID);
};

const logEvent = (category, action, label) => {
  ga.event({
    category: category,
    action: action,
    label: label,
  });
};

export default { initGA, logEvent };
