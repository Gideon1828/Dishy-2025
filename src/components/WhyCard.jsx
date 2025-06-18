import React from "react";
import { motion } from "framer-motion";
import "./WhyCard.css";

const fadeInUp = (delay = 0.2) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.6,
      ease: "easeOut"
    }
  }
});

const WhyCard = () => {
  return (
    <div>
      <motion.section
        className="why-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={fadeInUp(0.1)}
      >
        <motion.h2
          className="why-title"
          variants={fadeInUp(0.2)}
        >
          Why Dishy
        </motion.h2>

        <div className="card-container">
          <motion.div className="card" variants={fadeInUp(0.3)}>
            <h3>Find Ideas Easily</h3>
            <p>
              No more overthinking! Just type in the ingredients you have, and Dishy will give you cooking ideas that fit perfectly!
            </p>
          </motion.div>

          <motion.div className="card" variants={fadeInUp(0.4)}>
            <h3>Awesome Recipes from All over World</h3>
            <p>
              Want to try unique recipes? Dishy has a collection of awesome recipes created directly by Professionals.
            </p>
          </motion.div>

          <motion.div className="card" variants={fadeInUp(0.5)}>
            <h3>Save Cooking Ideas</h3>
            <p>
              You can save all the cooking ideas you’ve created, so you don’t have to rummage through your pantry again.
            </p>
          </motion.div>

          <motion.div className="card" variants={fadeInUp(0.6)}>
            <h3>Delicious Recipes from All over World</h3>
            <p>
              From practical recipes to special dishes, Dishy will be your main source of inspiration for your meals!
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.div
        className="space"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        variants={fadeInUp(0.7)}
      />

      <motion.div
        className="separator"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false }}
        variants={fadeInUp(0.8)}
      />
    </div>
  );
};

export default WhyCard;
