import React, { useState } from "react";
import { useSelector } from 'react-redux';
import '../css/mess.css';

import breakfastIcon from "/img/fried-egg.png";
import lunchIcon from "/img/lunch.png";
import dinnerIcon from "/img/Dinner.png";


export default function Mess() {
  const { currentUser } = useSelector((state) => state.user);
  const [reviewType, setReviewType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReviewClick = (type) => {
    if (!currentUser) {
      alert('Please sign in to submit a review');
      return;
    }
    setReviewType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRating('');
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const ratingValue = event.target.rating.value;
      if (!ratingValue) {
        throw new Error('Rating is required.');
      }
      
      const response = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userRef: currentUser._id,
          mealType: reviewType,
          rating: ratingValue
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit review');
      }
      
      console.log('Review submitted successfully');
      setReviewSubmitted(true);
      setShowModal(false);
      
      // Show success message
      setTimeout(() => {
        setReviewSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const menuData = [
    {
      type: 'Breakfast',
      icon: breakfastIcon,
      items: [
        'Pao Bhaji',
        'Milk',
        'Oats',
        'Banana',
        'Bread (Brown/White) and Jam',
        'Cornflakes'
      ]
    },
    {
      type: 'Lunch', 
      icon: lunchIcon,
      items: [
        'Rice',
        'Soya Keema Matar',
        'Paneer Handi',
        'Sambar',
        'Dal Pancharatan',
        'Roti'
      ]
    },

    // {
    //   type: 'Snacks',
    //   icon: '🍫',
    //   items: [
    //     'Bread Pakora',
    //     'Sweet and Green Chutney',
    //     'Tea',
    //     'Tang',
    //     'Coffee',
    //     'Biscuits'
    //   ]
    // },
    {
      type: 'Dinner',
      icon: dinnerIcon,
      items: [
        'Gatta Curry',
        'Tawa Vegetable',
        'Black Masoor',
        'Steamed Rice',
        'Roti',
        'Sooji Halwa'
      ]
    }
  ];

  return (
    <div id="mess-main">
      <div id="mess-container">
        <div className="hero-section">
          <h1 className="main-title">Today's Menu</h1>
          <h2 className="subtitle">
            Fresh meals prepared with care for our community
          </h2>
        </div>

        <div className="menu-grid">
          {menuData.map((meal, index) => (
            <div key={meal.type} className="menu-card">
              <div className="menu-header">
                <div className="meal-icon">
                  <img src={meal.icon} alt={meal.type} className="meal-icon-img" />
                </div>
                <h3 className="meal-title">{meal.type}</h3>
              </div>
              
              <div className="menu-items">
                <ul>
                  {meal.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="menu-item">
                      <span className="item-bullet">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="menu-actions">
                <button 
                  className="review-btn"
                  onClick={() => handleReviewClick(meal.type)}
                >
                  <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Rate {meal.type}
                </button>
              </div>
            </div>
          ))}
        </div>

        {reviewSubmitted && (
          <div className="success-notification">
            <div className="success-content">
              <svg className="check-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Review submitted successfully!</span>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>Rate {reviewType}</h2>
              <button 
                className="close-btn" 
                onClick={handleCloseModal}
              >
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <p className="rating-prompt">How would you rate today's {reviewType.toLowerCase()}?</p>
              
              <form onSubmit={handleSubmitReview} className="rating-form">
                <div className="rating-input-group">
                  <label htmlFor="rating" className="rating-label">
                    Rating (1-5 stars):
                  </label>
                  <div className="rating-input-container">
                    <input 
                      type="number" 
                      id="rating" 
                      name="rating" 
                      min="1" 
                      max="5" 
                      required 
                      placeholder="Enter rating (1-5)"
                      className="rating-input"
                    />
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="star">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="loading-spinner"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Review'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}