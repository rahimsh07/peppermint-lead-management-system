import { getDb } from "./client"
import { ObjectId } from "mongodb"
import { type Lead } from "@/lib/leads"

const COLLECTION = "leads"

type LeadDoc = Omit<Lead, "id">

export type LeadStats = {
  totalLeads: number
  newLeads: number
  followUps: number
  convertedLeads: number
  dailyLeads: { name: string; leads: number }[]
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfUTCDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

export async function stats(): Promise<LeadStats> {
  const db = await getDb()
  const collection = db.collection<LeadDoc & { createdAt?: Date }>(COLLECTION)

  // 7-day window
   const now = new Date()
  const todayUTC = startOfUTCDay(now)
  const sevenDaysAgo = new Date(todayUTC.getTime() - 6 * 24 * 60 * 60 * 1000)

  const [agg] = await collection
    .aggregate<{
      totalLeads: number
      newLeads: number
      followUps: number
      convertedLeads: number
    }>([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalLeads: { $sum: 1 },
                newLeads: {
                  $sum: { $cond: [{ $eq: ["$status", "New"] }, 1, 0] },
                },
                followUps: {
                  $sum: { $cond: [{ $eq: ["$status", "Follow-up"] }, 1, 0] },
                },
                convertedLeads: {
                  $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] },
                },
              },
            },
            { $project: { _id: 0 } },
          ],
        },
      },
      { $replaceRoot: { newRoot: { $ifNull: [{ $first: "$totals" }, {}] } } },
      {
        $addFields: {
          totalLeads: { $ifNull: ["$totalLeads", 0] },
          newLeads: { $ifNull: ["$newLeads", 0] },
          followUps: { $ifNull: ["$followUps", 0] },
          convertedLeads: { $ifNull: ["$convertedLeads", 0] },
        },
      },
    ])
    .toArray()

  const dailyRaw = await collection
    .aggregate<{ _id: string; leads: number }>([
      {
        $match: {
          $expr: {
            $gte: [
              { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
              sevenDaysAgo,
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $ifNull: ["$createdAt", { $toDate: "$_id" }] },
            },
          },
          leads: { $sum: 1 },
        },
      },
    ])
    .toArray()

  const byDay = new Map(dailyRaw.map((d) => [d._id, d.leads]))

  const dailyLeads = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sevenDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)               // UTC date key
    return {
      // force UTC so the weekday isn't shifted on the boundary day
      name: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      leads: byDay.get(key) ?? 0,
    }
  })

  return {
    totalLeads: agg?.totalLeads ?? 0,
    newLeads: agg?.newLeads ?? 0,
    followUps: agg?.followUps ?? 0,
    convertedLeads: agg?.convertedLeads ?? 0,
    dailyLeads,
  }
}

export async function listLeads(): Promise<Lead[]> {
  const db = await getDb()
  const collection = db.collection<LeadDoc>(COLLECTION)

  const docs = await collection.find().toArray()

  return docs.map(({ _id, ...rest }) => ({
    ...rest,
    id: _id.toHexString(),
  }))
}

export async function createLead(data: Omit<Lead, "id">) {
  const db = await getDb()
  const collection = db.collection<Lead>(COLLECTION)
  const result = await collection.insertOne(data as any)
  const id = result.insertedId.toString()
  return { id, ...data }
}

export async function updateLead(id: string, data: Partial<Omit<Lead, "id">>) {
  const db = await getDb()
  const collection = db.collection<Lead>(COLLECTION)
  const objectId = new ObjectId(id)
  await collection.updateOne({ _id: objectId }, { $set: data as any })
  const lead = await collection.findOne({ _id: objectId })
  if (!lead) throw new Error("Lead not found")
  return { ...lead, id } as Lead
}

export async function deleteLead(id: string) {
  const db = await getDb()
  const collection = db.collection<Lead>(COLLECTION)
  const objectId = new ObjectId(id)
  const result = await collection.deleteOne({ _id: objectId })
  if (result.deletedCount === 0) throw new Error("Lead not found")
  return { id }
}