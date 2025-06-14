// VisitDish.jsx
import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaLink } from "react-icons/fa";
import "./VisitDish.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import IngredientList from "../components/IngredientList.jsx"; // ✅ NEW import

const VisitDish = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const allRecipes = location.state?.recipes || [];
  const [dish, setDish] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false); // ✅ NEW state

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));

    const fetchDishDetails = async () => {
      try {
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=7eb495e634104e24aa445a2a2d7bf89c`
        );
        if (!response.ok) throw new Error("Failed to fetch recipe details");
        const data = await response.json();
        setDish(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load recipe details");
        setDish(null);
      }
    };

    fetchDishDetails();
  }, [id]);

  const handleFavorite = () => {
    if (!dish) return;

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = isFavorite
      ? favorites.filter(fav => fav.id !== parseInt(id))
      : [...favorites, {
          id: parseInt(id),
          title: dish.title,
          image: dish.image,
          readyInMinutes: dish.readyInMinutes
        }];

    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites!");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/visit-dish/${id}`
      );
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error("Failed to copy: ", err);
    }
  };

  if (!dish) return <div className="loading">Loading...</div>;

  const suggestedRecipes = allRecipes
    .filter((recipe) => recipe.id !== parseInt(id))
    .slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="dish-container">
        <Header />

        <div className="dish-header">
          <h1 className="dish-title-large">{dish.title}</h1>
          <div className="action-buttons">
            <button
              onClick={handleFavorite}
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart className="icon" /> : <FaRegHeart className="icon" />}
            </button>
            <button
              onClick={handleShare}
              className="share-btn"
              aria-label="Share recipe"
            >
              <FaLink className="icon" />
            </button>
          </div>
        </div>

        <div className="dish-image-container">
          <img src={dish.image} alt={dish.title} className="dish-image" />
        </div>

        {/* INGREDIENTS SECTION */}
        <div className="section">
          <h2 className="section-title">Ingredients</h2>
          <div className="ingredients-grid">
            {dish.extendedIngredients.map((ingredient, index) => (
  <div key={ingredient.id || `${ingredient.name}-${index}`} className="ingredient-card">
    <img
      src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient.image}`}
      alt={ingredient.name}
    />
    <p className="ingName">{ingredient.original}</p>
  </div>
))}
          </div>

          {/* ✅ New Button */}
          <button
            className="generate-list-btn"
            onClick={() => setShowIngredientModal(true)}
          >
            Generate Ingredients Price List
          </button>
        </div>

        {/* EQUIPMENT */}
        <div className="section">
          <h2 className="section-title">Equipment</h2>
          <div className="equipment-list">
            {dish.analyzedInstructions[0]?.steps.flatMap((step) => step.equipment).map((equipment, index) => (
              <div key={index} className="equipment-name">
                <p>{index + 1}.{equipment.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INSTRUCTIONS */}
        <div className="section">
          <h2 className="section-title">Instructions</h2>
          <ol className="instructions-list">
            {dish.analyzedInstructions[0]?.steps.map((step) => (
              <li key={step.number}>{step.step}<br /><br /></li>
            ))}
          </ol>
        </div>

        {/* NUTRITION */}
        <div className="section">
          <h2 className="section-title">Nutritional Information</h2>
          <div className="nutrition-grid">
            {dish.nutrition?.nutrients.map((nutrient) => (
              <div key={nutrient.name} className="nutrition-card">
                <p className="nutiName">
                  <strong>{nutrient.name}:</strong> {nutrient.amount} {nutrient.unit}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SUGGESTED */}
        <div className="section">
          <h2 className="section-title">Suggested Dishes</h2>
          <div className="suggestions-grids">
            {suggestedRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-cards">
                <img src={recipe.image} alt={recipe.title} />
                <h3>{recipe.title}</h3>
                <button
                  onClick={() =>
                    navigate(`/visit-dish/${recipe.id}`, {
                      state: { recipes: allRecipes },
                    })
                  }
                  className="view-recipes"
                >
                  View Recipe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ IngredientList Modal */}
      {showIngredientModal && (
        <IngredientList
          ingredients={dish.extendedIngredients}
          onClose={() => setShowIngredientModal(false)}
        />
      )}

      <Footer />
    </div>
  );
};

export default VisitDish;
