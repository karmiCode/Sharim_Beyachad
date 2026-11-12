const { createHmac } = require("crypto")
const Permission = require("../models/Permission")
const Employee = require("../models/Employee")
const Counter = require("../models/Counter")
const { getJwtSecret } = require("../config/jwt")
const { hashPassword, isValidPassword } = require("./password")

const PERMISSION_DEFINITIONS = [
    {
        name: "admin",
        passwordEnv: "ADMIN_PERMISSION_PASSWORD",
        legacyPasswordEnv: "INITIAL_ADMIN_PASSWORD",
        validActions: ["permissions", "employees", "events", "matching", "registation", "payments"]
    },
    
    {
        name: "medium",
        passwordEnv: "MEDIUM_PERMISSION_PASSWORD",
        validActions: ["registation", "events", "matching"]
    },
    
    {
        name: "basic",
        passwordEnv: "BASIC_PERMISSION_PASSWORD",
        validActions: ["registation"]
    }
]

// HMAC דטרמיניסטי משמש לאיתור הרשאות seed ולמניעת שמות כפולים.
// השם עצמו נשמר כטקסט תצוגה; סיסמת ההרשאה נשארת מגובבת.
const createNameLookup = name => createHmac("sha256", getJwtSecret())
    .update(name)
    .digest("hex")

// מסנכרן את המונה לפחות למזהה הגבוה שכבר קיים לפני הגדלתו. כך seed שמופעל
// על מסד ותיק אינו מקצה id שכבר נמצא בשימוש, גם אם מסמך Counter חסר או מיושן.
const getNextPermissionId = async () => {
    const highestPermission = await Permission.findOne().sort({ id: -1 }).select("id").lean()
    const highestId = highestPermission?.id || 0

    await Counter.findOneAndUpdate(
        { _id: "permission" },
        { $max: { seq: highestId } },
        { new: true, upsert: true }
    )

    try {
        // $inc אטומי: אם כמה תהליכים קוראים את המונה במקביל, כל אחד מקבל
        // ערך שונה. טיפול ב-11000 מכסה התנגשות בעת יצירת מסמך המונה הראשון.
        const counter = await Counter.findOneAndUpdate(
            { _id: "permission" },
            { $inc: { seq: 1 } },
            { new: true }
        )
        return counter.seq
    } catch (error) {
        if (error.code !== 11000) throw error
        const counter = await Counter.findOneAndUpdate(
            { _id: "permission" },
            { $inc: { seq: 1 } },
            { new: true }
        )
        return counter.seq
    }
}

const getPermissionPassword = definition => {
    const password = process.env[definition.passwordEnv] ||
        (definition.legacyPasswordEnv ? process.env[definition.legacyPasswordEnv] : undefined)
    if (!isValidPassword(password)) {
        throw new Error(`${definition.passwordEnv} must be set to a non-empty password of at most 72 UTF-8 bytes`)
    }
    return password
}

const upsertPermission = async definition => {
    const nameLookup = createNameLookup(definition.name)
    const existing = await Permission.findOne({ nameLookup }).select("+password").exec()

    if (existing) {
        existing.name = definition.name
        existing.validActions = definition.validActions
        if (!existing.password) {
            existing.password = await hashPassword(getPermissionPassword(definition))
        }
        await existing.save()
        return existing
    }

    const initialPassword = getPermissionPassword(definition)
    try {
        return await Permission.create({
            id: await getNextPermissionId(),
            name: definition.name,
            nameLookup,
            password: await hashPassword(initialPassword),
            validActions: definition.validActions
        })
    } catch (error) {
        // מופעי שרת מקבילים יכולים להתחרות על יצירת אותה הרשאה. אינדקס ייחודי
        // מכריע את המרוץ; במקרה כזה טוענים את הרשומה שנוצרה וממשיכים לעדכן אותה.
        if (error.code === 11000) {
            const createdByAnotherInstance = await Permission.findOne({ nameLookup }).select("+password").exec()
            if (createdByAnotherInstance) {
                createdByAnotherInstance.name = definition.name
                createdByAnotherInstance.validActions = definition.validActions
                if (!createdByAnotherInstance.password) {
                    createdByAnotherInstance.password = await hashPassword(getPermissionPassword(definition))
                }
                await createdByAnotherInstance.save()
                return createdByAnotherInstance
            }
        }
        throw error
    }
}

// ממיר עובדים שנוצרו לפני מעבר מ-role טקסטואלי ל-ObjectId reference.
// collection API משמש כאן בכוונה כדי ש-Mongoose לא ינסה לבצע cast לערכי role הישנים.
const migrateEmployeePermissions = async permissions => {
    const targetIds = new Map(PERMISSION_DEFINITIONS.map((definition, index) => [
        definition.name,
        permissions[index]._id
    ]))
    const legacyNames = [
        ["manager", "admin"],
        ["Basic", "basic-"],
        ["canMatch", "medium-"]
    ]

    for (const [legacyName, permissionName] of legacyNames) {
        await Employee.collection.updateMany(
            { permission: legacyName },
            { $set: { permission: targetIds.get(permissionName) } }
        )
    }

    // תפקיד טקסטואלי ישן שלא זוהה אינו מקבל הרשאות מוגברות; ממירים אותו ל-basic.
    await Employee.collection.updateMany(
        { permission: { $type: "string" } },
        { $set: { permission: targetIds.get("basic-") } }
    )
    await Employee.collection.updateMany(
        { $or: [{ permission: { $exists: false } }, { permission: null }] },
        { $set: { permission: targetIds.get("basic-") } }
    )
}

// רץ בכל אתחול: יוצר הרשאות חסרות עם קודי האתחול מ-env, מסנכרן פעולות
// בלי לדרוס קודים ששונו בממשק, ואז ממיר שיוכי עובדים ישנים ל-ObjectId references.
const ensurePermissionSeeds = async () => {
    const permissions = []

    for (let index = 0; index < PERMISSION_DEFINITIONS.length; index += 1) {
        permissions.push(await upsertPermission(PERMISSION_DEFINITIONS[index]))
    }

    await migrateEmployeePermissions(permissions)
    return permissions
}

module.exports = {
    ensurePermissionSeeds,
    ensureAdminPermission: ensurePermissionSeeds
}
