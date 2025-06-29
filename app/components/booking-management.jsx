"use client"

import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"
import { bookingService } from "../services/api"

export default function BookingManagement() {
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filter, setFilter] = useState({
    type: "all",
    status: "all",
    searchQuery: "",
  })

  useEffect(() => {
    loadBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, filter])

  const loadBookings = async () => {
    try {
      setIsLoading(true)
      const bookingsData = await bookingService.getAllBookings()
      setBookings(bookingsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings")
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...bookings]

    if (filter.type !== "all") {
      result = result.filter((booking) => booking.bookingType === filter.type)
    }

    if (filter.status !== "all") {
      result = result.filter((booking) => booking.status === filter.status)
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      result = result.filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.details?.destination?.toLowerCase().includes(query) ||
          booking.details?.name?.toLowerCase().includes(query),
      )
    }

    setFilteredBookings(result)
  }

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value,
    })
  }

  const handleViewDetails = async (bookingId) => {
    try {
      setIsLoading(true)
      const bookingDetails = await bookingService.getBookingDetails(bookingId)
      setSelectedBooking(bookingDetails)
      setShowDetails(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking details")
    } finally {
      setIsLoading(false)
    }
  }

  const closeDetails = () => {
    setShowDetails(false)
    setSelectedBooking(null)
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "status-confirmed"
      case "pending":
        return "status-pending"
      case "cancelled":
        return "status-cancelled"
      case "completed":
        return "status-completed"
      default:
        return ""
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <section className="booking-management">
      <div className="booking-management-container">
        <h2 className="section-title">My Bookings</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="booking-filters">
          <div className="filter-group">
            <label htmlFor="type">Booking Type</label>
            <select id="type" name="type" value={filter.type} onChange={handleFilterChange}>
              <option value="all">All Types</option>
              <option value="hotel">Hotels</option>
              <option value="flight">Flights</option>
              <option value="car">Car Rentals</option>
              <option value="taxi">Taxis</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={filter.status} onChange={handleFilterChange}>
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="filter-group search-filter">
            <label htmlFor="searchQuery">Search</label>
            <input
              type="text"
              id="searchQuery"
              name="searchQuery"
              value={filter.searchQuery}
              onChange={handleFilterChange}
              placeholder="Search bookings..."
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found matching your criteria.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="booking-item">
                <div className="booking-icon">{getBookingTypeIcon(booking.bookingType)}</div>
                <div className="booking-content">
                  <div className="booking-header">
                    <h4>
                      {booking.details?.name ||
                        booking.details?.destination ||
                        `${booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)} Booking`}
                    </h4>
                    <span className={`booking-status ${getStatusClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <div className="booking-info">
                    <p>Booking ID: {booking.id}</p>
                    <p>Booked on: {formatDate(booking.bookingDate)}</p>
                    <p>Service date: {formatDate(booking.serviceDate)}</p>
                    <p className="booking-amount">
                      {booking.currency} {booking.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <div className="booking-actions">
                    <button className="btn btn-secondary" onClick={() => handleViewDetails(booking.id)}>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDetails && selectedBooking && (
          <div className="booking-modal">
            <div className="booking-modal-content">
              <button className="close-btn" onClick={closeDetails}>
                ×
              </button>
              <div className="booking-modal-header">
                <div className="booking-type-badge">
                  {getBookingTypeIcon(selectedBooking.bookingType)}{" "}
                  {selectedBooking.bookingType.charAt(0).toUpperCase() + selectedBooking.bookingType.slice(1)}
                </div>
                <h3>Booking Details</h3>
                <span className={`booking-status ${getStatusClass(selectedBooking.status)}`}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </span>
              </div>

              <div className="booking-modal-body">
                <div className="booking-detail-section">
                  <h4>Booking Information</h4>
                  <div className="detail-item">
                    <span>Booking ID:</span>
                    <span>{selectedBooking.id}</span>
                  </div>
                  <div className="detail-item">
                    <span>Booking Date:</span>
                    <span>{formatDate(selectedBooking.bookingDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span>Service Date:</span>
                    <span>{formatDate(selectedBooking.serviceDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span>Total Amount:</span>
                    <span>
                      {selectedBooking.currency} {selectedBooking.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="booking-detail-section">
                  <h4>Service Details</h4>
                  {selectedBooking.details &&
                    Object.entries(selectedBooking.details).map(([key, value]) => {
                      if (key === "id" || typeof value === "object") return null

                      return (
                        <div className="detail-item" key={key}>
                          <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}:</span>
                          <span>{value}</span>
                        </div>
                      )
                    })}
                </div>

                <div className="booking-actions-footer">
                  {selectedBooking.status === "confirmed" && <button className="btn btn-danger">Cancel Booking</button>}
                  <button className="btn">Download Confirmation</button>
                  <button className="btn btn-secondary" onClick={closeDetails}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

BookingManagement.propTypes = {} 