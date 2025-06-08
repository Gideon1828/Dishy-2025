import React from "react";
import Header from "../components/Header.jsx";  // Import your Header component
import Results from "../components/Results.jsx";  // Import your Results component
import Footer from "../components/Footer.jsx";  // Import your Footer component

const ResultsPage = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column"}}>
      <Header />
      <Results />
      <Footer />
    </div>
  );
};

export default ResultsPage;
