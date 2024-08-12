import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaListUl } from 'react-icons/fa';
import menuicon from '/menu icon.png';
import welcomeSound from '/public/hogis welcome sound.wav';
import './SplashPage.css';

const SplashPage = () => {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(welcomeSound);
  }, []);

  const handleExplore = () => {
    audioRef.current.play();
    navigate('/menu');
  };

  return (
    <div className="splash-container">
      <motion.div
        className="gif-container"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 300 }}
      >
        <img src={menuicon} alt="Menu Icon" className="gif-illustration" />
      </motion.div>
      
      <motion.button
        className="explore-button"
        onClick={handleExplore}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaListUl />
        Explore Menu
      </motion.button>

      <motion.p
        className="rights-reserved"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        © 2024 Hogis Royale and Apartments. All rights reserved.
      </motion.p>
    </div>
  );
};

export default SplashPage;