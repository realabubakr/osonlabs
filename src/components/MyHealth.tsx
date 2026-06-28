import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  AlertCircle, 
  ArrowRight, 
  Activity, 
  Heart, 
  ShieldAlert
} from 'lucide-react';
import { triggerHaptic } from '../services/telegram';

interface MyHealthProps {
  onRebook: (tests: string[]) => void;
}

interface BiomarkerHistory {
  date: string;
  value: number;
  unit: string;
  labName: string;
  status: 'normal' | 'high' | 'low';
}

interface BiomarkerData {
  name: string;
  fullName: string;
  description: string;
  normalRange: string;
  currentValue: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
  history: BiomarkerHistory[];
}

const BIOMARKERS_DATA: Record<string, BiomarkerData> = {
  hba1c: {
    name: "HbA1c",
    fullName: "Glycated Hemoglobin",
    description: "Crucial marker for diabetes monitoring. Reflects average blood sugar over past 3 months.",
    normalRange: "4.0% - 5.6% (Normal), 5.7% - 6.4% (Prediabetes), ≥6.5% (Diabetes)",
    currentValue: 6.8,
    unit: "%",
    status: "high",
    history: [
      { date: "Jul 2025", value: 7.4, unit: "%", labName: "Diyomed Diagnostics", status: "high" },
      { date: "Oct 2025", value: 7.1, unit: "%", labName: "Intermed Innovation", status: "high" },
      { date: "Jan 2026", value: 6.5, unit: "%", labName: "Biomed Clinic", status: "normal" },
      { date: "Apr 2026", value: 6.8, unit: "%", labName: "Intermed Innovation", status: "high" }
    ]
  },
  tsh: {
    name: "TSH",
    fullName: "Thyroid Stimulating Hormone (TSH)",
    description: "Evaluates overall thyroid gland activity and metabolic regulation.",
    normalRange: "0.4 - 4.0 mIU/L",
    currentValue: 2.3,
    unit: " mIU/L",
    status: "normal",
    history: [
      { date: "Jul 2025", value: 4.8, unit: " mIU/L", labName: "Alpha Diagnostic", status: "high" },
      { date: "Oct 2025", value: 3.2, unit: " mIU/L", labName: "Intermed Innovation", status: "normal" },
      { date: "Jan 2026", value: 2.7, unit: " mIU/L", labName: "Diyomed Diagnostics", status: "normal" },
      { date: "Apr 2026", value: 2.3, unit: " mIU/L", labName: "Intermed Innovation", status: "normal" }
    ]
  },
  cholesterol: {
    name: "Cholesterol",
    fullName: "LDL Cholesterol",
    description: "Low-density lipoprotein. Higher levels increase cardiovascular and heart disease risks.",
    normalRange: "< 3.0 mmol/L (Optimal)",
    currentValue: 3.4,
    unit: " mmol/L",
    status: "high",
    history: [
      { date: "Jul 2025", value: 3.9, unit: " mmol/L", labName: "Diyomed Diagnostics", status: "high" },
      { date: "Oct 2025", value: 3.6, unit: " mmol/L", labName: "Alpha Diagnostic", status: "high" },
      { date: "Jan 2026", value: 3.1, unit: " mmol/L", labName: "Biomed Clinic", status: "high" },
      { date: "Apr 2026", value: 3.4, unit: " mmol/L", labName: "Intermed Innovation", status: "high" }
    ]
  }
};

export const MyHealth: React.FC<MyHealthProps> = ({ onRebook }) => {
  const [selectedKey, setSelectedKey] = useState<keyof typeof BIOMARKERS_DATA>('hba1c');
  const activeData = BIOMARKERS_DATA[selectedKey];

  const handleSelectKey = (key: keyof typeof BIOMARKERS_DATA) => {
    triggerHaptic('light');
    setSelectedKey(key);
  };

  const handleRebookClick = () => {
    triggerHaptic('medium');
    // Map the active biomarker to the correct test name in our catalog
    let testName = "HbA1c";
    if (selectedKey === 'tsh') testName = "Thyroid Panel (TSH)";
    if (selectedKey === 'cholesterol') testName = "Lipid Panel";
    
    onRebook([testName]);
  };

  // SVG Chart calculation helpers
  const chartHeight = 120;
  const chartWidth = 300;
  const points = activeData.history;
  const maxVal = Math.max(...points.map(p => p.value)) * 1.15;
  const minVal = Math.min(...points.map(p => p.value)) * 0.85;
  
  const getSvgCoordinates = () => {
    const xStep = chartWidth / (points.length - 1 || 1);
    return points.map((p, i) => {
      const x = i * xStep;
      const percentY = (p.value - minVal) / (maxVal - minVal || 1);
      // Invert Y because SVG 0 is at the top
      const y = chartHeight - (percentY * (chartHeight - 20) + 10);
      return { x, y };
    });
  };

  const coords = getSvgCoordinates();
  const pathD = coords.reduce((acc, c, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y} `;
  }, '');

  const areaD = pathD + `L ${coords[coords.length - 1].x} ${chartHeight} L ${coords[0].x} ${chartHeight} Z`;

  return (
    <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }} className="animate-slide-up">
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.25rem' }}>My Health</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Track your chronic biomarkers over time from all Tashkent laboratories.
        </p>
      </div>

      {/* Biomarker Selector Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '1.25rem',
        background: 'rgba(0,0,0,0.15)',
        border: '1px solid var(--panel-border)',
        borderRadius: '12px',
        padding: '4px'
      }}>
        {Object.entries(BIOMARKERS_DATA).map(([key, data]) => {
          const isActive = selectedKey === key;
          return (
            <button
              key={key}
              onClick={() => handleSelectKey(key)}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: '8px',
                background: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>{data.name}</span>
              <span style={{ 
                fontSize: '0.65rem', 
                fontWeight: 500, 
                opacity: 0.8,
                color: isActive ? '#fff' : (data.status === 'high' ? 'var(--color-danger)' : 'var(--color-success)')
              }}>
                {data.currentValue}{data.unit}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Trend Chart Card */}
      <div className="card" style={{ padding: '16px', position: 'relative', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historical Trend
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeData.currentValue}{activeData.unit}
              <span style={{ 
                fontSize: '0.7rem', 
                padding: '2px 8px', 
                borderRadius: '10px', 
                fontWeight: 600,
                background: activeData.status === 'high' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                color: activeData.status === 'high' ? 'var(--color-danger)' : 'var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {activeData.status === 'high' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {activeData.status === 'high' ? 'High' : 'Normal'}
              </span>
            </h3>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Last Tested</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>April 2026</span>
          </div>
        </div>

        {/* SVG Chart Area */}
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          margin: '10px 0',
          padding: '0 8px'
        }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '130px', overflow: 'visible' }}>
            {/* Horizontal Grid lines */}
            <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
            <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />
            <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.04)" strokeDasharray="3,3" />

            {/* Normal Range Shaded Zone (Visual Mock) */}
            {selectedKey === 'hba1c' && (
              <rect x="0" y={chartHeight * 0.45} width={chartWidth} height={chartHeight * 0.4} fill="rgba(34, 197, 94, 0.02)" />
            )}

            {/* Area under the line */}
            <path d={areaD} fill="url(#chart-gradient)" opacity="0.15" />

            {/* Line Path */}
            <path d={pathD} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Dots and Labels */}
            {coords.map((c, i) => {
              const val = points[i].value;
              const isHigh = points[i].status === 'high';
              return (
                <g key={i}>
                  <circle 
                    cx={c.x} 
                    cy={c.y} 
                    r="5" 
                    fill={isHigh ? 'var(--color-danger)' : 'var(--color-success)'} 
                    stroke="rgb(15, 23, 42)" 
                    strokeWidth="2" 
                  />
                  <text 
                    x={c.x} 
                    y={c.y - 10} 
                    textAnchor="middle" 
                    fill="var(--text-primary)" 
                    fontSize="9" 
                    fontWeight="700"
                  >
                    {val}{activeData.unit.trim()}
                  </text>
                  <text 
                    x={c.x} 
                    y={chartHeight + 15} 
                    textAnchor="middle" 
                    fill="var(--text-muted)" 
                    fontSize="8" 
                    fontWeight="500"
                  >
                    {points[i].date}
                  </text>
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Info Box */}
        <div style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          padding: '8px 10px',
          marginTop: '1.25rem',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start'
        }}>
          <Activity size={14} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            <strong>{activeData.fullName}:</strong> {activeData.description}<br />
            <span style={{ color: 'var(--text-muted)' }}>Normal range: {activeData.normalRange}</span>
          </p>
        </div>
      </div>

      {/* Reminder Widget */}
      {activeData.status === 'high' && (
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          padding: '14px',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
            <ShieldAlert size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Time for quarterly {activeData.name} check
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.3 }}>
                Your last {activeData.name} was {activeData.currentValue}{activeData.unit} (High) on April 2026. 
                Regular monitoring is recommended every 3 months.
              </p>
            </div>
          </div>
          <button 
            onClick={handleRebookClick}
            className="btn btn-primary animate-pulse"
            style={{ 
              width: '100%', 
              padding: '8px 12px', 
              borderRadius: '8px', 
              fontSize: '0.8rem', 
              background: 'var(--color-danger)', 
              borderColor: 'var(--color-danger)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            Schedule Home Sample Collection <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Log History */}
      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '8px' }}>
        Lab Results History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {activeData.history.map((log, index) => (
          <div 
            key={index} 
            className="card" 
            style={{ 
              margin: 0, 
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15,23,42,0.3)'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--panel-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Calendar size={14} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{log.labName}</h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.date}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  color: log.status === 'high' ? 'var(--color-danger)' : 'var(--color-success)'
                }}>
                  {log.value}{log.unit}
                </span>
                <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {log.status}
                </span>
              </div>

              <button 
                onClick={() => {
                  triggerHaptic('light');
                  alert(`Downloading original PDF report from ${log.labName}...`);
                }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '6px',
                  padding: '6px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
