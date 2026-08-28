"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronDown, ChevronUp, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

type Review = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  userEmail: string | null;
  text: string;
  rating: number;
  createdAt: string;
};

function StarRating({ rating, onRatingChange, interactive = false }: { rating: number; onRatingChange?: (r: number) => void; interactive?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRatingChange?.(star)}
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            size={24}
            className={
              star <= rating
                ? "fill-[#F59E0B] text-[#F59E0B]"
                : "text-[#64748B]"
            }
          />
        </button>
      ))}
    </div>
  );
}

function timeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ReviewBanner() {
  const [isReviewSectionOpen, setIsReviewSectionOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const { user, isLoading: isAuthLoading } = useAuth();

  const sortReviews = useCallback((items: Review[]) => {
    return [...items].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, []);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await res.json();
      if (data.status === "success") {
        setReviews(sortReviews(data.reviews));
      }
    } catch (err) {
      console.error("fetch reviews error", err);
      setError("Failed to load reviews.");
    } finally {
      setIsLoading(false);
    }
  }, [sortReviews]);

  useEffect(() => {
    if (isReviewSectionOpen) {
      fetchReviews();
    }
  }, [isReviewSectionOpen, fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || rating === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: {
        text: string;
        rating: number;
        authorName?: string;
        authorPhotoUrl?: string | null;
        userEmail?: string;
      } = {
        text: reviewText.trim(),
        rating,
      };

      if (user) {
        payload.authorName = user.name;
        payload.authorPhotoUrl = user.photoUrl ?? null;
        payload.userEmail = user.email;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit review");
      }

      const data = await res.json();
      if (data.status === "success" && data.review) {
        setReviews((prev) => sortReviews([data.review, ...prev]));
        setReviewText("");
        setRating(0);
      }
    } catch (err) {
      console.error("submit review error", err);
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVerifiedUser = !!user;
  const displayName = user?.name || "";

  return (
    <section className="px-6 md:px-8 mt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-2xl border border-white/20 bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#6366F1]/60 bg-[#6366F1]/10">
                <Star className="h-6 w-6 text-[#6366F1]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Enjoying the demo?</h3>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  Get early access to Voxlate Digital and experience seamless real-time conversations in any language.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline-on-navy"
                onClick={() => setIsReviewSectionOpen(!isReviewSectionOpen)}
              >
                {isReviewSectionOpen ? (
                  <>
                    Close Reviews
                    <ChevronUp size={16} />
                  </>
                ) : (
                  <>
                    Leave a Review
                    <ChevronDown size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {isReviewSectionOpen && (
          <div className="mt-6 rounded-2xl border border-white/20 bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
            <h4 className="text-lg font-semibold text-white mb-6">Leave a Review</h4>

            <form onSubmit={handleSubmitReview} className="space-y-4 mb-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Your Name
                    {isVerifiedUser && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-[#6366F1]/60 bg-[#6366F1]/10 px-2 py-0.5 text-[10px] font-semibold text-[#6366F1]">
                        <BadgeCheck size={12} />
                        Verified Waitlist User
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => !isVerifiedUser && setReviewText(e.target.value)}
                    readOnly={isVerifiedUser}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-white/20 bg-[rgba(2,6,23,0.6)] px-4 py-2.5 text-sm text-white placeholder:text-[#64748B] outline-none transition-colors focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:opacity-70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Rating</label>
                  <div className="flex items-center gap-2">
                    <StarRating rating={rating} onRatingChange={setRating} interactive />
                    <span className="text-xs text-[#94A3B8]">
                      {rating > 0 ? `${rating}/5` : "Select rating"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Your Review</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about the demo..."
                  rows={4}
                    className="w-full rounded-lg border border-white/20 bg-[rgba(2,6,23,0.6)] px-4 py-2.5 text-sm text-white placeholder:text-[#64748B] outline-none transition-colors focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                variant="primary-navy"
                disabled={!reviewText.trim() || rating === 0 || isSubmitting || isAuthLoading}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>

            <div className="border-t border-white/20 pt-6">
              <h5 className="text-sm font-semibold text-white mb-4">
                {isLoading ? "Loading reviews..." : `${reviews.length} Review${reviews.length !== 1 ? "s" : ""}`}
              </h5>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[#94A3B8] text-center py-8">No reviews yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-white/20 bg-[rgba(30,41,59,0.5)] p-4"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#7C3AED] text-white text-xs font-bold">
                          {review.authorPhotoUrl ? (
                            <img src={review.authorPhotoUrl} alt={review.authorName} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            review.authorName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{review.authorName}</p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="text-[10px] text-[#64748B]">{timeAgo(review.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[#94A3B8] leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
