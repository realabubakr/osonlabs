import React, { useState, useEffect, useRef } from 'react';
import { 
  PREBAKED_PRESCRIPTIONS, 
  performGeminiOCRExtraction 
} from '../services/gemini';
import type { ExtractedLabTest } from '../services/gemini';
import { 
  Upload, 
  FileText, 
  Loader2, 
  Plus, 
  Trash2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { triggerHaptic, configureMainButton, isTelegramWebApp } from '../services/telegram';

interface PrescriptionUploadProps {
  onNext: (tests: string[]) => void;
  savedTests: string[];
}

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ onNext, savedTests }) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTests, setExtractedTests] = useState<ExtractedLabTest[]>([]);
  const [newTestName, setNewTestName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from saved tests if they exist
  useEffect(() => {
    if (savedTests.length > 0 && extractedTests.length === 0) {
      setExtractedTests(savedTests.map(name => ({
        name,
        category: "General",
        likelyReason: "Prescribed by doctor."
      })));
    }
  }, [savedTests]);

  // Configure Telegram MainButton
  useEffect(() => {
    if (extractedTests.length > 0) {
      configureMainButton({
        text: `Compare ${extractedTests.length} Lab Offers`,
        onClick: handleProceed,
        isVisible: true,
        isActive: true
      });
    } else {
      configureMainButton({
        text: "Select Prescription Note",
        onClick: () => {},
        isVisible: false,
        isActive: false
      });
    }
  }, [extractedTests]);

  const handleSelectPreset = async (presetId: string) => {
    triggerHaptic('light');
    setSelectedPreset(presetId);
    setCustomImage(null);
    setIsProcessing(true);
    
    // Simulate Gemini Processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const preset = PREBAKED_PRESCRIPTIONS.find(p => p.id === presetId);
    if (preset) {
      setExtractedTests(preset.tests);
      triggerHaptic('success');
    }
    setIsProcessing(false);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    setCustomImageName(file.name);
    setSelectedPreset(null);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setCustomImage(base64);
      setIsProcessing(true);
      
      // Perform Gemini OCR (using simulator fallback if no key)
      const results = await performGeminiOCRExtraction(base64);
      setExtractedTests(results);
      triggerHaptic('success');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim()) return;

    triggerHaptic('light');
    setExtractedTests([
      ...extractedTests,
      {
        name: newTestName.trim(),
        category: "Custom Addition",
        likelyReason: "Manually added by user."
      }
    ]);
    setNewTestName('');
    setShowAddForm(false);
  };

  const handleRemoveTest = (index: number) => {
    triggerHaptic('medium');
    const updated = [...extractedTests];
    updated.splice(index, 1);
    setExtractedTests(updated);
  };

  const handleProceed = () => {
    triggerHaptic('medium');
    onNext(extractedTests.map(t => t.name));
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ padding: '1.25rem' }} className="animate-slide-up">
      {/* Introduction Card */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.08) 0%, rgba(129, 140, 248, 0.04) 100%)',
        border: '1px solid rgba(45, 212, 191, 0.15)'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Compare Diagnostics <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'rgba(45,212,191,0.12)', padding: '2px 8px', borderRadius: '12px' }}>Easy Intake</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Upload a photo of your handwritten doctor's note. Gemini AI will analyze the text, extract required blood/lab tests, and compare local provider rates instantly.
        </p>
      </div>

      {extractedTests.length === 0 && !isProcessing && (
        <div className="animate-slide-up">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 600 }}>
            Option 1: Upload Doctor's Prescription
          </h3>
          
          {/* File Upload Dropzone */}
          <div 
            onClick={triggerFileSelect}
            className="card card-hover" 
            style={{
              border: '2px dashed var(--panel-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2.5rem 1rem',
              cursor: 'pointer',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.15)'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleCustomUpload} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '50%',
              padding: '12px',
              marginBottom: '10px',
              border: '1px solid var(--panel-border)'
            }}>
              <Upload size={28} className="text-gradient" />
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>Take Photo or Upload Image</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports JPG, PNG, PDF notes</p>
          </div>

          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '1.5rem 0 0.75rem 0', fontWeight: 600 }}>
            Option 2: Try with a Demo Preset
          </h3>

          {/* Preset list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {PREBAKED_PRESCRIPTIONS.map(preset => (
              <div 
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className="card card-hover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  border: selectedPreset === preset.id ? '1px solid var(--color-primary)' : '1px solid var(--panel-border)',
                  background: selectedPreset === preset.id ? 'rgba(45, 212, 191, 0.05)' : 'rgba(15,23,42,0.45)'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={preset.imageMockUrl} alt={preset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>{preset.title}</h4>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {preset.tests.map((t, i) => (
                      <span key={i} style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
                        {t.name.split(' (')[0]}
                      </span>
                    ))}
                  </div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Animation */}
      {isProcessing && (
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(15,23,42,0.8)'
        }}>
          {customImage && (
            <div style={{ width: '100%', maxHeight: '110px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--panel-border)', opacity: 0.6 }}>
              <img src={customImage} alt="Scanning prescription" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div style={{ position: 'relative', marginBottom: '1.25rem' }} className="animate-float">
            {/* Pulsing glow ring */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              borderRadius: '50%',
              border: '2px solid var(--color-primary)',
              opacity: 0.4,
              animation: 'pulse 1.5s infinite'
            }} />
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(45, 212, 191, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(45, 212, 191, 0.3)'
            }}>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Gemini Extraction Engine</h3>
          {customImageName && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              File: {customImageName}
            </span>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="animate-pulse">
            Transcribing handwriting & mapping clinical tests...
          </p>

          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
            marginTop: '1.25rem',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              width: '40%',
              borderRadius: '2px',
              animation: 'drawCheck 2s infinite ease'
            }} />
          </div>
        </div>
      )}

      {/* OCR Results Display */}
      {extractedTests.length > 0 && !isProcessing && (
        <div className="animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Gemini Extracted Tests
            </h3>
            <button 
              onClick={() => {
                triggerHaptic('light');
                setShowAddForm(true);
              }}
              style={{
                background: 'rgba(45, 212, 191, 0.1)',
                border: '1px solid rgba(45, 212, 191, 0.2)',
                color: 'var(--color-primary)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Plus size={12} /> Add Test
            </button>
          </div>

          {/* Add custom test form overlay/inline */}
          {showAddForm && (
            <form onSubmit={handleAddTest} className="card" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Add Clinical Diagnostic Test</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  placeholder="e.g. Vitamin D, Thyroid Panel" 
                  className="form-input"
                  style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: '12px' }}
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Extracted test card item list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
            {extractedTests.map((test, index) => (
              <div 
                key={index}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '12px',
                  marginBottom: 0,
                  background: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--color-primary)' }} />
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{test.name}</h4>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Info size={12} style={{ color: 'var(--color-secondary)' }} />
                    {test.likelyReason}
                  </div>
                  <span style={{ 
                    fontSize: '0.65rem', 
                    background: 'rgba(129, 140, 248, 0.1)', 
                    color: 'var(--color-secondary)', 
                    padding: '2px 6px', 
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginTop: '6px',
                    fontWeight: 600
                  }}>
                    {test.category}
                  </span>
                </div>
                <button 
                  onClick={() => handleRemoveTest(index)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    padding: '4px',
                    opacity: 0.7
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Fallback button if running in normal web browser */}
          {!isTelegramWebApp() && (
            <button 
              onClick={handleProceed}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem' }}
            >
              Compare Lab Offers <ArrowRight size={18} />
            </button>
          )}

          <button
            onClick={() => {
              triggerHaptic('medium');
              setExtractedTests([]);
              setSelectedPreset(null);
              setCustomImage(null);
            }}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '8px', padding: '0.8rem', borderRadius: '12px', fontSize: '0.85rem' }}
          >
            Clear and Scan Again
          </button>
        </div>
      )}
    </div>
  );
};
