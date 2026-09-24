import { z } from "zod"
import { publicProcedure, router } from "./init"
import * as leadDb from "@/server/db/lead"
import { CATEGORIES, STATUSES, LeadCategory, LeadStatus } from "@/lib/leads"

const leadInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  mobile: z
    .string()
    .min(1, "Mobile is required")
    .regex(/^\d{10}$/, "Mobile must be 10 digits"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  category: z.enum(CATEGORIES as [LeadCategory, ...LeadCategory[]]),
  status: z.enum(STATUSES as [LeadStatus, ...LeadStatus[]]),
  followUpDate: z.string().optional(),
})

export const appRouter = router({
  lead: router({
    list: publicProcedure.query(async () => {
      return leadDb.listLeads()
    }),

    create: publicProcedure.input(leadInputSchema).mutation(async ({ input }) => {
      return leadDb.createLead(input)
    }),

    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          data: leadInputSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        return leadDb.updateLead(input.id, input.data)
      }),

    delete: publicProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        return leadDb.deleteLead(input.id)
      }),
  }),
  dashboard: router({
    stats: publicProcedure
      .query(async () => {
        return leadDb.stats();
      })
  }),
})

export type AppRouter = typeof appRouter