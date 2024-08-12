import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PromoBanner.css';

// Import your images here
import cinemaImage from '/public/cinema00.jpg';
import arcadeImage from '/game 2.jpg';
import clubImage from '/public/club.jpg';
import hotelImage from '/hotel.jpg';
import loungeImage from '/menu icon.png';
import banquetImage from '/public/hall.jpg';
import Recommended from '../Recommended/Recommended';

const banners = [
    {
        title: "Cinema",
        description: "Experience the latest blockbusters",
        buttonText: "Book Now",
        startTime: "Shows start at 6 PM Daily",
        image: cinemaImage,
        buttonLink: {
          url: "https://www.hogiscinemas.com/",
          target: "_blank"
        }
      },
      
  {
    title: "Games Arcade",
    description: "Fun for all ages",
    buttonText: "Play Now",
    startTime: "Open 10 AM - 10 PM",
    image: arcadeImage
  },
  {
    title: "Club Voltage",
    description: "Dance the night away",
    buttonText: "Get on the List",
    startTime: "Opens at 9 PM",
    image: clubImage
  },
  {
    title: "Hotel",
    description: "Your home away from home",
    buttonText: "Book a Room",
    startTime: "Check-in from 2 PM",
    image: hotelImage
  },
  {
    title: "The Lounge",
    description: "Relax and unwind",
    buttonText: "Reserve a Table",
    startTime: "Always Open",
    image: loungeImage
  },
  {
    title: "Hogis Royale Banquet Hall",
    description: "Perfect for your special events",
    buttonText: "Plan Your Event",
    startTime: "Available for bookings",
    image: banquetImage
  },
];

const PromoBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const bannerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const autoSwipeTimerRef = useRef(null);

  const changeBanner = useCallback((nextBanner) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBanner(nextBanner);
      setIsTransitioning(false);
    }, 50); // Match this with the CSS transition duration
  }, []);

  const resetAutoSwipeTimer = useCallback(() => {
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
    }
    autoSwipeTimerRef.current = setInterval(() => {
      changeBanner((prev) => (prev + 1) % banners.length);
    }, 4000); // 8 seconds interval
  }, [changeBanner]);

  useEffect(() => {
    resetAutoSwipeTimer();
    return () => {
      if (autoSwipeTimerRef.current) {
        clearInterval(autoSwipeTimerRef.current);
      }
    };
  }, [resetAutoSwipeTimer]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        changeBanner((currentBanner + 1) % banners.length);
      } else {
        changeBanner((currentBanner - 1 + banners.length) % banners.length);
      }
      resetAutoSwipeTimer(); // Reset the timer after a manual swipe
    } else {
      // If the swipe wasn't significant, snap back to the current banner
      changeBanner(currentBanner);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
  <div className='promo-banner-wrapper'>
    <h2>What We Offer</h2>
    <div className="promo-banner-container">
      <div
        className={`promo-banner ${isTransitioning ? 'transitioning' : ''}`}
        style={{transform: `translateX(-${currentBanner * 100}%)`}}
        ref={bannerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {banners.map((banner, index) => (
  <div key={index} className="banner-slide">
    <div className="banner-content">
      <h2>{banner.title}</h2>
      <p>{banner.description}</p>
      {banner.buttonLink ? (
        <a href={banner.buttonLink.url} target={banner.buttonLink.target} rel="noopener noreferrer">
          <button>{banner.buttonText}</button>
        </a>
      ) : (
        <button>{banner.buttonText}</button>
      )}
      <span className="start-time">{banner.startTime}</span>
    </div>
    <div 
      className="banner-image" 
      style={{ backgroundImage: `url(${banner.image})` }}
    ></div>
  </div>
))}


      </div>
      <div className="banner-indicators">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`indicator ${index === currentBanner ? 'active' : ''}`}
            onClick={() => {
              changeBanner(index);
              resetAutoSwipeTimer(); // Reset the timer when clicking on an indicator
            }}
          ></span>
        ))}
      </div>
    </div>
    </div>
  );
};

export default PromoBanner;