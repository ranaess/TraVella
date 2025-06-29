"use client"

import React from "react"
import { useState } from "react"
import { authService } from "../services/auth"

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.forgotPassword({ email })
      setSuccess("OTP sent to your email address")
      setStep("otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.verifyOtp({ email, otp })
      setSuccess("OTP verified successfully! You can now reset your password.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Forgot Password</h2>
          <p>{step === "email" ? "Enter your email to receive an OTP" : "Enter the OTP sent to your email"}</p>
        </div>

        {step === "email" ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="btn auth-btn" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <button type="submit" className="btn auth-btn" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button type="button" className="btn btn-secondary" onClick={() => setStep("email")}>
              Back to Email
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{" "}
            <button type="button" className="link-btn" onClick={onBackToLogin}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
