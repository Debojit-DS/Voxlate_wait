import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About us — Voxlate",
  description: "Why we are building natural, voice-preserving translation, and the team behind Voxlate.",
};

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
};

type TeamGroup = {
  team: string;
  members: TeamMember[];
};

const FOUNDER: TeamMember = {
  name: "Harsh SN Sisodiya",
  role: "Founder, CEO & Product Visionary",
  bio: "Leads the company's vision, product strategy, and day-to-day execution. Oversees product development, business strategy, partnerships, and long-term innovation while guiding Voxlate toward its mission of breaking language barriers.",
  image: "/images/team/Harsh.jpeg",
  linkedin: "https://www.linkedin.com/in/harsh-sn-sisodiya-a88a9b385",
};

const TEAM_GROUPS: TeamGroup[] = [
  {
    team: "Software Team",
    members: [
      {
        name: "Debojit Deb Sarkar",
        role: "Software Tech Lead",
        bio: "Leads the technical execution of the software team, supervises development activities, and contributes to building and improving Voxlate's core platform.",
        image: "/images/team/debojit.png",
        linkedin: "https://www.linkedin.com/in/debojit-deb-sarkar",
      },
      {
        name: "Saptarshi Kar",
        role: "Full-Stack & AI/ML Developer",
        bio: "Plays a key role in building Voxlate's software platform by developing scalable software systems and integrating AI-powered technologies. Passionate about creating reliable, high-performance solutions that drive the future of real-time voice translation.",
        image: "/images/team/saptarshi.jpg",
        linkedin: "https://www.linkedin.com/in/saptarshi-kar/",
      },
       {
         name: "Samidhya Banerjee",
         role: "Full-Stack & AI/ML Developer",
         bio: "Develops and maintains Voxlate's backend infrastructure while contributing to full-stack development. Will also focus on advanced AI models and intelligent system development as the product evolves.",
         image: "/images/team/samidhya.png",
         linkedin: "https://www.linkedin.com/in/samidhya-banerjee-9ba858284/",
       },
        {
          name: "Bikram Mondal",
          role: "Full-Stack & AI/ML Developer",
          bio: "Contributes to both the front-end and back-end architecture of Voxlate, alongside implementing advanced AI/ML features. Focused on writing efficient, scalable code that bridges modern web technologies with artificial intelligence.",
          image: "/images/team/bikram.png",
          linkedin: "https://www.linkedin.com/in/workwithbikram/",
        },
      ],
    },
    {
      team: "Hardware Team",
      members: [
        {
          name: "Avigyan Roy",
          role: "Hardware Development Engineer",
          bio: "Focuses on microcontroller programming, sensor integration, and developing low-level firmware to power Voxlate’s wearable prototype.",
          image: "/images/team/avigyan.jpeg",
          linkedin: "https://www.linkedin.com/in/avigyan-roy-634368397/",
        },
        {
          name: "Saloni Gupta",
          role: "Research and Development Hardware Engineer",
          bio: "Works on circuit design, component selection, and physical prototyping to test and iterate on the wearable device's internal architecture.",
          image: "/images/team/saloni.jpeg",
          linkedin: "https://www.linkedin.com/in/saloni-gupta-0820783aa/",
        },
      ],
    },
   {
     team: "Marketing and Sales Team",
     members: [
       {
         name: "Rajdeep Kumar Debnath",
         role: "Marketing Team Member",
         bio: "Contributes to marketing campaigns, audience outreach, content planning, and brand awareness initiatives, helping expand Voxlate's reach and community.",
         image: "/images/team/Rajdeep.jpeg",
         linkedin: "https://www.linkedin.com/in/rajdeep-kumar-debnath-87313b384/",
       },
        {
          name: "Prabhat Kumar Singh",
          role: "Marketing Team Member",
          bio: "Focuses on direct user outreach, guiding prospective leads through the pipeline, and driving adoption to accelerate Voxlate's early growth.",
          image: "/images/team/prabhat.jpeg",
          linkedin: "https://www.linkedin.com/in/prabhat-kumar-singh-9680813aa/",
        },
        {
          name: "Soham Barapanda",
          role: "Marketing and Sales Team Member",
          bio: "Handles digital outreach, executes social media campaigns, and develops community-focused initiatives to strengthen brand visibility and audience engagement.",
          image: "/images/team/soham.jpeg",
          linkedin: "https://www.linkedin.com/in/soham-barapanda-4a1a63373/",
        },
        {
          name: "Urnavo Chowdhury",
          role: "Marketing and Sales Team Member",
          bio: "Manages daily sales communications, identifies new outreach opportunities, and ensures a seamless onboarding experience for individuals testing the platform.",
          image: "/images/team/Urnavo.png",
          linkedin: "https://www.linkedin.com/in/urnavo-chowdhury/",
        },
        {
          name: "Sk.Shamim Raihan",
          role: "Marketing Team Lead",
          bio: "Leads promotional planning, oversees campaign execution, and builds strategic connections to expand Voxlate's market reach.",
          image: "/images/team/shamim.jpeg",
          linkedin: "https://www.linkedin.com/in/sk-shamim-raihan-130779241/",
        },
        {
          name: "Soumyadeep Gope",
          role: "Marketing and Sales Team Member",
          bio: "Focuses on driving sales outreach, converting leads, executing promotional campaigns, and building strategic customer relationships to accelerate Voxlate's market growth.",
          image: "/images/team/Soumyadeep.png",
          linkedin: "https://www.linkedin.com/in/soumyadeep-gope/",
        },
     ],
   },
  {
    team: "Creative Team",
    members: [
      {
        name: "Sudeshna Sasmal",
        role: "Video Editing & Social Media",
        bio: "Creates engaging visual content, edits promotional videos, and manages Voxlate's social media presence to strengthen the brand and connect with the community.",
        image: "/images/team/sudeshna.jpeg",
        linkedin: "https://www.linkedin.com/in/sudeshna-sasmal-b9bb62380/",
      },
      {
        name: "Subinita Ghosh",
        role: "Content and Creative Director",
        bio: "Responsible for content strategy, creative storytelling, poetry, artistic expression, and the conceptualization and production of advertising campaigns for Voxlate.",
        image: "/images/team/subinita.jpeg",
        linkedin: "https://www.linkedin.com/in/subinita-ghosh-bbb74b370/",
      },
      {
        name: "Raktim Chakraborty",
        role: "Visual Content & Design Lead",
        bio: "Responsible for VFX, video editing, graphic design, poster creation, and developing creative visual content for Voxlate's branding, marketing, and promotional campaigns.",
        image: "/images/team/raktim.png",
        linkedin: "https://www.linkedin.com/in/raktimchx/",
      },
    ],
  },
];

const PRINCIPLES = [
  {
    title: "Your voice stays yours",
    body: "Pitch, warmth and emotion carry into the other language, so people hear you, not a narrator reading a transcript.",
  },
  {
    title: "Who said what stays clear",
    body: "In a room or on a call, every speaker keeps a distinct voice, so a conversation still feels like several people talking.",
  },
  {
    title: "Meaning over word-for-word",
    body: "Intent, emphasis and direction are what get translated, so the result sounds like something a person would actually say.",
  },
];

function Portrait({ member, className = "" }: { member: TeamMember; className?: string }) {
  return member.image ? (
    <Image
      src={member.image}
      alt={`Portrait of ${member.name}`}
      width={480}
      height={600}
      sizes="(max-width: 640px) 50vw, 260px"
      className={`aspect-[4/5] w-full object-cover grayscale transition-[filter,transform] duration-500 group-hover:scale-[1.03] group-hover:grayscale-0 ${className}`}
    />
  ) : (
    <span className={`flex aspect-[4/5] w-full items-center justify-center bg-mist text-[40px] font-bold text-slate ${className}`} aria-hidden="true">
      {member.name
        .split(" ")
        .map((n) => n[0])
        .join("")}
    </span>
  );
}

function LinkedIn({ member }: { member: TeamMember }) {
  if (!member.linkedin) return null;
  return (
    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="vx-link mt-3 text-[14px]">
      LinkedIn <ArrowUpRight size={14} aria-hidden />
      <span className="sr-only"> profile of {member.name} (opens in a new tab)</span>
    </a>
  );
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="pb-24 lg:pb-32">
        <section className="page-container vx-page-head">
          <p className="vx-label">About us</p>
          <h1 className="vx-display mt-4 max-w-[18ch] text-[clamp(2.8rem,6.6vw,5.5rem)] text-ink">
            Translation that still sounds <span className="text-primary">like the person talking.</span>
          </h1>
        </section>

        <section id="mission" aria-labelledby="mission-title" className="border-y border-line bg-surface">
          <div className="page-container grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
            <h2 id="mission-title" className="vx-display text-[clamp(2rem,3.6vw,3rem)] text-ink">
              Our mission
            </h2>
            <div className="space-y-5 text-[17px] leading-relaxed text-slate lg:text-[18px]">
              <p className="text-ink">
                Most translation gets the words across and loses the person. We’re building Voxlate so that a conversation in two
                languages feels as natural as one in a single language.
              </p>
              <p>
                That means keeping the speaker’s tone and emotion, keeping it obvious who is talking, and carrying the intent of
                what was said rather than a literal string of words. Whether you’re a team meeting clients abroad, a student in a
                new city or a traveller at a market stall, you should be able to talk the way you normally talk.
              </p>
            </div>
          </div>
          <div className="page-container grid border-t border-line md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <div key={p.title} className={`py-10 md:pr-10 ${i > 0 ? "border-t border-line md:border-l md:border-t-0 md:pl-10" : ""}`}>
                <p className="vx-label text-primary">0{i + 1}</p>
                <h3 className="vx-display mt-3 text-[24px] text-ink">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-slate">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="team" aria-labelledby="team-title" className="page-container pt-20 lg:pt-28">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <h2 id="team-title" className="vx-display text-[clamp(2.4rem,4.6vw,4rem)] text-ink">
              Our team
            </h2>
            <p className="max-w-[60ch] text-[17px] leading-relaxed text-slate">
              Students from Heritage Institute of Technology working across software, AI, hardware, design and growth, united by
              one idea: language shouldn’t decide who you can talk to.
            </p>
          </div>

          <article className="group mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-[280px_1fr] md:gap-12">
            <div className="overflow-hidden rounded-[10px]">
              <Portrait member={FOUNDER} />
            </div>
            <div className="md:pt-2">
              <p className="vx-label">Founder</p>
              <h3 className="vx-display mt-3 text-[clamp(2rem,3.6vw,3rem)] text-ink">{FOUNDER.name}</h3>
              <p className="mt-2 text-[16px] font-medium text-primary">{FOUNDER.role}</p>
              <p className="mt-5 max-w-[58ch] text-[17px] leading-relaxed text-slate">{FOUNDER.bio}</p>
              <LinkedIn member={FOUNDER} />
            </div>
          </article>

          {TEAM_GROUPS.map((group) => (
            <section
              key={group.team}
              aria-labelledby={`team-${group.team}`}
              className="mt-16 grid gap-8 border-t border-line pt-10 lg:grid-cols-[200px_1fr] lg:gap-12"
            >
              <h3 id={`team-${group.team}`} className="vx-display text-[22px] text-ink">
                {group.team.replace(" Team", "")}
                <span className="vx-label mt-1 block">{group.members.length} people</span>
              </h3>
              <ul className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
                {group.members.map((member) => (
                  <li key={member.name} className="group">
                    <div className="overflow-hidden rounded-[10px]">
                      <Portrait member={member} />
                    </div>
                    <h4 className="mt-4 text-[17px] font-semibold leading-snug text-ink">{member.name}</h4>
                    <p className="mt-1 text-[14px] text-primary">{member.role}</p>
                    <p className="mt-2 hidden text-[14px] leading-relaxed text-slate sm:block">{member.bio}</p>
                    <LinkedIn member={member} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </section>

        <section id="join-team" className="page-container mt-24">
          <div className="grid gap-8 rounded-[14px] bg-night p-8 text-page sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="vx-display text-[clamp(2rem,4vw,3.25rem)]">Want to build this with us?</p>
              <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-page/70">
                We’re looking for people in software, AI, hardware, design and growth. If you’d rather back the idea, the founders
                would like to hear from you too.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:justify-end">
              <Link
                href="/careers"
                className="inline-flex h-[52px] items-center gap-2 rounded-[10px] bg-page px-6 font-semibold text-ink transition-colors hover:bg-white"
              >
                Join our team <ArrowRight size={17} aria-hidden />
              </Link>
              <Link href="/contact?for=investor" className="border-b border-page/40 pb-0.5 font-semibold transition-colors hover:border-page">
                Talk to us as an investor
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
