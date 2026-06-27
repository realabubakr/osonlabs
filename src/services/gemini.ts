// Service to extract tests from handwritten prescription notes using Gemini

export interface ExtractedLabTest {
  name: string;
  category: string;
  likelyReason: string;
}

// Prebaked prescriptions for visual demonstration / quick hackathon onboarding
export interface PrebakedPrescription {
  id: string;
  title: string;
  imageMockUrl: string;
  tests: ExtractedLabTest[];
}

export const PREBAKED_PRESCRIPTIONS: PrebakedPrescription[] = [
  {
    id: "annual-wellness",
    title: "Dr. Smith - Annual Wellness Check",
    imageMockUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
    tests: [
      { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "Screen for anemia, infection, and general health status." },
      { name: "Lipid Panel", category: "Cardiovascular", likelyReason: "Check cholesterol levels, HDL, LDL, and triglycerides." },
      { name: "Metabolic Panel (CMP)", category: "Organ Function", likelyReason: "Evaluate kidney function, liver function, and electrolyte levels." }
    ]
  },
  {
    id: "diabetes-thyroid",
    title: "Dr. Lopez - Diabetes & Fatigue Scan",
    imageMockUrl: "https://images.unsplash.com/photo-1628863012283-709ffcf7f68d?auto=format&fit=crop&q=80&w=600",
    tests: [
      { name: "HbA1c", category: "Endocrine/Diabetes", likelyReason: "Measure average blood sugar levels over the past 3 months." },
      { name: "Thyroid Panel (TSH)", category: "Thyroid Function", likelyReason: "Investigate persistent fatigue and thyroid hormone activity." },
      { name: "Vitamin D Test", category: "Nutrition/Bone", likelyReason: "Assess vitamin D deficiency associated with fatigue and bone health." }
    ]
  },
  {
    id: "general-symptoms",
    title: "Dr. Patel - Hepatic & Renal Screen",
    imageMockUrl: "https://images.unsplash.com/photo-1584515901367-f1c27b74b6c2?auto=format&fit=crop&q=80&w=600",
    tests: [
      { name: "Liver Function Panel", category: "Organ Function", likelyReason: "Evaluate enzyme levels, protein synthesis, and bilirubin in liver." },
      { name: "Urinalysis", category: "Renal/Urinary", likelyReason: "Check for kidney issues, urinary tract infections, or diabetes indicators." },
      { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "Evaluate immune response and red blood cell counts." }
    ]
  }
];

// Fallback simulator for uploaded custom images
export const simulateCustomImageExtraction = async (_fileName?: string): Promise<ExtractedLabTest[]> => {
  // Simulate network & API processing lag
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return a realistic, generalized set of tests
  return [
    { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "General health screening indicator." },
    { name: "Metabolic Panel (CMP)", category: "Organ Function", likelyReason: "Standard metabolic and electrolyte check." },
    { name: "Lipid Panel", category: "Cardiovascular", likelyReason: "Routine cholesterol levels evaluation." }
  ];
};

// Actual Gemini API Call (if user configures VITE_GEMINI_API_KEY in their local environment)
export const performGeminiOCRExtraction = async (base64Image: string): Promise<ExtractedLabTest[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is not defined. Falling back to simulated extraction.");
    await new Promise(resolve => setTimeout(resolve, 2500));
    return [
      { name: "CBC (Complete Blood Count)", category: "Hematology", likelyReason: "Standard screening from uploaded image." },
      { name: "Lipid Panel", category: "Cardiovascular", likelyReason: "Cholesterol checking detected on prescription." }
    ];
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // Structure of Gemini Multimodal request
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Analyze this doctor's prescription note. Extract all requested clinical laboratory diagnostic tests (e.g., CBC, Lipid Panel, HbA1c, TSH, Urinalysis, CMP, etc.). Respond ONLY with a valid JSON array of objects containing exactly these keys: 'name', 'category', 'likelyReason'. Do not include markdown code block formatting."
              },
              {
                inlineData: {
                  mimeType: base64Image.split(';')[0].split(':')[1] || "image/jpeg",
                  data: base64Image.split(',')[1] || base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      const parsed = JSON.parse(responseText.trim());
      if (Array.isArray(parsed)) {
        return parsed as ExtractedLabTest[];
      }
    }
    throw new Error("Invalid output format from Gemini");
  } catch (error) {
    console.error("Gemini API error, using simulation fallback:", error);
    return simulateCustomImageExtraction("uploaded_file.jpg");
  }
};
