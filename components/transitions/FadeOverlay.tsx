"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePageTransition } from "./PageTransitionProvider";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const transitionConfig = {
  duration: 1.2,
  ease: "easeInOut" as const,
};

export function FadeOverlay() {
  const { isTransitioning, finishTransition } = usePageTransition();

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#030712]"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transitionConfig}
          onAnimationComplete={() => finishTransition()}
        />
      )}
    </AnimatePresence>
  );
}
