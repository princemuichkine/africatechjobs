"use client";

import { motion } from "framer-motion";

export default function TermsClient() {
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
            Terms and conditions
          </motion.h1>
          <motion.p
            className="text-foreground/90 text-base leading-relaxed tracking-tight max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Please read these terms carefully before using our service. By using
            africatechjobs.xyz, you agree to these terms.
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
              Acceptance of terms
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              By accessing and using africatechjobs.xyz (&ldquo;Service&rdquo;),
              you accept and agree to be bound by the terms and provision of
              this agreement. If you do not agree to abide by the above, please
              do not use this service nor create an account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Description of service
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              africatechjobs.xyz is Africa&apos;s premier tech job board platform
              that connects talented developers, designers, and tech
              professionals with leading African companies and startups. Our
              platform aggregates daily updated, high-quality tech job
              opportunities across the continent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Billing and subscriptions
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We offer multiple plans, including free and paid tiers, and may
              provide usage-based billing for additional services. Prices and
              plan limits are described on our pricing page and may change from
              time to time. Taxes, where applicable, will be added at checkout.
              By starting a subscription, you authorize us (and our payment
              processor) to charge the applicable fees on a recurring basis
              until you cancel.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Trials
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              From time to time, we may offer a free or discounted trial on
              certain plans. Unless otherwise stated, at the end of the trial
              your subscription will continue automatically at the then-current
              rate unless you cancel before renewal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Cancellations
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              You may cancel your subscription at any time in your dashboard.
              When you cancel, you will retain access to paid features until the
              end of the current billing period. Fees already paid are not
              prorated.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Refunds and credits
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              Our goal is to provide a reliable job board experience. Because
              the Service is delivered immediately and capacity is reserved on
              your behalf, all fees are generally non-refundable. In rare cases
              where you experience a material, verifiable technical issue that
              prevents you from using the Service as described, we may, at our
              sole discretion, offer a remedy such as troubleshooting support,
              additional usage, or an account credit. Any discretionary credit
              must be requested within seven (7) days of purchase and will not
              exceed the amount paid for the affected period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              User responsibilities
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              You are responsible for maintaining the confidentiality of your
              account and password and for restricting access to your computer.
              You agree to accept responsibility for all activities that occur
              under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Prohibited uses
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              You may not use our service for any illegal or unauthorized
              purpose nor may you, in the use of the Service, violate any laws
              in your jurisdiction. You must not transmit any harmful or
              disruptive content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Limitation of liability
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              In no event shall africatechjobs.xyz be liable for any indirect,
              incidental, special, consequential, or punitive damages, including
              without limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Changes to terms
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              We reserve the right to modify these terms at any time. We will
              always post the most current version on our website. By continuing
              to use the Service after changes become effective, you agree to be
              bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-white">
              Contact
            </h2>
            <p className="text-foreground/90 text-base leading-relaxed tracking-tight">
              If you have any questions about these terms and conditions, please
              contact us through our website or reach out to our support team
              from the dashboard or via email at{" "}
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
