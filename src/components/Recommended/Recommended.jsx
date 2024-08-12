import React from 'react';
import RecipeCard from '../Recipe/Recipe';
import PromoBanner from '../PromoBanner/PromoBanner';
import './Recommended.css';

const Recommended = ({ recipes, addToCart }) => (
  <section className="recommended">
    <h3>Popular Meals</h3>
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          image={recipe.image}
          title={recipe.title}
          rating={recipe.rating}
          onClick={() => addToCart(recipe)}
        />
      ))}
      <span className="see-more">See more</span>
    </div>
    <PromoBanner />
  </section>
);

export default Recommended;