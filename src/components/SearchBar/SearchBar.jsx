import React, { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { IoClose, IoFastFoodOutline } from 'react-icons/io5';
import './SearchBar.css';
import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';
import { categories as categoryData } from '../DataCategory/Data.json';


const formatPrice = (price) => {
  return price.toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

const FilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const handleFilterChange = (filter) => {
    setFilters(prev => ({ ...prev, [filter]: !prev[filter] }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Filter Options</h2>
          <button className="close-btn" onClick={onClose}>
            <IoClose size={24} />
          </button>
        </div>
        <div className="filter-options">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="filter-option">
              <input className='checkbox'
                type="checkbox"
                id={key}
                checked={value}
                onChange={() => handleFilterChange(key)}
              />
              <label htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            </div>
          ))}
        </div>
        <button className="apply-btn" onClick={onClose}>Apply Filters</button>
      </div>
    </div>
  );
};

const SearchResultsModal = ({ items, categories, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <IoClose className="close-icon" onClick={onClose} />
        <h2 className="categories-name">Search Results</h2>
        {(categories.length > 0 || items.length > 0) ? (
          <>
            {categories.length > 0 && (
              <div>
                <h3 className="categories-name">Categories</h3>
                <ul>
                  {categories.map((category, index) => (
                    <li key={`category-${index}`}>
                      <span className="item-name">{category.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {items.length > 0 && (
              <div>
                <h3 className="categories-name">Menu Items</h3>
                <ul>
                  {items.map((item, index) => (
                    <li key={`item-${index}`}>
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">{formatPrice(parseFloat(item.price))}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p>No items or categories found.</p>
        )}
      </div>
    </div>
  );
};

const SearchBar = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);

  useEffect(() => {
    setAllMenuItems(menuItemsData);
  }, []);

  const filterMenuItems = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allMenuItems.filter(item => 
      item.name.toLowerCase().includes(lowerSearchTerm) ||
      (item.category && item.category.toLowerCase().includes(lowerSearchTerm))
    );
  };

  const filterCategories = (searchTerm) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return categoryData.filter(category =>
      category.title.toLowerCase().includes(lowerSearchTerm)
    );
  };

  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    
    if (newSearchTerm.length > 0) {
      const filteredMenuItems = filterMenuItems(newSearchTerm);
      const filteredCategoryItems = filterCategories(newSearchTerm);
      setFilteredItems(filteredMenuItems);
      setFilteredCategories(filteredCategoryItems);
      setIsModalOpen(true);
    } else {
      setFilteredItems([]);
      setFilteredCategories([]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={(e) => e.preventDefault()} className="search-bar">
        <div className="search-icon">
          <FiSearch size={20} />
        </div>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button
          type="button"
          className="filter-btn pulsating"
          onClick={() => setIsFilterOpen(true)}
        >
          <IoFastFoodOutline size={20} />
        </button>
      </form>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
      />

      {isModalOpen && (
        <SearchResultsModal
          items={filteredItems}
          categories={filteredCategories}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;