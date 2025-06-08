import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./SearchByIngredient.css";

const API_KEY = "7eb495e634104e24aa445a2a2d7bf89c";

const SearchByIngredient = () => {
  const [loading, setLoading] = useState(false);
  const [ingredients, setIngredients] = useState(["", "", "", "", ""]);
  const [cuisine, setCuisine] = useState("");
  const matchThreshold = 70; // Fixed at 70% (removed state)
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("https://dishy-2g4s.onrender.com/working", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUsername(response.data.username);
        })
        .catch((error) => {
          console.error("Error fetching data from MongoDB:", error);
        });
    }
  }, []);

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleIngredientChange = (index, value) => {
    const trimmedValue = value.trim().toLowerCase();
    const isDuplicate = ingredients.some(
      (ing, i) => i !== index && ing.trim().toLowerCase() === trimmedValue
    );
    if (isDuplicate) {
      alert("Duplicate ingredients are not allowed.");
      return;
    }

    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = value;
    setIngredients(updatedIngredients);
  };

  const handleVoiceSearch = (index) => {
    const button = document.getElementById(`voiced-btns-${index}`);
    button.classList.add("clicked");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.");
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

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
    };

    recognition.onend = () => {
      button.classList.remove("clicked");
    };
  };

  const normalizeIngredient = (ing) => {
    return ing.trim().toLowerCase().replace(/s$/, "");
  };

  const calculateMatchScore = (recipe, userIngredientsSet) => {
    const allRecipeIngredients = [
      ...recipe.usedIngredients,
      ...recipe.missedIngredients
    ].map(ing => normalizeIngredient(ing.name));

    const matchingIngredients = allRecipeIngredients.filter(ing => 
      userIngredientsSet.has(ing)
    ).length;

    return {
      score: (matchingIngredients / allRecipeIngredients.length) * 100,
      missingIngredients: allRecipeIngredients.filter(ing => 
        !userIngredientsSet.has(ing)
      ),
      matchingCount: matchingIngredients
    };
  };

  const handleSearch = async () => {
    const nonEmptyIngredients = ingredients.filter((ing) => ing.trim() !== "");

    if (!cuisine || cuisine === "" || cuisine === "Select Cuisine") {
      alert("Please select a cuisine type.");
      return;
    }

    if (nonEmptyIngredients.length < 1) { // Changed from 5 to 1 for flexibility
      alert("Please enter at least 1 ingredient.");
      return;
    }

    setLoading(true);
    const ingredientQuery = nonEmptyIngredients.join(",");
    
    // Try both ranking methods and combine results
    const urls = [
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientQuery}&number=15&ranking=1&ignorePantry=true&apiKey=${API_KEY}`,
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredientQuery}&number=15&ranking=2&ignorePantry=true&apiKey=${API_KEY}`
    ];

    try {
      const responses = await Promise.all(urls.map(url => fetch(url)));
      const data = await Promise.all(responses.map(res => res.json()));
      
      // Combine and deduplicate recipes
      const allRecipes = [...data[0], ...data[1]].reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) return acc.concat([current]);
        return acc;
      }, []);

      const userIngredientsSet = new Set(
        nonEmptyIngredients.map(normalizeIngredient)
      );

      // Calculate match score for each recipe
      const scoredRecipes = allRecipes.map(recipe => {
        const matchData = calculateMatchScore(recipe, userIngredientsSet);
        return {
          ...recipe,
          matchPercentage: matchData.score,
          missingIngredients: matchData.missingIngredients,
          matchingCount: matchData.matchingCount
        };
      });

      // Filter by threshold and cuisine
      const filteredRecipes = scoredRecipes.filter(recipe => {
        const meetsThreshold = recipe.matchPercentage >= matchThreshold;
        const cuisineMatch = cuisine === "Any" || 
                           (recipe.cuisines && recipe.cuisines.includes(cuisine));
        return meetsThreshold && cuisineMatch;
      });

      // Sort by best match (highest percentage first)
      filteredRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);

      if (filteredRecipes.length > 0) {
        navigate("/results", { 
          state: { 
            recipes: filteredRecipes,
            userIngredients: nonEmptyIngredients 
          } 
        });
      } else {
        // Show closest matches if no exact matches
        const closestMatches = scoredRecipes
          .filter(recipe => cuisine === "Any" || 
                          (recipe.cuisines && recipe.cuisines.includes(cuisine)))
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, 5);

        if (closestMatches.length > 0) {
          const proceed = window.confirm(
            `No recipes match ${matchThreshold}% of your ingredients. ` +
            `Would you like to see the closest matches (${Math.round(closestMatches[0].matchPercentage)}% match)?`
          );
          if (proceed) {
            navigate("/results", { 
              state: { 
                recipes: closestMatches,
                userIngredients: nonEmptyIngredients 
              } 
            });
          }
        } else {
          alert("No recipes found matching your criteria. Try different ingredients.");
        }
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetIngredients = () => {
    setIngredients(["", "", "", "", ""]);
  };


  const placeholderExamples = [
  "Eg. Chicken",
  "Eg. Tomato",
  "Eg. Onion",
  "Eg. Garlic",
  "Eg. Rice"
];
  return (
    <div className="ingredient-container">
      <h2>Welcome {username || "Guest"}</h2>
      <h2 className="ingredient-title">Add Ingredients to Find New Recipes</h2>

      {/* Removed the threshold slider control */}

      <div className="ingredient-form">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="ingredient-input-group">
            <input
              type="text"
              placeholder={placeholderExamples[index] }
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              className="ingredient-input"
            />
            <button
              id={`voiced-btns-${index}`}
              className="voiced-btns"
              onClick={() => handleVoiceSearch(index)}
            >
              🎤
            </button>
            <button className="ingredient-btn add" onClick={addIngredient}>
              +
            </button>
            {index > 0 && (
              <button
                className="ingredient-btn remove"
                onClick={() => removeIngredient(index)}
              >
                -
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="cuisine-controls">
        <button className="reset-btn" onClick={resetIngredients}>
          Reset
        </button>
        <select
          className="select-cuisine"
          onChange={(e) => setCuisine(e.target.value)}
          value={cuisine}
        >
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
      </div>

      <button className="submit-btn" onClick={handleSearch} disabled={loading}>
        {loading ? "Loading..." : "Find Recipes"}
      </button>
    </div>
  );
};

export default SearchByIngredient;