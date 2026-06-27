import React, { useState, useEffect } from 'react';
import labsData from '../data/labs.json';
import { 
  Star, 
  MapPin, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { triggerHaptic, configureMainButton, isTelegramWebApp } from '../services/telegram';

interface LabComparisonProps {
  selectedTests: string[];
  onSelect: (labId: string, totalCost: number) => void;
  onBack: () => void;
}

interface LabCalculation {
  id: string;
  name: string;
  rating: number;
  distanceMiles: number;
  processingTime: string;
  earliestSlot: string;
  homeCollectionFee: number;
  availableTests: { name: string; price: number }[];
  missingTests: string[];
  testSubtotal: number;
  grandTotal: number;
}

export const LabComparison: React.FC<LabComparisonProps> = ({ selectedTests, onSelect, onBack }) => {
  const [calculations, setCalculations] = useState<LabCalculation[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);
  const [expandedLabId, setExpandedLabId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'rating'>('price');

  // Compute test bundles and pricing for each lab
  useEffect(() => {
    const computed: LabCalculation[] = labsData.map(lab => {
      const availableTests: { name: string; price: number }[] = [];
      const missingTests: string[] = [];
      let testSubtotal = 0;

      selectedTests.forEach(testName => {
        // Find price in lab's price list (case insensitive match)
        const matchedKey = Object.keys(lab.priceList).find(
          k => k.toLowerCase() === testName.toLowerCase()
        );
        
        if (matchedKey) {
          const price = lab.priceList[matchedKey as keyof typeof lab.priceList];
          availableTests.push({ name: testName, price });
          testSubtotal += price;
        } else {
          // If not in the price list, fallback to a mock reasonable price
          const mockPrice = 30.00;
          availableTests.push({ name: testName, price: mockPrice });
          testSubtotal += mockPrice;
        }
      });

      const grandTotal = testSubtotal + lab.homeCollectionFee;

      return {
        id: lab.id,
        name: lab.name,
        rating: lab.rating,
        distanceMiles: lab.distanceMiles,
        processingTime: lab.processingTime,
        earliestSlot: lab.earliestSlot,
        homeCollectionFee: lab.homeCollectionFee,
        availableTests,
        missingTests,
        testSubtotal,
        grandTotal
      };
    });

    setCalculations(computed);

    // Auto-select the cheapest lab by default
    if (computed.length > 0) {
      const cheapest = [...computed].sort((a, b) => a.grandTotal - b.grandTotal)[0];
      setSelectedLabId(cheapest.id);
    }
  }, [selectedTests]);

  // Configure Telegram MainButton
  useEffect(() => {
    if (selectedLabId) {
      const selectedLab = calculations.find(c => c.id === selectedLabId);
      if (selectedLab) {
        configureMainButton({
          text: `Book At-Home Visit ($${selectedLab.grandTotal.toFixed(2)})`,
          onClick: handleProceed,
          isVisible: true,
          isActive: true
        });
      }
    } else {
      configureMainButton({
        text: "Select Laboratory",
        onClick: () => {},
        isVisible: false,
        isActive: false
      });
    }
  }, [selectedLabId, calculations]);

  // Sorting logic
  const getSortedCalculations = () => {
    const sorted = [...calculations];
    if (sortBy === 'price') {
      return sorted.sort((a, b) => a.grandTotal - b.grandTotal);
    } else if (sortBy === 'distance') {
      return sorted.sort((a, b) => a.distanceMiles - b.distanceMiles);
    } else if (sortBy === 'rating') {
      return sorted.sort((a, b) => b.rating - a.rating);
    }
    return sorted;
  };

  const handleSelectLab = (labId: string) => {
    triggerHaptic('light');
    setSelectedLabId(labId);
  };

  const toggleExpand = (labId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger select
    triggerHaptic('light');
    setExpandedLabId(expandedLabId === labId ? null : labId);
  };

  const handleProceed = () => {
    if (!selectedLabId) return;
    const selectedLab = calculations.find(c => c.id === selectedLabId);
    if (selectedLab) {
      triggerHaptic('medium');
      onSelect(selectedLabId, selectedLab.grandTotal);
    }
  };

  const sortedList = getSortedCalculations();
  const cheapestLabId = calculations.length > 0 
    ? [...calculations].sort((a, b) => a.grandTotal - b.grandTotal)[0].id 
    : null;

  return (
    <div style={{ padding: '1.25rem' }} className="animate-slide-up">
      {/* Step Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Compare Lab Offers</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Comparing for {selectedTests.length} extracted tests
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
          ← Edit Rx
        </button>
      </div>

      {/* Sort Options */}
      <div style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.15)',
        border: '1px solid var(--panel-border)',
        borderRadius: '10px',
        padding: '2px',
        marginBottom: '1rem'
      }}>
        {(['price', 'distance', 'rating'] as const).map(option => (
          <button
            key={option}
            onClick={() => {
              triggerHaptic('light');
              setSortBy(option);
            }}
            style={{
              flex: 1,
              padding: '6px 0',
              border: 'none',
              background: sortBy === option ? 'var(--color-primary)' : 'transparent',
              color: sortBy === option ? '#fff' : 'var(--text-secondary)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {option === 'price' ? 'Lowest Price' : option === 'distance' ? 'Closest' : 'Top Rated'}
          </button>
        ))}
      </div>

      {/* Lab Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
        {sortedList.map(lab => {
          const isSelected = selectedLabId === lab.id;
          const isExpanded = expandedLabId === lab.id;
          const isCheapest = lab.id === cheapestLabId;

          return (
            <div 
              key={lab.id}
              onClick={() => handleSelectLab(lab.id)}
              className="card card-hover"
              style={{
                position: 'relative',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--panel-border)',
                background: isSelected ? 'rgba(45, 212, 191, 0.04)' : 'rgba(15,23,42,0.45)',
                padding: '16px 14px',
                cursor: 'pointer',
                marginBottom: 0
              }}
            >
              {/* Badges */}
              {isCheapest && (
                <div style={{
                  position: 'absolute',
                  top: '-9px',
                  right: '12px',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <TrendingDown size={10} /> BEST BUNDLE PRICE
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--text-muted)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-primary)' }} />}
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{lab.name}</h3>
                </div>
                
                {/* Total Price display */}
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                    ${lab.grandTotal.toFixed(2)}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    incl. ${lab.homeCollectionFee.toFixed(2)} draw fee
                  </span>
                </div>
              </div>

              {/* Lab Stats */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '10px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                borderBottom: isExpanded ? '1px solid var(--panel-border)' : 'none',
                paddingBottom: isExpanded ? '10px' : '0',
                marginBottom: isExpanded ? '10px' : '0'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={12} fill="var(--color-accent)" color="var(--color-accent)" />
                  {lab.rating}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} />
                  {lab.distanceMiles} miles away
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Clock size={12} />
                  {lab.processingTime}
                </span>
              </div>

              {/* Collapsed breakdown display */}
              {isExpanded && (
                <div className="animate-slide-up" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '4px', marginBottom: '6px' }}>
                    <span>Analyte Test Name</span>
                    <span>Direct Price</span>
                  </div>
                  {lab.availableTests.map((test, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{test.name}</span>
                      <span>${test.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem' }}>
                    <span>Home Phlebotomy Collection Fee</span>
                    <span>${lab.homeCollectionFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: 'var(--text-muted)' }}>
                    <span>Earliest Available Draw Slot</span>
                    <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{lab.earliestSlot}</span>
                  </div>
                </div>
              )}

              {/* View breakdown toggle button */}
              <div 
                onClick={(e) => toggleExpand(lab.id, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  marginTop: '8px',
                  paddingTop: '4px',
                  borderTop: !isExpanded ? '1px solid rgba(255,255,255,0.02)' : 'none'
                }}
              >
                {isExpanded ? (
                  <>Hide Price Breakdown <ChevronUp size={12} /></>
                ) : (
                  <>Show Price Breakdown & Availability <ChevronDown size={12} /></>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fallback button if running in normal web browser */}
      {!isTelegramWebApp() && selectedLabId && (
        <button 
          onClick={handleProceed}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem', borderRadius: '14px', fontSize: '1rem' }}
        >
          Book Selected Lab <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
};
