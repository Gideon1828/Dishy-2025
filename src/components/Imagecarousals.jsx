import React, { useState, useEffect } from "react";
import './Imagecarousals.css';

const images = [
  "/carousel/food_1.jpg",
  "/carousel/food_2.jpg",
  "/carousel/food_3.jpg",
  "/carousel/food_4.jpg",
  "/carousel/food_5.jpg",
];

const Imagecarousals = ({ onReadyClick }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [buttonClicked, setButtonClicked] = useState(false);

  const handleClick = () => {
            setButtonClicked(true);      // Change the button text
            onReadyClick();              // Trigger the parent component's logic
        };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Welcome Box */}
      <div className="welcome-box">
        <h2>Welcome To Dishy !!</h2>
        <div>
          <h3>How to Use Dishy</h3>
          <ol>
            <li><strong>Search for Dishes</strong> - Use the search bar at the top to find any specific dish.</li>
            <li><strong>Find Recipes by Ingredients</strong> - Click the "Let's Go" button below these instructions to begin.</li>
            <li><strong>Add Ingredients</strong> - Enter your ingredients one by one (please check spelling).</li>
            <li><strong>Select Cuisine</strong> - Choose your preferred cuisine type from the dropdown.</li>
            <li><strong>Get Recipes</strong> - Click "Find Recipes" to view your personalized results.</li>
          </ol>
        </div>
  <button className="ready-button" onClick={handleClick}>{buttonClicked ? "Scroll Down ↓" : "Let's Go!"}
</button>
</div>

<div className="image-slider">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Dish ${index + 1}`}
            className={`slide ${index === currentImage ? "active" : ""}`}
          />
        ))}
      </div>


    </div>
  );
};

export default Imagecarousals;
