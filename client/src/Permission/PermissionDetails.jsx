import { useEffect, useState } from "react"
import { api, getErrorMessage } from "../api"


const PermissionDetails = () => {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    const fetchActions = async () => {
      try {
        const { data } = await api.get("/permission/actions")

        if (active) setActions(data)
      } catch (error) {
        if (active) setErrorMessage(getErrorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchActions()

    return () => {
      active = false
    }
  }, [])

  return (<>
    {loading && <p role="status">טוען הרשאות...</p>}

    {errorMessage && (
      <p className="form-message error-message" role="alert">
        {errorMessage}
      </p>
    )}

    {!loading && !errorMessage && actions.map((action) => (
      <p key={action}>{action}</p>
    ))}
  </>);
};

export default PermissionDetails