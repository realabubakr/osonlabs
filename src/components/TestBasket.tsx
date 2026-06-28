import React from 'react';
import { 
  Trash2, 
  ArrowRight, 
  Plus, 
  FileText, 
  Info
} from 'lucide-react';
import { triggerHaptic, configureMainButton } from '../services/telegram';

interface TestBasketProps {
  selectedTests: string[];
  onRemoveTest: (testName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const CORE_TESTS_INFO = [
  { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "Screen for anemia, infection, and general health status." },
  { name: "Lipid Panel", category: "Cardiovascular", likelyReason: "Check cholesterol levels, HDL, LDL, and triglycerides." },
  { name: "Thyroid Panel (TSH)", category: "Thyroid Function", likelyReason: "Investigate fatigue and thyroid hormone activity." },
  { name: "HbA1c", category: "Endocrine/Diabetes", likelyReason: "Measure average blood sugar levels over the past 3 months." },
  { name: "Metabolic Panel (CMP)", category: "Organ Function", likelyReason: "Evaluate kidney function, liver function, and electrolytes." },
  { name: "Vitamin D Test", category: "Nutrition/Bone", likelyReason: "Assess vitamin D deficiency associated with bone health." },
  { name: "Liver Function Panel", category: "Organ Function", likelyReason: "Evaluate enzyme levels, protein, and bilirubin in liver." },
  { name: "Urinalysis", category: "Renal/Urinary", likelyReason: "Check for kidney issues, infections, or diabetes indicators." }
];

export const TestBasket: React.FC<TestBasketProps> = ({ 
  selectedTests, 
  onRemoveTest, 
  onNext, 
  onBack 
}) => {

  // Configure Telegram MainButton
  React.useEffect(() => {
    if (selectedTests.length > 0) {
      configureMainButton({
        text: `Compare Laboratories (${selectedTests.length} ${selectedTests.length === 1 ? 'test' : 'tests'})`,
        onClick: onNext,
        isVisible: true,
        isActive: true
      });
    } else {
      configureMainButton({
        text: "No tests selected",
        onClick: () => {},
        isVisible: false,
        isActive: false
      });
    }
  }, [selectedTests, onNext]);

  const handleRemove = (testName: string) => {
    triggerHaptic('medium');
    onRemoveTest(testName);
  };

  const getTestDetails = (name: string) => {
    const found = CORE_TESTS_INFO.find(c => c.name.toLowerCase() === name.toLowerCase());
    return found || {
      name,
      category: "General Diagnostics",
      likelyReason: "Doctor prescribed test."
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }} className="animate-slide-up">
      {/* Scrollable Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>Selected Diagnostics</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Review your selected tests before comparing laboratory prices.
            </p>
          </div>
        </div>

        {selectedTests.length === 0 ? (
          <div className="card" style={{ 
            textAlign: 'center', 
            padding: '2.5rem 1.5rem',
            background: 'rgba(15,23,42,0.3)',
            border: '1px dashed var(--panel-border)',
            borderRadius: '16px'
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🛒</span>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No tests selected yet</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              Please go back and search for tests or scan your prescription.
            </p>
            <button 
              onClick={onBack} 
              className="btn btn-primary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              + Add Tests
            </button>
          </div>
        ) : (
          /* Tests List */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {selectedTests.map((testName, index) => {
              const details = getTestDetails(testName);
              return (
                <div 
                  key={index}
                  className="card animate-slide-up"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    margin: 0,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--panel-border)',
                    borderRadius: '14px'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '12px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {details.name}
                      </h4>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={12} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {details.likelyReason}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.62rem', 
                      background: 'rgba(37, 99, 235, 0.1)', 
                      color: 'var(--color-primary)', 
                      padding: '2px 6px', 
                      borderRadius: '6px',
                      display: 'inline-block',
                      marginTop: '6px',
                      fontWeight: 600
                    }}>
                      {details.category}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemove(testName)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-danger)',
                      cursor: 'pointer',
                      padding: '4px',
                      opacity: 0.8,
                      alignSelf: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Footer Action Buttons */}
      {selectedTests.length > 0 && (
        <div style={{ 
          padding: '12px 1.25rem', 
          borderTop: '1px solid var(--panel-border)', 
          background: 'rgba(15, 23, 42, 0.85)', 
          backdropFilter: 'blur(12px)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '10px', 
          flexShrink: 0 
        }}>
          <button 
            onClick={onNext}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.9rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700 }}
          >
            Compare Prices <ArrowRight size={16} />
          </button>

          <button 
            onClick={onBack}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Plus size={14} /> Add More Tests
          </button>
        </div>
      )}
    </div>
  );
};
