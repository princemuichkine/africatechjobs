import { FuzzyText } from "@/components/design/fuzzy-text";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full text-center">
        {/* Fuzzy 404 Text */}
        <div className="mb-6 sm:mb-8 flex justify-center">
          <FuzzyText
            fontSize="clamp(3rem, 15vw, 10rem)"
            fontWeight={900}
            enableHover={true}
            baseIntensity={0.15}
            hoverIntensity={0.4}
            className="text-primary"
          >
            404
          </FuzzyText>
        </div>

        {/* Help text */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 mb-6 rounded-sm bg-muted/50 border">
          <p className="text-sm text-foreground/80 max-w-lg mx-auto leading-relaxed">
            Looks like this page got lost in the fundraising process. If you
            think this is an error, please{" "}
            <a
              href="mailto:hello@suparaise.com"
              className="text-primary hover:underline font-medium"
            >
              contact our support team
            </a>{" "}
            and we&apos;ll help you out.
          </p>
        </div>
      </div>
    </div>
  );
}
