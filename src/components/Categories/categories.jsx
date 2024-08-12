import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { IoGrid, IoList } from "react-icons/io5";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import categories from '../CategoryIcon/Categoryicon.jsx'
import { db } from '../Firebase/FirebaseConfig.jsx';
import { categories as categoryData } from '../DataCategory/Data.json';
import menuItemsData from '../MenuItemsFallBackData/menuItemsData.json';

const CategoryModal = React.lazy(() => import('../Categories/CategoryModal/CategoryModal.jsx'));
const PUBLIC_URL = '';

const ITEMS_PER_PAGE = 12;
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const Categories = ({ addToCart }) => {
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [categories, setCategories] = useState(categoryData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useJsonFallback, setUseJsonFallback] = useState(false);

  const fetchCategoryData = useCallback(async (category) => {
    if (useJsonFallback) {
      const items = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
      return { items };
    }
  
    try {
      const itemsCollection = collection(db, 'menu_items');
      let q = query(itemsCollection, orderBy('name'));
  
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.warn(`No documents found for category: ${category}`);
        return { items: [] };
      } else {
        const allItems = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter items by category on the client side
        const items = allItems.filter(item => item.category.toUpperCase() === category.toUpperCase());
        
        return { items };
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      setUseJsonFallback(true);
      const items = menuItemsData.filter(item => item.category.toUpperCase() === category.toUpperCase());
      return { items };
    }
  }, [useJsonFallback]);

    const loadCategoryData = useCallback(async (category) => {
    const cachedData = localStorage.getItem(`menuItems_${category}`);
    const cachedTimestamp = localStorage.getItem(`menuItems_${category}_timestamp`);
    
    if (cachedData && cachedTimestamp) {
      const parsedData = JSON.parse(cachedData);
      const timestamp = parseInt(cachedTimestamp, 10);
      
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        setMenuItems(prevItems => ({...prevItems, [category]: parsedData}));
        setIsLoading(false);
        return;
      }
    }

    try {
      const { items } = await fetchCategoryData(category);
      if (items.length > 0) {
        setMenuItems(prevItems => ({...prevItems, [category]: items}));
        localStorage.setItem(`menuItems_${category}`, JSON.stringify(items));
        localStorage.setItem(`menuItems_${category}_timestamp`, Date.now().toString());
      } else {
        setError(`No menu items available for ${category}. Please try again later.`);
      }
    } catch (error) {
      console.error(`Error loading data for ${category}:`, error);
      setError(`Unable to load menu items for ${category}. Please check your internet connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCategoryData]);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryData(selectedCategory);
    }
  }, [selectedCategory, loadCategoryData]);

  useEffect(() => {
    if (categories.length === 0) {
      setError("Unable to load categories. Please try again later.");
    }
    setIsLoading(false);
  }, [categories]);

  const toggleView = useCallback(() => {
    setIsGridView(prev => !prev);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const getPaginatedData = useCallback(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return categories.slice(startIndex, endIndex);
  }, [currentPage, categories]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const openModal = useCallback((category) => {
    const upperCategory = category.toUpperCase();
    setSelectedCategory(upperCategory);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const displayedCategories = isGridView ? getPaginatedData() : categories;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <section className="categories">
    {error && <div className="error-message">{error}</div>}
    <div className='categories-info'>
      <h3>Categories</h3>
      <button onClick={toggleView} className="view-toggle">
        {isGridView ? <IoList className='list'/> : <IoGrid />}
      </button>
    </div>
    <div className={`category-container ${isGridView ? 'grid-view' : 'list-view'}`}>
      {displayedCategories.map((category) => (
        <div key={category.title} className="category" onClick={() => openModal(category.title)}>
            <img 
              src={category.image} 
              alt={category.title} 
              className="category-image" 
              onError={(e) => {
                console.error(`Error loading image for ${category.title}:`, e.target.src);
              }}
      />
                <span className="category-title">{category.title}</span>
        </div>
      ))}
    </div>
      {isGridView && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </button>
          ))}
        </div>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        {selectedCategory && (
          <CategoryModal
            category={selectedCategory}
            items={menuItems[selectedCategory] || []}
            onClose={closeModal}
            addToCart={addToCart}
          />
        )}
      </Suspense>
    </section>
  );
};

export default Categories;


