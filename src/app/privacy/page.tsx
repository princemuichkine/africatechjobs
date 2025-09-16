import { Header } from '@/components/custom/header'
import PrivacyClient from '@/components/custom/privacy-client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Learn how we protect your privacy and handle your data.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <PrivacyClient />
      </main>
    </div>
  )
}