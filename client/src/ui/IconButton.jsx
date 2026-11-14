/**
 * כפתור שמציג רק אייקון, וכשעוברים עליו עם העכבר (או מגיעים אליו במקלדת)
 * מופיע כיתוב. ה-label משמש גם כטקסט הנגיש לקוראי מסך (aria-label).
 *
 * variant: "secondary" (ברירת מחדל, כתום בהיר) או "primary" (תכלת כהה).
 * שאר המאפיינים (onClick, disabled, type...) עוברים ישר לכפתור.
 */
function IconButton({ label, variant = "secondary", className = "", type = "button", children, ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      data-tooltip={label}
      className={`icon-button icon-button-${variant} has-tooltip ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default IconButton
