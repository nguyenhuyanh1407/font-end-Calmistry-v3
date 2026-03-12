import React from 'react';
import FadeInUp from '../ui/FadeInUp';

const StatsSection = ({ stats, statsBg }) => {
  return (
    <section style={{ backgroundColor: statsBg, color: '#324d3e', padding: '120px 0' }}>
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-11 col-lg-5 mb-5 mb-lg-0">
            <FadeInUp>
              <div className="position-relative">
                <div style={{ position: 'absolute', top: '-40px', left: '0' }}>
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                    <line x1="20" y1="50" x2="0" y2="50" stroke="#397a4a" strokeWidth="3" />
                    <line x1="25" y1="25" x2="10" y2="10" stroke="#397a4a" strokeWidth="3" />
                    <line x1="50" y1="20" x2="50" y2="0" stroke="#397a4a" strokeWidth="3" />
                  </svg>
                </div>
                <h2 className="display-4 mb-4" style={{ fontWeight: '300', lineHeight: '1.2', letterSpacing: '-1px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Chăm sóc sức khỏe tinh thần <br /> Mọi lúc, mọi nơi. <br />
                  <span style={{ color: '#397a4a', fontWeight: '400' }}>100% online.</span>
                </h2>
              </div>
            </FadeInUp>
          </div>

          <div className="col-11 col-lg-6 offset-lg-1">
            <div className="brand-statement-list">
              {stats.map((item, i) => (
                <FadeInUp key={i} delay={i * 0.1}>
                  <div className="statement-item mb-4 pb-4" style={{ borderBottom: i < stats.length - 1 ? '1px solid rgba(50, 77, 62, 0.1)' : 'none' }}>
                    <div className="d-flex align-items-start gap-3">
                      <div className="mt-1" style={{ color: '#397a4a' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <p className="fs-4 mb-0 fw-medium" style={{ color: '#324d3e', lineHeight: '1.4', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                        {item.label || item}
                      </p>
                    </div>
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
