"use client";
import { Observer } from "tailwindcss-intersect";
import { useEffect } from "react";
import PropTypes from "prop-types";

export default function ObserverProvider({ children }) {
  useEffect(() => {
    Observer.start();
  }, []);

  return <>{children}</>;
}

ObserverProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
