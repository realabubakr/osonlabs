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
  Info,
  Search,
  Check,
  Camera
} from 'lucide-react';
import { triggerHaptic, configureMainButton, isTelegramWebApp } from '../services/telegram';

interface PrescriptionUploadProps {
  onNext: (tests: string[]) => void;
  savedTests: string[];
  onTestsChange?: (tests: string[]) => void;
}

const CORE_TESTS: ExtractedLabTest[] = [
  { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "Screen for anemia, infection, and general health status." },
  { name: "Lipid Panel", category: "Cardiovascular", likelyReason: "Check cholesterol levels, HDL, LDL, and triglycerides." },
  { name: "Thyroid Panel (TSH)", category: "Thyroid Function", likelyReason: "Investigate fatigue and thyroid hormone activity." },
  { name: "HbA1c", category: "Endocrine/Diabetes", likelyReason: "Measure average blood sugar levels over the past 3 months." },
  { name: "Metabolic Panel (CMP)", category: "Organ Function", likelyReason: "Evaluate kidney function, liver function, and electrolytes." },
  { name: "Vitamin D Test", category: "Nutrition/Bone", likelyReason: "Assess vitamin D deficiency associated with bone health." },
  { name: "Liver Function Panel", category: "Organ Function", likelyReason: "Evaluate enzyme levels, protein, and bilirubin in liver." },
  { name: "Urinalysis", category: "Renal/Urinary", likelyReason: "Check for kidney issues, infections, or diabetes indicators." }
];

const PACKAGES = [
  {
    id: "annual-checkup",
    title: "Annual Wellness Check",
    subtitle: "CBC, Lipid, Metabolic (CMP) to screen general health",
    icon: "🩺",
    testNames: ["CBC (Complete Blood Count)", "Lipid Panel", "Metabolic Panel (CMP)"]
  },
  {
    id: "fatigue-diabetes",
    title: "Fatigue & Diabetes Scan",
    subtitle: "HbA1c, Thyroid (TSH), Vitamin D to test energy levels",
    icon: "⚡",
    testNames: ["HbA1c", "Thyroid Panel (TSH)", "Vitamin D Test"]
  },
  {
    id: "hepatic-renal",
    title: "Organ Function Screen",
    subtitle: "Liver, Urinalysis, CBC to check internal organ status",
    icon: "🔬",
    testNames: ["Liver Function Panel", "Urinalysis", "CBC (Complete Blood Count)"]
  }
];

const QUICK_CHIPS = [
  "Vitamin D Test",
  "Lipid Panel",
  "Thyroid Panel (TSH)",
  "HbA1c",
  "CBC (Complete Blood Count)"
];

export const PrescriptionUpload: React.FC<PrescriptionUploadProps> = ({ 
  onNext, 
  savedTests,
  onTestsChange
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTests, setExtractedTests] = useState<ExtractedLabTest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Initialize from saved tests if they exist
  useEffect(() => {
    if (savedTests.length > 0 && extractedTests.length === 0) {
      setExtractedTests(savedTests.map(name => {
        const found = CORE_TESTS.find(c => c.name === name);
        return found || {
          name,
          category: "General",
          likelyReason: "Prescribed by doctor."
        };
      }));
    }
  }, [savedTests]);

  // Synchronize selected tests with parent state in real-time
  useEffect(() => {
    if (onTestsChange) {
      onTestsChange(extractedTests.map(t => t.name));
    }
  }, [extractedTests, onTestsChange]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        text: "Select Diagnostic Tests",
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

  // Toggle single test
  const handleToggleTest = (test: ExtractedLabTest) => {
    triggerHaptic('light');
    const exists = extractedTests.some(t => t.name === test.name);
    if (exists) {
      setExtractedTests(extractedTests.filter(t => t.name !== test.name));
    } else {
      setExtractedTests([...extractedTests, test]);
    }
  };

  // Check if a package is active (all its tests are selected)
  const isPackageActive = (packageTestNames: string[]) => {
    return packageTestNames.every(name => extractedTests.some(t => t.name === name));
  };

  // Toggle Package
  const handleTogglePackage = (testNames: string[]) => {
    triggerHaptic('medium');
    const active = isPackageActive(testNames);
    
    if (active) {
      // Remove all tests of this package
      setExtractedTests(extractedTests.filter(t => !testNames.includes(t.name)));
    } else {
      // Add all missing tests of this package
      const testsToAdd = testNames
        .filter(name => !extractedTests.some(t => t.name === name))
        .map(name => {
          const core = CORE_TESTS.find(c => c.name === name);
          return core || {
            name,
            category: "General Diagnostics",
            likelyReason: "Part of wellness panel."
          };
        });
      setExtractedTests([...extractedTests, ...testsToAdd]);
    }
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

  // Autocomplete filtering
  const filteredSuggestions = CORE_TESTS.filter(test => {
    const isMatched = test.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const isAlreadySelected = extractedTests.some(t => t.name === test.name);
    return isMatched && !isAlreadySelected;
  });

  return (
    <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }} className="animate-slide-up">
      {/* Title / Intro Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
        border: '1px solid rgba(37, 99, 235, 0.15)',
        marginBottom: '1rem',
        padding: '1rem'
      }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          Select Diagnostic Tests <span style={{ fontSize: '0.65rem', color: '#fff', background: 'var(--color-primary)', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>Step 1</span>
        </h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          Compare prices of Tashkent laboratories by scanning your prescription or choosing tests.
        </p>
      </div>

      {!isProcessing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ================= UNIFIED SEARCH BAR WITH CAMERA ICON ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div ref={searchContainerRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search test names (e.g., HbA1c, TSH)..."
                  className="form-input"
                  style={{ 
                    paddingLeft: '38px', 
                    paddingRight: '45px', // Space for camera icon
                    borderRadius: '12px', 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid var(--panel-border)' 
                  }}
                />
                
                {/* Embedded Camera Icon for AI Prescription Scan */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                    color: 'var(--color-primary)',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Scan Doctor's Note"
                >
                  <Camera size={16} />
                </button>

                {/* Hidden File Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleCustomUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && (searchTerm.trim() !== '') && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'rgb(24, 32, 51)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  marginTop: '6px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((test, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleToggleTest(test);
                          setSearchTerm('');
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                        className="card-hover"
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{test.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{test.category}</span>
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => {
                        handleToggleTest({
                          name: searchTerm.trim(),
                          category: "Custom Addition",
                          likelyReason: "Manually searched."
                        });
                        setSearchTerm('');
                        setShowSuggestions(false);
                      }}
                      style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      className="card-hover"
                    >
                      <Plus size={14} style={{ color: 'var(--color-primary)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Add: "<strong>{searchTerm}</strong>"</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Selection Chips */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
              {QUICK_CHIPS.map((chipName) => {
                const coreTest = CORE_TESTS.find(t => t.name === chipName)!;
                const isSelected = extractedTests.some(t => t.name === chipName);
                return (
                  <button
                    key={chipName}
                    onClick={() => handleToggleTest(coreTest)}
                    style={{
                      background: isSelected ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--panel-border)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected && <Check size={10} style={{ color: 'var(--color-primary)' }} />}
                    {chipName.split(' (')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= SUGGESTED PACKAGES ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Suggested Diagnostics Panels
            </span>
            
            {PACKAGES.map((pkg) => {
              const active = isPackageActive(pkg.testNames);
              return (
                <div
                  key={pkg.id}
                  onClick={() => handleTogglePackage(pkg.testNames)}
                  className="card card-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    margin: 0,
                    cursor: 'pointer',
                    border: active ? '1px solid var(--color-primary)' : '1px solid var(--panel-border)',
                    background: active 
                      ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.03) 100%)' 
                      : 'rgba(15,23,42,0.45)'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}>
                    {pkg.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {pkg.title}
                    </h4>
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkg.subtitle}
                    </p>
                  </div>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--text-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: active ? 'var(--color-primary)' : 'transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}>
                    {active && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>



        </div>
      )}

      {/* ================= EXTRACTION ENGINE LOADING STATE ================= */}
      {isProcessing && (
        <div className="card" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          background: 'rgba(15,23,42,0.8)',
          marginTop: '1rem'
        }}>
          {customImage && (
            <div style={{ width: '100%', maxHeight: '110px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid var(--panel-border)', opacity: 0.6 }}>
              <img src={customImage} alt="Scanning prescription" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div style={{ position: 'relative', marginBottom: '1.25rem' }} className="animate-float">
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
              background: 'rgba(37, 99, 235, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(37, 99, 235, 0.3)'
            }}>
              <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
          
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>OsonMed AI OCR Engine</h3>
          {customImageName && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              File: {customImageName}
            </span>
          )}
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="animate-pulse">
            Extracting prescription note...
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

    </div>
  );
};

