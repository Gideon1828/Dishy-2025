import React, { useState, useEffect } from "react";
import './Imagecarousals.css';
import { motion } from "framer-motion";

const images = [
  "/carousel/food_1.jpg",
  "/carousel/food_2.jpg",
  "/carousel/food_3.jpg",
  "/carousel/food_4.jpg",
  "/carousel/food_5.jpg",
];

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Imagecarousals = ({ onReadyClick }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleClick = () => {
    setButtonClicked(true);
    onReadyClick();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Welcome Box with scroll-triggered animation */}
      <motion.div
        className="welcome-box"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.h2 variants={itemVariants}>Welcome To Dishy !!</motion.h2>

        <motion.div variants={itemVariants}>
          <h3>How to Use Dishy</h3>
          <ol>
            <motion.li variants={itemVariants}>
              <strong>Search for Dishes</strong> - Use the search bar at the top to find any specific dish.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong>Find Recipes by Ingredients</strong> - Click the "Let's Go" button below these instructions to begin.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong>Add Ingredients</strong> - Enter your ingredients one by one (please check spelling).
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong>Select Cuisine</strong> - Choose your preferred cuisine type from the dropdown.
            </motion.li>
            <motion.li variants={itemVariants}>
              <strong>Get Recipes</strong> - Click "Find Recipes" to view your personalized results.
            </motion.li>
          </ol>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ready-button"
          onClick={handleClick}
        >
          {buttonClicked ? "Scroll Down ↓" : "Let's Go!"}
        </motion.button>
      </motion.div>

      {/* Image Carousel (left unchanged) */}
      <div className="image-slider">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Dish ${index + 1}`}
            className={`slide ${index === currentImage ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Imagecarousals;
