import { cache } from "react"
import superjson from "superjson"
import { TRPCError, initTRPC } from "@trpc/server"

export const createTRPCContext = cache(async () => {
  // No auth for now; extend later if needed
  return {}
})

type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory

// Optional: authenticatedProcedure if you add auth later
export const authenticatedProcedure = t.procedure.use(async (opts) => {
  // if (!opts.ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" })
  return opts.next()
})