import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, getErrorMessage } from "../api"
import Can from "../Can"

const displayPermissionName = (name) =>
    typeof name === "string" ? name.replace(/-+$/u, "") : ""

const ManagePermission = () => {
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const navigate = useNavigate()

    useEffect(() => {
        let active = true

        const fetchPermissions = async () => {
            try {
                const { data } = await api.get("/permission/names")
                if (active) setPermissions(data)
            } catch (error) {
                if (active) setErrorMessage(getErrorMessage(error))
            } finally {
                if (active) setLoading(false)
            }
        }

        fetchPermissions()

        return () => {
            active = false
        }
    }, [])
    return (
        <section dir="rtl">
            <h2>ניהול הרשאות</h2>

            <Can permission="permissions">
                <button
                    className="primary-button"
                    type="button"
                    aria-label="הוספת הרשאת גישה"
                    title="הוספת הרשאת גישה"
                    onClick={() => navigate("/personal/permissions-manage/new")}
                >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                </button>
            </Can>

            {loading && <p role="status">טוען הרשאות...</p>}

            {errorMessage && (
                <p className="form-message error-message" role="alert">
                    {errorMessage}
                </p>
            )}

            {!loading && !errorMessage && permissions.length === 0 && (
                <p>לא נמצאו הרשאות.</p>
            )}

            {!loading && !errorMessage && permissions.length > 0 && (
                <div className="mt-4 grid gap-4">
                    {permissions.map((permission) => (
                        <article className="parent-event-card relative !pt-14" key={permission._id}>
                            <h3>{displayPermissionName(permission.name)}</h3>
                            <button
                                className="secondary-button !absolute !left-2 !top-2 !z-10 !h-8 !min-h-0 !w-8 !min-w-0 !rounded-md !p-1"
                                type="button"
                                aria-label="עריכת הרשאה"
                                title="עריכת הרשאה"
                                onClick={() =>
                                    navigate(
                                        `/personal/permissions-manage/${permission._id}/edit`,
                                        {
                                            state: {
                                                permissionName: displayPermissionName(permission.name),
                                            },
                                        })
                                }
                            >
                                <svg className="edit-icon" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 2-1.66Z" />
                                </svg>
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ManagePermission