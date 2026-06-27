import React, { useState, useEffect } from 'react';
import labsData from '../data/labs.json';
import { getTelegramUser, triggerHaptic, configureMainButton, isTelegramWebApp } from '../services/telegram';
import { Calendar, Clock, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';

interface BookingFormProps {
  labId: string;
  totalCost: number;
  onSubmit: (details: BookingDetails) => void;
  onBack: () => void;
}

export interface BookingDetails {
  labName: string;
  patientName: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  totalCost: number;
}

export const BookingForm: React.FC<BookingFormProps> = ({ labId, totalCost, onSubmit, onBack }) => {
  const user = getTelegramUser();
  const lab = labsData.find(l => l.id === labId);
  const labName = lab?.name || "Selected Diagnostics";

  // Form State
  const [patientName, setPatientName] = useState(user ? `${user.first_name} ${user.last_name || ''}`.trim() : '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('8:00 AM - 10:00 AM');

  const dateOptions = ['Tomorrow', 'Day after tomorrow', 'Next Monday'];
  const timeSlots = [
    '7:00 AM - 9:00 AM',
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM'
  ];

  const isFormValid = patientName.trim() !== '' && phone.trim() !== '' && address.trim() !== '';

  // Configure Telegram MainButton
  useEffect(() => {
    if (isFormValid) {
      configureMainButton({
        text: `Confirm At-Home Booking - $${totalCost.toFixed(2)}`,
        onClick: handleConfirm,
        isVisible: true,
        isActive: true
      });
    } else {
      configureMainButton({
        text: "Please Fill Required Fields",
        onClick: () => {},
        isVisible: true,
        isActive: false // Disabled state
      });
    }
  }, [patientName, phone, address, isFormValid]);

  const handleConfirm = () => {
    if (!isFormValid) return;
    
    triggerHaptic('success');
    onSubmit({
      labName,
      patientName,
      phone,
      address,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      totalCost
    });
  };

  return (
    <div style={{ padding: '1.25rem' }} className="animate-slide-up">
      {/* Back & Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Booking Details</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Schedule sample collection visit
          </span>
        </div>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--panel-border)',
            color: 'var(--text-secondary)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          ← Offers
        </button>
      </div>

      {/* Selected Provider Summary Card */}
      <div className="card" style={{
        background: 'rgba(45, 212, 191, 0.05)',
        border: '1px solid rgba(45, 212, 191, 0.15)',
        padding: '12px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem'
      }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selected Laboratory
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 0 0' }}>{labName}</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            ${totalCost.toFixed(2)}
          </span>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>Total Package</span>
        </div>
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Patient Name */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={12} /> Patient Full Name *
            </span>
          </label>
          <input 
            type="text" 
            placeholder="Enter patient full name" 
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Contact Phone */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> Mobile Phone Number *
            </span>
          </label>
          <input 
            type="tel" 
            placeholder="e.g. +1 (555) 019-2834" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Address */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={12} /> Home Collection Address *
            </span>
          </label>
          <textarea 
            placeholder="Street address, Apt/Suite #, Zip code" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="form-input"
            style={{ minHeight: '60px', resize: 'none' }}
            required
          />
        </div>

        {/* Date Selector */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={12} /> Select Collection Date
            </span>
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {dateOptions.map(option => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedDate(option);
                }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: selectedDate === option ? '1.5px solid var(--color-primary)' : '1px solid var(--panel-border)',
                  background: selectedDate === option ? 'rgba(45, 212, 191, 0.05)' : 'rgba(0,0,0,0.15)',
                  color: selectedDate === option ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots Selector */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Select Arrival Window
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {timeSlots.map(slot => (
              <button
                key={slot}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedTimeSlot(slot);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: selectedTimeSlot === slot ? '1.5px solid var(--color-primary)' : '1px solid var(--panel-border)',
                  background: selectedTimeSlot === slot ? 'rgba(45, 212, 191, 0.05)' : 'rgba(0,0,0,0.15)',
                  color: selectedTimeSlot === slot ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Fallback button if running in normal web browser */}
      {!isTelegramWebApp() && (
        <button 
          onClick={handleConfirm}
          disabled={!isFormValid}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem', marginTop: '0.5rem' }}
        >
          Confirm At-Home Booking - ${totalCost.toFixed(2)} <CheckCircle2 size={18} />
        </button>
      )}
    </div>
  );
};
