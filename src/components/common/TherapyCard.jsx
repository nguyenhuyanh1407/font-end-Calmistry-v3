import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa'; // Import thêm icon này
const TherapyCard = ({
  item,
  index,
  expandedIndex,
  hoveredIndex,
  onToggle,
  onMouseEnter,
  onMouseLeave
}) => {
  const isCardActive = expandedIndex === index || hoveredIndex === index;

  return (
    <div className="col-12 col-md-4" style={{ maxWidth: '400px' }}>
      <div
        className={`therapy-card therapy-card-${index} ${expandedIndex === index ? 'active' : ''}`}
        onClick={() => onToggle(index)}
        onMouseEnter={() => onMouseEnter(index)}
        onMouseLeave={() => onMouseLeave()}
        style={{
          backgroundColor: item.bgColor,
          color: item.textColor,
          borderRadius: '16px',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '380px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          position: 'relative',
          zIndex: 2,
          transition: 'all 0.3s ease'
        }}
      >
        <div className="p-4">
          <h2 className="fw-bold fs-2 mb-1" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>{item.title}</h2>
          <div className="d-flex align-items-center opacity-90 mt-2">
            <span className="fs-6" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '1.725rem' }}>{item.desc}</span>
            {/* Thêm wrapper vòng tròn ở đây */}
            <span className={`arrow-circle-wrapper ${expandedIndex === index ? 'active' : ''}`}>
              <FaArrowRight className={`transition-arrow ${expandedIndex === index ? 'rotate-90' : ''}`} />
            </span>
          </div>
        </div>

        <div className="mt-auto overflow-hidden" style={{ position: 'relative', height: '220px' }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={isCardActive ? 'active' : 'default'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={isCardActive ? item.activeImg : item.img}
              alt="Therapy"
              className="w-100 h-100"
              style={{ display: 'block', objectFit: 'cover' }}
            />
          </AnimatePresence>
        </div>
      </div>

      <div className={`sub-cards-container ${expandedIndex === index ? 'show' : ''}`}>
        <div className="pt-3">
          {item.subOptions.map((sub, sIdx) => (
            <div
              key={sIdx}
              className={`sub-card-item sub-card-item-${index}-${sIdx} mb-2 p-3 d-flex align-items-center justify-content-between`}
              onClick={(e) => {
                e.stopPropagation();
                sub.action && sub.action();
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
                transitionDelay: `${sIdx * 0.1}s`
              }}
            >
              <span className="fs-6 fw-medium" style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontSize: '1.725rem' }}>{sub.title}</span>
              <span className="fs-4">{sub.icon}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TherapyCard;
