import React from "react";
import styles from "./Hero.module.css"; // Assuming you're using CSS Modules
import { Link } from "react-router-dom";
import { motion } from 'framer-motion'; // Ensure proper routing

const Hero = () => {
  return (
    <motion.div
      className={styles.heroContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}>
      <motion.div
        className={styles.textContainer}
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >Your Personal  Cooking Master</motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >Are you hungry? Want to cook but feeling confused?</motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >What do you want to cook with the limited ingredients you have?</motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >You want to cook, but...</motion.p>
        <ul className={styles.problemList}>
          <li>1. Limited Ingredients</li>
          <li>2. Concerns About Dish Variations</li>
          <li>3. Difficulty Choosing a Menu</li>
          <li>4. Ran Out of Ideas for What to Cook</li>
        </ul>
        
          <motion.Link to="/login" className={styles.createRecipeBtn}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          >Create Recipe</motion.Link>
        
      </motion.div>
    </motion.div>
  );
};

export default Hero;
