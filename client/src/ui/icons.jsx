/**
 * אייקונים לכפתורים בלי טקסט. כולם בסגנון קו אחיד (stroke) כמו שאר האייקונים באתר,
 * ויורשים את הצבע מהכפתור (currentColor). הגודל נקבע ב-CSS של .icon-button.
 */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
}

// X: ביטול וסגירה.
export const CancelIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

// עין: צפייה.
export const EyeIcon = () => (
  <svg {...base}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

// חץ למעלה מעל מגש: העלאת/בחירת קובץ.
export const UploadIcon = () => (
  <svg {...base}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
)

// לוח שנה עם פלוס: הרשמה לאירוע.
export const CalendarPlusIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18M12 13v5M9.5 15.5h5" />
  </svg>
)

// לוח שנה עם X: ביטול הרשמה לאירוע.
export const CalendarXIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18M9.5 13.5l5 5M14.5 13.5l-5 5" />
  </svg>
)

// חץ ימינה (בכיוון RTL: חזרה אחורה).
export const BackIcon = () => (
  <svg {...base}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

// דיסקט: שמירה.
export const SaveIcon = () => (
  <svg {...base}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
)

// עיפרון: עריכה.
export const EditIcon = () => (
  <svg {...base}>
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
)
