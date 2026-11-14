import { Link, Navigate, useOutletContext } from "react-router-dom"

/**
 * עמוד "עדכון פרטי ילד" מתפריט הכותרת: מציג את הילדים של ההורה לבחירה.
 * כשיש ילד אחד בלבד עוברים ישר לעריכתו. הרשימה מגיעה מ-ParentPA דרך context,
 * ולכן אין כאן בקשת רשת נוספת.
 */
function ChildrenUpdatePage() {
  const { childrenForRegistration, childrenLoading, childrenError } = useOutletContext()

  if (childrenLoading) {
    return <p role="status">טוען ילדים...</p>
  }

  if (childrenError) {
    return <p className="form-message error-message" role="alert">{childrenError}</p>
  }

  if (childrenForRegistration.length === 0) {
    return <p>לא נמצאו ילדים המשויכים לחשבון ההורה.</p>
  }

  if (childrenForRegistration.length === 1) {
    return <Navigate to={`/personal/children/${childrenForRegistration[0]._id}/edit`} replace />
  }

  return (
    <section className="parent-events" aria-labelledby="children-update-heading">
      <h2 id="children-update-heading">בחירת ילד לעדכון</h2>
      <p>בחרו את הילד שאת פרטיו תרצו לעדכן.</p>
      {childrenForRegistration.map((child) => (
        <Link
          key={child._id}
          className="secondary-button"
          to={`/personal/children/${child._id}/edit`}
          style={{ display: "grid", alignItems: "center", textDecoration: "none" }}
        >
          {child.fullName}
        </Link>
      ))}
    </section>
  )
}

export default ChildrenUpdatePage
