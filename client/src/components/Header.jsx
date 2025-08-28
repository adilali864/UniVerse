import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    // urlParams.set('searchTerm', searchTerm);
    // const searchQuery = urlParams.toString();
    // navigate(`/search?${searchQuery}`);
  };

  return (
    <header className={`floating-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo Section */}
        <Link to="/" className="logo-section">
          <img className="logo-image" src="./img/logo.png" alt="UniVerse" />
          <span className="logo-text">UniVerse</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-button">
            <FaSearch className="search-icon" />
          </button>
        </form>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            <span>Home</span>
          </Link>
          <Link to="/events" className="nav-link">
            <span>Events</span>
          </Link>
          <Link to="/laundry" className="nav-link">
            <span>Laundry</span>
          </Link>
          <Link to="/mess" className="nav-link">
            <span>Mess</span>
          </Link>
          <Link to="/about" className="nav-link">
            <span>About</span>
          </Link>

          {/* Profile/Auth Section */}
          <div className="auth-section">
            {currentUser ? (
              <Link to="/profile" className="profile-link">
                <img
                  className="profile-avatar"
                  src={currentUser.avatar}
                  alt="profile"
                />
                <span className="profile-name">{currentUser.username}</span>
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/sign-in" className="auth-button signin">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
