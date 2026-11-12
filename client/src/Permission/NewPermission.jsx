import { memo, useEffect, useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import { api, getErrorMessage } from "../api"
import { permissionActionLabels } from "./permissionActions"

const NewPermission = () => {
  const navigate = useNavigate()
  const { addPermission } = useOutletContext()
  const [name, setName] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [availableActions, setAvailableActions] = useState([])
  const [enabledActions, setEnabledActions] = useState([])
  const [isLoadingActions, setIsLoadingActions] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    api.get("/permission/actions")
      .then(({ data }) => {
        if (active) setAvailableActions(data)
      })
      .catch((error) => {
        if (active) setErrorMessage(getErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoadingActions(false)
      })

    return () => {
      active = false
    }
  }, [])

  const toggleAction = (action) => {
    setEnabledActions((current) =>
      current.includes(action)
        ? current.filter((item) => item !== action)
        : [...current, action]
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    if (!name.trim()) {
      setErrorMessage("יש להזין שם להרשאה.")
      return
    }
    if (!accessCode) {
      setErrorMessage("יש להזין קוד הרשמה לעובדים.")
      return
    }

    setIsSaving(true)
    try {
      const { data } = await api.post("/permission", {
        name: name.trim(),
        password: accessCode,
        validActions: enabledActions,
      })
      addPermission(data)
      navigate("/personal/permissions-manage", { replace: true })
    } catch (error) {
      setErrorMessage(
        error.response?.status === 409
          ? "כבר קיימת הרשאה בשם הזה. יש לבחור שם אחר."
          : getErrorMessage(error)
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section dir="rtl">
      <h2>הרשאה חדשה</h2>

      {errorMessage && (
        <p className="form-message error-message" role="alert">
          {errorMessage}
        </p>
      )}

      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="permission-name">שם ההרשאה</label>
          <input
            id="permission-name"
            value={name}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="permission-access-code">קוד הרשמה לעובדים</label>
          <input
            id="permission-access-code"
            type="password"
            autoComplete="new-password"
            value={accessCode}
            onChange={(event) => setAccessCode(event.target.value)}
            required
          />
          <small>
            העובד ישתמש בקוד הזה לשיוך להרשאה, ויבחר סיסמה אישית לחשבונו.
          </small>
        </div>

        <fieldset>
          <legend>יכולות ההרשאה</legend>
          {isLoadingActions && <p role="status">טוען יכולות...</p>}
          {!isLoadingActions && (
            <div className="event-status-fields">
              {availableActions.map((action) => (
                <label className="event-status-field" key={action}>
                  <span>{permissionActionLabels[action] || action}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={enabledActions.includes(action)}
                    onChange={() => toggleAction(action)}
                  />
                </label>
              ))}
            </div>
          )}
          {!isLoadingActions && availableActions.length === 0 && (
            <p>לא נמצאו יכולות זמינות.</p>
          )}
        </fieldset>

        <button
          className="primary-button"
          type="submit"
          disabled={isSaving || isLoadingActions || availableActions.length === 0}
        >
          {isSaving ? "שומר..." : "אישור"}
        </button>
      </form>
    </section>
  )
}

export default memo(NewPermission)