import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PrescriptionUpload } from './components/PrescriptionUpload';
import { LabComparison } from './components/LabComparison';
import { BookingForm } from './components/BookingForm';
import type { BookingDetails } from './components/BookingForm';
import { BookingSuccess } from './components/BookingSuccess';
import { 
  initTelegramWebApp, 
  getTelegramWebApp, 
  isTelegramWebApp, 
  triggerHaptic, 
  hideMainButton 
} from './services/telegram';
import { MyHealth } from './components/MyHealth';
import { UserProfile } from './components/UserProfile';
import { TestBasket } from './components/TestBasket';
import { Activity, Beaker, User, ArrowRight } from 'lucide-react';

type WizardStep = 'upload' | 'basket' | 'compare' | 'booking' | 'success';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('osonmed_onboarded');
    }
    return true;
  });
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'book' | 'health' | 'profile'>('book');
  const [step, setStep] = useState<WizardStep>('upload');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  // Initialize Telegram WebApp SDK
  useEffect(() => {
    initTelegramWebApp();

    if (isTelegramWebApp()) {
      // Add custom class to body for Telegram themes
      document.body.classList.add('telegram-app');
    }
  }, []);

  // Sync Telegram Native BackButton based on current step
  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp || !webApp.BackButton) return;

    const backButton = webApp.BackButton;

    const handleBackPress = () => {
      triggerHaptic('light');
      handleBackNavigation();
    };

    if (step === 'basket' || step === 'compare' || step === 'booking') {
      backButton.show();
      backButton.onClick(handleBackPress);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.offClick(handleBackPress);
    };
  }, [step]);

  const handleBackNavigation = () => {
    if (step === 'basket') {
      setStep('upload');
    } else if (step === 'compare') {
      setStep('basket');
    } else if (step === 'booking') {
      setStep('compare');
    }
  };

  const handleTestsExtracted = (tests: string[]) => {
    setSelectedTests(tests);
    setStep('basket');
  };

  const handleLabSelected = (labId: string, cost: number) => {
    setSelectedLabId(labId);
    setTotalCost(cost);
    setStep('booking');
  };

  const handleBookingSubmitted = (details: BookingDetails) => {
    setBookingDetails(details);
    setStep('success');
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedTests([]);
    setSelectedLabId(null);
    setTotalCost(0);
    setBookingDetails(null);
    hideMainButton();
  };

  const handleRebook = (tests: string[]) => {
    setSelectedTests(tests);
    setStep('compare');
    setActiveTab('book');
  };

  // Convert current wizard step state to numerical indicator for Header
  const getStepNumber = (): number => {
    switch (step) {
      case 'upload':
      case 'basket':
        return 1;
      case 'compare': return 2;
      case 'booking': return 3;
      case 'success': return 4;
      default: return 1;
    }
  };

  const handleNextOnboarding = () => {
    triggerHaptic('light');
    if (onboardingStep < 2) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      localStorage.setItem('osonmed_onboarded', 'true');
      setShowOnboarding(false);
    }
  };

  const onboardingSlides = [
    {
      title: "Welcome to OsonMed!",
      desc: "At-home blood diagnostics marketplace for patients with chronic conditions (Diabetes, Hypertension) in Tashkent, Uzbekistan.",
      icon: "🩺"
    },
    {
      title: "Compare Lab Prices",
      desc: "Compare prices across leading laboratories (Intermed, Diyomed, Alpha) and pick the best offer. A nurse will collect samples at your home.",
      icon: "📊"
    },
    {
      title: "Biomarker Trends",
      desc: "Your biomarker test history (HbA1c, Cholesterol, TSH) is aggregated in a single interactive dashboard with visual trend lines.",
      icon: "⚡"
    }
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(8, 12, 24, 0.88)',
          backdropFilter: 'blur(20px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="card animate-slide-up" style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem 1.5rem',
            borderRadius: '24px',
            textAlign: 'center',
            maxWidth: '380px',
            boxShadow: 'var(--shadow-glow)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Slide Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.15)',
              border: '2.5px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              marginBottom: '0.5rem',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.2)'
            }} className="animate-float">
              {onboardingSlides[onboardingStep].icon}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff' }}>
              {onboardingSlides[onboardingStep].title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              {onboardingSlides[onboardingStep].desc}
            </p>

            {/* Slide Dots */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', margin: '0.5rem 0' }}>
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  style={{
                    width: onboardingStep === i ? '18px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: onboardingStep === i ? 'var(--color-primary)' : 'rgba(255,255,255,0.15)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleNextOnboarding}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', fontSize: '0.9rem', marginTop: '0.5rem' }}
            >
              {onboardingStep < 2 ? 'Next' : 'Get Started'} →
            </button>
          </div>
        </div>
      )}

      {/* App Header (contains TMA steppers and user details) */}
      {activeTab === 'book' && <Header currentStep={getStepNumber()} />}
      {activeTab === 'health' && <Header currentStep={4} />}

      {/* Main Content Pane */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 'health' && <MyHealth onRebook={handleRebook} />}
        {activeTab === 'profile' && <UserProfile onResetApp={handleReset} />}
        {activeTab === 'book' && (
          <>
            {step === 'upload' && (
              <PrescriptionUpload 
                onNext={handleTestsExtracted} 
                savedTests={selectedTests} 
                onTestsChange={setSelectedTests}
              />
            )}

            {step === 'basket' && (
              <TestBasket 
                selectedTests={selectedTests}
                onRemoveTest={(testName) => {
                  setSelectedTests(prev => prev.filter(t => t !== testName));
                }}
                onNext={() => setStep('compare')}
                onBack={() => setStep('upload')}
              />
            )}

            {step === 'compare' && (
              <LabComparison 
                selectedTests={selectedTests} 
                onSelect={handleLabSelected} 
                onBack={() => setStep('basket')}
              />
            )}

            {step === 'booking' && selectedLabId && (
              <BookingForm 
                labId={selectedLabId} 
                totalCost={totalCost} 
                onSubmit={handleBookingSubmitted} 
                onBack={() => setStep('compare')}
              />
            )}

            {step === 'success' && bookingDetails && (
              <BookingSuccess 
                details={bookingDetails} 
                onReset={handleReset} 
              />
            )}
          </>
        )}
      </main>

      {/* Floating Basket Summary Bar (Sibling in Flex Column, safe from parent transforms) */}
      {activeTab === 'book' && step === 'upload' && selectedTests.length > 0 && (
        <div style={{
          width: 'calc(100% - 32px)',
          margin: '0 16px 10px 16px',
          background: 'rgba(37, 99, 235, 0.95)', // Solid OsonMed blue
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          animation: 'slideUp 0.3s ease-out forwards',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            <span style={{ fontSize: '1.1rem' }}>🛒</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{selectedTests.length} {selectedTests.length === 1 ? 'test' : 'tests'} selected</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)' }}>Review your selected tests</span>
            </div>
          </div>
          <button
            onClick={() => setStep('basket')}
            style={{
              background: '#ffffff',
              border: 'none',
              color: 'var(--color-primary)',
              padding: '6px 14px',
              borderRadius: '10px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            View <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Floating Capsule Bottom Navigation Bar (Sibling in Flex Column, safe from parent transforms) */}
      {step !== 'booking' && step !== 'success' && (
        <div style={{
          width: 'calc(100% - 32px)',
          margin: '0 16px 16px 16px',
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '30px',
          padding: '6px 12px',
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Book Tab */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('book');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'book' ? 'var(--color-primary)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.7rem',
              padding: '6px 16px',
              borderRadius: '20px',
              background: activeTab === 'book' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              transition: 'all 0.25s ease',
              minWidth: '90px'
            }}
          >
            <Beaker size={16} />
            <span>Diagnostics</span>
          </button>

          {/* Health Tab */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('health');
              hideMainButton();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'health' ? 'var(--color-primary)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.7rem',
              padding: '6px 16px',
              borderRadius: '20px',
              background: activeTab === 'health' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              transition: 'all 0.25s ease',
              minWidth: '90px'
            }}
          >
            <Activity size={16} />
            <span>My Health</span>
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('profile');
              hideMainButton();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.7rem',
              padding: '6px 16px',
              borderRadius: '20px',
              background: activeTab === 'profile' ? 'rgba(37, 99, 235, 0.15)' : 'transparent',
              transition: 'all 0.25s ease',
              minWidth: '90px'
            }}
          >
            <User size={16} />
            <span>Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
