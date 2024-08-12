import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import './breadCrumbs.css'; // We'll create this CSS file

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/' || location.pathname === '/menu') {
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();
    navigate('/menu');
  };

  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      <ol className="breadcrumb-list">
        <li className="breadcrumb-item">
          <a href="/menu" onClick={handleClick} className="breadcrumb-link">
            <ChevronLeft className="breadcrumb-icon" />
            back to Menu
          </a>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;