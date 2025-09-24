"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

// Define available languages
export type Language = "en" | "sw"

// Define translations interface
export interface TranslationValue {
  [key: string]: string
}

export interface LanguageSet {
  en: TranslationValue
  sw: TranslationValue
}

export interface Translations {
  [key: string]: LanguageSet
}

// Language context interface
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Initial translations
const translations: Translations = {
  // Common UI elements
  common: {
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember me",
      agreeTerms: "I agree to the Terms and Conditions",
      createAccount: "Create Account",
      welcome: "Welcome to Walowezi Migrant Portal",
      readMore: "Read more",
      angaliaZaidi: "Angalia Zaidi",
      tumaOmbi: "Tuma Maombi",
      signIn: "Sign In",
      accountAccess: "Account Access",
      signInOrCreateAccount: "Sign in to your account or create a new one",
      resetPassword: "Reset Password",
      resetPasswordDescription: "Enter your email address and we'll send you a link to reset your password.",
      requestResetLink: "Request Reset Link"
    },
    sw: {
      login: "Ingia",
      register: "Jisajili",
      email: "Barua pepe",
      password: "Nywila",
      confirmPassword: "Thibitisha Nywila",
      forgotPassword: "Umesahau nywila?",
      rememberMe: "Nikumbuke",
      agreeTerms: "Nakubali Vigezo na Masharti",
      createAccount: "Fungua Akaunti",
      welcome: "Karibu kwenye Portal ya Walowezi",
      readMore: "Soma zaidi",
      angaliaZaidi: "Angalia Zaidi",
      tumaOmbi: "Tuma Maombi",
      signIn: "Ingia",
      accountAccess: "Ufikiaji wa Akaunti",
      signInOrCreateAccount: "Ingia kwenye akaunti yako au tengeneza mpya",
      resetPassword: "Weka upya Nywila",
      resetPasswordDescription: "Ingiza barua pepe yako na tutakutumia kiungo cha kuweka upya nywila yako.",
      requestResetLink: "Omba Kiungo cha Kuweka Upya"
    }
  },
  // Landing page specific
  landing: {
    en: {
      managing: "Migrant",
      seasonalMigrant: "System",
      inTanzania: "in Tanzania",
      description: "This is a service that enables an applicant to fill out the Settlement Permit Application Form electronically from anywhere. After completing the form, they will be required to print it and submit it together with other supporting documents to the nearest Immigration Office for processing of their Settlement Permit application",
      ourServices: "Our Services"
    },
    sw: {
      managing: "Mfumo wa",
      seasonalMigrant: "Walowezi",
      inTanzania: "Tanzania",
      description: "Hii ni huduma inayomuwezesha muombaji kujaza Fomu ya Maombi ya Kibali cha Walowezi kwa njia ya Kielektroniki akiwa mahali popote. Baada ya kujaza fomu hiyo, atatakiwa kuichapisha (Print) na kuiwasilisha pamoja na vielelezo vingine katika Ofisi ya Uhamiaji iliyo karibu naye kwa ajili ya kushughulikiwa maombi yake ya Kibali cha Walowezi.",
      ourServices: "Huduma Zetu"
    }
  },
  // Service cards
  services: {
    en: {
      mmiliki: "Individual Owner",
      kampuni: "Company",
      akaunti: "Account",
      requirements: "Requirements"
    },
    sw: {
      mmiliki: "Mmiliki Binafsi",
      kampuni: "Kampuni",
      akaunti: "Akaunti",
      requirements: "Vigezo na Masharti"
    }
  }
}

// Provider component
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>("en")
  
  useEffect(() => {
    // Try to get language from localStorage on mount
    const storedLanguage = localStorage.getItem("language") as Language
    if (storedLanguage === "en" || storedLanguage === "sw") {
      setLanguageState(storedLanguage)
    }
  }, [])
  
  // Update language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }
  
  // Translation function
  const t = (key: string): string => {
    // Split the key into section and subkey (e.g., "common.login")
    const [section, subkey] = key.split(".")
    
    // Return translation or key if not found
    if (translations[section] && translations[section][language] && translations[section][language][subkey]) {
      return translations[section][language][subkey]
    }
    
    // Fallback to English
    if (translations[section] && translations[section]["en"] && translations[section]["en"][subkey]) {
      return translations[section]["en"][subkey]
    }
    
    return key
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
