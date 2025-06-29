"use client"

export default function Navigation({
  activeSection,
  setActiveSection,
  user,
  onLogout,
  onLogin,
  onRegister
}) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "hotels", label: "Hotels" },
    { id: "flights", label: "Flights" },
    { id: "cars", label: "Car Rental" },
    { id: "taxis", label: "Taxi" },
    { id: "budget", label: "Budget Prediction" },
  ]


  

  return (
    <nav className="navigation">
      <div className="nav-container">
        <a href="#" className="logo" onClick={() => setActiveSection("home")}>
          TraVella
        </a>

        <div className="nav-content">
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li
                key={item.id}
                className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </li>
            ))}
          </ul>

          <div className="nav-auth">
            {user ? (
              <div className="user-menu">
                <button className="btn-link" onClick={() => setActiveSection("profile")}>
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
      </div>
    </nav>
  )
}
