import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './Feedback.css'

const EMOJI_RATINGS = [
  { emoji: '☹️', label: 'Very Dissatisfied', value: 1 },
  { emoji: '😐', label: 'Neutral', value: 2 },
  { emoji: '🙂', label: 'Satisfied', value: 3 },
  { emoji: '😊', label: 'Happy', value: 4 },
  { emoji: '😄', label: 'Very Happy', value: 5 },
];

const SUGGESTIONS = [
  "Great service",
  "Delicious food",
  "Clean rooms",
  "Friendly staff",
  "Comfortable seating",
  "Good value for money",
  "Excellent atmosphere",
  "Quick service",
  "Needs improvement",
  "Outstanding experience"
];

const useFeedbackForm = () => {
  const [rating, setRating] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors = [];
    if (rating === null) errors.push('Please provide a reaction');
    if (name.trim() === '') errors.push('Please provide your name');
    if (comment.trim() === '') errors.push('Please provide a comment');
    if (email && !/\S+@\S+\.\S+/.test(email)) errors.push('Please provide a valid email');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      Swal.fire({
        title: 'Oops!',
        html: errors.join('<br>'),
        icon: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('comment', comment);

    try {
      const response = await fetch('https://getform.io/f/ayvpwzmb', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        Swal.fire({
          title: 'Thank you!',
          text: 'Your feedback has been submitted successfully.',
          icon: 'success',
        });
        // Reset form
        setRating(null);
        setName('');
        setEmail('');
        setComment('');
        setSelectedSuggestions([]);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to submit feedback. Please try again.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    rating,
    setRating,
    name,
    setName,
    email,
    setEmail,
    comment,
    setComment,
    selectedSuggestions,
    setSelectedSuggestions,
    isSubmitting,
    handleSubmit
  };
};

const EmojiRating = ({ rating, setRating }) => {
  return (
    <div className="custom-emoji-rating" role="group" aria-label="Rate your experience">
      {EMOJI_RATINGS.map((emojiRating) => (
        <button
          key={emojiRating.value}
          type="button"
          onClick={() => setRating(emojiRating.value)}
          className={`custom-emoji-button ${rating === emojiRating.value ? 'selected' : ''}`}
          aria-label={emojiRating.label}
          title={emojiRating.label}
        >
          {emojiRating.emoji}
        </button>
      ))}
    </div>
  );
};

const SuggestionButtons = ({ setComment, selectedSuggestions, setSelectedSuggestions }) => {
  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestions(prev => {
      const newSelected = prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion];
      
      setComment(newSelected.join(', '));
      return newSelected;
    });
  };

  return (
    <div className="custom-suggestion-buttons">
      {SUGGESTIONS.map((suggestion, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleSuggestionClick(suggestion)}
          className={`custom-suggestion-button ${selectedSuggestions.includes(suggestion) ? 'selected' : ''}`}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

const FeedbackForm = () => {
  const {
    rating,
    setRating,
    name,
    setName,
    email,
    setEmail,
    comment,
    setComment,
    selectedSuggestions,
    setSelectedSuggestions,
    isSubmitting,
    handleSubmit
  } = useFeedbackForm();

  return (
    <div className="custom-feedback-wrapper">
      <div className="custom-feedback-container">
        <h2 className="custom-feedback-title">We'd love your feedback!👍🏼</h2>
        <form onSubmit={handleSubmit}>
          <div className="custom-form-group">
            <label className="custom-form-label">How was your experience?</label>
            <EmojiRating rating={rating} setRating={setRating} />
          </div>
          <div className="custom-form-group">
            <label className="custom-form-label">Quick suggestions:</label>
            <SuggestionButtons 
              setComment={setComment} 
              selectedSuggestions={selectedSuggestions}
              setSelectedSuggestions={setSelectedSuggestions}
            />
          </div>
          <div className="custom-form-group">
            <label htmlFor="name" className="custom-form-label">Name:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              className="custom-form-input"
            />
          </div>
          <div className="custom-form-group">
            <label htmlFor="email" className="custom-form-label">Email (optional):</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="custom-form-input"
            />
          </div>
          <div className="custom-form-group">
            <label htmlFor="comment" className="custom-form-label">Comments:</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              required
              className="custom-form-input custom-form-textarea"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="custom-submit-button">
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;