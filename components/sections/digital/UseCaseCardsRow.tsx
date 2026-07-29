import { Users, User, GraduationCap } from "lucide-react";
import { UseCaseCard } from "@/components/ui/UseCaseCard";

const CARDS = [
  {
    icon: Users,
    label: "BUSINESS MEETING",
    photoSrc: "/images/use-case-business.png",
    photoAlt: "Business meeting use case",
    caption:
      "You speak in their language. They speak theirs. Close deals without language barriers.",
  },
  {
    icon: User,
    label: "FREELANCER & CLIENT",
    photoSrc: "/images/use-case-freelancer.png",
    photoAlt: "Freelancer and client use case",
    caption:
      "Work with global clients comfortably. Clear communication, better results.",
  },
  {
    icon: Users,
    label: "HR & CANDIDATE INTERVIEW",
    photoSrc: "/images/use-case-interview.png",
    photoAlt: "HR and candidate interview use case",
    caption:
      "Interview in your language. Candidate answers in theirs. Fair evaluation, no misunderstanding.",
  },
  {
    icon: GraduationCap,
    label: "STUDENT & TEACHER",
    photoSrc: "/images/use-case-student.png",
    photoAlt: "Student and teacher use case",
    caption:
      "Learn in your language, teacher teaches in theirs. Better understanding, better learning.",
  },
];

export function UseCaseCardsRow() {
  return (
    <section className="bg-bg-page py-10 md:py-12">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((card) => (
            <UseCaseCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
