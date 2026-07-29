import Image from "next/image";
import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillBadge } from "@/components/ui/PillBadge";

const P2E_ITEMS = [
  "Auto-connects to any Voxlate device within 2 meters",
  "No manual pairing required",
  "Ideal for tourists, shopping, offices, campuses & casual conversations",
];

const P2P_ITEMS = [
  "Connect 2 to 200 participants at once",
  "Everyone hears in their own preferred language",
  "Ask questions, reply and understand everyone in real time",
];

export function CommunicationModes() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <SectionHeading label="Communication Modes" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-card bg-bg-surface-alt border border-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-success">P2E - Person to Environment</h3>
              <PillBadge variant="success">Auto Connect within 2m</PillBadge>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-48 shrink-0 flex justify-center">
                <Image
                  src="/images/physical/modes/p2e.png"
                  alt="P2E Person to Environment mode illustration"
                  width={220}
                  height={120}
                  className="w-full max-w-[220px] h-auto object-contain"
                />
              </div>
              <div className="space-y-3 text-text-secondary text-sm">
                <p>Perfect for dynamic, one-to-one or small group conversations in daily life.</p>
                <ul className="space-y-2">
                  {P2E_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={16} className="text-success mt-0.5 shrink-0" />
                      <span className="text-text-primary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-bg-surface-alt border border-border p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">P2P - Person to Person</h3>
              <PillBadge variant="info">Connect 2 to 200 People</PillBadge>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-56 shrink-0 flex justify-center">
                <Image
                  src="/images/physical/modes/p2p.png"
                  alt="P2P Person to Person mode illustration"
                  width={260}
                  height={140}
                  className="w-full max-w-[260px] h-auto object-contain"
                />
              </div>
              <div className="space-y-3 text-text-secondary text-sm">
                <p>Designed for structured group communication like classrooms, seminars & events.</p>
                <ul className="space-y-2">
                  {P2P_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check size={16} className="text-text-primary mt-0.5 shrink-0" />
                      <span className="text-text-primary">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
