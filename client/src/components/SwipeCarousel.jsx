import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./SwipeCarousel.css";

const imgs = [
  "/carousel/food_1.jpg",
  "/carousel/food_2.jpg",
  "/carousel/food_3.jpg",
  "/carousel/food_4.jpg",
  "/carousel/food_5.jpg",
];

const SwipeCarousel = () => {
  const [imgIndex, setImgIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(imgIndex);
      setImgIndex((prev) => (prev + 1) % imgs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imgIndex]);

  return (
    <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
           className="carousel-container">
      <div className="phone-frame">
        <AnimatePresence mode="wait">
          {prevIndex !== null && (
            <motion.img
              key={`prev-${prevIndex}`}
              src={imgs[prevIndex]}
              className="carousel-image"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              /* exit={{ opacity: 0 }} */
              transition={{ duration: 1 }}
              alt={`food-prev-${prevIndex + 1}`}
            />
          )}
          <motion.img
            key={`current-${imgIndex}`}
            src={imgs[imgIndex]}
            className="carousel-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            alt={`food-${imgIndex + 1}`}
          />
        </AnimatePresence>

        <div className="carousel-dots">
          {imgs.map((_, idx) => (
            <span
              key={idx}
              className={`dot ${imgIndex === idx ? "active" : ""}`}
              onClick={() => {
                setPrevIndex(imgIndex);
                setImgIndex(idx);
              }}
            ></span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCarousel;
