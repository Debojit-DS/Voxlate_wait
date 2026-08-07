"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

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

const TEAM_GROUPS: TeamGroup[] = [
  {
    team: "Software Team",
    members: [
      {
        name: "Debojit Deb Sarkar",
        role: "Full-Stack & AI/ML Developer",
        bio: "Plays a key role in building Voxlate's software platform by developing scalable software systems and integrating AI-powered technologies. Passionate about creating reliable, high-performance solutions that drive the future of real-time voice translation.",
        image: "/images/team/debojit.png",
        linkedin: "https://www.linkedin.com/in/debojit-deb-sarkar",
      },
      {
        name: "Saptarshi Kar",
        role: "Software Tech Lead",
        bio: "Leads the technical execution of the software team, supervises development activities, and contributes to building and improving Voxlate's core platform.",
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
    ],
  },
  {
    team: "Marketing and Sales Team",
    members: [
      {
        name: "Snehargha Chakraborty",
        role: "Marketing Lead",
        bio: "Leads Voxlate's digital marketing strategy, brand positioning, growth campaigns, and community engagement across digital platforms.",
        image: "/images/team/snehargha.jpg",
        linkedin: "",
      },
      {
        name: "Rajdeep Kumar Debnath",
        role: "Marketing Team Member",
        bio: "Contributes to marketing campaigns, audience outreach, content planning, and brand awareness initiatives, helping expand Voxlate's reach and community.",
        image: "/images/team/rajdeep.jpg",
        linkedin: "https://www.linkedin.com/in/rajdeep-kumar-debnath-87313b384/",
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
        image: "/images/team/sudeshna.jpg",
        linkedin: "https://www.linkedin.com/in/sudeshna-sasmal-b9bb62380/",
      },
    ],
  },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<"team" | "mission">("team");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full px-6 py-6">
        <div className="mx-auto max-w-[1200px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-16 w-auto" />
            <div className="leading-none">
              <span className="block text-3xl font-bold tracking-tight text-text-primary">VOXLATE</span>
              <span className="block text-xs font-medium uppercase tracking-widest text-text-muted">Breaking Language Barriers</span>
            </div>
          </div>
          <Link href="/" className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-card bg-surface p-8 shadow-sm border border-border">
            <div className="mb-6 flex gap-2 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab("team")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "team"
                    ? "border-orange text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Our Team
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mission")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "mission"
                    ? "border-orange text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Our Mission
              </button>
            </div>

            {activeTab === "team" ? (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Meet the Team</h2>
                <p className="text-text-secondary leading-relaxed mb-8">
                  We are a team of passionate students from Heritage Institute of Technology, united by a shared vision to eliminate language barriers through AI-driven innovation. Combining expertise in software engineering, artificial intelligence, marketing, and digital media, we are building Voxlate to make communication more natural, accessible, and human.
                </p>
                
                <div className="mb-12 p-8 rounded-card bg-gradient-to-br from-orange/5 to-transparent border border-border">
                  <h3 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b border-border">Leadership</h3>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-32 h-32 flex-shrink-0 rounded-full bg-gradient-to-br from-orange/20 to-orange/5 flex items-center justify-center border-2 border-border">
                      <img src="/images/team/Harsh.jpeg" alt="Harsh SN Sisodiya" className="w-32 h-32 rounded-full object-cover" />
                    </div>
                    <div className="text-center md:text-left">
                      <h4 className="text-2xl font-bold text-text-primary mb-1">Harsh SN Sisodiya</h4>
                      <p className="text-orange font-medium mb-3">Founder, CEO & Product Visionary</p>
                      <p className="text-text-secondary leading-relaxed mb-4">Leads the company&apos;s vision, product strategy, and day-to-day execution. Oversees product development, business strategy, partnerships, and long-term innovation while guiding Voxlate toward its mission of breaking language barriers.</p>
                      <a href="https://www.linkedin.com/in/harsh-sn-sisodiya-a88a9b385" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-orange hover:underline">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>

                {TEAM_GROUPS.map((group) => (
                  <div key={group.team} className="mb-12">
                    <h3 className="text-xl font-semibold text-text-primary mb-6 pb-2 border-b border-border">{group.team}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {group.members.map((member, index) => (
                        <div key={index} className="text-center">
                          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange/20 to-orange/5 flex items-center justify-center border-2 border-border">
                            {member.image ? (
                              <img src={member.image} alt={member.name} className="w-32 h-32 rounded-full object-cover" />
                            ) : (
                              <span className="text-4xl font-bold text-text-muted">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-text-primary mb-1">{member.name}</h3>
                          <p className="text-sm text-orange font-medium mb-3">{member.role}</p>
                          <p className="text-sm text-text-secondary leading-relaxed mb-4">{member.bio}</p>
                          <div className="flex items-center justify-center gap-3">
                            {member.linkedin && (
                              <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-orange transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              </a>
                            )}
                            {member.github && (
                              <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-orange transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                              </a>
                            )}
                            {member.twitter && (
                              <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-orange transition-colors">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">Our Mission</h2>
                <div className="space-y-4 text-text-secondary leading-relaxed">
                  <p className="text-base">
                    At Voxlate, our mission is to eliminate language barriers and make communication seamless, accessible, and inclusive for everyone.
                  </p>
                  <p className="text-base">
                    We believe that language should never be a barrier to connecting with others. Whether you&apos;re a business expanding globally, a student learning a new language, or a traveler exploring a new country, Voxlate is here to help you communicate naturally and authentically.
                  </p>
                  <p className="text-base">
                    Our AI-powered platform preserves not just words, but the speaker&apos;s natural voice, tone, and emotion—making every conversation feel genuine and personal.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

