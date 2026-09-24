"use client"

import * as React from "react"
import { TrendingUp, Users, UserCheck, PhoneCall, UserPlus } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useTRPC } from "@/trpc/utils"
import { useQuery } from "@tanstack/react-query"

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
} satisfies React.ComponentProps<typeof ChartContainer>["config"]

export default function LeadDashboardPage() {
  const trpc = useTRPC()
  const { data, isLoading, error } = useQuery(
    trpc.dashboard.stats.queryOptions()
  )

  console.log(data?.dailyLeads);

  if (isLoading) return <div className="space-y-6 p-4"><p>Loading…</p></div>
  if (error) return <div className="space-y-6 p-4"><p>Error: {error.message}</p></div>
  if (!data) return null

  return (
    <div className="space-y-6 p-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your leads and conversion performance.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Leads"
          value={data.totalLeads.toLocaleString()}
          description="All leads in the system"
          icon={Users}
        />
        <StatCard
          title="New Leads"
          value={data.newLeads.toLocaleString()}
          description="Added this week"
          icon={UserPlus}
        // trend="+12% from last week"
        />
        <StatCard
          title="Follow-ups"
          value={data.followUps.toLocaleString()}
          description="Pending follow-ups"
          icon={PhoneCall}
        />
        <StatCard
          title="Converted Leads"
          value={data.convertedLeads.toLocaleString()}
          description="Turned into customers"
          icon={UserCheck}
        // trend="+5% from last week"
        />
      </div>

      {/* Chart section */}
      <Card>
        <CardHeader>
          <CardTitle>Leads Overview</CardTitle>
          <CardDescription>New leads per day (last 7 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <BarChart data={data.dailyLeads} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="leads"
                fill="var(--color-leads)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
}: {
  title: string
  value: string | number
  description: string
  trend?: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="mt-1 flex items-center text-xs text-emerald-600">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}