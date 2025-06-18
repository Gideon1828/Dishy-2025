import React from "react";
import { motion } from "framer-motion";
import "./FAQ.css";

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

const FAQ = () => {
  return (
    <motion.div
      className="faq-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={fadeInUp(0.1)}
    >
      <motion.h2 className="faq-title" variants={fadeInUp(0.2)}>
        Frequently Asked Questions (FAQ)
      </motion.h2>

      <motion.div className="faq-item" variants={fadeInUp(0.3)}>
        <h3>1. Why Use Dishy?</h3>
        <p>
          Because with Dishy, We can provide cooking ideas that match the
          ingredients you have. No hassle—just type in the ingredients, and
          voila! You have got a new recipe!
        </p>
      </motion.div>

      <motion.div className="faq-item" variants={fadeInUp(0.4)}>
        <h3>2. How Much Does It Cost?</h3>
        <p>
          The good news is, you can enjoy Dishy without spending a single
          penny! Yup, all the features and goodness of Dishy are free for
          you to use.
        </p>
      </motion.div>

      <motion.div className="faq-item" variants={fadeInUp(0.5)}>
        <h3>3. How Does Dishy Help Me?</h3>
        <p>
          Dishy will be your best friend in the kitchen! You can find
          cooking ideas, save recipes, and check out awesome recipes created by
          Experts. Everything becomes easier with Dishy!
        </p>
      </motion.div>

      <motion.div className="faq-item" variants={fadeInUp(0.6)}>
        <h3>4. So, What’s the Difference Compared to Using Other Sites?</h3>
        <p>
          The difference is, with Dishy, you can do more than just ask for
          suggestions about the ingredients you have. You can save your favorite
          recipes, check out recipes from other users, and get new inspiration
          every day! So, besides making cooking more fun, you can also get
          awesome recipes from our community!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FAQ;
