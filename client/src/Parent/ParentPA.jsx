import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../useAuth"
import { api, getErrorMessage } from "../api"
import PageWrapper from "../layout/PageWrapper"

// האזור קורא את זהות ההורה מה-Context במקום לפרש נתונים מקומיים מהדפדפן.
function ParentPA() {
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()
  const [childrenForSelection, setChildrenForSelection] = useState([])
  const [isLoadingChildren, setIsLoadingChildren] = useState(true)
  const [successMessage, setSuccessMessage] = useState("")
  const [childrenError, setChildrenError] = useState("")

  useEffect(() => {
    let active = true

    api.get("/child")
      .then(({ data }) => {
        if (!active) return
        setChildrenForSelection(data)
        setChildrenError(data.length === 0 ? "לא נמצאו ילדים המשויכים לחשבון ההורה." : "")
      })
      .catch((error) => {
        if (active) setChildrenError(getErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoadingChildren(false)
      })

    return () => {
      active = false
    }
  }, [location.state?.refreshChildren])

  // הכותרת וההודעה הפותחת מוצגות רק במסך הבית של האזור האישי, לא בעמודי המשנה (אירועים וכו').
  const isPersonalHome = ["/personal", "/EmployeePA"].includes(location.pathname.replace(/\/+$/, ""))

  const returnToPersonalHome = () => {
    navigate("/personal", { replace: true })
  }

  return (
    <PageWrapper>
      <section className="auth-card parent-area-card min-w-0 flex-1" dir="rtl">
        <header className="parent-area-header">
          {isPersonalHome && <h1>האזור האישי</h1>}
          <button
            className="employee-home-button"
            type="button"
            aria-label="חזרה לאזור האישי הראשי"
            title="חזרה לאזור האישי הראשי"
            onClick={returnToPersonalHome}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
            </svg>
          </button>
          {isPersonalHome && (
            <p>התחברת בהצלחה ({role}). פרטי המשתמש נטענו לאחר אימות מול השרת.</p>
          )}
        </header>
        {(successMessage || location.state?.successMessage) && (
          <p className="form-message success-message" role="status">
            {successMessage || location.state.successMessage}
          </p>
        )}
        {/* מסכי־בן, כמו אירועים, מוצגים כאן לפי הנתיב ולא באמצעות state מקומי. */}
        <div className="parent-content min-w-0 w-full flex-1">
          <Outlet
            context={{
              childrenForRegistration: childrenForSelection,
              childrenLoading: isLoadingChildren,
              childrenError,
              onChildUpdated: (updatedChild) => {
                setChildrenForSelection((current) => current.map((child) =>
                  child._id === updatedChild._id ? updatedChild : child
                ))
              },
              onRegistrationSuccess: (childName, eventName) => {
                setSuccessMessage(`ההרשמה של ${childName} לאירוע "${eventName}" הושלמה בהצלחה.`)
              },
            }}
          />
        </div>
      </section>
    </PageWrapper>
  )
}

export default ParentPA
