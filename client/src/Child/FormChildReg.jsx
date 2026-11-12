import { useState } from "react"
import { api, getErrorMessage } from "../api"

const FormChildReg = ({ child, event, onSuccess }) => {
    const [favoriteVolun, setFavoriteVolun] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [payment, setPayment] = useState(null)
    const [paymentError, setPaymentError] = useState("")
    const [isCreatingPayment, setIsCreatingPayment] = useState(false)

    const handleSubmit = async (submitEvent) => {
        submitEvent.preventDefault()
        setErrorMessage("")
        setIsSubmitting(true)

        try {
            await api.post("/child-event", {
                child: child._id,
                event: event._id,
                favoriteVolun: favoriteVolun.trim(),
            })
            onSuccess?.()
        } catch (error) {
            setErrorMessage(getErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    const payClick = async () => {
        setPaymentError("")
        setIsCreatingPayment(true)
        try {
            const response = await api.post("/payment", { event: event._id })
            setPayment(response.data)
        } catch (error) {
            setPaymentError(getErrorMessage(error))
        } finally {
            setIsCreatingPayment(false)
        }
    }
    return (
        <form className="auth-card registration-card" onSubmit={handleSubmit} dir="rtl">
            <h2>הרשמה לאירוע</h2>
            <p><strong>שם הילד:</strong> {child.fullName}</p>
            <p><strong>שם האירוע:</strong> {event.name}</p>
            <p><strong>תאריך:</strong> {new Date(event.date).toLocaleDateString("he-IL")}</p>
            <p><strong>שעה:</strong> {event.hour}</p>
            <p><strong>מחיר:</strong> {Number(event.price ?? 0).toLocaleString("he-IL", { style: "currency", currency: "ILS" })}</p>
            <p><strong>פרטים להורים:</strong> {event.detailingForParent}</p>
            <div className="form-field">
                <label htmlFor="registration-favorite-volunteer">האם יש מתנדבת שתעדיפו?</label>
                <input
                    id="registration-favorite-volunteer"
                    name="favoriteVolun"
                    type="text"
                    value={favoriteVolun}
                    onChange={(inputEvent) => setFavoriteVolun(inputEvent.target.value)}
                />
            </div>
            {Number(event.price ?? 0) > 0 ? (
                <button
                    type="button"
                    onClick={payClick}
                    disabled={isCreatingPayment || Boolean(payment)}
                >
                    {isCreatingPayment ? "יוצר בקשת תשלום..." : payment ? "בקשת התשלום נוצרה" : "לתשלום"}
                </button>
            ) : (
                <p>האירוע ללא עלות.</p>
            )}
            {payment && (
                <p role="status">
                    בקשת התשלום נוצרה וממתינה לעדכון מצב.
                    סכום: {Number(payment.amount).toLocaleString("he-IL", { style: "currency", currency: "ILS" })}
                </p>
            )}
            {paymentError && <p className="form-message error-message" role="alert">{paymentError}</p>}
            {errorMessage && <p className="form-message error-message" role="alert">{errorMessage}</p>}
            <button
                className="primary-button !inline-flex !h-8 !min-h-0 !w-8 !min-w-0 !items-center !justify-center !rounded-md !p-1"
                type="submit"
                disabled={isSubmitting}
                aria-label={isSubmitting ? "שולח הרשמה..." : "אישור הרשמת ילד"}
                title={isSubmitting ? "שולח הרשמה..." : "אישור הרשמת ילד"}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M17 21v-8H7v8M7 3v5h8" />
                </svg>
            </button>
        </form>
    )
}

export default FormChildReg