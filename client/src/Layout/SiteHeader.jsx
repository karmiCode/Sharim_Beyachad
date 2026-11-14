import { useEffect, useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../useAuth"
import LogoMark from "./LogoMark"

const pillBase =
  "rounded-full px-4 py-2 text-base font-bold no-underline transition-colors"

// קישור בתפריט: הדף הפעיל מודגש בכתום, ושאר הקישורים מקבלים רקע תכלת בריחוף.
const navLinkClass = ({ isActive }) =>
  `${pillBase} ${isActive ? "bg-sun-100 text-sun-800" : "text-sea-800 hover:bg-sea-100"}`

/**
 * בונה את רשימת הקישורים לפי מי שמחובר.
 * הקישורים תואמים לנתיבים שמוגדרים ב-App.jsx; הרשאות העובד נבדקות כאן
 * רק כדי להסתיר קישורים, והאכיפה האמיתית נשארת ב-ProtectedRoute ובשרת.
 */
function getMenuItems({ isAuthenticated, role, hasPermission }) {
  if (!isAuthenticated) {
    return [
      { to: "/register/parent", label: "הרשמת הורה" },
      { to: "/register/volunteer", label: "הרשמת מתנדב/ת" },
    ]
  }

  const home = { to: "/personal", label: "האזור שלי", end: true }

  if (role === "parent") {
    return [
      home,
      { to: "/personal/events", label: "אירועים" },
      { to: "/personal/reg-child", label: "רישום ילד" },
      { to: "/personal/parent-details", label: "פרטי הורה" },
    ]
  }

  if (role === "volunteer") {
    return [
      home,
      { to: "/personal/events", label: "אירועים" },
      { to: "/personal/volunteer-details", label: "פרטים אישיים" },
    ]
  }

  if (role === "employee") {
    return [
      home,
      { to: "/personal/all-events", label: "כל האירועים" },
      ...(hasPermission("events")
        ? [{ to: "/personal/add-event", label: "הוספת אירוע" }]
        : []),
      ...(hasPermission("employees")
        ? [{ to: "/personal/employees-manage", label: "ניהול עובדים" }]
        : []),
      { to: "/personal/employee-details", label: "פרטים אישיים" },
    ]
  }

  return [home]
}

/**
 * כותרת קבועה בראש כל עמוד: לוגו מצד אחד ותפריט ניווט מצד שני.
 * התפריט משתנה לפי סוג המשתמש (אורח, הורה, מתנדב/ת, עובד/ת), ובמסך צר
 * הוא נפתח מכפתור "המבורגר". היא מוצבת ב-App מחוץ ל-Routes.
 */
function SiteHeader() {
  const navigate = useNavigate()
  const { isAuthenticated, role, hasPermission, logout, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  // Escape סוגר את התפריט הנפתח, כמו שמצופה מתפריט נגיש.
  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [menuOpen])

  const items = loading ? [] : getMenuItems({ isAuthenticated, role, hasPermission })
  const closeMenu = () => setMenuOpen(false)

  const signOut = () => {
    closeMenu()
    logout()
    navigate("/", { replace: true })
  }

  const links = items.map((item) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={navLinkClass}
      onClick={closeMenu}
    >
      {item.label}
    </NavLink>
  ))

  // לאורח מוצג כפתור כניסה מודגש; למחובר מוצג כפתור יציאה עדין בוורוד.
  const accountButton = loading ? null : isAuthenticated ? (
    <button
      type="button"
      onClick={signOut}
      className={`${pillBase} cursor-pointer border-2 border-blush-300 bg-transparent text-blush-700 hover:bg-blush-50`}
    >
      יציאה
    </button>
  ) : (
    <Link
      to="/"
      onClick={closeMenu}
      className={`${pillBase} bg-sea-700 text-center text-white hover:bg-sea-800`}
    >
      כניסה
    </Link>
  )

  return (
    <header
      dir="rtl"
      className="sticky top-0 z-[1] border-b-4 border-sun-300 bg-cream-50/95 backdrop-blur"
    >
      <div
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4"
        style={{ height: "var(--header-height)" }}
      >
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="שרים ביחד - למסך הראשי"
          className="flex shrink-0 items-center gap-3 no-underline"
        >
          <LogoMark className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <span className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight text-sea-700 sm:text-3xl">
              שרים ביחד
            </span>
            <span className="mt-1 hidden text-sm font-medium text-sun-700 sm:block">
              משפחה, לפני הכל.
            </span>
          </span>
        </Link>

        {/* תפריט במסך רחב */}
        <nav aria-label="תפריט ראשי" className="hidden items-center gap-1 md:flex">
          {links}
          {accountButton}
        </nav>

        {/* כפתור המבורגר במסך צר */}
        {!loading && (
          <button
            type="button"
            aria-label={menuOpen ? "סגירת התפריט" : "פתיחת התפריט"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-xl border-0 bg-sea-100 text-sea-800 md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* תפריט נפתח במסך צר */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="תפריט ראשי"
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b-4 border-sun-300 bg-cream-50 p-3 shadow-lg md:hidden"
        >
          {links}
          {accountButton}
        </nav>
      )}
    </header>
  )
}

export default SiteHeader
