/**
 * Standardized Framer Motion Presets for HCM Lite
 * Tuned with precise, physical spring dampening (no harsh snapping or generic CSS transitions).
 */

export const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.03,
    },
  },
};

export const itemFadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 380,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

export const itemFadeLeft = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 24,
    },
  },
};

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 28,
    },
  },
};

export const cardHoverSpring = {
  rest: { y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } },
  hover: {
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: {
    scale: 0.985,
    transition: { type: "spring", stiffness: 500, damping: 25 },
  },
};

export const springLayoutTransition = {
  type: "spring",
  stiffness: 320,
  damping: 28,
};
