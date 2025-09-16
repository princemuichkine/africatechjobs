import { Header } from '@/components/custom/header'
import TermsClient from '@/components/custom/terms-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Read the terms and conditions for using our services.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <TermsClient />
      </main>
    </div>
  )
}