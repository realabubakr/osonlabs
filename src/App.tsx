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

type WizardStep = 'upload' | 'compare' | 'booking' | 'success';

function App() {
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

    if (step === 'compare') {
      backButton.show();
      backButton.onClick(handleBackPress);
    } else if (step === 'booking') {
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
    if (step === 'compare') {
      setStep('upload');
    } else if (step === 'booking') {
      setStep('compare');
    }
  };

  const handleTestsExtracted = (tests: string[]) => {
    setSelectedTests(tests);
    setStep('compare');
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

  // Convert current wizard step state to numerical indicator for Header
  const getStepNumber = (): number => {
    switch (step) {
      case 'upload': return 1;
      case 'compare': return 2;
      case 'booking': return 3;
      case 'success': return 4;
      default: return 1;
    }
  };

  return (
    <div className="app-container">
      {/* App Header (contains TMA steppers and user details) */}
      <Header currentStep={getStepNumber()} />

      {/* Main Content Pane */}
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
        {step === 'upload' && (
          <PrescriptionUpload 
            onNext={handleTestsExtracted} 
            savedTests={selectedTests} 
          />
        )}

        {step === 'compare' && (
          <LabComparison 
            selectedTests={selectedTests} 
            onSelect={handleLabSelected} 
            onBack={() => setStep('upload')}
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
      </main>
    </div>
  );
}

export default App;
