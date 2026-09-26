import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Pulls its child toward the pointer while hovered, then springs back.
 *
 * The pull is proportional to the distance from the child's own centre, so the
 * element leans toward you rather than chasing the cursor — a control that
 * follows the pointer all the way stops feeling like a physical object.
 *
 * Pointer-only by nature: there is no keyboard or touch equivalent of "near
 * but not on", so this adds affordance and never carries behaviour. Under
 * reduced motion it renders its child untouched.
 */
export default function Magnetic({ children, strength = 0.35 }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  if (reduced) return children;

  const onMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
