import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./AuthComponent.css";

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

const AuthComponent = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Ensures animation triggers on refresh
    setHasMounted(true);
  }, []);

  return (
    <div className="auth-container">
      <motion.div
        className="separator"
        initial="hidden"
        animate={hasMounted ? "visible" : "hidden"}
        variants={fadeInUp(0.1)}
      />

      <motion.div
        className="content"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        variants={fadeInUp(0.2)}
      >
        <motion.h2
          className="title"
          initial="hidden"
          animate={hasMounted ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp(0.3)}
        >
          Ask for Recipes at Dishy!!
        </motion.h2>

        <motion.p
          className="description"
          initial="hidden"
          animate={hasMounted ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp(0.4)}
        >
          You are confused about what to cook? No problem! Dishy is here to help.
          Just type in the ingredients you have, and Dishy will help you create a recipe easily.
        </motion.p>

        <motion.img
          src="/auth/img_register.png"
          alt="Dishy"
          className="image"
          initial="hidden"
          animate={hasMounted ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp(0.5)}
        />

        <motion.div
          className="what-can-you-do"
          initial="hidden"
          animate={hasMounted ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp(0.6)}
        >
          <h3>What can you do here?</h3>
          <div className="lists">
            <ul className="list">
              <li>Find cooking ideas using the ingredients you already have in your pantry.</li>
              <li>Save the cooking ideas you've created.</li>
            </ul>
            <ul className="list">
              <li>Check out awesome recipes created by AI.</li>
              <li>Get new inspiration for your meals.</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          className="closing-text"
          initial="hidden"
          animate={hasMounted ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: false }}
          variants={fadeInUp(0.7)}
        >
          So, no more stressing over what to cook!
          <br />
          <strong>Dishy bro is ready to help you.</strong>
        </motion.div>
      </motion.div>

      <motion.div
        className="separator"
        initial="hidden"
        animate={hasMounted ? "visible" : "hidden"}
        variants={fadeInUp(0.8)}
      />
    </div>
  );
};

export default AuthComponent;
