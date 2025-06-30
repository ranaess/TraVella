"use client"
import { useState } from "react"

export default function Navigation({
  activeSection,
  setActiveSection,
  user,
  onLogout,
  onLogin,
  onRegister
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { id: "home", label: "Home" },
    { id: "hotels", label: "Hotels" },
    { id: "flights", label: "Flights" },
    { id: "cars", label: "Car Rental" },
    { id: "taxis", label: "Taxi" },
    { id: "budget", label: "Budget Prediction" },
  ]

  const handleNavClick = (sectionId) => {
    setActiveSection(sectionId)
    setIsMobileMenuOpen(false) 
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navigation">
      <style jsx>{`
        .navigation {
          background: #406F89;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: bold;
          color: #fff;
          text-decoration: none;
        }

        .nav-content {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex: 1;
          justify-content: space-between;
          margin-left: 2rem;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 2rem;
        }

        .nav-item {
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #fff;
          font-weight: 500;
        }

        .nav-item:hover {
          background: #1c465d;
          color: #fff;
        }

        .nav-item.active {
          background: #1c465d;
          color: white;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: #406F89;
          color: white;
        }

        .btn-primary:hover {
          background: #406F89;
        }

        .btn-secondary {
          background: #64748b;
          color: white;
        }

        .btn-secondary:hover {
          background: #475569;
        }

        .btn-link {
          background: none;
          color: #fff;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          font-weight: 500;
        }

        .btn-link:hover {
          color: #1c465d;
          text-decoration: underline;
        }

        .user-greeting {
          color: #fff;
          font-weight: 500;
        }

        .mobile-menu-toggle {
          display: none;
          flex-direction: column;
          cursor: pointer;
          padding: 0.5rem;
          gap: 4px;
        }

        .hamburger-line {
          width: 25px;
          height: 3px;
          background-color: #fff;
          transition: all 0.3s ease;
          border-radius: 2px;
        }

        .mobile-menu-toggle.active .hamburger-line:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .mobile-menu-toggle.active .hamburger-line:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-toggle.active .hamburger-line:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        .mobile-overlay.active {
          display: block;
        }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          background: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          padding: 1rem;
          transform: translateY(-100%);
          transition: transform 0.3s ease;
        }

        .mobile-menu.active {
          display: block;
          transform: translateY(0);
        }

        .mobile-nav-menu {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .mobile-nav-item {
          cursor: pointer;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          color: #64748b;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .mobile-nav-item:hover {
          background: #f1f5f9;
          color: #1c465d;
        }

        .mobile-nav-item.active {
          background: #406F89;
          color: white;
        }

        .mobile-nav-item:last-child {
          border-bottom: none;
        }

        .mobile-auth {
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
          margin-top: 1rem;
        }

        .mobile-user-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mobile-auth-buttons .btn,
        .mobile-auth-buttons .btn-link,
        .mobile-user-menu .btn,
        .mobile-user-menu .btn-link {
          width: 100%;
          text-align: center;
          padding: 0.75rem;
          border-radius: 6px;
        }

        .mobile-user-menu .btn-link {
          background: #406F89;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .mobile-user-greeting {
          color: #64748b;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        /* Tablet and Mobile Styles */
        @media (max-width: 768px) {
          .nav-content {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .nav-container {
            padding: 0 0.5rem;
            height: 60px;
          }

          .logo {
            font-size: 1.5rem;
          }

          .mobile-menu {
            top: 60px;
          }

          .mobile-overlay {
            top: 60px;
          }
        }

        /* Desktop adjustments for smaller screens */
        @media (min-width: 769px) and (max-width: 1024px) {
          .nav-menu {
            gap: 1rem;
          }

          .nav-item {
            padding: 0.4rem 0.8rem;
            font-size: 0.9rem;
          }

          .user-greeting {
            display: none;
          }
        }
      `}</style>
      
      <div className="nav-container">
        <a href="#" className="logo" onClick={() => handleNavClick("home")}>
          TraVella
        </a>

        {/* Desktop Navigation */}
        <div className="nav-content">
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="nav-auth">
            {user ? (
              <div className="user-menu">
                <button className="btn-link" onClick={() => handleNavClick("profile")}>
                  My Profile
                </button>
                <span className="user-greeting">Hello, {user.firstName}!</span>
                <button className="btn btn-secondary" onClick={onLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-link" onClick={onLogin}>
                  Sign In
                </button>
                <button className="btn btn-primary" onClick={onRegister}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div 
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-nav-menu">
          {navItems.map((item) => (
            <li
              key={item.id}
              className={`mobile-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <div className="mobile-auth">
          {user ? (
            <div className="mobile-user-menu">
              <div className="mobile-user-greeting">Hello, {user.firstName}!</div>
              <button 
                className="btn-link" 
                onClick={() => {
                  handleNavClick("profile");
                }}
              >
                My Profile
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  onRegister();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign Up
              </button>
              <button 
                className="btn-link" 
                onClick={() => {
                  onLogin();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}