import { useEffect, useState } from "react"
import { api, getErrorMessage } from "../api"
import { childFields } from "./RegChild"
import IconButton from "../ui/IconButton"
import { CancelIcon } from "../ui/icons"

const parentEditableFields = childFields.filter(
  (field) => !["status", "category", "notes", "img"].includes(field.name)
)

const UpdateChild = ({ child, onCancel, onSuccess, read, setToEdit, embedded = false }) => {
  const [values, setValues] = useState(() =>
    Object.fromEntries(parentEditableFields.map((field) => {
      const value = child[field.name]
      if (field.type === "array") return [field.name, Array.isArray(value) ? value.join(", ") : ""]
      if (field.type === "boolean") return [field.name, Boolean(value)]
      return [field.name, value ?? ""]
    }))
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const currentImageUrl = child.img
    ? new URL(child.img, api.defaults.baseURL).toString()
    : ""

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])
  // const [toRead, setToRead] = useState(read ? true : false)
  const toRead = read ? true : false

  const validateField = (field, value) => {
    const textValue = String(value ?? "")
    if (field.required && !textValue.trim()) {
      return field.requiredMessage || "זהו שדה חובה."
    }
    if (!textValue.trim() || !field.validate || field.validate(textValue)) return ""
    return field.validationMessage || "הערך שהוזן אינו תקין."
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    const errors = Object.fromEntries(
      parentEditableFields
        .map((field) => [field.name, validateField(field, values[field.name])])
        .filter(([, message]) => message)
    )
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setErrorMessage("יש לתקן את השדות המסומנים.")
      return
    }

    const payload = { ...values }
    for (const field of parentEditableFields) {
      if (field.type === "number") {
        if (payload[field.name] === "") delete payload[field.name]
        else payload[field.name] = Number(payload[field.name])
      } else if (field.type === "array") {
        payload[field.name] = payload[field.name]
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      }
    }

    setIsSubmitting(true)
    try {
      const { data: updatedChild } = await api.patch(
        `/child/${child._id}`,
        payload
      )

      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append("img", selectedImage)

        const { data: imageResponse } = await api.patch(
          `/child/${child._id}/image`,
          imageFormData
        )

        Object.assign(updatedChild, imageResponse)
      }

      onSuccess?.(updatedChild)
    } catch (error) {
      const details = error.response?.data?.details
      if (details && typeof details === "object") {
        setFieldErrors(details)
        setErrorMessage("יש לתקן את השדות המסומנים.")
      } else {
        setErrorMessage(getErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateClick = (event) => {
    event.preventDefault()
    setToEdit(true)
  }

  const confirmClick = (event) => {
    event.preventDefault()
    onSuccess?.(child)
  }

  return (

    <form
      className={embedded
        ? "registration-card registration-form-embedded relative"
        : "auth-card registration-card relative !pt-14"}
      onSubmit={handleSubmit}
      dir="rtl"
    >

      <h2>{read ? "פרטי ילד" : "עדכון פרטי ילד"} </h2>
      {parentEditableFields.map((field) => (
        <div className="form-field" key={field.name}>
          <label htmlFor={`update-child-${field.name}`}>{field.label}</label>
          {field.type === "boolean" ? (
            <input disabled={toRead}
              id={`update-child-${field.name}`}
              name={field.name}
              type="checkbox"
              checked={values[field.name]}
              onChange={(event) => setValues((current) => ({
                ...current,
                [field.name]: event.target.checked,
              }))}
            />
          ) : field.type === "select" ? (
            <select disabled={toRead}
              id={`update-child-${field.name}`}
              name={field.name}
              value={values[field.name]}
              onChange={(event) => setValues((current) => ({
                ...current,
                [field.name]: event.target.value,
              }))}
            >
              <option value="">בחרו {field.label}</option>
              {field.options.map((option) => (
                <option disabled={toRead} key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              disabled={toRead}
              id={`update-child-${field.name}`}
              name={field.name}
              type={field.type === "array" ? "text" : field.type}
              autoComplete={field.autoComplete}
              min={field.min}
              step={field.step}
              placeholder={field.placeholder}
              value={values[field.name]}
              required={field.required}
              onFocus={() => {
                setFieldErrors((current) => {
                  if (!current[field.name]) return current
                  const next = { ...current }
                  delete next[field.name]
                  return next
                })
              }}
              onBlur={() => {
                const message = validateField(field, values[field.name])
                setFieldErrors((current) => {
                  const next = { ...current }
                  if (message) next[field.name] = message
                  else delete next[field.name]
                  return next
                })
              }}
              onChange={(event) => setValues((current) => ({
                ...current,
                [field.name]: event.target.value,
              }))}
              aria-invalid={Boolean(fieldErrors[field.name])}
              aria-describedby={fieldErrors[field.name] ? `update-child-${field.name}-error` : undefined}
            />
          )}
          {field.help && <small>{field.help}</small>}
          {fieldErrors[field.name] && (
            <small
              id={`update-child-${field.name}-error`}
              className="error-message"
              role="alert"
            >
              {fieldErrors[field.name]}
            </small>
          )}
        </div>
      ))}
      <div className="form-field">
        <label htmlFor="update-child-img">תמונת הילד/ה</label>

        {(imagePreview || currentImageUrl) ? (
          <img
            className="file-preview"
            src={imagePreview || currentImageUrl}
            alt="תמונת הילד/ה"
          />
        ) : (
          <p>לא נבחרה תמונה.</p>
        )}

        <span className="has-tooltip file-picker" data-tooltip="בחירת קובץ">
          <input
            id="update-child-img"
            name="img"
            type="file"
            accept="image/*"
            disabled={toRead || isSubmitting}
            onChange={(event) => {
              const file = event.target.files?.[0] || null
              setSelectedImage(file)
              setImagePreview(file ? URL.createObjectURL(file) : "")
            }}
          />
        </span>
      </div>
      {errorMessage && <p className="form-message error-message" role="alert">{errorMessage}</p>}
      <div className="flex items-center gap-2">
      {!toRead &&
        <button
          className="primary-button !inline-flex !h-8 !min-h-0 !w-8 !min-w-0 !items-center !justify-center !rounded-md !p-1"
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? "שומר..." : "שמירת פרטי הילד"}
          title={isSubmitting ? "שומר..." : "שמירת פרטי הילד"}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
            <path d="M17 21v-8H7v8M7 3v5h8" />
          </svg>
        </button>}
      {toRead && <>
        <button className="primary-button" type="button" onClick={confirmClick}>אישור</button>
        <button
          onClick={updateClick}
          className="primary-button !absolute !left-2 !top-2 !z-10 !h-8 !min-h-0 !w-8 !min-w-0 !rounded-md !p-1"
          type="button"
          aria-label="עדכון פרטי הילד"
          title="עדכון פרטי הילד"
        >
          <svg className="edit-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.04a1 1 0 0 0 0-1.42l-2.5-2.5a1 1 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 2-1.66Z" />
          </svg>
        </button>
      </>}
      <IconButton label="ביטול" onClick={onCancel} disabled={isSubmitting}>
        <CancelIcon />
      </IconButton>
      </div>
    </form>
  )

}

export default UpdateChild
