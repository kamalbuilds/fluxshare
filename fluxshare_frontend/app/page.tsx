"use client";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { GridPattern } from "@/components/ui/grid-pattern";

export default function Home() {
  // Content for the sticky scroll feature section
  const features = [
    {
      title: "Subscription Management Made Easy",
      description:
        "Create and manage subscription plans with flexible pricing and durations. Set up recurring payments that automatically process at specified intervals.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/subscription-preview.png" 
            width={400} 
            height={300} 
            alt="Subscription Management" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Split Payments with Precision",
      description:
        "Distribute funds among multiple recipients automatically based on predefined shares. Perfect for revenue sharing, royalty payments, and team distributions.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-950/50 dark:to-emerald-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/payment-split-preview.png" 
            width={400} 
            height={300} 
            alt="Payment Splitting" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Complete Analytics Dashboard",
      description:
        "Track payments, subscriptions, and revenue with intuitive analytics. Gain insights into your payment streams and optimize your financial operations.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950/50 dark:to-amber-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/analytics-preview.png" 
            width={400} 
            height={300} 
            alt="Analytics Dashboard" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
    {
      title: "Secure Blockchain Transactions",
      description:
        "Built on IOTA's secure and feeless blockchain technology. Every transaction is fully traceable and immutable, providing complete transparency.",
      content: (
        <div className="h-full w-full bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-950/50 dark:to-rose-950/50 rounded-xl p-8 flex items-center justify-center">
          <Image 
            src="/security-preview.png" 
            width={400} 
            height={300} 
            alt="Blockchain Security" 
            className="rounded-lg shadow-lg object-cover"
          />
        </div>
      ),
    },
  ];

  // Card content for the "Use Cases" section
  const useCards = [
    {
      title: "Content Creators",
      description: "Automate revenue sharing between creators, platforms, and collaborators.",
      icon: "👨‍🎨",
    },
    {
      title: "SaaS Businesses",
      description: "Set up subscription plans with flexible pricing and automatic billing.",
      icon: "💻",
    },
    {
      title: "Freelancers",
      description: "Split project payments among team members with predefined shares.",
      icon: "👩‍💻",
    },
    {
      title: "Digital Services",
      description: "Implement pay-as-you-go models with transparent payment processing.",
      icon: "🛠",
    },
    {
      title: "NFT Marketplaces",
      description: "Manage royalty distributions for NFT sales and resales.",
      icon: "🖼",
    },
    {
      title: "DAOs & Communities",
      description: "Distribute funds among community members based on contribution.",
      icon: "🤝",
    },
  ];
  
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative">
        <GridPattern className="absolute inset-0 -z-10" />
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                FluxShare
              </span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-[700px] mx-auto">
              Automated revenue splitting and subscription management for digital creators and businesses on the IOTA blockchain
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 min-[400px]:gap-6">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Get Started
            </Link>
            <Link
              href="#features"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Learn More
            </Link>
          </div>
          
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
            <MacbookScroll
              title={
                <div className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-center mb-4">
                  Create, split, and manage recurring payments with zero fees
                </div>
              }
              src="/dashboard-preview.png"
              showGradient={true}
            />
          </div>
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-950">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Powerful Features
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Our platform provides all the tools you need to manage payments and subscriptions on the blockchain
            </p>
          </div>
          
          <div className="h-[80vh] md:h-[90vh]">
            <StickyScroll content={features} />
          </div>
        </div>
      </section>

      {/* Use Cases section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <TracingBeam>
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Use Cases
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                IOTA Pay Split is versatile and can be used across various industries and scenarios
              </p>
            </div>
            
            <HoverEffect items={useCards} />
          </TracingBeam>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container px-4 md:px-6 mx-auto flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to revolutionize your payment system?
            </h2>
            <p className="mx-auto max-w-[600px] text-gray-200 md:text-xl/relaxed">
              Get started with IOTA Pay Split today and experience the future of decentralized payments
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "bg-white text-purple-600 hover:bg-gray-100"
              })}
            >
              Launch App
            </Link>
            <Link
              href="https://docs.iota.org"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-white text-white hover:bg-white/10"
              })}
            >
              Learn About IOTA
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
