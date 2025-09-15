import Image from "next/image";

export const metadata = {
  title: "Africa Tech Jobs",
  description: "Why we built Africa Tech Jobs",
};

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center max-w-screen-md mx-auto px-6 py-12">
      <h1 className="text-4xl mb-12 mt-20 text-center">
        Why We Built <br />
        Africa Tech Jobs
      </h1>

      <div className="space-y-12 mt-10">
        <section>
          <p className="text-[#878787] leading-relaxed text-sm">
            Our journey with Africa Tech Jobs has been transformative. As team
            of one developer and a designer, we&apos;ve experienced firsthand
            how Africa Tech Jobs significantly accelerated our development
            process. This efficiency boost gave us the bandwidth to build our
            two startups,{" "}
            <a
              href="https://go.africatechjobs.com/8cX3F4o"
              className="text-primary border-border border-dashed border-b-[1px]"
            >
              Midday
            </a>{" "}
            and{" "}
            <a
              href="https://go.africatechjobs.com/NnI1CUO"
              className="text-primary border-border border-dashed border-b-[1px]"
            >
              Languine
            </a>{" "}
            with incredible velocity.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Our Approach</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            As a bootstrapped company, we believe in sustainable growth and
            maintaining full control over our product vision. We&apos;re
            building our platforms thoughtfully, prioritizing user needs over
            rapid scaling. With Africa Tech Jobs, we&apos;re streamlining
            business operations, while with Languine, we&apos;re building
            localization infrastructure that helps fast-paced startups reach
            global audiences without slowing down their development velocity.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Open Source Commitment</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            We&apos;re deeply committed to open source principles. Both Africa
            Tech Jobs and Languine are being built in public, with transparency
            at their core. We believe that collaboration with the community
            leads to better products, and we&apos;re proud to contribute back to
            the open source ecosystem. This commitment remains central to our
            mission, even as we grow and evolve.
          </p>
        </section>

        <section>
          <h2 className="text-xl mb-2">Follow Our Journey</h2>
          <p className="text-[#878787] leading-relaxed text-sm">
            Follow{" "}
            <a
              href="https://x.com/pontusab"
              className="text-primary hover:underline"
            >
              @pontusab
            </a>{" "}
            and{" "}
            <a
              href="https://x.com/viktorhofte"
              className="text-primary hover:underline"
            >
              @viktorhofte
            </a>{" "}
            on X to stay updated with our latest developments on both Africa
            Tech Jobs and&apos; Languine.
          </p>
        </section>
      </div>

      <Image
        src="https://africatechjobs.com/cdn-cgi/image/width=1920,quality=80//_next/static/media/founders.c6158766.png"
        alt="Africa Tech Jobs founders"
        width={1920}
        height={1080}
        className="rounded-lg mb-12 mt-12"
      />
    </div>
  );
}
