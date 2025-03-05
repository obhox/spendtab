"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, LineChart, PieChart, BarChart3, DollarSign, CreditCard, TrendingUp, BarChart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { NextPage } from "next";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header/Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-sm fixed w-full z-50">
        <Link className="flex items-center justify-center" href="/">
          <DollarSign className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold">spendtab</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#pricing">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#about">
            About
          </Link>
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="rounded-full">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="rounded-full bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                    Lorem Ipsum <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Dolor</span> Sit Amet!
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Consectetur adipiscing elit. Nullam vehicula justo nec lorem ultrices, et pharetra ligula molestie.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row mt-4">
                  <Link href="/signup">
                    <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" size="lg" className="rounded-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative lg:ml-auto">
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-purple-100 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 bg-grid-white/10" />
                  <div className="relative p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <BarChart3 className="h-6 w-6 text-primary mb-2" />
                        <p className="text-sm font-medium">Monthly Revenue</p>
                        <p className="text-2xl font-bold">$12,345</p>
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                        <TrendingUp className="h-6 w-6 text-green-500 mb-2" />
                        <p className="text-sm font-medium">Growth</p>
                        <p className="text-2xl font-bold">+24%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="w-full py-12 border-y bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-4">
              <p className="text-sm font-medium text-gray-500">Trusted by innovative companies</p>
              <div className="flex justify-center items-center gap-8 grayscale opacity-60">
                {/* Company Logo Placeholders */}
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl">
                Everything you need to manage your finances in one place
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature Cards */}
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Feature 1</h3>
                <p className="text-gray-500 text-sm">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <PieChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Feature 2</h3>
                <p className="text-gray-500 text-sm">
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Feature 3</h3>
                <p className="text-gray-500 text-sm">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Feature 4</h3>
                <p className="text-gray-500 text-sm">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple, Transparent Pricing</h2>
              <p className="max-w-[600px] mx-auto text-gray-500 md:text-xl">
                Choose the plan that's right for you
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-2xl p-8 shadow-lg shadow-gray-100 border border-gray-100">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Free</h3>
                  <div className="text-4xl font-bold">$0<span className="text-base font-normal text-gray-500">/month</span></div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Track up to 30 transactions per month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Basic budgeting features</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span>Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full rounded-full" variant="outline">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-white/10 px-3 py-1 text-sm rounded-bl-lg">
                  Most Popular
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <div className="text-4xl font-bold">$29<span className="text-base font-normal text-white/90">/month</span></div>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                      <span>Unlimited transactions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                      <span>Unlimited budgeting</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                      <span>All premium features included</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                      <span>Lorem ipsum dolor sit amet, consectetur adipiscing</span>
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full rounded-full bg-white text-primary hover:bg-white/90">
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-gradient-to-br from-primary/5 via-purple-50 to-blue-50">
          <div className="container px-4 md:px-6 mx-auto text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Start Managing Your Spending Smarter Today!
              </h2>
              <p className="text-gray-500 md:text-xl">
                Join thousands of users who trust SpendTab for their financial management
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}