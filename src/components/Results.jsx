import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Results.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const allRecipes = location.state?.recipes || [];

  const [visibleCount, setVisibleCount] = useState(6);
  const [filter, setFilter] = useState("all");
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true); // New loading state

  // Fetch favorite recipe IDs from the backend
  useEffect(() => {
  const fetchFavorites = async () => {
    try {
      const res = await fetch("https://dishy-2g4s.onrender.com/favorite", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const favorites = await res.json();
      setFavoriteIds(favorites.map(fav => String(fav.id)));
    } catch (err) {
      console.error(err);
    } finally {
      // ✅ Always set loading to false, even on error
      setFavoritesLoading(false);
    }
  };

  fetchFavorites();
}, []);
// 👈 Re-run whenever user navigates to this page


  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, allRecipes.length));
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/visit-dish/${recipeId}`, { state: { recipes: allRecipes } });
  };

  const isVeg = (recipe) => {
    const vegKeywords = [
      "tomato", "potato", "spinach", "paneer", "carrot", "cauliflower",
    ];
    const nonVegKeywords = [
      "chicken", "mutton", "fish", "egg", "beef", "pork", "bone", "ribs",
    ];

    const title = recipe.title.toLowerCase();
    const ingredients = recipe.ingredients?.join(" ").toLowerCase() || "";

    if (nonVegKeywords.some((kw) => title.includes(kw) || ingredients.includes(kw))) return false;
    if (vegKeywords.some((kw) => title.includes(kw) || ingredients.includes(kw))) return true;
    return true;
  };

  const filteredRecipes = allRecipes.filter((recipe) => {
    const vegStatus = isVeg(recipe);
    if (filter === "all") return true;
    return filter === "veg" ? vegStatus : !vegStatus;
  });

  const toggleFavorite = async (recipe) => {
  const isCurrentlyFavorite = favoriteIds.includes(String(recipe.id));

  try {
    const res = await fetch("https://dishy-2g4s.onrender.com/favorite", {
      method: isCurrentlyFavorite ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ recipe }),
    });

    if (!res.ok) throw new Error("Failed to update favorite");

    if (isCurrentlyFavorite) {
  setFavoriteIds((prev) => {
    const updated = prev.filter((id) => id !== String(recipe.id)); // <-- change here
    console.log("Removed favoriteIds:", updated);
    return updated;
  });
  toast.success("Removed from favorites");
} else {
  setFavoriteIds((prev) => {
    const updated = [...prev, String(recipe.id)]; // <-- and here
    console.log("Added favoriteIds:", updated);
    return updated;
  });
  toast.success("Added to favorites");
}
  } catch (err) {
    console.error("Error updating favorites:", err);
    toast.error("Error saving favorite. Please try again.");
  }
};


  return (
    <div className="results-container">
      <h2>Search Results</h2>
      <div className="filter-container">
        <label>Filter: </label>
        <select
          className="select-filter"
          onChange={(e) => setFilter(e.target.value)}
          value={filter}
        >
          <option value="all">All</option>
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
        </select>
      </div>

      {favoritesLoading ? (
        <p>Loading favorites...</p>
      ) : filteredRecipes.length === 0 ? (
        <p>No results found. Try searching again.</p>
      ) : (
        <>
          <div className="results-grid">
            {filteredRecipes.slice(0, visibleCount).map((recipe) => {
              const isFavorite = favoriteIds.includes(String(recipe.id));

              return (
                <div key={recipe.id} className="recipe-card">
                  <button
                    className={`favorite-btn ${isFavorite ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe);
                    }}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite ? "❤️" : "🤍"}
                  </button>

                  <img src={recipe.image} alt={recipe.title} />
                  <h3>{recipe.title}</h3>

                  <div className="card-actions">
                    <button
                      onClick={() => handleViewRecipe(recipe.id)}
                      className="view-recipe"
                    >
                      View Recipe
                    </button>
                    <button
                      className="share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(
                          `${window.location.origin}/visit-dish/${recipe.id}`
                        );
                        toast.success("Link copied to clipboard!");
                      }}
                    >
                      🔗 Share
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < filteredRecipes.length ? (
            <button className="load-more-btn" onClick={loadMore}>
              Load More
            </button>
          ) : (
            <p className="end-message">🎉 End of results! 🎉</p>
          )}
        </>
      )}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default Results;
