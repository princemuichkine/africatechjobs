import { Footer } from "@/components/emails/footer";
import { Logo } from "@/components/emails/logo";
import {
  Body,
  Container,
  Font,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function WelcomeEmail({
  name = "there",
}: {
  name: string;
}) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Geist Mono"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@500&display=swap",
            format: "woff2",
          }}
          fontWeight={500}
          fontStyle="normal"
        />
      </Head>
      <Preview>
        Welcome to Africa Tech Jobs – Find your dream tech job in Africa!
      </Preview>
      <Tailwind>
        <Body className="bg-white font-mono">
          <Container className="mx-auto py-5 pb-12 max-w-[580px]">
            <Logo />

            <Text className="text-xs leading-7 mb-6 font-mono">Hi {name},</Text>

            <Text className="text-xs leading-7 pb-2 font-mono">
              Welcome to Africa Tech Jobs – your gateway to the best tech opportunities across Africa!
            </Text>

            <Text className="text-xs leading-7 pb-4 font-mono">
              We&apos;re excited to have you join our community of tech professionals.
              Whether you&apos;re looking for your next opportunity or connecting with
              talented developers, you&apos;re in the right place.
            </Text>

            <Text className="text-xs leading-7 pb-2 font-mono">
              Here&apos;s what you can do in Africa Tech Jobs:
            </Text>

            <Text className="text-xs font-mono">
              <span className="text-lg">◇ </span>
              <Link
                href="https://africatechjobs.com/jobs"
                className="underline text-black font-mono"
              >
                Browse Jobs
              </Link>{" "}
              – Discover tech positions across Africa from top companies
            </Text>

            <Text className="text-xs font-mono">
              <span className="text-lg">◇ </span>
              <Link
                href="https://africatechjobs.com/companies"
                className="underline text-black font-mono"
              >
                Explore Companies
              </Link>{" "}
              – Learn about tech companies hiring in Africa
            </Text>

            <Text className="text-xs font-mono">
              <span className="text-lg">◇ </span>
              <Link
                href="https://africatechjobs.com/advertise"
                className="underline text-black font-mono"
              >
                Post a Job
              </Link>{" "}
              – Employers can post job openings to reach top talent
            </Text>

            <Text className="text-xs font-mono">
              <span className="text-lg">◇ </span>
              <Link
                href="https://africatechjobs.com/about"
                className="underline text-black font-mono"
              >
                About Us
              </Link>{" "}
              – Learn more about our mission to connect African tech talent
            </Text>

            <Text className="text-xs leading-7 mt-4 font-mono">
              Africa Tech Jobs is more than just a platform – it&apos;s a community.
              Connect with like-minded developers, share your knowledge, and be
              part of the movement.
            </Text>

            <Section className="mt-2">
              <Text className="text-xs leading-7 mb-6 font-mono">
                Ready to get started?{" "}
                <Link
                  href="https://africatechjobs.com"
                  className="underline text-black font-mono"
                >
                  africatechjobs.com
                </Link>
              </Text>
            </Section>

            <Text className="text-xs leading-7 font-mono">
              Looking forward to helping you find your next opportunity!
            </Text>

            <Text className="text-xs leading-7 mt-2 font-mono">
              Best regards,
              <br />
              The Africa Tech Jobs Team
            </Text>

            <Footer />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
