import Image from "next/image";
import { HomeNav } from "@/components/home-nav";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <main className="flex flex-col">

      <HomeNav />

      {/* Hero — full bleed B&W */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-8 text-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/Redwoods-2.jpg"
            alt=""
            fill
            className="object-cover object-center"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.65) 55%, rgba(10,10,10,0.9) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <p
            className="text-sm uppercase mb-10 opacity-50"
            style={{ color: "var(--paper)", fontFamily: "var(--font-accent)", letterSpacing: "0.12em", fontSize: "1rem" }}
          >
            a space for creatives
          </p>
          <h1
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.95] font-semibold mb-12 tracking-tight"
            style={{ color: "var(--paper)", fontFamily: "var(--font-heading)" }}
          >
            You are not
            <br />
            <span className="font-light italic">finished</span>
            <br />
            becoming.
          </h1>
          <p
            className="text-base md:text-lg max-w-md mx-auto leading-relaxed mb-16"
            style={{ color: "var(--paper)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.6 }}
          >
            And that is exactly where this begins.
          </p>
          <a
            href="#what-this-is"
            className="inline-block text-sm uppercase px-8 py-4 transition-opacity duration-300 hover:opacity-75"
            style={{
              backgroundColor: "var(--paper)",
              color: "var(--ink)",
              fontFamily: "var(--font-body)",
              letterSpacing: "0.2em",
            }}
          >
            Enter the space
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
          <div className="w-px h-16" style={{ backgroundColor: "var(--paper)" }} />
        </div>
      </section>

      {/* The Honest Part */}
      <section className="py-32 px-8" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <p
              className="text-xl leading-relaxed"
              style={{ color: "var(--ink)", fontFamily: "var(--font-accent)", fontSize: "1.6rem", lineHeight: 1.5 }}
            >
              &ldquo;You&apos;ve started things. Left them unfinished. Wondered if you&apos;re really an artist — or just someone who wishes they were.&rdquo;
            </p>
            <div className="w-8 h-px" style={{ backgroundColor: "var(--dust)" }} />
            <p
              className="text-base md:text-lg leading-loose font-medium"
              style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}
            >
              That wondering? That is the work.
            </p>
            <p
              className="text-base md:text-lg leading-loose"
              style={{ color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
            >
              The Becoming Creative was built for the in-between. For the artist
              who isn&apos;t sure yet. For the maker who keeps starting over. For
              the dreamer who needs somewhere to land.
            </p>
            <p
              className="text-base md:text-lg leading-loose"
              style={{ color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
            >
              This is that place.
            </p>
          </div>

          <div className="relative h-[560px] md:h-[680px] overflow-hidden">
            <Image
              src="/images/AV_michelle-7879.jpg"
              alt=""
              fill
              className="object-cover object-center grayscale"
            />
          </div>
        </div>
      </section>

      {/* Photo strip — B&W */}
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
              className={`object-cover ${img.position} grayscale transition-all duration-700 hover:scale-105 hover:grayscale-0`}
            />
          </div>
        ))}
      </div>

      {/* What Lives Here */}
      <section
        id="what-this-is"
        className="py-32 px-8"
        style={{ backgroundColor: "var(--ash)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="mb-4 opacity-50"
            style={{ fontFamily: "var(--font-accent)", color: "var(--ink)", fontSize: "1.1rem" }}
          >
            what lives here
          </p>
          <h2
            className="text-4xl md:text-6xl font-semibold tracking-tight mb-20"
            style={{ color: "var(--ink)", fontFamily: "var(--font-heading)" }}
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
                link: "/field-notes",
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
                style={{ borderTop: "1px solid var(--dust)" }}
              >
                <span
                  style={{ fontFamily: "var(--font-accent)", color: "var(--stone)", fontSize: "1rem" }}
                >
                  {item.mark}
                </span>
                <h3
                  className="text-3xl font-semibold tracking-tight"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-base leading-loose"
                  style={{ color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 300, opacity: 0.7 }}
                >
                  {item.description}
                </p>
                {"link" in item && (
                  <a
                    href={item.link}
                    className="text-xs uppercase tracking-widest transition-opacity hover:opacity-100"
                    style={{ color: "var(--ink)", fontFamily: "var(--font-body)", opacity: 0.5 }}
                  >
                    Explore →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width dramatic image — B&W */}
      <div className="relative overflow-hidden" style={{ height: "75vh" }}>
        <Image
          src="/images/AV_michelle-7926.jpg"
          alt=""
          fill
          className="object-cover object-top grayscale"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 60%)" }}
        />
      </div>

      {/* Pull Quote — stark black */}
      <section
        className="relative py-40 px-8 text-center"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <div className="max-w-3xl mx-auto">
          <p
            className="mb-6 opacity-40"
            style={{ color: "var(--paper)", fontFamily: "var(--font-accent)", fontSize: "1rem" }}
          >
            — the becoming creative
          </p>
          <h2
            className="leading-tight"
            style={{
              color: "var(--paper)",
              fontFamily: "var(--font-accent)",
              fontSize: "clamp(2.5rem, 7vw, 5rem)",
              lineHeight: 1.25,
            }}
          >
            Come as you are.
            <br />
            Stay as you grow.
          </h2>
          <div className="w-12 h-px mx-auto mt-12 opacity-30" style={{ backgroundColor: "var(--paper)" }} />
        </div>
      </section>

      {/* CTA / Join */}
      <section id="join" className="py-40 px-8" style={{ backgroundColor: "var(--paper)" }}>
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-8">
          <p
            style={{ fontFamily: "var(--font-accent)", color: "var(--ink)", opacity: 0.45, fontSize: "1.1rem" }}
          >
            ready to begin
          </p>
          <h2
            className="text-4xl md:text-6xl font-semibold tracking-tight"
            style={{ color: "var(--ink)", fontFamily: "var(--font-heading)" }}
          >
            Join the community.
          </h2>
          <p
            className="text-base leading-loose opacity-60"
            style={{ color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Free to start. No perfection required.
          </p>

          <WaitlistForm />

          <p className="text-xs opacity-35" style={{ color: "var(--ink)", fontFamily: "var(--font-body)" }}>
            No spam. Unsubscribe any time.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-8 flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ backgroundColor: "var(--ink)" }}
      >
        <div className="flex items-center gap-3" style={{ color: "var(--paper)", opacity: 0.5 }}>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, letterSpacing: "0.08em", fontSize: "0.95rem" }}>
            the becoming creative
          </span>
        </div>
        <p className="text-xs opacity-30" style={{ color: "var(--paper)", fontFamily: "var(--font-body)" }}>
          © {new Date().getFullYear()} The Becoming Creative. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
