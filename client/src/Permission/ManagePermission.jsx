import { useEffect, useState } from "react"
import { useNavigate, Outlet } from "react-router-dom"
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
                    onClick={() => navigate("/personal/permissions-manage/new")}
                >
                    הוספת הרשאת גישה
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
                <div>
                    {permissions.map((permission) => (
                        <article className="parent-event-card" key={permission._id}>
                            <h3>{displayPermissionName(permission.name)}</h3>
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/personal/permissions-manage/${permission._id}/edit`,
                                        { state: { permissionName: permission.name } }
                                    )
                                }
                            >
                                עריכה
                            </button>
                        </article>
                    ))}
                </div>
            )}

            <Outlet />
        </section>
    )
}

export default ManagePermission