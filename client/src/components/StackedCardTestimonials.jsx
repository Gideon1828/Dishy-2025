import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./StackedCardTestimonials.css";

const testimonials = [
  {
    quote:
      "The recipes on this website are really helpful! The ingredient-based search feature makes cooking more practical and enjoyable.",
    name: "Agatha Ita",
    role: "Homemaker",
  },
  {
    quote:
      "This Dishy recipe website is top-notch! Finding recipes with the ingredients I have is so easy...",
    name: "Ana Soviyana",
    role: "Homemaker",
  },
  {
    quote:
      "Dishy has made my meal planning effortless! Dishy suggestions are always spot-on.",
    name: "David Carter",
    role: "Chef",
  },
];

const fadeInUp = (delay = 0.2) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: "easeOut",
    },
  },
});

const StackedCardTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
    >
      <motion.section className="testimonial-section" variants={fadeInUp(0.1)}>
        <motion.h2 className="testimonial-title" variants={fadeInUp(0.2)}>
          What our customers think
        </motion.h2>

        <motion.div className="progress-bar" variants={fadeInUp(0.3)}>
          {testimonials.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${
                index === currentIndex ? "active" : ""
              }`}
            ></div>
          ))}
        </motion.div>

        <motion.div
          className="testimonial-container"
          variants={fadeInUp(0.4)}
        >
          <div className="testimonial-card">
            <p className="testimonial-quote">
              <em>"{testimonials[currentIndex].quote}"</em>
            </p>
            <p className="testimonial-author">
              <strong>{testimonials[currentIndex].name}</strong>
            </p>
            <p className="testimonial-role">
              {testimonials[currentIndex].role}
            </p>
          </div>
        </motion.div>
      </motion.section>

      <motion.div className="space" variants={fadeInUp(0.5)} />
      <motion.div className="separator" variants={fadeInUp(0.6)} />
    </motion.div>
  );
};

export default StackedCardTestimonials;
