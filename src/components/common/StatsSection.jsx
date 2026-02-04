import React from 'react';
import FadeInUp from '../ui/FadeInUp';
import CountingNumber from '../ui/CountingNumber';

const StatsSection = ({ stats, statsBg, brandGreen }) => {
  return (
    <section style={{ backgroundColor: statsBg, color: '#324d3e', padding: '120px 0' }}>
      <div className="container">
        <div className="row align-items-start justify-content-center">
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
                <h2 className="display-4 mb-4" style={{ fontWeight: '300', lineHeight: '1.1', letterSpacing: '-1px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                  Chăm sóc sức khỏe tinh thần <br /> Mọi lúc, mọi nơi. <br />
                  <span style={{ color: '#397a4a', fontWeight: '400' }}>100% online.</span>
                </h2>
              </div>
            </FadeInUp>
          </div>

          <div className="col-11 col-lg-5">
            <div className="stats-list">
              {stats.map((stat, i) => (
                <div key={i} className="stat-item mb-4">
                  <h3 className="display-5 fw-bold mb-1" style={{ color: '#397a4a', letterSpacing: '-1px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>
                    <CountingNumber endValue={stat.val} />
                  </h3>
                  <p className="fs-5 mb-3 opacity-75" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>{stat.label}</p>
                  {i < stats.length - 1 && <hr style={{ borderTop: '1px solid #324d3e', opacity: '0.15', margin: '0' }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
