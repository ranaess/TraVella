"use client"

import React, { useState, useEffect } from "react"
import { authService } from "../services/auth"


export default function UserProfile({ user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [bookingHistory, setBookingHistory] = useState([])
  const [userPoints, setUserPoints] = useState(0)

  const [profileData, setProfileData] = useState({
    displayName: "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    dateOfBirth: user?.dateOfBirth || "",
    gender: user?.gender || "",
    agreedToTerms: true,
  })

  const [passwordData, setPasswordData] = useState({
    email:  "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (activeTab === "history") loadBookingHistory()
    if (activeTab === "points") loadUserPoints()
  }, [activeTab])

  const loadBookingHistory = async () => {
    try {
      setIsLoading(true)
      const history = await authService.getBookingHistory()
      if (Array.isArray(history)) {
        setBookingHistory(history)
      } else if (Array.isArray(history.bookings)) {
        setBookingHistory(history.bookings)
      } else {
        setBookingHistory([]) 
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load booking history")
    } finally {
      setIsLoading(false)
    }
  }
  

  const loadUserPoints = async () => {
    try {
      setIsLoading(true)
      const points = await authService.getUserPoints()
      setUserPoints(points)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load points")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const updatedUser = await authService.updatePersonalDetails(profileData)
      onUserUpdate(updatedUser)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await authService.changePassword({
        email: user.email,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      })
      setSuccess("Password changed successfully!")
      setPasswordData({ email: user.email, newPassword: "", confirmPassword: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivateAccount = async () => {
    if (confirm("Are you sure you want to deactivate your account?")) {
      try {
        setIsLoading(true)
        await authService.deactivateAccount(user.email)
        setSuccess("Account deactivated successfully!")
        localStorage.removeItem("token")
        localStorage.removeItem("userEmail")
        window.location.href = "/login" 
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deactivate account")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        setIsLoading(true)
        await authService.deleteAccount(user.email)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete account")
      } finally {
        setIsLoading(false)
      }
    }
  }

  

  return (
    <section className="user-profile">
      <div className="profile-container">
        <h2 className="section-title">My Account</h2>

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === "profile" ? "active" : ""}`} onClick={() => setActiveTab("profile")}>Profile</button>
          <button className={`tab-btn ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>Password</button>
          <button className={`tab-btn ${activeTab === "points" ? "active" : ""}`} onClick={() => setActiveTab("points")}>Points</button>
          <button className={`tab-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>History</button>
          <button className={`tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>Settings</button>
        </div>

        <div className="tab-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {activeTab === "profile" && (
            <form className="profile-form" onSubmit={handleProfileUpdate}>
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
  <input
    type="text"
    id="displayName"
    value={profileData.displayName}
    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
    required
  />
</div>
</div>

<div className="form-group">
  <label htmlFor="phone">Phone</label>
  <input
    type="tel"
    id="phone"
    value={profileData.phone}
    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
    required
  />
</div>

<div className="form-group">
  <label htmlFor="dateOfBirth">Date of Birth</label>
  <input
    type="date"
    id="dateOfBirth"
    value={profileData.dateOfBirth}
    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
    required
  />
</div>

              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          )}

          {activeTab === "password" && (
            <form className="profile-form" onSubmit={handlePasswordChange}>
              <h3>Change Password</h3>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={passwordData.email} onChange={(e) => setPasswordData({ ...passwordData, email: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input type="password" id="newPassword" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required minLength={6} />
              </div>
              <button type="submit" className="btn" disabled={isLoading}>
                {isLoading ? "Changing..." : "Change Password"}
              </button>
            </form>
          )}

          {activeTab === "points" && (
            <div className="user-points">
              <h3>Points</h3>
              {isLoading ? (
                <p>Loading points...</p>
              ) : (
                <div className="points-display">
                  <div className="points-card">
                    <h4>Your Points Balance</h4>
                    <div className="points-value">{userPoints.toLocaleString()}</div>
                    <p>Points can be used for discounts on future bookings</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="booking-history">
              <h3>Booking History</h3>
              {isLoading ? (
                <p>Loading booking history...</p>
              ) : bookingHistory.length === 0 ? (
                <p>No booking history found.</p>
              ) : (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingHistory.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.bookingType}</td>
                        <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                        <td>{b.status}</td>
                        <td>
                          {b.currency} {b.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="account-settings">
              <h3>Account Settings</h3>
              <div className="settings-actions">
                <button className="btn btn-warning" onClick={handleDeactivateAccount} disabled={isLoading}>
                  Deactivate Account
                </button>
                <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={isLoading}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
