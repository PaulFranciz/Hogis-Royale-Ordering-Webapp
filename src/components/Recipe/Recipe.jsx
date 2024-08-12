import React from 'react';
import './Recipe.css';

const RecipeCard = ({ image, title, rating, onClick }) => (
  <div className="recipe-card" onClick={onClick}>
    <img src={image} alt={title} />
    <h3>{title}</h3>
    <div className="recipe-info">
      <span>★ {rating}</span>
    </div>
  </div>
);

export default RecipeCard;