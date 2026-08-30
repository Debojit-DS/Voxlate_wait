"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

type Review = {
  id: string;
  authorName: string;
  authorPhotoUrl: string | null;
  userEmail: string | null;
  text: string;
  rating: number;
  createdAt: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled className="cursor-default" aria-label={`${star} star${star > 1 ? "s" : ""}`}>
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

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
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (!isPaused && reviews.length > 1) {
      const interval = setInterval(() => {
        if (!carouselRef.current) return;
        const card = carouselRef.current.firstElementChild as HTMLElement | null;
        if (!card) return;
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 16;
        const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;

        if (carouselRef.current.scrollLeft >= maxScroll - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({
            left: cardWidth + gap,
            behavior: "smooth",
          });
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isPaused, reviews.length]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleScroll = () => {
      const card = container.firstElementChild as HTMLElement | null;
      if (!card) return;
      const cardWidth = card.getBoundingClientRect().width;
      const gap = 16;
      const index = Math.round(container.scrollLeft / (cardWidth + gap));
      setCurrentIndex(Math.min(index, reviews.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [reviews.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    dragStartX.current = e.pageX - carouselRef.current.offsetLeft;
    dragScrollLeft.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 2;
    carouselRef.current.scrollLeft = dragScrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="px-6 md:px-8 mt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-2xl border border-white/20 bg-[rgba(15,23,42,0.4)] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_30px_rgba(59,130,246,0.25)]">
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
            <div className="relative group">
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  setIsDragging(false);
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex-shrink-0 snap-start w-[85%] md:w-[44%] lg:w-[30%] rounded-xl border border-white/20 bg-[rgba(30,41,59,0.5)] p-4"
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

              {reviews.length > 1 && (
                <>
                  <button
                    onClick={goToPrev}
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/70"
                    aria-label="Previous review"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/70"
                    aria-label="Next review"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}

              <div className="flex justify-center gap-2 mt-4">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
