import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../useAuth"
import Can from "../Can"
import PageWrapper from "../layout/PageWrapper"

// Layout למתנדבת: Outlet מציג את תוכן נתיב-הבן. הניווט והיציאה נמצאים בתפריט הכותרת (SiteHeader).
function VolunteerPA() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const returnToPersonalHome = () => {
    navigate("/personal", { replace: true })
  }

  return (
    <PageWrapper>
      <section className="auth-card parent-area-card min-w-0 flex-1" dir="rtl">
        <header className="parent-area-header">
          <h1>האזור האישי למתנדב/ת</h1>
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
          
          <Can role="volunteer">
            <p>שלום {user?.fullName || user?.email || "מתנדב/ת"}.</p>
          </Can>
        </header>
        {location.state?.successMessage && (
          <p className="form-message success-message" role="status">
            {location.state.successMessage}
          </p>
        )}
        <div className="parent-content min-w-0 w-full flex-1">
          <Outlet />
        </div>
      </section>
    </PageWrapper>
  )
}

export default VolunteerPA