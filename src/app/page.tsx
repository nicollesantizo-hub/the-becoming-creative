import Image from "next/image";
import { Logo } from "@/components/logo";
import { HomeNav } from "@/components/home-nav";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <main className="flex flex-col">

      <HomeNav />

      {/* Hero — full bleed photo */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/AV_stephanie-6488.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(42,33,24,0.25) 0%, rgba(42,33,24,0.6) 55%, rgba(42,33,24,0.88) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="text-sm uppercase mb-10 opacity-60"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)", letterSpacing: "0.25em" }}
          >
            a space for creatives
          </p>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.95] font-light italic mb-12"
            style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
          >
            You are not
            <br />
            <span className="not-italic font-normal">finished</span>
            <br />
            becoming.
          </h1>
          <p
            className="text-base md:text-lg max-w-md mx-auto leading-relaxed mb-16"
            style={{ color: "var(--cream)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
          >
            And that is exactly where this begins.
          </p>
          <a
            href="#what-this-is"
            className="inline-block text-sm uppercase px-8 py-4 transition-opacity duration-300 hover:opacity-75"
            style={{
              backgroundColor: "var(--clay)",
              color: "var(--cream)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.2em",
            }}
          >
            Enter the space
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-25">
          <div className="w-px h-16" style={{ backgroundColor: "var(--cream)" }} />
        </div>
      </section>

      {/* The Honest Part */}
      <section className="py-32 px-8" style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <h2
              className="text-4xl md:text-5xl leading-tight italic font-light"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
            >
              &ldquo;You&apos;ve started things.
              <br />
              Left them unfinished.
              <br />
              Wondered if you&apos;re really
              <br />
              an artist, or just someone
              <br />
              who wishes they were.&rdquo;
            </h2>
            <p
              className="text-base md:text-lg leading-loose"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 400 }}
            >
              That wondering? That is the work.
            </p>
            <p
              className="text-base md:text-lg leading-loose"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.8 }}
            >
              The Becoming Creative was built for the in-between. For the artist
              who isn&apos;t sure yet. For the maker who keeps starting over. For
              the dreamer who needs somewhere to land.
            </p>
            <p
              className="text-base md:text-lg leading-loose"
              style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.8 }}
            >
              This is that place.
            </p>
          </div>

          <div className="relative h-[560px] md:h-[680px] overflow-hidden">
            <Image
              src="/images/AV_michelle-7879.jpg"
              alt=""
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <div className="grid grid-cols-3" style={{ height: "55vh" }}>
        {[
          { src: "/images/AV_michelle-7599.jpg", position: "object-[55%_40%]" },
          { src: "/images/AV_michelle-7896.jpg", position: "object-[50%_30%]" },
          { src: "/images/AV_stephanie-6460.jpg", position: "object-[50%_70%]" },
        ].map((img) => (
          <div key={img.src} className="relative overflow-hidden">
            <Image
              src={img.src}
              alt=""
              fill
              className={`object-cover ${img.position} transition-transform duration-700 hover:scale-105`}
            />
          </div>
        ))}
      </div>

      {/* What Lives Here */}
      <section
        id="what-this-is"
        className="py-32 px-8"
        style={{ backgroundColor: "var(--sand)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-sm uppercase mb-4 opacity-50"
            style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.25em" }}
          >
            what lives here
          </p>
          <h2
            className="text-4xl md:text-6xl font-light mb-20"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Everything you need
            <br />
            to keep going.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Inspiration",
                description:
                  "Curated content, stories from real creatives, and honest conversations about the messy middle of making something.",
                mark: "01",
              },
              {
                title: "Community",
                description:
                  "A forum built for depth. Share your work, ask hard questions, find the people who understand what it means to create.",
                mark: "02",
              },
              {
                title: "Resources",
                description:
                  "Tools, guides, and calculators built for working creatives. Business of art, event hosting, ways to sell — all in one place.",
                mark: "03",
                link: "/resources",
              },
            ].map((item) => (
              <div
                key={item.mark}
                className="flex flex-col gap-6 pt-8"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span
                  className="text-xs tracking-widest opacity-40"
                  style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)" }}
                >
                  {item.mark}
                </span>
                <h3
                  className="text-3xl font-light italic"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base leading-loose"
                  style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.75 }}
                >
                  {item.description}
                </p>
                {"link" in item && (
                  <a
                    href={item.link}
                    className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
                    style={{ color: "var(--clay)", fontFamily: "var(--font-body)", opacity: 0.8 }}
                  >
                    Explore →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width dramatic image — reaching up */}
      <div className="relative overflow-hidden" style={{ height: "75vh" }}>
        <Image
          src="/images/AV_michelle-7926.jpg"
          alt=""
          fill
          className="object-cover object-top"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(42,33,24,0.5) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Pull Quote — photo background */}
      <section className="relative py-40 px-8 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/AV_stephanie-6704.jpg"
            alt=""
            fill
            className="object-cover object-center"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(85, 95, 80, 0.70)" }}
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2
            className="text-5xl md:text-7xl font-light italic leading-tight"
            style={{ color: "var(--cream)", fontFamily: "var(--font-heading)" }}
          >
            Come as you are.
            <br />
            Stay as you grow.
          </h2>
          <div
            className="w-12 h-px mx-auto mt-12 opacity-50"
            style={{ backgroundColor: "var(--cream)" }}
          />
        </div>
      </section>

      {/* CTA / Join */}
      <section id="join" className="py-40 px-8" style={{ backgroundColor: "var(--cream)" }}>
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-8">
          <p
            className="text-sm uppercase opacity-50"
            style={{ fontFamily: "var(--font-body)", color: "var(--charcoal)", letterSpacing: "0.25em" }}
          >
            ready to begin
          </p>
          <h2
            className="text-4xl md:text-6xl font-light"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-heading)" }}
          >
            Join the community.
          </h2>
          <p
            className="text-base leading-loose opacity-70"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Free to start. No perfection required.
          </p>

          <WaitlistForm />

          <p
            className="text-xs opacity-40"
            style={{ color: "var(--charcoal)", fontFamily: "var(--font-body)" }}
          >
            No spam. Unsubscribe any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: "var(--charcoal)" }}
      >
        <Logo className="text-[var(--cream)] opacity-60" />
        <p
          className="text-xs opacity-30"
          style={{ color: "var(--cream)", fontFamily: "var(--font-body)" }}
        >
          © {new Date().getFullYear()} The Becoming Creative. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
