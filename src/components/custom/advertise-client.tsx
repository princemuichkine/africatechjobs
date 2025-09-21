"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AdvertiseClient() {
  return (
    <>
      <div className="flex flex-col items-center justify-center max-w-screen-md mx-auto px-6 py-12 pb-32">
        {/* Hero Section */}
        <div className="relative pt-8 sm:pt-20 md:pt-20 pb-2 sm:pb-4 mb-0 text-center">
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter font-regular text-zinc-800 dark:text-white mb-2 sm:mb-4 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Advertise
          </motion.h1>
        </div>

        {/* Content Sections */}
        <motion.div
          className="space-y-8 sm:space-y-12 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Reach an engaged audience
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed tracking-tight">
              afritechjobs.com attracts over{" "}
              <a
                href="https://dashboard.openpanel.dev/share/overview/a5hhbY?range=6m"
                className="text-primary border-border border-dashed border-b-[1px] hover:text-primary/80 transition-colors font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                100,000 unique visitors monthly
              </a>{" "}
              - and we&apos;re growing steadily. Our audience consists of
              developers, engineering leaders, and technical operators who are
              actively looking for new roles in Africa.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Why advertise with us?
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed tracking-tight">
              Our community is highly engaged with the tech ecosystem. If
              you&apos;re recuiting for a new role or offering APIs, cloud
              services, or any tech product, our platform provides direct access
              to your ideal audience. Our users are early adopters who can
              actively influence choices within their current and future
              organizations.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Our audience
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed tracking-tight">
              • Tech operators (65%)
              <br />• Engineers and developers (20%)
              <br />• Managers and executives (10%)
              <br />• Other professionals (5%)
              <br />
              <br />
              Our visitors come from leading companies, innovative tech
              startups, and development agencies all around the Continent, all
              united by their deep interest in the tech ecosystem.
              <br />
              <br />
              View our{" "}
              <a
                href="https://dashboard.openpanel.dev/share/overview/a5hhbY?range=30d"
                className="text-primary border-border border-dashed border-b-[1px] hover:text-primary/80 transition-colors font-semibold"
                target="_blank"
                rel="noopener noreferrer"
              >
                real-time analytics dashboard
              </a>{" "}
              for up-to-date visitor statistics.
            </p>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-white">
              Advertising options
            </h2>
            <p className="text-foreground/90 text-sm sm:text-base leading-relaxed tracking-tight">
              We offer various advertising opportunities including:
              <br />• Featured listings in our directory
              <br />• Sponsored content
              <br />• Newsletter sponsorships
              <br />• Custom partnership opportunities
              <br />
              <br />
              Contact Babacar at{" "}
              <a
                href="https://twitter.com/bm_diop"
                className="text-primary border-border border-dashed border-b-[1px] hover:text-primary/80 transition-colors font-semibold"
              >
                @bm_diop
              </a>{" "}
              to discuss how we can help you reach our engaged community.
            </p>

            <p className="text-primary mt-6 sm:mt-8 text-sm w-full">
              <Button
                asChild
                className="w-full h-10 sm:h-9 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 hover:text-blue-900 dark:hover:text-blue-200 border border-blue-300 dark:border-blue-800"
              >
                <a href="">Buy ad slot</a>
              </Button>
            </p>
          </section>
        </motion.div>
      </div>
    </>
  );
}
