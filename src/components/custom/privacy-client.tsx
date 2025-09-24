"use client";

import { motion } from "framer-motion";

export default function PrivacyClient() {
  return (
    <>
      <div className="flex flex-col max-w-screen-md mx-auto px-6 py-12 pb-32">
        {/* Hero Section */}
        <div className="relative pt-20 md:pt-20 mb-12 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Privacy policy
          </motion.h1>
          <motion.p
            className="text-foreground/90 text-base leading-relaxed tracking-tight max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your privacy is important to us. This policy explains how we
            collect, use, and protect your information.
          </motion.p>
        </div>

        {/* Content Sections */}
        <motion.div
          className="space-y-12 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Information we collect
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight mb-4">
              We collect information you provide directly to us, such as when
              you create an account, post job listings, apply for jobs, or
              contact us for support. This includes personal details, company
              information, and communication preferences.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90 text-base leading-relaxed tracking-tight">
              <li>
                Account and profile: name, email, password (hashed), and basic
                profile details you choose to provide.
              </li>
              <li>
                Job content: job listings, applications, resumes, and documents
                you upload through our platform.
              </li>
              <li>
                Usage and device data: limited technical information (such as
                browser type, timestamps, and interactions) to secure and
                improve the Service.
              </li>
              <li>
                Communications: messages you send to support and operational
                emails we exchange with you.
              </li>
              <li>
                Billing metadata: limited payment-related details from our
                payment processor (e.g., last four digits, card brand, billing
                country) for subscription management.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Payments and billing information
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We use a third-party payment processor to handle payments. Payment
              method details are processed and stored by the processor, not by
              africatechjobs.xyz. We receive limited information related to your
              transactions (for example, the last four digits of a card, card
              brand, and billing country) to help us manage your subscription.
              For information about refunds or credits, please refer to our
              Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              How we use your information
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight mb-4">
              We use the information we collect to provide, maintain, and
              improve our services, process transactions, and communicate with
              you about your account and our services. This enables us to
              deliver personalized and effective job matching and recruitment
              services.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90 text-base leading-relaxed tracking-tight">
              <li>
                Operate core features, including job posting and job search.
              </li>
              <li>
                Match job seekers with relevant opportunities and companies with
                qualified candidates.
              </li>
              <li>Provide support, account notices, and service updates.</li>
              <li>Monitor, prevent, and address abuse, fraud, and outages.</li>
              <li>Improve the Service, including quality and reliability.</li>
              <li>Comply with legal, tax, and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              AI and automated processing
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              Some features rely on automated systems and AI models to enhance
              your experience (for example, job recommendations, candidate
              matching, and content moderation). These systems process the
              content you provide to deliver the requested functionality and
              improve our service quality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Information sharing
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We do not sell your personal information. We share information in
              limited cases, including with: (a) service providers acting on our
              behalf (for hosting, database, messaging, analytics, and
              payments); (b) to comply with law or legal process; (c) to protect
              rights, safety, and the integrity of the Service; or (d) in
              connection with a corporate transaction. Service providers are
              bound by appropriate confidentiality and security obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Data security
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We implement measures designed to protect your information,
              including encryption in transit, access controls, least- privilege
              practices, logging, and regular backups. No method of transmission
              or storage is 100% secure, but we work to safeguard your data and
              review our controls periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Data retention
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We retain information for as long as necessary to provide the
              Service, comply with legal obligations, resolve disputes, and
              enforce agreements. When no longer needed, we take steps to delete
              or de-identify information in a reasonable timeframe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Your rights
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              Depending on your location, you may have rights over your personal
              information, including to access, correct, delete, restrict or
              object to processing, and request portability. You may also
              withdraw consent where processing is based on consent. Contact us
              to exercise these rights; we will respond consistent with
              applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Cookies and tracking
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight mb-4">
              We use cookies and similar technologies to operate and improve the
              Service. You can control cookies through your browser settings.
              Disabling certain cookies may affect core functionality.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90 text-base leading-relaxed tracking-tight">
              <li>Essential: required for core features and security.</li>
              <li>Functional: remember preferences and improve experience.</li>
              <li>Analytics: help us understand usage and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Data location and transfers
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We may process and store information in the country where you live
              or in other countries where we or our service providers operate.
              Where required, we use appropriate safeguards for cross-border
              transfers, such as contractual commitments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Changes to this policy
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &ldquo;Last updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Contact
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              If you have any questions about this privacy policy, please
              contact us through our website or reach out to our support team
              for assistance from the dashboard or via email at{" "}
              <a
                href="mailto:hello@africatechjobs.xyz"
                className="text-primary border-border border-dashed border-b-[1px] hover:text-primary/80 transition-colors font-semibold"
              >
                hello@africatechjobs.xyz
              </a>
              .
            </p>
          </section>
        </motion.div>

        {/* Footer info */}
        <div className="mt-20 pt-8 border-t border-border flex justify-end">
          <p className="text-foreground/80 text-sm">
            Last updated: September 4, 2025
          </p>
        </div>
      </div>
    </>
  );
}
