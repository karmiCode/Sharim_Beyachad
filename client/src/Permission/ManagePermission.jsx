import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, getErrorMessage } from "../api"
import Can from "../Can"
import IconButton from "../ui/IconButton"
import { EditIcon, PlusIcon } from "../ui/icons"

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
                <IconButton
                    variant="primary"
                    label="הוספת הרשאת גישה"
                    onClick={() => navigate("/personal/permissions-manage/new")}
                >
                    <PlusIcon />
                </IconButton>
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
                <div className="card-list">
                    {permissions.map((permission) => (
                        <article className="parent-event-card" key={permission._id}>
                            <h3>{displayPermissionName(permission.name)}</h3>
                            <div className="icon-actions">
                                <IconButton
                                    label="עריכת הרשאה"
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
                                    <EditIcon />
                                </IconButton>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}

export default ManagePermission