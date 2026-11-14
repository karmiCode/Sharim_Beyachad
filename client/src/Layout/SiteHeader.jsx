import { Link } from "react-router-dom"
import LogoMark from "./LogoMark"

/**
 * כותרת קבועה שמוצגת בראש כל עמוד באתר ומכילה את הלוגו.
 * היא מוצבת ב-App מחוץ ל-Routes, ולכן אין צורך להוסיף אותה לכל מסך בנפרד.
 * לחיצה על הלוגו מחזירה למסך הראשי.
 */
function SiteHeader() {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-[1] flex items-center justify-center border-b-4 border-sun-300 bg-cream-50/90 px-4 backdrop-blur"
      style={{ height: "var(--header-height)" }}
    >
      <Link
        to="/"
        aria-label="שרים ביחד - למסך הראשי"
        className="flex items-center gap-3 no-underline"
      >
        <LogoMark className="h-14 w-14 shrink-0" />
        <span className="flex flex-col leading-none">
          <span className="text-3xl font-extrabold tracking-tight text-sea-700">
            שרים ביחד
          </span>
          <span className="mt-1 text-sm font-medium text-sun-700">
            משפחה, לפני הכל.
          </span>
        </span>
      </Link>
    </header>
  )
}

export default SiteHeader
