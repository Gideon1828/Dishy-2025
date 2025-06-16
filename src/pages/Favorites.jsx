import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./Favorites.css";
import Header from '../components/Header';
import Footer from '../components/Footer';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [sortOrder, setSortOrder] = useState("latest"); // New sorting state
const [ratingsMap, setRatingsMap] = useState({});

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("https://dishy-2g4s.onrender.com/favorite", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(data);
        setFavoriteIds(data.map((r) => String(r.id)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);
  useEffect(() => {
  const fetchRatings = async () => {
    const token = localStorage.getItem("token");
    if (!token || favorites.length === 0) return;

    const fetches = favorites.map(async (recipe) => {
      try {
        const res = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${recipe.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const ratedOnly = data.allRatings.filter(r => r.rating > 0);
        const average = ratedOnly.length
          ? +(ratedOnly.reduce((sum, r) => sum + r.rating, 0) / ratedOnly.length).toFixed(1)
          : null;

        return {
          recipeId: recipe.id,
          averageRating: average,
          userCount: ratedOnly.length
        };
      } catch (err) {
        console.error("Failed to fetch ratings for", recipe.id, err);
        return null;
      }
    });

    const results = await Promise.all(fetches);

    const ratingsMap = {};
    results.forEach(r => {
      if (r) {
        ratingsMap[r.recipeId] = {
          averageRating: r.averageRating,
          userCount: r.userCount,
        };
      }
    });

    setRatingsMap(ratingsMap);
  };

  fetchRatings();
}, [favorites]);


  // Sort favorites based on sortOrder state
const sortedFavorites = [...favorites].sort((a, b) => {
  const idA = Number(a.id);
  const idB = Number(b.id);

  if (sortOrder === "latest") {
    return idB - idA; // higher id first = latest
  } else {
    return idA - idB; // lower id first = oldest
  }
});

  const handleViewRecipe = (recipeId) => {
    navigate(`/visit-dish/${recipeId}`, { state: { recipes: favorites } });
  };

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
        setFavorites((prev) => prev.filter((r) => r.id !== recipe.id));
        setFavoriteIds((prev) => prev.filter((id) => id !== String(recipe.id)));
        toast.success("Removed from favorites");
      } else {
        setFavorites((prev) => [...prev, recipe]);
        setFavoriteIds((prev) => [...prev, String(recipe.id)]);
        toast.success("Added to favorites");
      }

    } catch (err) {
      console.error(err);
      toast.error("Error updating favorite.");
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <div className="results-container">
        <h2>My Favorite Dishes</h2>

        {/* Sort dropdown UI */}
        <div className="filter-container" style={{ marginBottom: "1rem" }}>
          <label htmlFor="sortOrder">Sort by: </label>
          <select
            id="sortOrder"
            className="select-filter"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="old">Old</option>
          </select>
        </div>

        {loading ? (
          <p>Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <p>No favorites yet. Start adding some!</p>
        ) : (
          <div className="results-grid">
            {sortedFavorites.map((recipe) => {
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
                  {ratingsMap[recipe.id] && ratingsMap[recipe.id].averageRating != null && (

  <div className="average-rating-display">
    <span style={{ fontWeight: "bold", fontSize: "14px", marginRight: "4px" }}>
      Avg Rating:
    </span>
    {[1, 2, 3, 4, 5].map(i => (
      <span
        key={i}
        style={{
          color:
            i <= Math.floor(ratingsMap[recipe.id].averageRating)
              ? "#f5c518"
              : i - 0.5 <= ratingsMap[recipe.id].averageRating
              ? "#f5c518"
              : "#ccc",
          fontSize: "16px"
        }}
      >
        ★
      </span>
    ))}
    <span style={{ marginLeft: "6px", fontSize: "13px" }}>
      {ratingsMap[recipe.id].averageRating} ({ratingsMap[recipe.id].userCount} )
    </span>
  </div>
)}
                </div>
              );
            })}
          </div>
        )}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;
