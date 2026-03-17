import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const GuestOnboarding = ({ steps, onComplete, onStepChange, onFinish }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const lastGoodRectRef = useRef(null);
  const lastGoodRectTsRef = useRef(0);

  const updateTargetRect = useCallback(() => {
    const step = steps[currentStep];
    if (!step.target) {
      setTargetRect(null);
      return;
    }
    const target = document.querySelector(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();

      // Store raw viewport coordinates to avoid sync issues with window.scrollY
      // Guard: if element is transitioning into view and has 0-size, keep last spotlight briefly.
      if (rect.width <= 1 || rect.height <= 1) {
        const age = Date.now() - (lastGoodRectTsRef.current || 0);
        if (lastGoodRectRef.current && age < 700) {
          setTargetRect(lastGoodRectRef.current);
        } else {
          setTargetRect(null);
        }
        return;
      }

      const nextRect = {
        viewportTop: rect.top,
        viewportLeft: rect.left,
        width: rect.width,
        height: rect.height,
        // Document absolute top for cases where we need it
        absTop: rect.top + window.scrollY,
      };

      lastGoodRectRef.current = nextRect;
      lastGoodRectTsRef.current = Date.now();
      setTargetRect(nextRect);
    } else {
      // When a target is temporarily missing (e.g., dropdown still opening), don't "black out" the page.
      const age = Date.now() - (lastGoodRectTsRef.current || 0);
      if (lastGoodRectRef.current && age < 700) {
        setTargetRect(lastGoodRectRef.current);
      } else {
        setTargetRect(null);
      }
    }
  }, [currentStep, steps]);

  // HANDLE SCROLLING - Trigger only once per step change or meaningful layout shift
  useEffect(() => {
    const step = steps[currentStep];
    if (step.placement === 'center') return;
    const target = document.querySelector(step.target);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const tooltipHeight = 280;
    const margin = 20;

    // Determine tooltip placement (logical duplicate of render logic)
    let isTop = step.placement === 'top';
    if (!isTop && step.placement !== 'bottom') {
      // Auto-flip logic: if bottom doesn't fit, it goes top
      if (rect.top + rect.height + margin + tooltipHeight > window.innerHeight - 20) {
        isTop = true;
      }
    }

    // Calculate the combined document-relative vertical bounds
    const topArea = isTop
      ? rect.top + window.scrollY - tooltipHeight - margin
      : rect.top + window.scrollY;

    const bottomArea = isTop
      ? rect.bottom + window.scrollY
      : rect.bottom + window.scrollY + tooltipHeight + margin;

    const totalHeight = bottomArea - topArea;

    // Ideal scroll centers this combined block
    let idealScrollTop = topArea - (window.innerHeight / 2) + (totalHeight / 2);

    // If the combined block is taller than the viewport, 
    // we must adjust to ensure the most critical part (the tooltip) is visible.
    if (totalHeight > window.innerHeight - 40) {
      if (!isTop) {
        // Tooltip is at bottom: scroll so bottom of tooltip is visible
        idealScrollTop = bottomArea - window.innerHeight + 40;
      } else {
        // Tooltip is at top: scroll so top of tooltip is visible
        idealScrollTop = topArea - 40;
      }
    }

    window.scrollTo({
      top: Math.max(0, idealScrollTop),
      behavior: 'smooth'
    });
  }, [currentStep, steps]); // Only run when step changes

  // HANDLE TRACKING - High frequency updates for smooth spotlighting
  useEffect(() => {
    updateTargetRect();

    let rafId;
    const startTime = Date.now();

    const track = () => {
      updateTargetRect();
      if (Date.now() - startTime < 1000) { // Track for 1s during transitions
        rafId = requestAnimationFrame(track);
      }
    };

    rafId = requestAnimationFrame(track);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [updateTargetRect, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (onStepChange) onStepChange(nextStep);
    } else {
      // Final step "Bắt đầu" clicked
      if (onFinish) {
        onFinish();
      } else {
        handleClose();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      if (onStepChange) onStepChange(prevStep);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('HAS_SEEN_GUEST_TOUR', 'true');
    if (onComplete) onComplete();
  };

  const [placementClass, setPlacementClass] = useState('bottom');
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!targetRect) return;

    const isMobile = window.innerWidth <= 576;
    const tooltipWidth = isMobile ? window.innerWidth - 30 : 400;
    const tooltipHeight = 280; // Estimated max height
    const margin = 15;
    const placement = step.placement || 'bottom';

    let top, left, pClass = placement;

    if (placement === 'center' || !targetRect) {
      top = (window.innerHeight - tooltipHeight) / 2;
      left = (window.innerWidth - tooltipWidth) / 2;
      pClass = 'center';
    } else if (isMobile) {
      // Mobile positioning: prefer bottom, then top, then center
      left = (window.innerWidth - tooltipWidth) / 2;

      // Try bottom first
      top = targetRect.viewportTop + targetRect.height + margin;
      pClass = 'bottom';

      // If bottom fails, try top
      if (top + tooltipHeight > window.innerHeight - 10) {
        top = targetRect.viewportTop - tooltipHeight - margin;
        pClass = 'top';
      }

      // If top also fails (off-screen top), fallback to center or stick to viewport bounds
      if (top < 10) {
        if (targetRect.viewportTop + targetRect.height / 2 > window.innerHeight / 2) {
          // Target is mostly in bottom half, put tooltip at top of viewport
          top = 10;
          pClass = 'top';
        } else {
          // Target is mostly in top half, put tooltip at bottom of viewport
          top = window.innerHeight - tooltipHeight - 10;
          pClass = 'bottom';
        }
      }
    } else if (placement === 'top') {
      top = targetRect.viewportTop - tooltipHeight - margin;
      left = Math.min(window.innerWidth - tooltipWidth - 20, Math.max(20, targetRect.viewportLeft + targetRect.width / 2 - tooltipWidth / 2));
    } else if (placement === 'right') {
      top = targetRect.viewportTop + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.viewportLeft + targetRect.width + margin;
      top = Math.min(window.innerHeight - tooltipHeight - 10, Math.max(10, top));
      if (left + tooltipWidth > window.innerWidth - 10) {
        left = targetRect.viewportLeft - tooltipWidth - margin;
        pClass = 'left';
      }
    } else if (placement === 'left') {
      top = targetRect.viewportTop + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.viewportLeft - tooltipWidth - margin;
      top = Math.min(window.innerHeight - tooltipHeight - 10, Math.max(10, top));
      if (left < 10) {
        left = targetRect.viewportLeft + targetRect.width + margin;
        pClass = 'right';
      }
    } else {
      top = targetRect.viewportTop + targetRect.height + margin;
      left = Math.min(window.innerWidth - tooltipWidth - 20, Math.max(20, targetRect.viewportLeft + targetRect.width / 2 - tooltipWidth / 2));

      if (placement !== 'bottom' && top + tooltipHeight > window.innerHeight - 20) {
        top = targetRect.viewportTop - tooltipHeight - margin;
        pClass = 'top';
      }
    }

    // FINAL SAFETY CLAMP
    setCoords({
      top: Math.max(10, Math.min(window.innerHeight - 100, top)),
      left: Math.max(10, left)
    });
    setPlacementClass(pClass);
  }, [targetRect, currentStep, steps]);

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="guest-onboarding-overlay" style={{ pointerEvents: 'auto' }}>
      {/* Spotlight effect using viewport-relative coordinates */}
      <svg className="spotlight-overlay" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.viewportLeft - 10}
                y={targetRect.viewportTop - 10}
                width={targetRect.width + 20}
                height={targetRect.height + 20}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
        />
      </svg>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`onboarding-tooltip placement-${placementClass}`}
          style={{
            top: coords.top,
            left: coords.left,
          }}
        >
          <div className="tooltip-arrow" style={{
            display: placementClass === 'center' ? 'none' : 'block',
            left: (placementClass === 'top' || placementClass === 'bottom')
              ? Math.max(10, Math.min((window.innerWidth <= 576 ? window.innerWidth - 60 : 370), (targetRect?.viewportLeft || 0) + (targetRect?.width || 0) / 2 - coords.left - 12))
              : 'auto',
            top: (placementClass === 'left' || placementClass === 'right')
              ? Math.max(10, Math.min(250, (targetRect?.viewportTop || 0) + (targetRect?.height || 0) / 2 - coords.top - 12))
              : 'auto'
          }} />

          <button className="close-tour" onClick={handleClose}>&times;</button>

          <div className="tooltip-content p-4">
            <h4 className="fw-bold mb-2" style={{ fontFamily: "'Lora', serif", color: '#e50914' }}>
              {step.title}
            </h4>
            <p className="mb-4" style={{ color: '#333', fontSize: '1rem', lineHeight: '1.5' }}>
              {step.content}
            </p>

            <div className="d-flex align-items-center justify-content-between mt-auto">
              <div className="step-progress d-flex gap-1">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`progress-dot ${i === currentStep ? 'active' : ''}`}
                  />
                ))}
              </div>

              <div className="d-flex gap-2">
                {currentStep > 0 && (
                  <button className="btn-tour-secondary" onClick={handleBack}>
                    Trước
                  </button>
                )}
                <button className="btn-tour-primary" onClick={handleNext}>
                  {currentStep === steps.length - 1 ? 'Bắt đầu' : 'Sau'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GuestOnboarding;
