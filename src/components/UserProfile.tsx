import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Languages, 
  Bell, 
  CreditCard,
  Heart
} from 'lucide-react';
import { getTelegramUser, triggerHaptic } from '../services/telegram';

interface UserProfileProps {
  onResetApp: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onResetApp }) => {
  const user = getTelegramUser();
  const [lang, setLang] = useState<'uz' | 'ru' | 'en'>('uz');
  const [notifications, setNotifications] = useState(true);

  // Health profile state (mock)
  const [age, setAge] = useState(52);
  const [bloodType, setBloodType] = useState('A+ (II)');
  const [conditions, setConditions] = useState(['Type 2 Diabetes', 'Hypertension']);

  const handleLangChange = (newLang: 'uz' | 'ru' | 'en') => {
    triggerHaptic('light');
    setLang(newLang);
  };

  const toggleNotifications = () => {
    triggerHaptic('light');
    setNotifications(!notifications);
  };

  const handleSupportClick = () => {
    triggerHaptic('medium');
    alert("Support bot: @osonmed_support_bot");
  };

  return (
    <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }} className="animate-slide-up">
      {/* Profile Header Card */}
      <div className="card" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '1.25rem',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
        border: '1px solid var(--panel-border)',
        marginBottom: '1.25rem'
      }}>
        <div style={{ position: 'relative' }}>
          {user?.photo_url ? (
            <img 
              src={user.photo_url} 
              alt={user.first_name} 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} 
            />
          ) : (
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff',
              fontSize: '1.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              border: '2px solid var(--color-primary)'
            }}>
              {user?.first_name ? user.first_name[0] : 'U'}
            </div>
          )}
        </div>
        
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
            {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User Profile'}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
            {user?.username ? `@${user.username}` : 'OsonMed Patient'}
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            color: 'var(--color-primary)', 
            background: 'rgba(37, 99, 235, 0.1)', 
            padding: '2px 6px', 
            borderRadius: '6px',
            display: 'inline-block',
            marginTop: '6px',
            fontWeight: 600
          }}>
            ID: {user ? user.id : '12345678'}
          </span>
        </div>
      </div>

      {/* Chronic Disease / Health Profile Card */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '14px' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Heart size={14} style={{ color: 'var(--color-danger)' }} /> 
          Health Profile (Chronic Patient Card)
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Age</span>
            <span style={{ fontWeight: 600 }}>{age} years</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '6px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Blood Group</span>
            <span style={{ fontWeight: 600 }}>{bloodType}</span>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Chronic Conditions</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {conditions.map((cond, idx) => (
                <span 
                  key={idx} 
                  style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    color: 'var(--color-danger)', 
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    padding: '3px 8px', 
                    borderRadius: '12px',
                    fontWeight: 600
                  }}
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Options List */}
      <div className="card" style={{ padding: '8px 12px', marginBottom: '1.25rem' }}>
        
        {/* Language Selector */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Languages size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Language</span>
          </div>
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '2px', borderRadius: '8px' }}>
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => handleLangChange(l)}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  background: lang === l ? 'var(--color-primary)' : 'transparent',
                  color: lang === l ? '#fff' : 'var(--text-muted)',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 0',
          borderBottom: '1px solid rgba(255,255,255,0.04)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Telegram Notifications</span>
          </div>
          <button 
            onClick={toggleNotifications}
            style={{
              width: '38px',
              height: '20px',
              borderRadius: '10px',
              background: notifications ? 'var(--color-primary)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.3s ease'
            }}
          >
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '2px',
              left: notifications ? '20px' : '2px',
              transition: 'left 0.3s ease'
            }} />
          </button>
        </div>

        {/* Saved Cards */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 0',
          cursor: 'pointer'
        }}
        onClick={() => { triggerHaptic('light'); alert("Mock Payment System - UZS cards saved."); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Saved Cards</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.75rem' }}>Uzcard / Humo</span>
            <ChevronRight size={14} />
          </div>
        </div>

      </div>

      {/* Support & Security */}
      <div className="card" style={{ padding: '8px 12px', marginBottom: '1.5rem' }}>
        
        {/* Help & Support */}
        <div 
          onClick={handleSupportClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Help &amp; Support</span>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Privacy Policy */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 0',
          cursor: 'pointer'
        }}
        onClick={() => { triggerHaptic('light'); alert("OsonMed Privacy Policy - All health data is encrypted locally."); }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={16} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Privacy Policy</span>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </div>

      </div>

      {/* Reset App / Dev options */}
      <button 
        onClick={() => {
          triggerHaptic('heavy');
          if (confirm("Reset application state? This will clear current booking and basket.")) {
            onResetApp();
          }
        }}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
      >
        <LogOut size={16} /> Reset Active Booking Data
      </button>
    </div>
  );
};
