"use client"

import React, { useState } from "react"
import { authService } from "../services/auth"

export default function Login({ onLoginSuccess, onSwitchToRegister, onForgotPassword }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
  
    try {
      const response = await authService.login(formData)  
      localStorage.setItem("token", response.token)        
      if (onLoginSuccess) onLoginSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account to continue booking</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn auth-btn" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <button type="button" className="link-btn" onClick={onSwitchToRegister}>
              Create Account
            </button>
          </p>
          <p>
            <button type="button" className="link-btn" onClick={onForgotPassword}>
              Forgot Password?
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
