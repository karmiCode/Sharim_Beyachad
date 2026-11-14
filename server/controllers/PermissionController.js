const { createHmac } = require("crypto")
const createModelController = require("./modelControllerFactory")
const Permission = require("../models/Permission")
const Counter = require("../models/Counter")
const { getJwtSecret } = require("../config/jwt")
const { hashPassword, isValidPassword } = require("../utils/password")
const { checkEmployeeAccessCode, accessCodeFailureMessage } = require("../utils/employeePermission")
const { getLoginLock, recordLoginFailure, clearLoginFailures } = require("../utils/loginRateLimiter")

const VALID_ACTIONS = ["permissions", "employees", "events", "matching", "registation", "payments"]


// employeeController.getAccessPermission = async (req, res) => {
//     const { id } = req.params

//     if (!mongoose.isValidObjectId(id)) {
//         return res.status(400).json({ message: "נדרש מזהה עובד תקין" })
//     }

//     try {
//         const employee = await Employee.findById(id).select("permission").lean()

//         if (!employee) {
//             return res.status(404).json({ message: "העובד/ת לא נמצא/ה" })
//         }

//         const permission = await Permission.findById(employee.permission)
//             .select("validActions")
//             .lean()

//         if (!permission) {
//             return res.status(404).json({ message: "הרשאת העובד/ת לא נמצאה" })
//         }

//         return res.json({ permissionId: String(permission._id) })
//     } catch (error) {
//         console.error("Failed to get employee access permission:", error)
//         return res.status(500).json({ message: "טעינת הרשאת העובד/ת נכשלה" })
//     }
// }

// employeeController.updateAccessPermission = async (req, res) => {
//     const { id } = req.params
//     const { permissionId } = req.body || {}

//     if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(permissionId)) {
//         return res.status(400).json({ message: "נדרש מזהה עובד והרשאה תקינים" })
//     }

//     try {
//         const permissionExists = await Permission.exists({ _id: permissionId })

//         if (!permissionExists) {
//             return res.status(404).json({ message: "ההרשאה שנבחרה לא נמצאה" })
//         }

//         const employee = await Employee.findByIdAndUpdate(
//             id,
//             { $set: { permission: permissionId } },
//             { new: true, runValidators: true },
//         )

//         if (!employee) {
//             return res.status(404).json({ message: "העובד/ת לא נמצא/ה" })
//         }

//         return res.json({ message: "הרשאת העובד/ת עודכנה בהצלחה" })
//     } catch (error) {
//         console.error("Failed to update employee access permission:", error)
//         return res.status(500).json({ message: "עדכון הרשאת העובד/ת נכשל" })
//     }
// }

// ה-HMAC משמש רק לאיתור הרשאה ולמניעת שמות כפולים; name עצמו נשמר כטקסט תצוגה.
// יש לשמור על אותו JWT_SECRET כדי שה-seed יוכל לזהות את ההרשאות המובנות.
const createNameLookup = (name) => createHmac("sha256", getJwtSecret())
    .update(name)
    .digest("hex")

// מקצה את המזהה העסקי המספרי הבא להרשאה.
// findOneAndUpdate עם $inc מבצע את ההגדלה ב-MongoDB באופן אטומי, כך שבקשות
// הרשמה מקבילות לא יקראו את אותו ערך ולא יקבלו אותו id.
const getNextPermissionId = async () => {
    try {
        const counter = await Counter.findOneAndUpdate(
            // כל ההרשאות משתמשות במסמך מונה יחיד עם המפתח הקבוע "permission".
            { _id: "permission" },
            // הגדלה באחד; upsert יוצר את מסמך המונה אם זו ההרשמה הראשונה.
            { $inc: { seq: 1 } },
            // מחזירים את המסמך לאחר ההגדלה, כדי להשתמש במספר החדש.
            { new: true, upsert: true }
        )
        return counter.seq
    } catch (error) {
        // בשתי הרשמות ראשונות בו-זמניות, שתיהן עלולות לנסות ליצור את מסמך המונה.
        // אילוץ הייחודיות על _id מאפשר רק לאחת ליצור אותו; השנייה תקבל שגיאה 11000.
        // במקרה הזה מנסים שוב ללא upsert, כדי להגדיל את המסמך שכבר נוצר.
        // כל שגיאה אחרת אינה צפויה ולכן מועברת הלאה לטיפול ה-controller המשותף.
        if (error.code !== 11000) throw error
        const counter = await Counter.findOneAndUpdate(
            { _id: "permission" },
            { $inc: { seq: 1 } },
            { new: true }
        )
        return counter.seq
    }
}

// מנרמל שם תצוגה ומחשב מפתח ייחודיות פנימי; סיסמת ההרשאה נשארת מגובבת בנפרד.
const preparePermissionFields = async (fields) => {
    if (!("name" in fields)) return fields
    const name = fields.name.trim()
    return {
        ...fields,
        name,
        nameLookup: createNameLookup(name)
    }
}

const permissionController = createModelController({
    model: Permission,
    // name, password ו-validActions מתקבלים רק במסלול ניהול מוגן. id מוקצה בשרת,
    // ו-nameLookup הוא שדה פנימי שנגזר מהשם.
    editableFields: ["name", "password", "validActions"],
    // השם מוצג למנהלי הרשאות; מפתח החיפוש והסיסמה נשארים פרטיים.
    privateFields: ["nameLookup", "password"],
    // מאפשר ל-controller המשותף לבצע hash לסיסמה ביצירה ובעדכון,
    // וכן לבדוק אותה מול ה-hash בעת התחברות.
    passwordField: "password",
    // ההתחברות מחפשת לפי המזהה העסקי המספרי. זה שונה מ-_id של MongoDB,
    // שבו משתמשים בנתיבי ה-CRUD הכלליים לקריאה, עדכון ומחיקה.
    loginFields: ["id"],
    loginIdentifierField: "id",
    // ה-API מקבל id כמספר JSON או כמחרוזת ספרות חיובית ללא אפס מוביל.
    // Number.isSafeInteger מונע ערכים גדולים מדי לייצוג מדויק ב-JavaScript.
    loginIdentifierValidator: value =>
        (typeof value === "number" && Number.isSafeInteger(value) && value > 0) ||
        (typeof value === "string" && /^[1-9]\d*$/.test(value)),
    // שומרים id כמספר ב-MongoDB, לכן ממירים מחרוזת תקינה למספר לפני החיפוש.
    loginIdentifierLookup: value => Number(value),
    // שם תצוגה אינו סיסמה ולכן אינו כפוף למגבלת bcrypt.
    validateFields: (fields) => {
        if (
            "name" in fields &&
            (typeof fields.name !== "string" || !fields.name.trim() || fields.name.trim().length > 100)
        ) {
            return "Name must be a non-empty string of at most 100 characters"
        }
        if (
            "validActions" in fields &&
            (!Array.isArray(fields.validActions) ||
                fields.validActions.some(action => !VALID_ACTIONS.includes(action)))
        ) {
            return "validActions must be an array containing only supported actions"
        }
        return null
    },
    // הכנה זו משותפת ליצירה ולעדכון, כדי ששינוי שם יעדכן גם את השם וגם את מפתח הייחודיות.
    prepareFields: preparePermissionFields,
    // לפני יצירה מכינים את השם ומקצים id חדש. ה-id אינו מתקבל מהלקוח
    // ואינו משתנה בעדכון, שבו משתמשים רק ב-prepareFields.
    prepareCreateFields: async fields => ({
        ...await preparePermissionFields(fields),
        id: await getNextPermissionId()
    })
})

permissionController.getAvailableActions = (req, res) => {
    return res.json(VALID_ACTIONS)
}

permissionController.getNames = async (req, res) => {
    try {
        const permissions = await Permission.find()
            .select("_id name")
            .lean()

        return res.json(
            permissions.map(({ _id, name }) => ({ _id, name }))
        )
    } catch (error) {
        console.error("Failed to load permission names:", error)
        return res.status(500).json({
            message: "טעינת שמות ההרשאות נכשלה",
        })
    }
}

// בודק בצד השרת אם הסיסמה תואמת להרשאה ייעודית לאחד מתפקידי העובדים.
// הפעולה אינה מחזירה hash או שם הרשאה, אלא רק תפקיד מוכר לצורך ממשק ההרשמה.
permissionController.verifyEmployeeAccess = async (req, res) => {
    const { password } = req.body || {}
    if (!isValidPassword(password)) {
        return res.status(400).json({ message: "יש להזין סיסמת הרשאת גישה תקינה" })
    }

    const ipAddress = req.ip || req.socket?.remoteAddress || "unknown"
    // מגביל ניסיונות של קודי הרשאה לפי IP, ומשתף את החסימה עם נתיב הרישום לעובד.
    const { key, retryAfterSeconds } = getLoginLock(
        "employee-registration-access",
        ipAddress,
        "access"
    )
    if (retryAfterSeconds > 0) {
        res.set("Retry-After", String(retryAfterSeconds))
        return res.status(429).json({
            message: "נחסמה בדיקת ההרשאה. נסו שוב מאוחר יותר",
            retryAfterSeconds
        })
    }

    try {
        // משווה את הקוד מול סיסמאות ההרשאה השמורות, ואז מאמת שההרשאה מצביעה לתפקיד עובד.
        const { permission, failure } = await checkEmployeeAccessCode(password)
        if (!permission) {
            recordLoginFailure(key)
            const lock = getLoginLock("employee-registration-access", ipAddress, "access")
            if (lock.retryAfterSeconds > 0) {
                res.set("Retry-After", String(lock.retryAfterSeconds))
                return res.status(429).json({
                    message: "נחסמה בדיקת ההרשאה. נסו שוב מאוחר יותר",
                    retryAfterSeconds: lock.retryAfterSeconds
                })
            }
            return res.status(403).json({
                message: accessCodeFailureMessage(failure) || "סיסמת הרשאת הגישה אינה מורשית"
            })
        }

        clearLoginFailures(key)
        return res.json({
            authorized: true,
            permission: {
                id: permission.id,
                validActions: permission.validActions
            }
        })
    } catch (error) {
        console.error("Failed to verify employee access permission:", error)
        return res.status(500).json({ message: "בדיקת הרשאת הגישה נכשלה" })
    }
}

module.exports = permissionController
