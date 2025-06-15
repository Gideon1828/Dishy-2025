import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaLink } from "react-icons/fa";
import "./VisitDish.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import IngredientList from "../components/IngredientList.jsx";

const VisitDish = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const allRecipes = location.state?.recipes || [];

  const [dish, setDish] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  const commentsPerPage = 5;

  
  
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.some(fav => fav.id === parseInt(id)));

    const fetchDishDetails = async () => {
      try {
        setDish(null);
        const response = await fetch(
          `https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=94b3cb9092c543f6892ed1aeffbb9de9`
        );
        if (!response.ok) throw new Error("Failed to fetch recipe details");
        const data = await response.json();
        setDish(data);
      } catch (error) {
        toast.error("Failed to load recipe details");
        console.error(error);
      }
    };

    const fetchRatingsAndComments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (!res.ok) throw new Error("Failed to fetch ratings/comments");

        const data = await res.json();
        setRatings(data.allRatings);
        setComments(data.allRatings.filter(item => item.comment));
        setNewRating(data.userRating || 0);
      } catch (err) {
        console.error("Error fetching ratings/comments:", err);
      }
    };

    fetchDishDetails();
    fetchRatingsAndComments();
  }, [id]);
    

   useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUser({ id: payload.id, email: payload.email });
    }
  }, []);
   const handleRatingClick = async (rating) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Login to rate");

    try {
      setNewRating(rating);
      const res = await fetch(`https://dishy-2g4s.onrender.com/rate-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dishId: id, rating }),
      });

      if (!res.ok) throw new Error("Rating failed");

      const updatedRes = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setRatings(updatedData.allRatings);
      setComments(updatedData.allRatings.filter(item => item.comment));
    } catch (err) {
      toast.error("Failed to submit rating");
    }
  };

  const handleEditClick = (commentId, originalText) => {
  setEditingCommentId(commentId);
  setEditedText(originalText);
};

const handleCancelEdit = () => {
  setEditingCommentId(null);
  setEditedText("");
};

const handleUpdateComment = async (commentId) => {
  try {
    const token = localStorage.getItem("token");

    console.log("Trying to update comment ID:", commentId);
    console.log("Trying to update token ID:", token);
    const res = await fetch(`https://dishy-2g4s.onrender.com/api/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ comment: editedText }),
    });

    if (!res.ok) throw new Error("Failed to update comment");

    toast.success("Comment updated");
    setEditingCommentId(null);
    setEditedText("");

    // Refresh comments
    const updatedRes = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedData = await updatedRes.json();
    setRatings(updatedData.allRatings);
    setComments(updatedData.allRatings.filter(item => item.comment));
  } catch (err) {
    toast.error("Update failed");
    console.error(err);
  }
};

const handleDeleteComment = async (commentId) => {
  if (!window.confirm("Are you sure you want to delete this comment?")) return;

  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`https://dishy-2g4s.onrender.com/api/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete comment");

    toast.success("Comment deleted");

    // Refresh comments
    const updatedRes = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const updatedData = await updatedRes.json();
    setRatings(updatedData.allRatings);
    setComments(updatedData.allRatings.filter(item => item.comment));
  } catch (err) {
    toast.error("Deletion failed");
    console.error(err);
  }
};

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return toast.error("Comment cannot be empty");
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Login required");

    try {
      const res = await fetch(`https://dishy-2g4s.onrender.com/rate-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dishId: id, comment: newComment }),
      });

      if (!res.ok) throw new Error("Comment failed");

      toast.success("Comment added");
      setNewComment("");
      const updatedRes = await fetch(`https://dishy-2g4s.onrender.com/rate-comment/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = await updatedRes.json();
      setRatings(updatedData.allRatings);
      setComments(updatedData.allRatings.filter(item => item.comment));
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

 

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
      await navigator.clipboard.writeText(`${window.location.origin}/visit-dish/${id}`);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
      console.error(err);
    }
  };

  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(comments.length / commentsPerPage);

  if (!dish) return <div className="loading">Loading...</div>;

  const suggestedRecipes = allRecipes.filter(recipe => recipe.id !== parseInt(id)).slice(0, 6);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <Header />
      <div className="dish-container">
        <div className="dish-header">
          <h1 className="dish-title-large">{dish.title}</h1>
          <div className="action-buttons">
            <button onClick={handleFavorite} className={`favorite-btn ${isFavorite ? 'active' : ''}`}>
              {isFavorite ? <FaHeart className="icon" /> : <FaRegHeart className="icon" />}
            </button>
            <button onClick={handleShare} className="share-btn">
              <FaLink className="icon" />
            </button>
          </div>
        </div>

        <div className="dish-image-container">
          <img src={dish.image} alt={dish.title} className="dish-image" />
        </div>

        <div className="section">
          <h2 className="section-title">Ingredients</h2>
          <div className="ingredients-grid">
            {dish.extendedIngredients.map((ing, i) => (
              <div key={ing.id || i} className="ingredient-card">
                <img src={`https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`} alt={ing.name} />
                <p className="ingName">{ing.original}</p>
              </div>
            ))}
          </div>
          <button className="generate-list-btn" onClick={() => setShowIngredientModal(true)}>
            Generate Ingredients Price List
          </button>
        </div>

        <div className="section">
          <h2 className="section-title">Equipment</h2>
          <div className="equipment-list">
            {dish.analyzedInstructions?.[0]?.steps?.flatMap(step => step.equipment)?.map((eq, i) => (
              <div key={i} className="equipment-name">
                <p>{i + 1}. {eq.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="section">
          <h2 className="section-title">Instructions</h2>
          {dish.analyzedInstructions?.length > 0 ? (
            <ol className="instructions-list">
              {dish.analyzedInstructions[0].steps.map(step => (
                <li key={step.number}>{step.step}</li>
              ))}
            </ol>
          ) : (
            <p>No instructions available</p>
          )}
        </div>

        <div className="section">
          <h2 className="section-title">Nutritional Information</h2>
          <div className="nutrition-grid">
            {dish.nutrition?.nutrients.map(nut => (
              <div key={nut.name} className="nutrition-card">
                <p><strong>{nut.name}:</strong> {nut.amount} {nut.unit}</p>
              </div>
            ))}
          </div>
        </div>

       

        <div className="feedback-section">
          <h2 className="section-title">Ratings & Comments</h2>

          <div className="rating-input">
            {[1, 2, 3, 4, 5].map(i => (
              <span
                key={i}
                style={{ cursor: "pointer", fontSize: "24px", color: i <= newRating ? "#f5c518" : "#ccc" }}
                onClick={() => handleRatingClick(i)}
              >★</span>
            ))}
          </div>

          <div className="feedback-form">
            <textarea
              placeholder="Write your comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={handleSubmitComment}>Submit Feedback</button>
          </div>

          {/* Comments UI unchanged */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p>No comments yet. Be the first to share your thoughts!</p>
            ) : (
              <>
                {currentComments
                  .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                  .map((cmt) => (
                    <div key={cmt._id} className="comment-box">
                      <p><strong>{cmt.username || "Anonymous"}:</strong></p>
                      {editingCommentId === cmt._id ? (
                        <>
                          <textarea value={editedText} onChange={e => setEditedText(e.target.value)} />
                          <button onClick={() => handleUpdateComment(cmt._id)}>Save</button>
                          <button onClick={handleCancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <p>{cmt.comment}</p>
                          <span>{new Date(cmt.timestamp).toLocaleString()}</span>
                          {currentUser?.id === cmt.userId && (
                            <div className="comment-actions">
                              <button onClick={() => handleEditClick(cmt._id, cmt.comment)}>Edit</button>
                              <button onClick={() => handleDeleteComment(cmt._id)}>Delete</button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}

                <div className="pagination-controls">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

       

        <div className="section">
          <h2 className="section-title">Suggested Dishes</h2>
          <div className="suggestions-grids">
            {suggestedRecipes.map((recipe) => (
              <div key={recipe.id} className="recipe-cards">
                <img src={recipe.image} alt={recipe.title} />
                <h3>{recipe.title}</h3>
                <button onClick={() => navigate(`/visit-dish/${recipe.id}`, { state: { recipes: allRecipes } })}>
                  View Recipe
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

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
