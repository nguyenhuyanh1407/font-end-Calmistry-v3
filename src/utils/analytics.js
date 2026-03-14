import ReactGA from "react-ga4";

const MEASUREMENT_ID = "G-YX93B1WRN9";

const initGA = () => {
  ReactGA.initialize(MEASUREMENT_ID);
};

const logEvent = (category, action, label) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
  });
};

export default { initGA, logEvent };
