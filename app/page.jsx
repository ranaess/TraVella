"use client"

import { useState, useEffect } from "react"
import Navigation from "./components/navigation"
import Hero from "./components/hero"
import HotelBooking from "./components/hotel-booking"
import FlightBooking from "./components/flight-booking"
import CarRental from "./components/car-rental"
import TaxiBooking from "./components/taxi-booking"
import BudgetPredictor from "./components/budget-predictor"
import Login from "./components/login"
import Register from "./components/register"
import Footer from "./components/footer"
import { authService } from "./services/auth"
import "./globals.css"
import UserProfile from "./components/user-profile"
import ForgotPassword from "./components/forgot-password"
import BookingManagement from "./components/booking-management"
import SearchResults from "./components/search-results"
import BookingConfirmation from "./components/booking-confirmation"

export default function TravelBookingApp() {
  const [activeSection, setActiveSection] = useState("home")
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState("login")
  const [redirectAfterAuth, setRedirectAfterAuth] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [searchType, setSearchType] = useState("hotel")
  const [searchParams, setSearchParams] = useState({})
  const [bookingDetails, setBookingDetails] = useState(null)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("payment") === "success") {
      setActiveSection("payment-success")
    } else if (urlParams.get("payment") === "cancel") {
      setActiveSection("payment-cancel")
    }
  }, [])

  const handleSectionChange = (section) => {
    setActiveSection(section)
  }

  const handleLoginSuccess = () => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    if (redirectAfterAuth) {
      setActiveSection(redirectAfterAuth)
      setRedirectAfterAuth(null)
    } else {
      setActiveSection("home")
    }
  }

  const handleRegisterSuccess = () => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    if (redirectAfterAuth) {
      setActiveSection(redirectAfterAuth)
      setRedirectAfterAuth(null)
    } else {
      setActiveSection("home")
    }
  }

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveSection("home");
  }
  

  const handleSearchResults = (results, type, params) => {
    setSearchResults(results)
    setSearchType(type)
    setSearchParams(params)
    setActiveSection("search-results")
  }

  const handleBookNow = (result) => {
    const mockBookingDetails = {
      id: `BK${Date.now()}`,
      type: result.type,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
      serviceDate: searchParams.checkIn || searchParams.date || new Date().toISOString(),
      serviceName: result.name,
      location: result.location || "Location TBD",
      totalAmount: result.price,
      currency: result.currency || "EGP",
      customerInfo: {
        name: user ? `${user.firstName} ${user.lastName}` : "Guest User",
        email: user?.email || "guest@example.com",
        phone: "+1234567890",
      },
      serviceDetails: {
        ...searchParams,
        ...result.details,
      },
      paymentStatus: "completed",
      confirmationNumber: `CNF${Date.now().toString().slice(-6)}`,
    }
    setBookingDetails(mockBookingDetails)
    setActiveSection("booking-confirmation")
  }

  const handleViewDetails = (result) => {
    alert(`Viewing details for: ${result.name}\nPrice: ${result.currency} ${result.price}`)
  }

  const handleAuthRequired = () => {
    setActiveSection("auth")
    setAuthMode("login")
    setRedirectAfterAuth(activeSection)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "hotels":
        return (
          <HotelBooking
            onSearchResults={(results, params) => handleSearchResults(results, "hotel", params)}
            onAuthRequired={handleAuthRequired}
          />
        )
      case "flights":
        return (
          <FlightBooking
            onSearchResults={(results, params) => handleSearchResults(results, "flight", params)}
            onAuthRequired={handleAuthRequired}
          />
        )
      case "cars":
        return (
          <CarRental
            onSearchResults={(results, params) => handleSearchResults(results, "car", params)}
            onAuthRequired={handleAuthRequired}
          />
        )
      case "taxis":
        return (
          <TaxiBooking
            onSearchResults={(results, params) => handleSearchResults(results, "taxi", params)}
            onAuthRequired={handleAuthRequired}
          />
        )
      case "budget":
        return <BudgetPredictor onAuthRequired={handleAuthRequired} />
      case "search-results":
        return (
          <SearchResults
            results={searchResults}
            searchType={searchType}
            searchParams={searchParams}
            onBookNow={handleBookNow}
            onViewDetails={handleViewDetails}
            onAuthRequired={handleAuthRequired}
          />
        )
      case "booking-confirmation":
        return (
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onBackToHome={() => setActiveSection("home")}
            onDownloadConfirmation={() => alert("Download feature coming soon!")}
          />
        )
      case "bookings":
        return user ? <BookingManagement /> : <Hero setActiveSection={handleSectionChange} />
      case "profile":
        return user ? (
          <UserProfile user={user} onUserUpdate={setUser} />
        ) : (
          <Hero setActiveSection={handleSectionChange} />
        )
      case "auth":
        if (authMode === "forgot") {
          return <ForgotPassword onBackToLogin={() => setAuthMode("login")} />
        }
        return authMode === "login" ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthMode("register")}
            onForgotPassword={() => setAuthMode("forgot")}
          />
        ) : (
          <Register onRegisterSuccess={handleRegisterSuccess} onSwitchToLogin={() => setAuthMode("login")} />
        )
      default:
        return <Hero setActiveSection={handleSectionChange} />
    }
  }

  const handleProfileAccess = () => {
    if (user) {
      setActiveSection("profile")
    } else {
      setActiveSection("auth")
      setAuthMode("login")
    }
  }

  const handleBookingsAccess = () => {
    if (user) {
      setActiveSection("bookings")
    } else {
      setActiveSection("auth")
      setAuthMode("login")
      setRedirectAfterAuth("bookings")
    }
  }

  return (
    <div className="app">
      <Navigation
        activeSection={activeSection}
        setActiveSection={handleSectionChange}
        user={user}
        onLogout={handleLogout}
        onLogin={() => {
          setActiveSection("auth")
          setAuthMode("login")
        }}
        onRegister={() => {
          setActiveSection("auth")
          setAuthMode("register")
        }}
      />
      <main className="main-content">{renderActiveSection()}</main>
      <Footer />
    </div>
  )
} 