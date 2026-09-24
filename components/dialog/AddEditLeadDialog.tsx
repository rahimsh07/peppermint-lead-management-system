"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldLabel,
    FieldDescription,
    FieldError,
} from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { type LeadFormData, CATEGORIES, Lead, LeadCategory, LeadStatus, STATUSES } from "@/lib/leads"
import { useTRPC } from "@/trpc/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
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
    category: z.enum(CATEGORIES as [LeadCategory, ...LeadCategory[]], {
        error: "Category is required",
    }),
    status: z.enum(STATUSES as [LeadStatus, ...LeadStatus[]], {
        error: "Status is required",
    }),
    followUpDate: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const EMPTY: FormValues = {
    name: "", company: "", mobile: "", email: "",
    category: "Innerwear", status: "New", followUpDate: "",
}

export function AddEditLeadDialog({
    open,
    onOpenChange,
    lead,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead?: Lead
}) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            company: "",
            mobile: "",
            email: "",
            category: "Innerwear",
            status: "New",
            followUpDate: "",
            ...lead,
        },
    })

    const {
        formState: { errors },
    } = form

    const trpc = useTRPC()
    const queryClient = useQueryClient()

    const invalidateList = () =>
        queryClient.invalidateQueries(trpc.lead.list.queryFilter())

    const createMutation = useMutation(
        trpc.lead.create.mutationOptions({
            onSuccess: () => {
                invalidateList()
                onOpenChange(false)
                form.reset(EMPTY)
            },
        })
    )

    const updateMutation = useMutation(
        trpc.lead.update.mutationOptions({
            onSuccess: () => {
                invalidateList()
                onOpenChange(false)
            },
        })
    )

    const isPending = createMutation.isPending || updateMutation.isPending
    const mutationError = createMutation.error ?? updateMutation.error

    function handleSubmit(values: FormValues) {
        if (lead) {
            updateMutation.mutate({ id: lead.id, data: values })
        } else {
            createMutation.mutate(values)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>
                        {lead?.name ? "Edit Lead" : "Add Lead"}
                    </DialogTitle>
                </DialogHeader>

                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                    noValidate
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="name">Name</FieldLabel>
                            <Controller
                                name="name"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="name"
                                        placeholder="Lead name"
                                        aria-invalid={!!errors.name}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.name && (
                                <FieldError>{errors.name.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="company">Company</FieldLabel>
                            <Controller
                                name="company"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="company"
                                        placeholder="Company name"
                                        aria-invalid={!!errors.company}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.company && (
                                <FieldError>{errors.company.message}</FieldError>
                            )}
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="mobile">Mobile</FieldLabel>
                            <Controller
                                name="mobile"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="mobile"
                                        placeholder="9876543210"
                                        aria-invalid={!!errors.mobile}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.mobile && (
                                <FieldError>{errors.mobile.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Controller
                                name="email"
                                control={form.control}
                                render={({ field }) => (
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        aria-invalid={!!errors.email}
                                        {...field}
                                    />
                                )}
                            />
                            {errors.email && (
                                <FieldError>{errors.email.message}</FieldError>
                            )}
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="category">Interested Category</FieldLabel>
                            <Controller
                                name="category"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((c) => (
                                                <SelectItem key={c} value={c}>
                                                    {c}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.category && (
                                <FieldError>{errors.category.message}</FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="status">Lead Status</FieldLabel>
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.status && (
                                <FieldError>{errors.status.message}</FieldError>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="followUpDate">Follow-up Date</FieldLabel>
                        <Controller
                            name="followUpDate"
                            control={form.control}
                            render={({ field }) => (
                                <Input
                                    id="followUpDate"
                                    type="date"
                                    aria-invalid={!!errors.followUpDate}
                                    {...field}
                                />
                            )}
                        />
                        {errors.followUpDate && (
                            <FieldError>{errors.followUpDate.message}</FieldError>
                        )}
                    </Field>

                    {mutationError && (
                        <p className="text-sm text-destructive">{mutationError.message}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending
                                ? "Saving…"
                                : lead
                                    ? "Save changes"
                                    : "Add lead"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}