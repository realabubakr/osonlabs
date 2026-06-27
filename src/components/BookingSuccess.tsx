import React, { useEffect, useState } from 'react';
import type { BookingDetails } from './BookingForm';
import { 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Sparkles, 
  Share2, 
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { triggerHaptic, hideMainButton } from '../services/telegram';

interface BookingSuccessProps {
  details: BookingDetails;
  onReset: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({ details, onReset }) => {
  const [countdownText, setCountdownText] = useState('');

  // Hide Telegram MainButton when success screen loads
  useEffect(() => {
    hideMainButton();
    triggerHaptic('success');

    // Simulate counting down to the phlebotomy visit
    const updateCountdown = () => {
      // Hardcoded countdown simulation for demo purposes
      setCountdownText("15 hours 42 minutes");
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Phlebotomist details for high fidelity
  const phlebotomist = {
    name: "Marcus Vance, CPT-1",
    rating: 4.9,
    experience: "5+ years",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200",
    badgeNumber: "CPT-98204"
  };

  const handleShare = () => {
    triggerHaptic('light');
    const shareText = `🩸 Just booked an at-home blood collection through PulseMarket!\n🏥 Lab: ${details.labName}\n📅 Date: ${details.date} during ${details.timeSlot}\n💳 Total Price: $${details.totalCost.toFixed(2)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My PulseMarket Booking',
        text: shareText,
      }).catch(err => console.log('Share error:', err));
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert("Booking details copied to clipboard!");
    }
  };

  return (
    <div style={{ padding: '1.25rem' }} className="animate-slide-up">
      {/* Animated Success Checkmark Header */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1.5rem 0',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          {/* Pulse Ripple */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            right: '-6px',
            bottom: '-6px',
            borderRadius: '50%',
            background: 'var(--color-success)',
            opacity: 0.2,
            animation: 'pulse 2s infinite'
          }} />
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-success)'
          }}>
            <CheckCircle2 size={36} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Booking Confirmed!
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
          <Sparkles size={12} /> Appointment is secured
        </p>
      </div>

      {/* Countdown Panel */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(15, 23, 42, 0.3) 100%)',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        textAlign: 'center',
        padding: '14px',
        marginBottom: '1rem'
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Estimated Arrival Window
        </span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
          {countdownText}
        </h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Phlebotomist is scheduled for {details.date}
        </span>
      </div>

      {/* Assigned Phlebotomist Info Card */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Assigned Mobile Phlebotomist
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)', flexShrink: 0 }}>
            <img src={phlebotomist.avatar} alt={phlebotomist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h5 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{phlebotomist.name}</h5>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
              Rating: {phlebotomist.rating} ★ | {phlebotomist.experience} exp
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
              License: {phlebotomist.badgeNumber}
            </span>
          </div>
          <a 
            href={`tel:${details.phone}`}
            onClick={() => triggerHaptic('light')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--panel-border)',
              borderRadius: '50%',
              padding: '10px',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Phone size={16} />
          </a>
        </div>
      </div>

      {/* Booking Details Checklist */}
      <div className="card" style={{ padding: '14px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.15)' }}>
        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '6px' }}>
          Summary Checklist
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <User size={14} style={{ marginTop: '2px', color: 'var(--text-muted)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Patient: </span>
              <span style={{ fontWeight: 600 }}>{details.patientName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <Calendar size={14} style={{ marginTop: '2px', color: 'var(--text-muted)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Date & Slot: </span>
              <span style={{ fontWeight: 600 }}>{details.date} ({details.timeSlot})</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <MapPin size={14} style={{ marginTop: '2px', color: 'var(--text-muted)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Location: </span>
              <span style={{ fontWeight: 600 }}>{details.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <TrendingUp size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Lab Partner: </span>
              <span style={{ fontWeight: 600 }}>{details.labName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.03)', fontSize: '0.85rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-primary)' }}>Total Paid (Simulated)</span>
            <span style={{ color: 'var(--color-primary)', fontSize: '1rem' }}>${details.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handleShare}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontSize: '0.95rem' }}
        >
          <Share2 size={16} /> Share Appointment
        </button>

        <button 
          onClick={() => {
            triggerHaptic('medium');
            onReset();
          }}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Scan New Prescription
        </button>
      </div>
    </div>
  );
};
