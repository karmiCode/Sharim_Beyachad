import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, getErrorMessage } from "../api"
import { useAuth } from "../useAuth"

const UpdateParent = () => {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState(user?.email || "")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage("")
        setIsSubmitting(true)

        const payload = { email }

        // שולחים סיסמה רק אם ההורה בחר לשנות אותה.
        if (password) {
            payload.password = password
        }

        try {
            await api.patch(`/parent/${user._id}`, payload)
            // מרעננים מהשרת כדי שה-Context יכיל את הנתונים המאומתים לאחר העדכון.
            await refreshUser()
            navigate("/personal", {
                replace: true,
                state: { successMessage: "פרטי ההורה עודכנו בהצלחה." },
            })
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user?._id) {
        return <p role="alert">לא ניתן לטעון את פרטי ההורה. יש להתחבר מחדש.</p>
    }



    return (
      <>
        <h2>עדכון פרטי הורה</h2>
        <form onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="email">אימייל:</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="form-field">
                <label htmlFor="password">סיסמה חדשה:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="סיסמה חדשה"
                    autoComplete="new-password"
                />
            </div>

            {errorMessage && <p role="alert">{errorMessage}</p>}
            <button className="secondary-button" type="button" onClick={() => navigate("/personal")}>
                ביטול
            </button>
            <button
                className="primary-button !inline-flex !h-8 !min-h-0 !w-8 !min-w-0 !items-center !justify-center !rounded-md !p-1"
                type="submit"
                disabled={isSubmitting}
                aria-label={isSubmitting ? "שומר..." : "שמירת פרטי הורה"}
                title={isSubmitting ? "שומר..." : "שמירת פרטי הורה"}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
            </button>
        </form>
      </>
    )
}

export default UpdateParent
