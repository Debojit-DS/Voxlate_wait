"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  HeartHandshake,
  Star,
  User,
  Quote,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { apiRequest } from "@/lib/apiClient";

// Predefined avatar options
const predefinedAvatars = [
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=8",
  "https://i.pravatar.cc/150?img=7",
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=33",
];

export interface TestimonialData {
  name: string;
  country: string;
  type: string;
  avatar: string;
  feedback: string;
  rating: number;
}

interface DbReview {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  text: string;
  rating: number;
  createdAt: string;
}

const defaultTestimonials: TestimonialData[] = [
  {
    name: "Alex R.",
    country: "Global Team Lead",
    type: "Team Lead",
    avatar: "https://i.pravatar.cc/150?img=11",
    feedback:
      "Voxlate made cross-language team standups feel effortless. Preserving everyone's natural voice and cadence changed how our distributed team communicates.",
    rating: 5,
  },
  {
    name: "Sarah L.",
    country: "International Consultant",
    type: "Consultant",
    avatar: "https://i.pravatar.cc/150?img=5",
    feedback:
      "Speaking in my own language while overseas partners hear my exact vocal warmth and tone in English builds immediate trust in client meetings.",
    rating: 5,
  },
  {
    name: "Daniel K.",
    country: "Software Architect",
    type: "Engineer",
    avatar: "https://i.pravatar.cc/150?img=3",
    feedback:
      "Zero awkward bot invites or extra links. Routing audio directly into Zoom and Google Meet makes integration completely frictionless.",
    rating: 5,
  },
  {
    name: "Priya M.",
    country: "Product Designer",
    type: "Designer",
    avatar: "https://i.pravatar.cc/150?img=9",
    feedback:
      "The voice preservation blew me away. In client design critiques, vocal inflection and emotional nuances carry essential context that robots always erased.",
    rating: 5,
  },
  {
    name: "Ethan C.",
    country: "Business Development",
    type: "Enterprise",
    avatar: "https://i.pravatar.cc/150?img=8",
    feedback:
      "Unlike monotone robotic translators, Voxlate retains the speaker's true personality. It is night and day for cross-border executive negotiations.",
    rating: 5,
  },
  {
    name: "Maya T.",
    country: "Travel Creator",
    type: "Traveler",
    avatar: "https://i.pravatar.cc/150?img=7",
    feedback:
      "The wearable concept and real-time translation is a dream for global travel. Communicating face-to-face without language barriers feels like the future.",
    rating: 5,
  },
  {
    name: "Jordan W.",
    country: "Community Director",
    type: "Community",
    avatar: "https://i.pravatar.cc/150?img=12",
    feedback:
      "Secure, private, and genuinely intuitive. Voxlate feels like breaking down barriers that separated our multilingual community members for years.",
    rating: 5,
  },
  {
    name: "Elena R.",
    country: "Customer Operations Lead",
    type: "Support",
    avatar: "https://i.pravatar.cc/150?img=33",
    feedback:
      "In sensitive customer support calls, tone is everything. Preserving empathy and genuine human cadence across languages transforms the service experience.",
    rating: 5,
  },
];

const avatars = [
  {
    imageUrl: "https://avatars.githubusercontent.com/u/170235967?v=4",
    profileUrl: "https://github.com/BikramMondal5",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/20110627",
    profileUrl: "https://github.com/tomonarifeehan",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/106103625",
    profileUrl: "https://github.com/BankkRoll",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59228569",
    profileUrl: "https://github.com/safethecode",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/59442788",
    profileUrl: "https://github.com/sanjay-mali",
  },
  {
    imageUrl: "https://avatars.githubusercontent.com/u/89768406",
    profileUrl: "https://github.com/itsarghyadas",
  },
];

function AvatarCircles({
  numPeople,
  avatarUrls,
}: {
  numPeople: number;
  avatarUrls: { imageUrl: string; profileUrl: string }[];
}) {
  return (
    <div className="flex items-center justify-center -space-x-3">
      {avatarUrls.map((avatar, idx) => (
        <a
          key={idx}
          href={avatar.profileUrl}
          target="_blank"
          rel="noreferrer"
          className="h-10 w-10 rounded-full border-2 border-surface overflow-hidden hover:z-10 transition-transform hover:scale-110 shadow-xs"
        >
          <img
            src={avatar.imageUrl}
            alt="Community member"
            className="h-full w-full object-cover"
          />
        </a>
      ))}
      {numPeople > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-surface bg-primary text-xs font-semibold text-white shadow-xs">
          +{numPeople}
        </div>
      )}
    </div>
  );
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(defaultTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    occupation: "",
    primaryUse: "",
    frequency: "",
    feedback: "",
    rating: 5,
    favoriteFeature: "",
    allowPublic: false,
    avatar: null as string | null,
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch live reviews from the database (the exact same endpoint used in /demo)
  const fetchDbReviews = useCallback(async () => {
    try {
      const res = await apiRequest("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.reviews) && data.reviews.length > 0) {
          const mapped: TestimonialData[] = data.reviews.map((rev: DbReview, idx: number) => ({
            name: rev.authorName || "Verified User",
            country: "Verified Tester",
            type: "Demo User",
            avatar:
              rev.authorPhotoUrl ||
              predefinedAvatars[idx % predefinedAvatars.length],
            feedback: rev.text,
            rating: typeof rev.rating === "number" ? rev.rating : 5,
          }));
          setTestimonials(mapped);
          return;
        }
      }
      // If DB has no records yet or endpoint is not reachable, retain defaultTestimonials
    } catch {
      // In case unable to load fetched DB data, gracefully fallback to default hardcoded testimonials
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void fetchDbReviews(), 0);
    return () => clearTimeout(timer);
  }, [fetchDbReviews]);

  // Ensure rows have enough items for continuous seamless marquee looping
  const ensureMinLength = (items: TestimonialData[]): TestimonialData[] => {
    if (items.length === 0) return testimonials;
    let list = [...items];
    while (list.length < 4) {
      list = [...list, ...items];
    }
    return list;
  };

  const row1Testimonials = testimonials.filter((_, i) => i % 2 === 0);
  const row2Testimonials = testimonials.filter((_, i) => i % 2 !== 0);

  const row1All = [
    ...ensureMinLength(row1Testimonials),
    ...ensureMinLength(row1Testimonials),
  ];
  const row2All = [
    ...ensureMinLength(row2Testimonials.length ? row2Testimonials : row1Testimonials),
    ...ensureMinLength(row2Testimonials.length ? row2Testimonials : row1Testimonials),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      text: formData.feedback.trim(),
      rating: formData.rating,
      authorName: formData.name.trim(),
      authorPhotoUrl: formData.avatar || null,
    };

    try {
      const response = await apiRequest("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.status === "success" && data.review) {
          const newEntry: TestimonialData = {
            name: data.review.authorName || payload.authorName,
            country: formData.occupation || "Verified Tester",
            type: "Demo User",
            avatar:
              data.review.authorPhotoUrl ||
              payload.authorPhotoUrl ||
              predefinedAvatars[0],
            feedback: data.review.text || payload.text,
            rating: data.review.rating || payload.rating,
          };
          setTestimonials((prev) => [newEntry, ...prev]);

          setStatusMessage({
            type: "success",
            message:
              "Thank you! Your feedback has been saved to the database.",
          });
          setFormData({
            name: "",
            occupation: "",
            primaryUse: "",
            frequency: "",
            feedback: "",
            rating: 5,
            favoriteFeature: "",
            allowPublic: false,
            avatar: null,
          });
          setSelectedAvatar(null);
          setCustomImage(null);

          setTimeout(() => {
            setIsModalOpen(false);
            setStatusMessage(null);
          }, 1800);
          return;
        }
      }
      throw new Error("API post rejected or offline");
    } catch {
      // Client fallback in case DB is unreachable
      const fallbackEntry: TestimonialData = {
        name: formData.name || "Anonymous",
        country: formData.occupation || "Community Tester",
        type: formData.primaryUse || "Early Tester",
        avatar:
          formData.avatar ||
          `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 12 + 1)}`,
        feedback: formData.feedback,
        rating: formData.rating,
      };
      if (formData.allowPublic) {
        setTestimonials((prev) => [fallbackEntry, ...prev]);
      }
      setStatusMessage({
        type: "success",
        message:
          "Thank you! Your feedback helps us shape a world without language limits.",
      });
      setTimeout(() => {
        setIsModalOpen(false);
        setStatusMessage(null);
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative w-full z-10 border-t border-line bg-mist/40 pt-16 pb-20 overflow-hidden"
    >
      {/* Header */}
      <div className="page-container flex flex-col items-center text-center">
        {/* Tag / Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-xs mb-4">
          <HeartHandshake size={14} className="text-primary shrink-0" aria-hidden="true" />
          <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.16em] text-primary">
            VOICES OF VOXLATE
          </span>
        </div>

        {/* Heading */}
        <h2
          id="testimonials-heading"
          className="font-display text-[34px] sm:text-[42px] md:text-[50px] leading-[1.08] text-ink font-normal tracking-tight mb-4"
        >
          Real Voices. Real Connections.
        </h2>

        {/* Sub-heading */}
        <p className="mt-1 text-[16px] sm:text-[18px] md:text-[19px] leading-relaxed text-slate max-w-[64ch] mx-auto mb-6">
          Discover how Voxlate is bringing people closer across language barriers. Hear from the people helping shape a world without language limits.
        </p>

        {/* Avatars Circles */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <AvatarCircles numPeople={45} avatarUrls={avatars} />
        </div>
      </div>

      {/* Sliding testimonials marquee (2 rows) */}
      <div className="relative overflow-hidden w-full py-4 mb-10 flex flex-col gap-6">
        {/* Gradient edge fades - strictly matching theme page background */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-page via-page/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-page via-page/80 to-transparent z-10" />

        {/* Row 1: Sliding Left */}
        <div
          className="flex animate-marquee hover:pause-marquee"
          style={{ width: "max-content" }}
        >
          {row1All.map((testimonial, index) => (
            <div
              key={`row1-${index}`}
              className="px-3 sm:px-4 flex-shrink-0"
              style={{ width: "420px" }}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>

        {/* Row 2: Sliding Right */}
        <div
          className="flex animate-marquee-reverse hover:pause-marquee"
          style={{ width: "max-content" }}
        >
          {row2All.map((testimonial, index) => (
            <div
              key={`row2-${index}`}
              className="px-3 sm:px-4 flex-shrink-0"
              style={{ width: "420px" }}
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-12 px-7 rounded-full bg-primary text-white hover:bg-primary-hover font-semibold text-[15px] transition-all duration-200 shadow-xs hover:-translate-y-0.5 cursor-pointer"
        >
          Share Your Experience
        </button>
      </div>

      {/* Lightweight Modal */}
      {isModalOpen &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
            <div className="relative w-full max-w-[550px] max-h-[85vh] bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col text-left">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setStatusMessage(null);
                }}
                className="absolute top-5 right-5 text-slate hover:text-ink font-semibold text-lg cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="flex flex-col gap-1 mb-5 pr-6">
                <h3 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-primary shrink-0" />
                  Share Your Voxlate Experience
                </h3>
                <p className="text-slate text-sm">
                  Tell us how natural voice translation could change how you connect. Your feedback helps shape future releases.
                </p>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-4">
                {statusMessage && (
                  <div
                    className={`p-4 rounded-xl border ${statusMessage.type === "success"
                        ? "bg-success-tint border-success/30 text-success"
                        : "bg-danger-tint border-danger/30 text-danger"
                      } flex items-center gap-3`}
                  >
                    <p className="font-medium text-sm">{statusMessage.message}</p>
                  </div>
                )}

                {!statusMessage && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-ink">
                        Overall Rating <span className="text-primary">*</span>
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, rating: star })
                            }
                            className="transition-transform hover:scale-110 cursor-pointer"
                          >
                            <Star
                              className={`h-7 w-7 ${star <= formData.rating
                                  ? "fill-primary text-primary"
                                  : "fill-none text-line hover:text-slate"
                                }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-ink">
                        Profile Image
                      </label>

                      <div className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-2xl border border-line bg-mist/60 overflow-hidden flex items-center justify-center">
                          {customImage || selectedAvatar ? (
                            <img
                              src={customImage || selectedAvatar || ""}
                              alt="Avatar Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-slate mb-2">
                            Choose from avatars or upload your own
                          </p>
                          <div className="flex gap-2">
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      const base64String = reader.result as string;
                                      setCustomImage(base64String);
                                      setFormData({
                                        ...formData,
                                        avatar: base64String,
                                      });
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-mist/80 border border-line hover:bg-mist transition-colors text-primary text-xs font-semibold">
                                <Upload className="w-3.5 h-3.5" />
                                Upload Image
                              </div>
                            </label>
                            {customImage && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomImage(null);
                                  setFormData({
                                    ...formData,
                                    avatar: selectedAvatar,
                                  });
                                }}
                                className="px-3 py-1.5 text-xs rounded-lg border border-danger/20 bg-danger-tint text-danger font-semibold cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {!customImage && (
                        <div>
                          <p className="text-[10px] text-slate uppercase tracking-wider mb-2 font-medium">
                            Or choose an avatar:
                          </p>
                          <div className="grid grid-cols-8 gap-2">
                            {predefinedAvatars.map((avatar, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setSelectedAvatar(avatar);
                                  setFormData({ ...formData, avatar });
                                }}
                                className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 cursor-pointer ${selectedAvatar === avatar
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-line hover:border-slate"
                                  }`}
                              >
                                <img
                                  src={avatar}
                                  alt={`Avatar ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="name" className="text-xs font-semibold text-ink">
                        Your Name <span className="text-primary">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="w-full px-3 py-2 bg-mist/30 border border-line rounded-xl text-ink placeholder:text-slate/60 focus:outline-none focus:border-primary text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="occupation"
                        className="text-xs font-semibold text-ink"
                      >
                        Occupation <span className="text-primary">*</span>
                      </label>
                      <select
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            occupation: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select your occupation</option>
                        <option value="Working Professional">Working Professional</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Business Owner">Business Owner</option>
                        <option value="Student">Student</option>
                        <option value="Content Creator">Content Creator</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="primaryUse"
                        className="text-xs font-semibold text-ink"
                      >
                        Primary Use Case <span className="text-primary">*</span>
                      </label>
                      <select
                        id="primaryUse"
                        value={formData.primaryUse}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            primaryUse: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select primary use case</option>
                        <option value="Remote Team Meetings">Remote Team Meetings</option>
                        <option value="Cross-Border Business">Cross-Border Business</option>
                        <option value="Multilingual Customer Support">Multilingual Customer Support</option>
                        <option value="International Travel">International Travel</option>
                        <option value="Family & Personal Conversations">Family & Personal Conversations</option>
                        <option value="Academic Collaboration">Academic Collaboration</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="frequency"
                        className="text-xs font-semibold text-ink"
                      >
                        How often do you need voice translation?{" "}
                        <span className="text-primary">*</span>
                      </label>
                      <select
                        id="frequency"
                        value={formData.frequency}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            frequency: e.target.value,
                          })
                        }
                        required
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select frequency</option>
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Occasionally">Occasionally</option>
                        <option value="This is my first time">This is my first time</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="favoriteFeature"
                        className="text-xs font-semibold text-ink"
                      >
                        Favorite Planned Feature{" "}
                        <span className="text-slate font-normal">(Optional)</span>
                      </label>
                      <select
                        id="favoriteFeature"
                        value={formData.favoriteFeature}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            favoriteFeature: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-surface border border-line rounded-xl text-ink focus:outline-none focus:border-primary text-sm"
                      >
                        <option value="">Select a feature</option>
                        <option value="Natural Voice Preservation">Natural Voice Preservation</option>
                        <option value="No-Bot Direct Meeting Integration">No-Bot Direct Meeting Integration</option>
                        <option value="Hardware Wearable Concept">Hardware Wearable Concept</option>
                        <option value="Emotion & Tone Preservation">Emotion & Tone Preservation</option>
                        <option value="Enterprise Privacy & Security">Enterprise Privacy & Security</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="feedback"
                        className="text-xs font-semibold text-ink"
                      >
                        Share Your Experience <span className="text-primary">*</span>
                      </label>
                      <textarea
                        id="feedback"
                        placeholder="Tell us what excites you about Voxlate or how voice preservation would help you communicate across languages."
                        value={formData.feedback}
                        onChange={(e) =>
                          setFormData({ ...formData, feedback: e.target.value })
                        }
                        required
                        rows={3}
                        className="w-full px-3 py-2 bg-mist/30 border border-line rounded-xl text-ink placeholder:text-slate/60 focus:outline-none focus:border-primary text-sm resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input
                        id="allowPublic"
                        type="checkbox"
                        checked={formData.allowPublic}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            allowPublic: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded border-line text-primary focus:ring-primary cursor-pointer"
                      />
                      <label
                        htmlFor="allowPublic"
                        className="text-xs font-medium text-slate cursor-pointer"
                      >
                        I agree to let Voxlate display my feedback publicly.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 rounded-full bg-primary text-white hover:bg-primary-hover font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Marquee Keyframes */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marquee-reverse {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-marquee {
              animation: marquee 35s linear infinite;
            }
            .animate-marquee:hover,
            .pause-marquee:hover {
              animation-play-state: paused;
            }
            .animate-marquee-reverse {
              animation: marquee-reverse 35s linear infinite;
            }
            .animate-marquee-reverse:hover {
              animation-play-state: paused;
            }
          `,
        }}
      />
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: TestimonialData }) {
  return (
    <div
      className="relative group transition-all duration-300 h-full border border-line/80 bg-surface shadow-[0_2px_12px_rgba(24,43,58,0.04)] hover:shadow-[0_8px_24px_rgba(24,43,58,0.08)] hover:-translate-y-1 rounded-3xl overflow-hidden text-left flex flex-col justify-between"
      style={{ minHeight: "270px" }}
    >
      {/* Decorative quote icon */}
      <div className="absolute top-0 right-0 p-6 text-primary/15 group-hover:text-primary/30 transition-colors pointer-events-none">
        <Quote className="w-12 h-12 rotate-180" aria-hidden="true" />
      </div>

      <div className="p-7 flex flex-col h-full relative z-10 justify-between flex-grow">
        <div>
          {/* Header row: avatar, name, subtitle */}
          <div className="flex items-center space-x-3.5 mb-5">
            {testimonial.avatar ? (
              <div className="relative shrink-0">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-13 h-13 rounded-2xl border border-line/80 object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-surface" />
              </div>
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-mist flex items-center justify-center border border-line shrink-0">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h4 className="font-bold text-ink text-[17px] tracking-tight leading-snug">
                {testimonial.name}
              </h4>
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {testimonial.country}
              </p>
            </div>
          </div>

          {/* Feedback quote */}
          <p className="text-slate text-[15px] leading-relaxed text-pretty flex-grow mb-5 group-hover:text-ink transition-colors italic">
            &quot;{testimonial.feedback}&quot;
          </p>
        </div>

        {/* Footer row: stars and pill badge */}
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-line/60">
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${star <= (testimonial.rating || 5)
                    ? "fill-primary text-primary"
                    : "fill-none text-line"
                  }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-mist/80 text-slate border border-line group-hover:border-primary/40 group-hover:text-primary transition-all">
            {testimonial.type}
          </span>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsSection;
