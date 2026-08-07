import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";

const SITUATIONS = [
  { label: "Tourists", src: "/images/physical/situations/tourists.png", alt: "Tourists interacting with locals on a street" },
  { label: "Students", src: "/images/physical/situations/students.png", alt: "Students collaborating at a table" },
  { label: "Business Meetings", src: "/images/physical/situations/business-meeting.png", alt: "Four people at a boardroom table in a meeting" },
  { label: "Seminars & Conferences", src: "/images/physical/situations/seminar.png", alt: "Presenter addressing a seated audience" },
  { label: "Markets & Shopping", src: "/images/physical/situations/market.png", alt: "People interacting at a market stall" },
  { label: "Travel & Airports", src: "/images/physical/situations/travel.png", alt: "Two people with luggage at an airport terminal" },
];

export function SituationsGrid() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <SectionHeading label="Built for Real-Life Situations" />
        <div className="mt-10 rounded-card bg-bg-surface-alt border border-border p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SITUATIONS.map((item) => (
              <div key={item.label} className="rounded-[12px] border border-border bg-bg-surface-alt overflow-hidden shadow-sm">
                <p className="mb-2 px-1 pt-3 text-sm font-bold text-text-primary text-center">{item.label}</p>
                <div className="rounded-b-[12px] overflow-hidden bg-white">
                  <Image src={item.src} alt={item.alt} width={200} height={200} className="w-full h-44 object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
