"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authEndpoints } from "@/lib/api/endpoints/auth"

// Define the User type
export interface User {
  id: string
  fullName: string
  email: string
  role: "user" | "admin"
  avatarUrl?: string
  profile?: UserProfile | null
}

// Define the UserProfile type
export interface UserProfile {
  firstName: string
  middleName: string
  lastName: string
  gender: "male" | "female"
  birthDate: string
  nationalId: string
  phoneNumber: string
  address: {
    area: string
    region: string
    district: string
    ward: string
    street: string
  }
  photoUrl?: string
  addressProofUrl?: string
  isComplete: boolean
}

// Define the login result interface
interface LoginResult {
  success: boolean
  hasProfile: boolean
}

// Define API auth response
interface AuthResponse {
  status: boolean
  data: {
    email: string
    authToken: string
    refreshToken: string
    profile: UserProfile | null
    company: any | null
  }
  message: string
  timestamp: string
}

// Define the AuthContext interface
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<LoginResult>
  register: (data: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }) => Promise<boolean>
  logout: () => void
  updateUserProfile: (profile: UserProfile) => void
  hasCompletedProfile: () => boolean
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Register setUser function for external use
  useEffect(() => {
    registerSetUser(setUser);
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if token exists
        const token = localStorage.getItem("auth_token")
        
        if (token) {
          // Get user profile from API
          try {
            const profileData = await authEndpoints.getProfile()
            setUser(profileData.user)
          } catch (profileError) {
            // If profile fetch fails, fallback to stored user data
            const storedUser = localStorage.getItem("user")
            if (storedUser) {
              setUser(JSON.parse(storedUser))
            } else {
              // If no stored user, logout
              authEndpoints.logout()
            }
          }
        }
      } catch (error) {
        console.error("Authentication error:", error)
        authEndpoints.logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string, remember: boolean = false): Promise<LoginResult> => {
    setIsLoading(true)
    try {
      try {
        // Try to call the real API endpoint
        const response = await authEndpoints.signin(email, password)
        console.log("API Response:", response.data)
        if (response.data.status) {
          // Extract user data from response
          const { email, profile } = response.data.data
          console.log("API Response:", response.data.data)
          setAuth(response.data.data)
          // Create user object from response data
          const userData: User = {
            id: response.data.data.authToken.split('.')[0] || Math.random().toString(36).substring(2, 15), // Use part of token as ID if available
            email: email,
            fullName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), // Temporary name until profile is complete
            role: "user", // Default role
            profile: profile
          }
          
          // Check if user has a profile
          const hasProfile = !!profile
          
          // Set user in state
          setUser(userData)
          
          // Store in localStorage if remember is true
          if (remember && userData) {
            localStorage.setItem("user", JSON.stringify(userData))
          }
          
          return {
            success: true,
            hasProfile: hasProfile
          }
        } else {
          return {
            success: false,
            hasProfile: false
          }
        }
      } catch (apiError) {
        console.error("API connection error:", apiError)
        console.log("Using fallback login mechanism")
        
       await new Promise(resolve => setTimeout(resolve, 1000))
      
       const isAdmin = email.includes("admin")
        const hasProfile = email.includes("complete")
        
        // Create mock user for development
        const mockUser: User = {
          id: Math.random().toString(36).substring(2, 15),
          fullName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          email,
          role: isAdmin ? "admin" : "user",
          avatarUrl: "/avatar.jpg",
          profile: hasProfile ? {
            firstName: "John",
            middleName: "",
            lastName: "Doe",
            gender: "male",
            birthDate: "1990-01-01",
            nationalId: "12345678-12345-12345-12",
            phoneNumber: "+255123456789",
            address: {
              area: "Urban",
              region: "Dar es Salaam",
              district: "Ilala",
              ward: "Kariakoo",
              street: "Uhuru Street"
            },
            photoUrl: "/avatar.jpg",
            addressProofUrl: "/proof.jpg",
            isComplete: true
          } : null
        }

        setUser(mockUser)
        
        // Store in localStorage if remember is true
        if (remember) {
          localStorage.setItem("user", JSON.stringify(mockUser))
        }
        
        return {
          success: true,
          hasProfile: hasProfile
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        hasProfile: false
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (data: {
    fullName: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // In a real app, this would be an API call to register
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 15),
        fullName: data.fullName,
        email: data.email,
        role: "user",
        avatarUrl: "/avatar.jpg"
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      
      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    authEndpoints.logout()
  }

  // Update user profile function
  const updateUserProfile = (profile: UserProfile) => {
    if (user) {
      const updatedUser = {
        ...user,
        profile: {
          ...profile,
          isComplete: true
        }
      }
      setUser(updatedUser)
      
      // Update in localStorage if user was remembered
      if (localStorage.getItem("user")) {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    }
  }
  
  // Check if user has completed profile
  const hasCompletedProfile = () => {
    return !!user?.profile?.isComplete
  }

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUserProfile,
    hasCompletedProfile
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Create a hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Create a reference to the setUser function
let setUserRef: React.Dispatch<React.SetStateAction<User | null>> | null = null;

// Export function to register the setUser function
export function registerSetUser(setUserFunction: React.Dispatch<React.SetStateAction<User | null>>) {
  setUserRef = setUserFunction;
}

// Export function to set auth data from outside the context
// This is used by the auth endpoints
export function setAuth(authData: any) {
  if (authData && authData.email) {
    const { email, profile } = authData;
    
    // Create user object from response data
    const userData: User = {
      id: authData.authToken?.split('.')[0] || Math.random().toString(36).substring(2, 15),
      email: email,
      fullName: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      role: "user",
      profile: profile
    };
    
    // Store user in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Update React state if setUserRef is available
    if (setUserRef) {
      console.log("Updating user state via setAuth:", userData);
      setUserRef(userData);
    } else {
      console.warn("setUserRef is not available. User state not updated.");
    }
    
    return userData;
  }
  return null;
}
