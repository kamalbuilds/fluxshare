"use client";
import "@/styles/globals.css"
import { Metadata } from "next"

import { siteConfig } from "@/fluxshare_frontend/config/site"
import { fontSans } from "@/fluxshare_frontend/lib/fonts"
import { cn } from "@/fluxshare_frontend/lib/utils"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import { createNetworkConfig, IotaClientProvider, WalletProvider, IOTAProvider } from '@iota/dapp-kit';
import { getFullnodeUrl } from '@iota/iota-sdk/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@iota/dapp-kit/dist/index.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {

  const { networkConfig } = createNetworkConfig({
    localnet: { url: getFullnodeUrl('localnet') },
    testnet: { url: getFullnodeUrl('testnet') },
});
const queryClient = new QueryClient();

  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable,
            inter.className
          )}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
          <IotaClientProvider
            networkId="testnet"
            endpoints={{
              jsonRpc: 'https://api.testnet.iota.cafe',
              graphql: 'https://graphql.testnet.iota.cafe',
            }}
          >
              <WalletProvider>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <div className="flex-1">{children}</div>
            </div>
            <TailwindIndicator />
            <Toaster />
            </WalletProvider>
            </IotaClientProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
