import { Outlet, useLocation, useNavigate } from "react-router-dom"
import PageWrapper from "../layout/PageWrapper"

const EmployeePA = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const returnToEmployeeHome = () => {
    navigate("/personal", { replace: true })
  }

  return (
    <PageWrapper>
      <section className="auth-card parent-area-card min-w-0 flex-1" dir="rtl">
        <button
          className="employee-home-button"
          type="button"
          aria-label="חזרה לדף הבית של עובד"
          title="חזרה לדף הבית של עובד"
          onClick={returnToEmployeeHome}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z" />
          </svg>
        </button>
        <h1>האזור האישי לעובד</h1>
        {location.state?.successMessage && (
          <p className="form-message success-message" role="status">
            {location.state.successMessage}
          </p>
        )}

        <p>חשבון זה כולל הרשאות ניהול.</p>


        <div className="parent-content min-w-0 w-full flex-1">
          <Outlet />
        </div>
      </section>
    </PageWrapper>
  )

}
export default EmployeePA