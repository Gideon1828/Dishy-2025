"use client"

import { useState, useRef, useEffect ,useContext} from "react"
import { useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import "./Header.css"
import logo from "../assets/logo.png"
import { Link, useNavigate } from "react-router-dom"
import LanguageSwitcher from "../LanguageSwitcher"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faHeart, faBars, faTimes, faSearch } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import { ThemeContext } from "../context/ThemeContext";

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()

  const [usernames, setUsernames] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true"
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const toggleSearchExpand = () => {
    setSearchExpanded(!searchExpanded)
  }

  // search bar
  const [dish, setDish] = useState("")
  const [cuisine, setCuisine] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios
        .get("https://dishy-2g4s.onrender.com/working", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setUsernames(response.data.username)
          setIsLoggedIn(true)
        })
        .catch((error) => {
          console.error("Error fetching data:", error)
          setUsernames("")
          setIsLoggedIn(false)
          localStorage.setItem("isLoggedIn", "false")
        })
    } else {
      setUsernames("")
      setIsLoggedIn(false)
    }

    // Close mobile menu when route changes
    setMobileMenuOpen(false)
  }, [location])

  const name = usernames
  const user = {
    name: name,
    avatarUrl: "/PhotoProfile.png",
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.setItem("isLoggedIn", "false")
    setIsLoggedIn(false)
    setMobileMenuOpen(false)
  }

  const [dropdownVisible, setDropdownVisible] = useState(false)
  const dropdownRef = useRef(null)

  const toggleDropdown = (e) => {
    e.stopPropagation()
    setDropdownVisible((prev) => !prev)
  }

  useEffect(() => {
    const handleClickAnywhere = () => {
      setDropdownVisible(false)
    }

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false)
        setSearchExpanded(false)
      }
    }

    document.addEventListener("click", handleClickAnywhere)
    window.addEventListener("resize", handleResize)

    return () => {
      document.removeEventListener("click", handleClickAnywhere)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  //Search Bar Functionality
  const handleSearch = async () => {
    if (cuisine === "") {
      alert("Please select a cuisine before searching!")
      return
    }

    let url = `https://api.spoonacular.com/recipes/complexSearch?query=${dish}&number=10&apiKey=7eb495e634104e24aa445a2a2d7bf89c`

    if (cuisine !== "Any") {
      url += `&cuisine=${cuisine}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.results.length > 0) {
        navigate("/results", { state: { recipes: data.results } })
        setSearchExpanded(false)
      } else {
        alert("No recipes found. Try a different dish name!")
      }
    } catch (error) {
      console.error("Error fetching recipes:", error)
    }
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo and Title */}
        <div className="logo-container">
          <img src={logo || "/placeholder.svg"} alt={t("header.title")} className="logo" />
          <h1 className="title">{t("header.title")}</h1>
        </div>

        {/* Search Bar - Only visible on desktop */}{/* Search Bar - Positioned below header container like in original */}
      {isLoggedIn && (
        <div className={`header-search-bar ${searchExpanded ? "expanded" : ""}`}>
          <input type="text" placeholder="Search Any Dish" value={dish} onChange={(e) => setDish(e.target.value)} />

          <select onChange={(e) => setCuisine(e.target.value)} value={cuisine}>
            <option value="">Cuisine</option>
            <option value="Any">Any</option>
            <option value="Indian">Indian</option>
            <option value="Mexican">Mexican</option>
            <option value="Chinese">Chinese</option>
            <option value="Italian">Italian</option>
            <option value="Japanese">Japanese</option>
            <option value="French">French</option>
            <option value="Thai">Thai</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Middle Eastern">Middle Eastern</option>
            <option value="Vietnamese">Vietnamese</option>
            <option value="Korean">Korean</option>
            <option value="Burmese">Burmese</option>
          </select>
          <button className="header-submit-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
      )}

        {/* Mobile Controls - Only visible on mobile */}
        <div className="mobile-controls">
          {isLoggedIn && (
            <button
              className={`mobile-search-toggle ${searchExpanded ? "active" : ""}`}
              onClick={toggleSearchExpand}
              aria-label="Toggle search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          )}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? "active" : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
          </button>
        </div>

        {/* Navigation, Language Switcher, and Profile */}
        <div className={`nav-container ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <div className="mobile-menu-header">
            <button className="mobile-menu-close" onClick={toggleMobileMenu}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <nav className="nav">
            {!isLoggedIn ? (
              <>
                <Link to="/" className="nav-link" onClick={handleLogout}>
                  {t("header.nav.home")}
                </Link>
                <Link to="/login" className="nav-link" onClick={handleLogout}>
                  {t("header.nav.login")}
                </Link>
                <Link to="/register" className="nav-link" onClick={handleLogout}>
                  {t("header.nav.register")}
                </Link>
              </>
            ) : (
              <>
                <Link to="/favorite" className="nav-link favorite-link" onClick={() => setMobileMenuOpen(false)}>
                  <FontAwesomeIcon icon={faHeart} /> {t("header.nav.favorites") || "Favorites"}
                </Link>
              </>
            )}
          </nav>

          {/* Language Switcher */}
          <div className="language-container">
            <LanguageSwitcher />
          </div>

          {/* Profile Section */}
          {isLoggedIn && (
            <div className="profile-section" onClick={toggleDropdown}>
              <img src={user.avatarUrl || "/placeholder.svg"} alt="Profile" className="profile-icon" />
              {dropdownVisible && (
                <div className="profile-dropdown" ref={dropdownRef}>
                  <div className="profile-info">
                    <img src={user.avatarUrl || "/placeholder.svg"} alt="Profile" className="profile-dropdown-icon" />
                    <span>{user.name}</span>
                  </div>
                  <Link to="/change-password" className="dropdown-item" onClick={() => setMobileMenuOpen(false)}>
                    {t("header.nav.changePassword") || "Change Password"}
                  </Link>
                  <div
                    className="dropdown-item"
                    onClick={() => {
                    setDarkMode(!darkMode);
                    setMobileMenuOpen(false);
                    }}>
                    {t("header.nav.darkmode") || "Dark Mode"} {darkMode && "✔️"}
                  </div>
                  <Link to="/" onClick={handleLogout} className="btn logout-btn">
                    {t("header.nav.logout") || "Logout"}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      
    </header>
  )
}

export default Header
