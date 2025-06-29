const API_BASE_URL = "http://travella.runasp.net"

class AuthService {
  constructor() {
    this.user = null
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        this.user = JSON.parse(storedUser)
      }
    }
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}/${endpoint}`
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(this.user?.token && { Authorization: `Bearer ${this.user.token}` }),
        ...options.headers,
      },
    }


  
    const response = await fetch(url, config)
  
    const contentType = response.headers.get("content-type")
    const hasBody = contentType && contentType.includes("application/json")
  
    if (!response.ok) {
      const errorData = hasBody ? await response.json().catch(() => ({})) : {}
      console.error("❌ Error response from server:", errorData)
      throw new Error(errorData.message || `Request failed: ${response.status}`)
    }
  
    return hasBody ? await response.json().catch(() => ({})) : {}
  }
  

  async login(credentials) {
    const userData = await this.makeRequest("api/Accounts/Login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    })

    const user = {
      id: userData.id || userData.userId || "",
      email: userData.email || credentials.email,
      displayName: userData.displayName || "",
      token: userData.token || "",
    }
    localStorage.setItem("token", userData.token);

    this.user = user
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return user
  }

  async register(registerData) {
    const requestBody = {
      displayName: registerData.displayName,
      email: registerData.email,
      password: registerData.password,
      phone: registerData.phone,
      dateOfBirth: registerData.dateOfBirth,
      gender: registerData.gender,
    }
    localStorage.setItem("token", registerData.token);
  
    await this.makeRequest("api/Accounts/Register", {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
  
    return this.login({
      email: registerData.email,
      password: registerData.password,
    })
  }

  async forgotPassword(data) {
    await this.makeRequest("api/Accounts/ForgotPassword", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async verifyOtp(data) {
    await this.makeRequest("api/Accounts/VerifyOtp", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async refreshToken() {
    const userData = await this.makeRequest("api/Accounts/refreash-token", {
      method: "POST",
    })

    const user = {
      ...this.user,
      token: userData.token || "",
    }

    this.user = user
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return user
  }

  async changePassword(data) {
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("New passwords do not match")
    }

    await this.makeRequest("api/Accounts/ChangePassword", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }),
    })
  }

  async updatePersonalDetails(data) {
    const userData = await this.makeRequest("api/Accounts/Update personal-details", {
      method: "PUT",
      body: JSON.stringify(data),
    })

    const user = {
      ...this.user,
      displayName: userData.displayName || this.user.displayName,
      email: userData.email || this.user.email,
    }

    this.user = user
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return user
  }

  async getBookingHistory() {
    const response = await this.makeRequest("api/Accounts/history", {
      method: "GET",
    })
    return response
  }

  async getUserPoints() {
    const data = await this.makeRequest("api/Accounts/Points", {
      method: "GET",
    })
    return data.points || 0
  }

  async addUser(userId) {
    await this.makeRequest(`api/Accounts/add/${userId}`, {
      method: "POST",
    })
  }

  async deactivateAccount(email) {
    await this.makeRequest("api/Accounts/DeactivateAccount", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify(email), 
    })
    this.logout()
  }
  

  async reactivateAccount() {
    await this.makeRequest("api/Accounts/ReactivateAccount", {
      method: "POST",
    })
  }

  async deleteAccount(email) {
    await this.makeRequest("api/Accounts/DeleteAccount", {
      method: "DELETE",
      headers: {
        "Content-Type": "text/plain",
      },
      body: email, 
    })
  
    this.logout()
  }
  
  
  
  

  async logout() {
    try {
      if (this.user?.token) {
        await this.makeRequest("api/Accounts/logout", {
          method: "POST",
        })
      }
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      this.user = null
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
      }
    }
  }

  getCurrentUser() {
    return this.user
  }

  isAuthenticated() {
    return this.user !== null && !!this.user.token
  }

  getAuthToken() {
    return this.user?.token || null
  }
}

export const authService = new AuthService()
