import React from 'react';
import { getTelegramUser } from '../services/telegram';
import { Activity, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentStep: number;
}

export const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const user = getTelegramUser();
  const steps = [
    { label: 'Upload', desc: 'Scan Rx' },
    { label: 'Compare', desc: 'Find Labs' },
    { label: 'Book', desc: 'At-Home Draw' }
  ];

  return (
    <header style={{
      padding: '1.25rem 1.25rem 0.75rem 1.25rem',
      background: 'rgba(15, 23, 42, 0.4)',
      borderBottom: '1px solid var(--panel-border)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Top Banner (User Profile + Branding) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            borderRadius: '10px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Activity size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
              <span className="text-gradient">Pulse</span>Market
            </h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
              <Sparkles size={8} /> Powered by Gemini
            </span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--panel-border)',
            padding: '4px 8px 4px 4px',
            borderRadius: '20px'
          }}>
            {user.photo_url ? (
              <img 
                src={user.photo_url} 
                alt={user.first_name} 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--color-secondary)',
                color: '#fff',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600
              }}>
                {user.first_name[0]}
              </div>
            )}
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
              {user.first_name}
            </span>
          </div>
        )}
      </div>

      {/* Progress Stepper */}
      {currentStep < 4 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 4px' }}>
          {/* Connector Line */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '8%',
            right: '8%',
            height: '2px',
            background: 'rgba(255, 255, 255, 0.08)',
            zIndex: 1
          }}>
            <div style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Step Nodes */}
          {steps.map((step, idx) => {
            const stepNum = idx + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;
            
            return (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                flex: 1
              }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  background: isCompleted 
                    ? 'var(--color-primary)' 
                    : isActive 
                      ? 'var(--color-secondary)' 
                      : 'rgba(15, 23, 42, 0.9)',
                  color: (isCompleted || isActive) ? '#fff' : 'var(--text-muted)',
                  border: `2px solid ${
                    isCompleted 
                      ? 'var(--color-primary)' 
                      : isActive 
                        ? 'var(--color-secondary)' 
                        : 'rgba(255,255,255,0.08)'
                  }`,
                  boxShadow: isActive ? '0 0 12px rgba(129, 140, 248, 0.4)' : 'none'
                }}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : isCompleted ? 'var(--color-primary)' : 'var(--text-muted)',
                  marginTop: '4px'
                }}>
                  {step.label}
                </span>
                <span style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  display: 'block'
                }}>
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};
