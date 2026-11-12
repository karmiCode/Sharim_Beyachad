import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom"
import { useAuth } from "../useAuth"
import Can from "../Can"
import PageWrapper from "../layout/PageWrapper"

const EmployeePA = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { permissions, logout } = useAuth()
  const signOut = () => {
    logout()
    navigate("/", { replace: true })
  }
  
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


        <nav className="parent-nav" aria-label="ניווט באזור האישי לעובד">
          <NavLink
            to="/personal/employee-details"
            className={({ isActive }) =>
              `parent-nav-link${isActive ? " active" : ""}`
            }
          >
            עדכון פרטים אישיים
          </NavLink>
          <NavLink
            to="/personal/all-events"
            className={({ isActive }) =>
              `parent-nav-link${isActive ? " active" : ""}`
            }
          >
            כל האירועים
          </NavLink>
          <Can permission="events">
            <NavLink
              to="/personal/add-event"
              className={({ isActive }) =>
                `parent-nav-link${isActive ? " active" : ""}`
              }
            >
              הוסף אירוע
            </NavLink>
          </Can>

          <Can permission="employees">
            <NavLink
              to="/personal/employees-manage"
              className={({ isActive }) =>
                `parent-nav-link${isActive ? " active" : ""}`
              }
            >
              ניהול עובדים
            </NavLink>
          </Can>

          <Can permission="permissions">
            <NavLink
              to="/personal/permissions-manage"
              className={({ isActive }) =>
                `parent-nav-link${isActive ? " active" : ""}`
              }
            >
              ניהול הרשאות
            </NavLink>
          </Can>

          <button className="parent-nav-link" type="button" onClick={signOut}>
            יציאה
          </button>
        </nav>


        <div className="parent-content min-w-0 w-full flex-1">
          <Outlet />
        </div>
      </section>
    </PageWrapper>
  )

}
export default EmployeePA