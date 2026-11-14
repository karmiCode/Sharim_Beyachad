import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, getErrorMessage } from "../api"
import { useAuth } from "../useAuth"
import IconButton from "../ui/IconButton"
import { CancelIcon } from "../ui/icons"

/**
 * טופס עדכון הפרופיל של המתנדבת המחוברת.
 * השרת מזהה את בעלת החשבון לפי JWT ובודק שה-id בכתובת תואם לה; לכן הטופס
 * שולח PATCH ל-/volunteer/:id ולא שולח מזהה משתמש בתוך גוף הבקשה.
 */
const UpdateVolunteer = () => {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState(user?.email || "")
    const [fullName, setFullName] = useState(user?.fullName || "")
    const [phone, setPhone] = useState(user?.phone || "")
    const [age, setAge] = useState(user?.age ?? "")
    const [seminar, setSeminar] = useState(user?.seminar || "")
    const [detaling, setDetaling] = useState(user?.detaling || "")
    const [password, setPassword] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event) => {
        event.preventDefault()
        setErrorMessage("")
        setIsSubmitting(true)

        // PATCH שולח רק שדות פרופיל. סיסמה ריקה מושמטת כדי לא לדרוס את הקיימת.
        // age נשמר בסכמה כמספר שלם, לכן ממירים את ערך ה-input (שהוא מחרוזת).
        const payload = {
            email: email.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            seminar: seminar.trim(),
            detaling: detaling.trim(),
        }

        if (age !== "") {
            payload.age = Number(age)
        }
        if (password) {
            payload.password = password
        }

        try {
            await api.patch(`/volunteer/${user._id}`, payload)
            await refreshUser()
            navigate("/personal", {
                replace: true,
                state: { successMessage: "פרטי המתנדבת עודכנו בהצלחה." },
            })
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!user?._id) {
        return <p role="alert">לא ניתן לטעון את פרטי המתנדב/ת. יש להתחבר מחדש.</p>
    }

    return (
        <>
            <h2>עדכון פרטי מתנדבת</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label htmlFor="volunteer-fullName">שם מלא:</label>
                    <input
                        type="text"
                        id="volunteer-fullName"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-email">אימייל:</label>
                    <input
                        type="email"
                        id="volunteer-email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-phone">טלפון:</label>
                    <input
                        type="tel"
                        id="volunteer-phone"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        required
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-age">גיל:</label>
                    <input
                        type="number"
                        id="volunteer-age"
                        min="0"
                        step="1"
                        value={age}
                        onChange={(event) => setAge(event.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-seminar">סמינר:</label>
                    <input
                        type="text"
                        id="volunteer-seminar"
                        value={seminar}
                        onChange={(event) => setSeminar(event.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-detaling">פרטים נוספים:</label>
                    <input
                        type="text"
                        id="volunteer-detaling"
                        value={detaling}
                        onChange={(event) => setDetaling(event.target.value)}
                    />
                </div>

                <div className="form-field">
                    <label htmlFor="volunteer-password">סיסמה חדשה:</label>
                    <input
                        type="password"
                        id="volunteer-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        // placeholder="השאירי ריק אם אינך רוצה לשנות סיסמה"
                        autoComplete="new-password"
                    />
                </div>

                {errorMessage && <p className="form-message error-message" role="alert">{errorMessage}</p>}
                <div className="volunteer-registration-actions">
                    <IconButton
                        label="ביטול"
                        onClick={() => navigate("/personal")}
                        disabled={isSubmitting}
                    >
                        <CancelIcon />
                    </IconButton>
                    <button
                        className="primary-button !inline-flex !h-8 !min-h-0 !w-8 !min-w-0 !items-center !justify-center !rounded-md !p-1"
                        type="submit"
                        disabled={isSubmitting}
                        aria-label={isSubmitting ? "שומר..." : "שמירת פרטי מתנדבת"}
                        title={isSubmitting ? "שומר..." : "שמירת פרטי מתנדבת"}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                            <path d="M17 21v-8H7v8M7 3v5h8" />
                        </svg>
                    </button>
                </div>
            </form>
        </>
    )

}

export default UpdateVolunteer

