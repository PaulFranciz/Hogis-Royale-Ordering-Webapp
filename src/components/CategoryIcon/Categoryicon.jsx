// components/CategoryIcon.js
import React from 'react';
import './CategoryIcon.css'

const CategoryIcon = ({ image, title }) => (
  <div className="category">
    <img src={image} alt={title} className='categories-img' />
    <h5>{title}</h5>
  </div>
);

export default CategoryIcon;