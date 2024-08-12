import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { FaCommentDots, FaCog } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from '../components/SearchBar/SearchBar';
import Categories from '../components/Categories/categories';
import RecommendedSection from '../components/Recommended/Recommended';
import UserMenu from '../components/Auth/UserMenu';
import { ShoppingCartIcon } from '../components/ShoppingCart/ShoppingCart';
import { auth, db } from '../components/Firebase/FirebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useShoppingCart } from '../components/ShoppingCart/ShoppingCartContext';
import './Menu.css';

const AnimatedFeedbackHeading = ({ navigate, showLoginAlert }) => {
  const headingVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const handleFeedbackClick = (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      navigate('/feedback');
    } else {
      showLoginAlert();
    }
  };
  
  return (
    <motion.h2
      className='dish-ideas'
      variants={headingVariants}
      initial="initial"
      animate="animate"
    >
      <a href="/feedback" onClick={handleFeedbackClick} style={{ textDecoration: 'none', color: 'inherit' }}>
        You got some <span style={{ textDecoration: 'underline' }}>Feedback</span>?{' '}
        <FaCommentDots style={{ display: 'inline', verticalAlign: 'middle' }} />
      </a>
    </motion.h2>
  );
};

const UserDisplay = () => {
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFirstName(userDoc.data().firstName || '');
        }
      }
    };

    fetchUserData();
  }, []);

  return firstName ? (
    <div className="user-display-wrapper">
      <div className="user-display">
        Welcome, {firstName}!
      </div>
    </div>
  ) : null;
};

const Menu = () => {
  const { addToCart } = useShoppingCart();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists() && adminDoc.data().isAdmin) {
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    const fetchRecommendedRecipes = async () => {
      try {
        const recipesCollection = collection(db, 'recipes');
        const recipesSnapshot = await getDocs(recipesCollection);
        const recipesData = recipesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecommendedRecipes(recipesData);
      } catch (error) {
        console.error("Error fetching recommended recipes:", error);
        toast.error("Failed to load recommended recipes. Using default data.");
        setRecommendedRecipes([
          { id: '1', title: 'Spaghetti Oglio', rating: 4.9, image: '/IMG_6013.jpg' },
          { id: '2', title: 'Chicken Steak', rating: 5.0, image: '/IMG_6013.jpg' },
          { id: '3', title: 'Seafood Fried Rice', rating: 4.8, image: '/IMG_6013.jpg' },
        ]);
      }
    };

    fetchRecommendedRecipes();

    return () => unsubscribe();
  }, []);

  const handleAddToCart = (item) => {
    addToCart(item);
    console.log('Adding item to cart:', item);
    toast.success(`${item.name} added to cart!`, {
      onClick: () => navigate('/cart')
    });
  };

  const showLoginAlert = () => {
    Swal.fire({
      title: 'Signup Required',
      text: 'Please create an account to access the feedback page.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#000',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Create an Account'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/signup');
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='menu-container'>
      <header>
        <UserDisplay />
        <AnimatedFeedbackHeading navigate={navigate} showLoginAlert={showLoginAlert} />
        {isAdmin && (
          <Link to="/admin-dashboard">
            <FaCog className='dashboard-link'/>
          </Link>
        )} 
        <UserMenu user={user} classname="user" />
        <ShoppingCartIcon />
      </header>
      <SearchBar />
      <main>
        <Categories addToCart={handleAddToCart} />
        <RecommendedSection recipes={recommendedRecipes} addToCart={handleAddToCart} />
      </main>
      <ToastContainer 
        position="bottom-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Menu;