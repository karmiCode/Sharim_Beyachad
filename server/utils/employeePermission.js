const Permission = require("../models/Permission")
const { isValidPassword, verifyPassword } = require("./password")

// מאתר הרשאה לפי סיסמת הגישה ומקבל רק הרשאה ייחודית (קוד שאינו שמור ביותר מהרשאה אחת).
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

    return matchingPermissions[0]
}

// כמו findEmployeePermission, אבל מחזיר גם סיבת כשל, כדי שהמשתמשת תדע מה לתקן:
// "no-match"    - הקוד לא תואם לאף הרשאה.
// "ambiguous"   - אותו קוד שמור ביותר מהרשאה אחת.
const checkEmployeeAccessCode = async (accessPassword) => {
    if (!isValidPassword(accessPassword)) return { failure: "no-match" }

    const permissions = await Permission.find().select("+name +password")
    const matching = []
    for (const permission of permissions) {
        if (await verifyPassword(accessPassword, permission.password)) matching.push(permission)
    }

    if (matching.length === 0) return { failure: "no-match" }
    if (matching.length > 1) return { failure: "ambiguous" }
    return { permission: matching[0] }
}

const accessCodeFailureMessage = (failure) => ({
    ambiguous: "אותו קוד הרשאה שמור ביותר מהרשאה אחת. יש להחליף את הקוד באחת ההרשאות בניהול הרשאות.",
}[failure])

module.exports = { findEmployeePermission, checkEmployeeAccessCode, accessCodeFailureMessage }
