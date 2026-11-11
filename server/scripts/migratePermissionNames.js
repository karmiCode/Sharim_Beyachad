require("dotenv").config()
const { createHmac } = require("crypto")
const mongoose = require("mongoose")
const Permission = require("../models/Permission")
const { getJwtSecret } = require("../config/jwt")
const { isBcryptHash } = require("../utils/password")

const createNameLookup = name => createHmac("sha256", getJwtSecret()).update(name).digest("hex")
const builtInNames = ["admin", "basic-", "medium-"]

const migratePermissionNames = async () => {
    if (!process.env.DATABASE_URI) {
        throw new Error("DATABASE_URI must be set before migrating permission names")
    }

    try {
        await mongoose.connect(process.env.DATABASE_URI)
        const permissions = await Permission.collection.find({}).sort({ id: 1 }).toArray()
        const builtInNamesByLookup = new Map(
            builtInNames.map(name => [createNameLookup(name), name])
        )
        const usedNameLookups = new Set()
        const updates = []
        let replacedHashedNames = 0

        for (const permission of permissions) {
            if (typeof permission.name !== "string" || !permission.name) {
                throw new Error(`Permission ${permission._id} has no usable name`)
            }

            let name = permission.name.trim()
            if (isBcryptHash(name)) {
                name = builtInNamesByLookup.get(permission.nameLookup) ||
                    `הרשאה ${permission.id ?? permission._id}`
                replacedHashedNames += 1
            }

            if (!name || name.length > 100) {
                throw new Error(`Permission ${permission._id} has an invalid display name`)
            }

            const nameLookup = createNameLookup(name)
            if (usedNameLookups.has(nameLookup)) {
                throw new Error(`Duplicate permission name detected for record ${permission._id}`)
            }
            usedNameLookups.add(nameLookup)

            updates.push({
                updateOne: {
                    filter: { _id: permission._id },
                    update: { $set: { name, nameLookup } }
                }
            })
        }

        if (updates.length > 0) {
            await Permission.collection.bulkWrite(updates)
        }

        console.log(
            `Migrated ${updates.length} permission names; replaced ${replacedHashedNames} hashed names`
        )
    } finally {
        await mongoose.disconnect()
    }
}

migratePermissionNames().catch(error => {
    console.error("Failed to migrate permission names:", error)
    process.exitCode = 1
})
