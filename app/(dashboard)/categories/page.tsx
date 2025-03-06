"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryForm } from "@/components/categories/category-form"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

const CategoryManager = dynamic(
  () => import("@/components/categories/category-manager").then((mod) => mod.CategoryManager),
  { ssr: false }
)

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <CategoryForm>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </CategoryForm>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Create and manage custom categories for your transactions and budgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <CategoryManager />
          </Suspense>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Using Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Categories help you organize your financial data in a way that makes sense for your business.
              Use them to group similar transactions and track spending patterns over time.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customization Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create categories that reflect your specific business needs. Use clear, descriptive names and
              assign colors to make them easy to identify in reports and visualizations.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
