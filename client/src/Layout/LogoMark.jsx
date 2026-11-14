/**
 * סמל הלוגו של "שרים ביחד": לב פתוח, ילד בתוכו ושני עיגולים מעליו.
 * הצבעים נלקחים מפלטת האתר (תכלת, כתום, ורוד) כדי שהלוגו יתאים לעיצוב הקיצי.
 * הסמל מצויר כ-SVG ולכן חד בכל גודל; הגודל נקבע דרך className (למשל "h-12 w-12").
 */
function LogoMark({ className = "h-12 w-12", title }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      {/* שתי זרועות הלב */}
      <path
        d="M47 37C42 27 30 21 20 29C8 39 12 57 28 71C36 78 45 84 50 91"
        stroke="var(--color-sea-500)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M53 37C58 27 70 21 80 29C92 39 88 57 72 71C64 78 55 84 50 91"
        stroke="var(--color-sea-500)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* שני העיגולים שמעל הלב */}
      <circle cx="20" cy="10" r="7.5" fill="var(--color-blush-400)" />
      <circle cx="80" cy="10" r="7.5" fill="var(--color-blush-400)" />
      {/* הילד שבתוך הלב */}
      <circle cx="50" cy="63" r="9.5" fill="var(--color-sun-400)" />
    </svg>
  )
}

export default LogoMark
