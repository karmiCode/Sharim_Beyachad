const Permission = require("../models/Permission")
const { isValidPassword, verifyPassword } = require("./password")

const REGISTRATION_ACTION = "registation"

// מאתר הרשאה לפי סיסמת הגישה ומקבל רק הרשאה ייחודית שמורשית לרישום עובדים.
const findEmployeePermission = async (accessPassword) => {
    // דוחים סיסמאות ריקות או ארוכות מהמגבלה הנתמכת על ידי bcrypt.
    if (!isValidPassword(accessPassword)) return null

    // שם וסיסמה מוסתרים בברירת מחדל, ולכן נשלפים רק לצורך אימות הקוד.
    const permissions = await Permission.find().select("+name +password")
    const matchingPermissions = []
    // לא מסתפקים בהתאמה הראשונה: קוד הרשאה כפול ייחשב עמום ולא יאושר.
    for (const permission of permissions) {
        if (await verifyPassword(accessPassword, permission.password)) {
            matchingPermissions.push(permission)
        }
    }

    if (matchingPermissions.length !== 1) return null

    const matchingPermission = matchingPermissions[0]
    if (!matchingPermission.validActions.includes(REGISTRATION_ACTION)) return null
    return matchingPermission
}

// כמו findEmployeePermission, אבל מחזיר גם סיבת כשל, כדי שהמשתמשת תדע מה לתקן:
// "no-match"    - הקוד לא תואם לאף הרשאה.
// "ambiguous"   - אותו קוד שמור ביותר מהרשאה אחת.
// "no-register" - הקוד נכון, אך להרשאה אין את היכולת "הרשמה" (registation).
const checkEmployeeAccessCode = async (accessPassword) => {
    if (!isValidPassword(accessPassword)) return { failure: "no-match" }

    const permissions = await Permission.find().select("+name +password")
    const matching = []
    for (const permission of permissions) {
        if (await verifyPassword(accessPassword, permission.password)) matching.push(permission)
    }

    if (matching.length === 0) return { failure: "no-match" }
    if (matching.length > 1) return { failure: "ambiguous" }
    if (!matching[0].validActions.includes(REGISTRATION_ACTION)) return { failure: "no-register" }
    return { permission: matching[0] }
}

const accessCodeFailureMessage = (failure) => ({
    ambiguous: "אותו קוד הרשאה שמור ביותר מהרשאה אחת. יש להחליף את הקוד באחת ההרשאות בניהול הרשאות.",
    "no-register": "הקוד נכון, אבל להרשאה הזו אין את היכולת \"הרשמה\". יש להפעיל אותה בעריכת ההרשאה בניהול הרשאות.",
}[failure])

module.exports = { findEmployeePermission, checkEmployeeAccessCode, accessCodeFailureMessage }
