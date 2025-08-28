import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../css/events.css';

function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const eventData = await response.json();
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
        // Fallback data for demonstration
        setEvents([
          {
            _id: '1',
            name: 'Tech Summit 2024',
            description: 'Annual technology conference featuring latest innovations in AI and Machine Learning.',
            date: '2024-09-15',
            venue: 'Main Auditorium',
            imageUrl: './img/tech-summit.webp',
            category: 'Technology'
          },
          {
            _id: '2',
            name: 'Cultural Night 2025',
            description: 'A vibrant evening celebrating diverse cultures through music, dance, and food.',
            date: '2024-09-20',
            venue: 'Student Center',
            imageUrl: './img/cultural-night.jpg',
            category: 'Cultural'
          },
          {
            _id: '3',
            name: 'Startup Pitch Competition',
            description: 'Entrepreneurs showcase their innovative ideas to potential investors and mentors.',
            date: '2024-09-25',
            venue: 'Innovation Lab',
            imageUrl: './img/startup-pitch.jpg',
            category: 'Business'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (eventId) => {
    // Navigate to event details or booking page
    navigate(`/event-details/${eventId}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div id="events-main">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading amazing events...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="events-main">
      <div id="events-container">
        <div className="hero-section">
          <h1 className="main-title">Discover Amazing Events</h1>
          <h2 className="subtitle">
            Join the excitement and connect with your community
          </h2>
        </div>

        <div className="events-grid">
          {events.length > 0 ? (
            events.map((event, index) => (
              <div 
                key={event._id || index} 
                className="event-card"
                onClick={() => handleEventClick(event._id)}
              >
                <div className="event-image-container">
                  <img 
                    src={event.imageUrl || './img/default-event.jpg'} 
                    alt={event.name}
                    className="event-image"
                  />
                  <div className="event-overlay">
                    <span className="event-category">{event.category || 'Event'}</span>
                  </div>
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h3 className="event-title">{event.name}</h3>
                    <div className="event-date">
                      {formatDate(event.date)}
                    </div>
                  </div>
                  
                  <p className="event-description">
                    {event.description}
                  </p>
                  
                  <div className="event-details">
                    <div className="event-venue">
                      <svg className="venue-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {event.venue}
                    </div>
                  </div>
                  
                  <div className="event-actions">
                    <button className="register-btn">
                      Register Now
                    </button>
                    <button className="learn-more-btn">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <div className="no-events-icon">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No Events Available</h3>
              <p>Check back later for exciting upcoming events!</p>
            </div>
          )}
        </div>

        {currentUser && (
          <div className="create-event-section">
            <button 
              className="create-event-btn"
              onClick={() => navigate('/create-event')}
            >
              <svg className="plus-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;