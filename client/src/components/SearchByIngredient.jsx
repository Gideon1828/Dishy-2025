import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mic } from "lucide-react";
import Modal from "../context/Modal";
import "./SearchByIngredient.css";
import { motion } from "framer-motion";

const API_KEY = "7eb495e634104e24aa445a2a2d7bf89c";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SearchByIngredient = () => {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState(["", "", "", "", ""]);
  const [cuisine, setCuisine] = useState("");
  const [modal, setModal] = useState({ message: "", type: "alert", variant: "success" });
  const matchThreshold = 70;
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("https://dishy-2g4s.onrender.com/working", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUsername(response.data.username))
        .catch(console.error);
    }
  }, []);

  const addIngredient = () => setIngredients([...ingredients, ""]);

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index, value) => {
    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = ingredients.some((ing, i) => i !== index && ing.trim().toLowerCase() === trimmedValue);
    if (isDuplicate) {
      setModal({ message: "Duplicate ingredients are not allowed.", type: "prompt", variant: "error" });
      return;
    }
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  const handleVoiceSearch = (index) => {
    const button = document.getElementById(`voiced-btns-${index}`);
    button.classList.add("clicked");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setModal({ message: "Your browser does not support Speech Recognition.", type: "prompt", variant: "error" });
      button.classList.remove("clicked");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleIngredientChange(index, transcript);
    };

    recognition.onerror = (event) => console.error("Voice recognition error:", event.error);

    recognition.onend = () => button.classList.remove("clicked");
  };

  const normalizeIngredient = (ing) => ing.trim().toLowerCase().replace(/s$/, "");

  const calculateMatchScore = (recipe, userIngredientsSet) => {
    const allRecipeIngredients = [...recipe.usedIngredients, ...recipe.missedIngredients]
      .map((ing) => normalizeIngredient(ing.name));

    const matchingCount = allRecipeIngredients.filter((ing) => userIngredientsSet.has(ing)).length;
    return {
      score: (matchingCount / allRecipeIngredients.length) * 100,
      missingIngredients: allRecipeIngredients.filter((ing) => !userIngredientsSet.has(ing)),
      matchingCount,
    };
  };

  const handleSearch = async () => {
    const nonEmptyIngredients = ingredients.filter((ing) => ing.trim() !== "");

    if (!cuisine || cuisine === "Select Cuisine") {
      setModal({ message: "Please select a cuisine type.", type: "prompt", variant: "error" });
      return;
    }

    if (nonEmptyIngredients.length < 1) {
      setModal({ message: "Please enter at least 1 ingredient.", type: "prompt", variant: "error" });
      return;
    }

    setLoading(true);
    const ingredientQuery = nonEmptyIngredients.join(",");
    const urls = [
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientQuery}&number=15&ranking=1&ignorePantry=true&apiKey=${API_KEY}`,
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientQuery}&number=15&ranking=2&ignorePantry=true&apiKey=${API_KEY}`,
    ];

    try {
      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const data = await Promise.all(responses.map((res) => res.json()));
      const allRecipes = [...data[0], ...data[1]].reduce((acc, current) => {
        if (!acc.find((item) => item.id === current.id)) acc.push(current);
        return acc;
      }, []);

      const userIngredientsSet = new Set(nonEmptyIngredients.map(normalizeIngredient));
      const scoredRecipes = allRecipes.map((recipe) => {
        const matchData = calculateMatchScore(recipe, userIngredientsSet);
        return { ...recipe, matchPercentage: matchData.score, missingIngredients: matchData.missingIngredients, matchingCount: matchData.matchingCount };
      });

      const filteredRecipes = scoredRecipes.filter((recipe) => {
        const meetsThreshold = recipe.matchPercentage >= matchThreshold;
        const cuisineMatch = cuisine === "Any" || (recipe.cuisines && recipe.cuisines.includes(cuisine));
        return meetsThreshold && cuisineMatch;
      }).sort((a, b) => b.matchPercentage - a.matchPercentage);

      if (filteredRecipes.length > 0) {
        navigate("/results", {
          state: {
            recipes: filteredRecipes,
            userIngredients: nonEmptyIngredients,
          },
        });
      } else {
        const closestMatches = scoredRecipes
          .filter((r) => cuisine === "Any" || (r.cuisines && r.cuisines.includes(cuisine)))
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 5);

        if (closestMatches.length > 0) {
          setModal({
            message: `closest match Found is ${Math.round(closestMatches[0].matchPercentage)}% 
             For${matchThreshold}% Threshold. Would you like to see these recipes?`,
            type: "prompt",
            variant: "success",
            onConfirm: () =>
              navigate("/results", {
                state: { recipes: closestMatches, userIngredients: nonEmptyIngredients },
              }),
          });
        } else {
          setModal({ message: "No recipes found. Try different ingredients.", type: "prompt", variant: "error" });
        }
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setModal({ message: "Something went wrong. Please try again.", type: "prompt", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetIngredients = () => setIngredients(["", "", "", "", ""]);
  const placeholderExamples = ["Eg. Chicken", "Eg. Tomato", "Eg. Onion", "Eg. Garlic", "Eg. Rice"];

  return (
    <motion.div
      className="ingredient-container"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      {modal.message && (
        <Modal
          message={modal.message}
          type={modal.type}
          variant={modal.variant}
          onClose={() => setModal({ ...modal, message: "" })}
          onConfirm={modal.onConfirm}
        />
      )}

      <motion.h2 variants={itemVariants}>Welcome {username || "Guest"}</motion.h2>
      <motion.h2 className="ingredient-title" variants={itemVariants}>Add Ingredients to Find New Recipes</motion.h2>

      <motion.div className="ingredient-form" variants={itemVariants}>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-input-group">
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type="text"
                placeholder={placeholderExamples[index]}
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="ingredient-input"
                style={{ paddingRight: "44px" }}
              />
              <button
                id={`voiced-btns-${index}`}
                className="voiced-btns"
                onClick={() => handleVoiceSearch(index)}
                aria-label="Voice Input"
              >
                <Mic size={18} />
              </button>
            </div>
            <button className="ingredient-btn add" onClick={addIngredient}>+</button>
            {index >= 0 && (
              <button className="ingredient-btn remove" onClick={() => removeIngredient(index)}>-</button>
            )}
          </div>
        ))}
      </motion.div>

      <motion.div className="cuisine-controls" variants={itemVariants}>
        <button className="reset-btn" onClick={resetIngredients}>Reset</button>
        <select className="select-cuisine" onChange={(e) => setCuisine(e.target.value)} value={cuisine}>
          <option value="">Select Cuisine</option>
          <option value="Any">Any</option>
          <option value="Indian">Indian</option>
          <option value="Mexican">Mexican</option>
          <option value="Chinese">Chinese</option>
          <option value="Italian">Italian</option>
          <option value="Japanese">Japanese</option>
          <option value="French">French</option>
          <option value="Thai">Thai</option>
          <option value="Middle Eastern">Middle Eastern</option>
          <option value="Vietnamese">Vietnamese</option>
          <option value="Korean">Korean</option>
          <option value="Burmese">Burmese</option>
        </select>
      </motion.div>

      <motion.button
        className="submit-btn"
        onClick={handleSearch}
        disabled={loading}
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? "Loading..." : "Find Recipes"}
      </motion.button>
    </motion.div>
  );
};

export default SearchByIngredient;
