import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Brain, Activity, CheckCircle, XCircle, ArrowRight, Trophy, RefreshCw, Stethoscope, AlertCircle, Shield, Bug, Bone, PersonStanding, Thermometer, Sparkles, Loader2, Star, Zap, Users, Save, Flame, Sword, Crown } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";

// --- GEMINI API INTEGRATION ---
const callGemini = async (prompt) => {
  const apiKey = ""; // Injected at runtime by the environment
  const delays = [1000, 2000, 4000, 8000, 16000]; 

  for (let i = 0; i <= delays.length; i++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate response.";
    } catch (error) {
      if (i === delays.length) return "Sorry, the AI tutor is currently offline. Please try again later.";
      await new Promise(resolve => setTimeout(resolve, delays[i]));
    }
  }
};

// --- FIREBASE SETUP ---
let db, auth;
let appId = 'default-app-id';
try {
  const firebaseConfig = JSON.parse(window.__firebase_config || '{}');
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  if (typeof window.__app_id !== 'undefined') appId = window.__app_id;
} catch (e) {
  console.error("Firebase init error:", e);
}

// --- DATA ---
const INITIAL_DATA = [
  {
    id: 'ch18',
    title: 'Ch 18: Immune Assessment',
    icon: <Shield className="w-6 h-6" />,
    description: 'Anatomy, function, and assessment.',
    questions: [
      {
        id: 1,
        text: "The nurse is teaching a group of patients about first-line defense against infection. Which patient statement indicates the need for further education?",
        options: ["The skin is a first-line defense.", "A sneeze is a mechanical defense.", "My saliva is a biochemical defense.", "A cut with pus is a mechanical first-line defense."],
        correctIndex: 3,
        rationale: "A cut with pus indicates an inflammatory response (second-line defense), not a first-line defense."
      },
      {
        id: 2,
        text: "The nurse correlates the function of the thymus gland to which outcome?",
        options: ["WBC development", "T-cell development", "Cytokine production", "B-cell production"],
        correctIndex: 1,
        rationale: "The thymus gland is the primary site for the maturation and development of T-cells."
      },
      {
        id: 3,
        text: "Which type of leukocyte releases heparin as part of the inflammatory response?",
        options: ["Basophil", "Eosinophil", "Monocyte", "Neutrophil"],
        correctIndex: 0,
        rationale: "Basophils release histamine and heparin during the inflammatory response."
      },
      {
        id: 4,
        text: "A nurse is caring for a patient who is experiencing leukocytosis. Which action is most appropriate?",
        options: ["Assessing for source of infection", "Assessing for bleeding", "Reverse isolation", "Electric razor use"],
        correctIndex: 0,
        rationale: "Leukocytosis (elevated WBC) is a sign of infection. The priority is to find the cause."
      },
      {
        id: 5,
        text: "Breastfeeding provides which type of immunity?",
        options: ["Natural Active", "Artificial Active", "Natural Passive", "Artificial Passive"],
        correctIndex: 2,
        rationale: "Natural Passive Immunity occurs when antibodies are passed from mother to baby (placenta/breastmilk)."
      },
      {
        id: 6,
        text: "Which age-related change increases an older adult's susceptibility to cancer?",
        options: ["Thymus involution", "Increased autoantibodies", "Decreased Cytotoxic T-cell surveillance", "Increased vaccine response"],
        correctIndex: 2,
        rationale: "Decreased surveillance by Cytotoxic T-cells allows malignant cells to proliferate."
      },
      {
        id: 7,
        text: "A 'Left Shift' in WBC differential indicates:",
        options: ["Viral infection", "Acute bacterial infection", "Parasitic infection", "Allergy"],
        correctIndex: 1,
        rationale: "A 'Left Shift' means increased immature neutrophils (bands), a sign of acute bacterial infection."
      },
      {
        id: 8,
        text: "Which finding suggests potential immune deficiency?",
        options: ["BP 120/80", "Frequent, recurrent infections", "Seasonal allergies", "Mild fatigue"],
        correctIndex: 1,
        rationale: "Frequent, severe, or recurrent infections are the hallmark of immune deficiency."
      },
      {
        id: 9,
        text: "Which organ filters old blood cells and foreign antigens from the blood?",
        options: ["Thymus", "Spleen", "Tonsils", "Bone Marrow"],
        correctIndex: 1,
        rationale: "The spleen filters blood and mounts immune responses to blood-borne pathogens."
      },
      {
        id: 10,
        text: "Which immunoglobulin crosses the placenta?",
        options: ["IgM", "IgA", "IgG", "IgE"],
        correctIndex: 2,
        rationale: "IgG is the most abundant and the only Ig that crosses the placenta."
      },
      {
        id: 11,
        text: "A hard, fixed, non-tender lymph node suggests:",
        options: ["Infection", "Malignancy", "Aging", "Inflammation"],
        correctIndex: 1,
        rationale: "Malignant nodes are hard, fixed, and non-tender. Infected nodes are soft and tender."
      },
      {
        id: 12,
        text: "Elevated Eosinophils indicate:",
        options: ["Bacterial infection", "Viral infection", "Parasitic infection/Allergy", "Autoimmune flare"],
        correctIndex: 2,
        rationale: "Eosinophils rise during allergic reactions and parasitic infections."
      },
      {
        id: 13,
        text: "Which nutrient is critical for antibody synthesis?",
        options: ["Protein", "Carbs", "Fats", "Fiber"],
        correctIndex: 0,
        rationale: "Protein is essential for antibody production. Malnutrition compromises immunity."
      },
      {
        id: 14,
        text: "Primary function of B-Lymphocytes?",
        options: ["Cellular attack", "Phagocytosis", "Humoral immunity (Antibodies)", "Histamine release"],
        correctIndex: 2,
        rationale: "B-cells produce antibodies (Humoral Immunity)."
      },
      {
        id: 15,
        text: "Inflammation causes which vascular change?",
        options: ["Vasoconstriction", "Vasodilation & permeability", "Decreased flow", "Decreased permeability"],
        correctIndex: 1,
        rationale: "Vasodilation (heat/redness) and permeability (swelling) allow immune cells to reach the site."
      }
    ]
  },
  {
    id: 'ch19',
    title: 'Ch 19: Immune Disorders',
    icon: <AlertCircle className="w-6 h-6" />,
    description: 'Hypersensitivities & Autoimmunity.',
    questions: [
      {
        id: 1,
        text: "Which Ig is a mediator in allergic responses?",
        options: ["IgA", "IgD", "IgE", "IgG"],
        correctIndex: 2,
        rationale: "IgE binds to mast cells and triggers histamine release in allergies."
      },
      {
        id: 2,
        text: "Latex sensitivity is cross-reactive with:",
        options: ["Strawberries", "Shellfish", "Bananas/Avocados", "Peanuts"],
        correctIndex: 2,
        rationale: "Bananas, avocados, and kiwis share similar proteins with latex."
      },
      {
        id: 3,
        text: "Signs of Anaphylaxis (Type I) include:",
        options: ["Delayed rash", "Jaundice", "Stridor, wheezing, hypotension", "Joint pain"],
        correctIndex: 2,
        rationale: "Stridor and hypotension indicate life-threatening airway constriction and shock."
      },
      {
        id: 4,
        text: "A hemolytic transfusion reaction is which type?",
        options: ["Type I", "Type II (Cytotoxic)", "Type III", "Type IV"],
        correctIndex: 1,
        rationale: "Antibodies attacking donor RBCs is a Type II Cytotoxic reaction."
      },
      {
        id: 5,
        text: "SLE (Lupus) is which type of hypersensitivity?",
        options: ["Type I", "Type II", "Type III (Immune Complex)", "Type IV"],
        correctIndex: 2,
        rationale: "SLE involves immune complex deposition in tissues (Type III)."
      },
      {
        id: 6,
        text: "Priority for a severe bee sting reaction?",
        options: ["Oral antihistamine", "Epinephrine IM", "Ice", "Drive to hospital"],
        correctIndex: 1,
        rationale: "Epinephrine is the life-saving priority to reverse anaphylaxis."
      },
      {
        id: 7,
        text: "The TB skin test (PPD) is which reaction type?",
        options: ["Type I", "Type II", "Type III", "Type IV (Delayed)"],
        correctIndex: 3,
        rationale: "PPD is a T-cell mediated Delayed (Type IV) reaction."
      },
      {
        id: 8,
        text: "First-line drug for angioedema of the lips/tongue?",
        options: ["Fluids", "Epinephrine", "Steroids", "Benadryl"],
        correctIndex: 1,
        rationale: "Airway compromise requires Epinephrine immediately."
      },
      {
        id: 9,
        text: "Goodpasture's syndrome (antibodies attack lung/kidney) is:",
        options: ["Autoimmunity", "Immunodeficiency", "Gammopathy", "Alloimmunity"],
        correctIndex: 0,
        rationale: "Autoimmunity is the loss of self-tolerance attacking own tissues."
      },
      {
        id: 10,
        text: "Crucial intervention for B-cell deficiency?",
        options: ["Avoid live vaccines", "Daily steroids", "Plasmapheresis", "High potassium"],
        correctIndex: 0,
        rationale: "Without antibodies, live vaccines can cause the actual disease."
      },
      {
        id: 11,
        text: "Serum Sickness is which type of reaction?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 2,
        rationale: "Serum sickness is a Type III immune complex reaction."
      },
      {
        id: 12,
        text: "Sign of allergic reaction to antibiotics?",
        options: ["HR 72", "Diffuse pruritus/urticaria", "Hunger", "Low urine output"],
        correctIndex: 1,
        rationale: "Itching and hives are classic signs of allergy."
      },
      {
        id: 13,
        text: "Important instruction before allergy skin testing?",
        options: ["Stop antihistamines 48-72h prior", "Fast 12h", "Apply lotion", "Double allergy meds"],
        correctIndex: 0,
        rationale: "Antihistamines suppress the skin response and cause false negatives."
      },
      {
        id: 14,
        text: "Hyperacute transplant rejection occurs:",
        options: ["Minutes to hours", "6 months", "Years", "If meds stopped"],
        correctIndex: 0,
        rationale: "Hyperacute rejection is immediate and antibody-mediated."
      },
      {
        id: 15,
        text: "Cell type responsible for Type IV reactions?",
        options: ["B-cells", "Sensitized T-cells", "Neutrophils", "Mast cells"],
        correctIndex: 1,
        rationale: "Type IV is cell-mediated by T-cells, not antibodies."
      }
    ]
  },
  {
    id: 'ch20',
    title: 'Ch 20: Connective Tissue',
    icon: <Bone className="w-6 h-6" />,
    description: 'RA, Lupus, Gout, Scleroderma.',
    questions: [
      {
        id: 1,
        text: "Highest risk for Osteoarthritis (OA)?",
        options: ["40yo admin", "45yo construction", "55yo obese female machinist", "60yo accountant"],
        correctIndex: 2,
        rationale: "Risk factors: Age >55, Female, Obesity, Repetitive motion."
      },
      {
        id: 2,
        text: "Non-pharm therapy for Lupus?",
        options: ["Avoid sun/Use sunscreen", "Increase sun", "Limit fluids", "High protein only"],
        correctIndex: 0,
        rationale: "Sun exposure triggers SLE flares (photosensitivity)."
      },
      {
        id: 3,
        text: "Finding associated with RA (not OA)?",
        options: ["Asymmetrical pain", "Heberden's nodes", "Symmetrical pain/Morning stiffness >1hr", "Crepitus"],
        correctIndex: 2,
        rationale: "RA is systemic, symmetrical, and causes prolonged morning stiffness."
      },
      {
        id: 4,
        text: "Medication for ACUTE Gout flare?",
        options: ["Allopurinol", "Colchicine", "Febuxostat", "Methotrexate"],
        correctIndex: 1,
        rationale: "Colchicine treats acute inflammation. Allopurinol prevents future attacks."
      },
      {
        id: 5,
        text: "In CREST syndrome, 'R' stands for:",
        options: ["Rash", "Raynaud's Phenomenon", "Renal", "Rigidity"],
        correctIndex: 1,
        rationale: "Calcinosis, Raynaud's, Esophageal dysfunction, Sclerodactyly, Telangiectasia."
      },
      {
        id: 6,
        text: "Dietary modification for Gout?",
        options: ["High protein", "Low purine (no organ meat/alcohol)", "Gluten-free", "Fluid restriction"],
        correctIndex: 1,
        rationale: "Purines break down into uric acid, which causes Gout."
      },
      {
        id: 7,
        text: "Adverse effect of Methotrexate?",
        options: ["Weight gain", "Bone marrow suppression", "Insomnia", "Hyperactivity"],
        correctIndex: 1,
        rationale: "Methotrexate causes immunosuppression/bone marrow suppression."
      },
      {
        id: 8,
        text: "Heberden's nodes are a sign of:",
        options: ["RA", "Osteoarthritis", "Gout", "Lupus"],
        correctIndex: 1,
        rationale: "Bony overgrowths on distal joints (Heberden's) are classic OA."
      },
      {
        id: 9,
        text: "Fibromyalgia involves:",
        options: ["Inflammation", "Autoimmunity", "Central sensitization/Amplified pain", "Uric acid"],
        correctIndex: 2,
        rationale: "Fibromyalgia is a non-inflammatory chronic pain syndrome."
      },
      {
        id: 10,
        text: "Hallmark of Sjögren's syndrome?",
        options: ["Dry eyes/mouth", "Weakness", "Kidney stones", "Tremors"],
        correctIndex: 0,
        rationale: "Sjögren's attacks moisture glands (eyes/mouth)."
      },
      {
        id: 11,
        text: "Specific lab for SLE (Lupus)?",
        options: ["RF", "Anti-dsDNA", "Uric Acid", "CRP"],
        correctIndex: 1,
        rationale: "Anti-dsDNA and Anti-Smith are highly specific for Lupus."
      },
      {
        id: 12,
        text: "Scleroderma patient with swallowing difficulty?",
        options: ["Esophageal dysfunction", "Infection", "Anxiety", "Side effect"],
        correctIndex: 0,
        rationale: "Esophageal hardening causes dysphagia (CREST)."
      },
      {
        id: 13,
        text: "Best exercise for knee OA?",
        options: ["Jogging", "Heavy weights", "Swimming/Water aerobics", "Bed rest"],
        correctIndex: 2,
        rationale: "Low-impact water exercise reduces joint stress."
      },
      {
        id: 14,
        text: "Raynaud's trigger to avoid?",
        options: ["Warmth", "Cold & Stress", "Water", "Elevation"],
        correctIndex: 1,
        rationale: "Cold and stress trigger vasospasm in digits."
      },
      {
        id: 15,
        text: "Indication for Arthroplasty (Joint Replacement)?",
        options: ["Diagnosis", "Uncontrolled pain/mobility loss", "Age <40", "Cream failure"],
        correctIndex: 1,
        rationale: "Surgery is the last resort for severe pain/loss of function."
      }
    ]
  },
  {
    id: 'ch21',
    title: 'Ch 21: MDROs',
    icon: <Bug className="w-6 h-6" />,
    description: 'Transmission & Infection Control.',
    questions: [
      {
        id: 1,
        text: "Contact Transmission involves:",
        options: ["Insect bite", "Direct/Indirect contact", "Airborne particles", "Ingestion"],
        correctIndex: 1,
        rationale: "Direct contact or contact with contaminated surfaces."
      },
      {
        id: 2,
        text: "Vector-Borne Transmission involves:",
        options: ["Insects (ticks/mosquitoes)", "Direct contact", "Breathing", "Food"],
        correctIndex: 0,
        rationale: "Vectors are living organisms (insects) that transmit disease."
      },
      {
        id: 3,
        text: "Airborne Transmission involves:",
        options: ["Doorknobs", "Breathing small suspended particles", "Food", "Droplets >5 microns"],
        correctIndex: 1,
        rationale: "Airborne pathogens remain suspended in air for long periods."
      },
      {
        id: 4,
        text: "Common MDRO requiring Contact Precautions?",
        options: ["Strep", "MRSA", "Flu", "Shingles"],
        correctIndex: 1,
        rationale: "MRSA is a resistant organism spread by contact."
      },
      {
        id: 5,
        text: "Priority for C. diff?",
        options: ["Mask", "Soap & Water hand wash", "Negative pressure", "Open door"],
        correctIndex: 1,
        rationale: "Alcohol does not kill C. diff spores; mechanical washing is required."
      },
      {
        id: 6,
        text: "VRE is spread via:",
        options: ["Contact", "Airborne", "Water", "Mosquitoes"],
        correctIndex: 0,
        rationale: "VRE survives on surfaces/hands; spread by contact."
      },
      {
        id: 7,
        text: "Highest risk for MDRO?",
        options: ["Broken arm", "ICU with central line/antibiotics", "Cold", "Outpatient"],
        correctIndex: 1,
        rationale: "Invasive devices and antibiotic use increase MDRO risk."
      },
      {
        id: 8,
        text: "Acinetobacter baumannii is associated with:",
        options: ["Food", "VAP/Wound infections in ICU", "Sore throat", "Ticks"],
        correctIndex: 1,
        rationale: "Opportunistic pathogen common in ICUs/ventilators."
      },
      {
        id: 9,
        text: "Antibiotic Stewardship means:",
        options: ["Antibiotics for all", "Right drug/dose/duration", "Creating drugs", "No antibiotics"],
        correctIndex: 1,
        rationale: "Optimizing use to prevent resistance."
      },
      {
        id: 10,
        text: "Donning PPE order?",
        options: ["Gloves first", "Gown -> Gloves", "Mask -> Gloves", "Gloves -> Mask"],
        correctIndex: 1,
        rationale: "Gown first, then gloves over cuffs."
      },
      {
        id: 11,
        text: "Most contaminated PPE item (remove first)?",
        options: ["Mask", "Gown", "Gloves", "Goggles"],
        correctIndex: 2,
        rationale: "Gloves are most contaminated."
      },
      {
        id: 12,
        text: "CRE are dangerous because:",
        options: ["Viral", "Resistant to carbapenems", "Affect kids", "Waterborne"],
        correctIndex: 1,
        rationale: "Resistant to last-resort antibiotics."
      },
      {
        id: 13,
        text: "Cohort isolation involves:",
        options: ["Same organism roommates", "Any roommate", "Home", "Negative pressure"],
        correctIndex: 0,
        rationale: "Patients with the SAME active infection can share a room."
      },
      {
        id: 14,
        text: "Best way to break transmission?",
        options: ["Diagnosis", "Hand Hygiene", "Nutrition", "Vaccines"],
        correctIndex: 1,
        rationale: "Hand hygiene is #1 for preventing spread."
      },
      {
        id: 15,
        text: "Standard Precautions apply to:",
        options: ["Infected only", "HIV only", "All patients", "Surgical only"],
        correctIndex: 2,
        rationale: "Universal standard for all patients."
      }
    ]
  },
  {
    id: 'ch22',
    title: 'Ch 22: HIV/AIDS',
    icon: <Activity className="w-6 h-6" />,
    description: 'Etiology, Progression, Management.',
    questions: [
      {
        id: 1,
        text: "Correct HIV progression?",
        options: ["Acute->AIDS", "Viral transmission -> Seroconversion -> Acute -> Chronic -> AIDS", "AIDS first", "Transmission->AIDS"],
        correctIndex: 1,
        rationale: "Transmission > Antibodies > Acute Sx > Latency > AIDS."
      },
      {
        id: 2,
        text: "Sign of deterioration in HIV?",
        options: ["Undetectable load", "Weight loss >10%", "Night sweats", "CD4 600"],
        correctIndex: 1,
        rationale: "Wasting syndrome (>10% loss) indicates progression."
      },
      {
        id: 3,
        text: "PrEP is:",
        options: ["Vaccine", "Daily med to prevent HIV", "After sex", "Cure"],
        correctIndex: 1,
        rationale: "Pre-Exposure Prophylaxis prevents acquisition."
      },
      {
        id: 4,
        text: "CD4 count of 180 indicates:",
        options: ["Acute HIV", "AIDS", "Adherence", "Normal"],
        correctIndex: 1,
        rationale: "AIDS < 200 CD4 cells."
      },
      {
        id: 5,
        text: "Opportunistic Infection (OI) in AIDS?",
        options: ["Strep", "PCP Pneumonia", "Flu", "Eczema"],
        correctIndex: 1,
        rationale: "PCP is a classic OI."
      },
      {
        id: 6,
        text: "Goal of ART?",
        options: ["Cure", "Undetectable viral load", "Increase virus", "Decrease CD4"],
        correctIndex: 1,
        rationale: "Suppress virus to undetectable levels."
      },
      {
        id: 7,
        text: "Kaposi's Sarcoma presents as:",
        options: ["Purple/red skin lesions", "White patches", "Diarrhea", "Blindness"],
        correctIndex: 0,
        rationale: "Cancer of blood vessels causing purple lesions."
      },
      {
        id: 8,
        text: "Needle stick priority?",
        options: ["Wait", "PEP within 72h", "Antibiotics", "Retire"],
        correctIndex: 1,
        rationale: "Post-Exposure Prophylaxis ASAP (max 72h)."
      },
      {
        id: 9,
        text: "Undetectable viral load means:",
        options: ["Cured", "Gone", "Untransmittable (U=U)", "Stop meds"],
        correctIndex: 2,
        rationale: "Cannot transmit sexually, but must keep taking meds."
      },
      {
        id: 10,
        text: "Oral Thrush presents as:",
        options: ["Blisters", "Creamy white patches", "Bleeding", "Taste loss"],
        correctIndex: 1,
        rationale: "Fungal infection, white patches."
      },
      {
        id: 11,
        text: "HIV Screening/Confirmation test?",
        options: ["CBC", "CXR", "4th Gen Antigen/Antibody", "UA"],
        correctIndex: 2,
        rationale: "Detects p24 antigen and antibodies early."
      },
      {
        id: 12,
        text: "IRIS is:",
        options: ["Collapse", "Immune recovery causing inflammation", "Stop meds", "Mutation"],
        correctIndex: 1,
        rationale: "Recovering immune system attacks old infections."
      },
      {
        id: 13,
        text: "Vertical Transmission:",
        options: ["Sex", "Needles", "Mother-to-child", "Blood"],
        correctIndex: 2,
        rationale: "Perinatal transmission."
      },
      {
        id: 14,
        text: "ART Adherence requirement:",
        options: ["When sick", "95%+", "Double dose", "Stop if side effects"],
        correctIndex: 1,
        rationale: "Strict adherence prevents resistance."
      },
      {
        id: 15,
        text: "TB in HIV:",
        options: ["Rare", "Leading cause of death", "Untreatable", "No isolation"],
        correctIndex: 1,
        rationale: "Major coinfection and killer."
      }
    ]
  }
];

export default function RNMasteryGame() {
  const [gameState, setGameState] = useState('menu'); 
  const [activeChapter, setActiveChapter] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showRationale, setShowRationale] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [riskMode, setRiskMode] = useState(false); // NEW: Risk Mechanic
  const [completedChapters, setCompletedChapters] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  // AI States
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStudyGuide, setAiStudyGuide] = useState(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  
  // Firebase
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!auth) return;
      if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
        await signInWithCustomToken(auth, window.__initial_auth_token).catch(console.error);
      } else {
        await signInAnonymously(auth).catch(console.error);
      }
    };
    initAuth();
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  // --- LOGIC ---
  const startChapter = (chapter) => {
    setActiveChapter(chapter);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setSelectedOption(null);
    setShowRationale(false);
    setAiExplanation(null);
    setFeedbackMessage('');
    setRiskMode(false);
  };

  const getMultiplier = () => {
    if (streak >= 10) return 3;
    if (streak >= 5) return 2;
    if (streak >= 3) return 1.5;
    return 1;
  };

  const submitAnswer = () => {
    if (selectedOption === null) return;
    const isCorrect = selectedOption === activeChapter.questions[currentQuestionIndex].correctIndex;
    
    if (isCorrect) {
      const basePoints = 100;
      const multiplier = getMultiplier();
      let totalPoints = basePoints * multiplier;
      
      if (riskMode) totalPoints *= 2; // Double points for Risk
      
      setScore(Math.floor(score + totalPoints));
      setStreak(streak + 1);
      setFeedbackMessage(riskMode ? "RISK PAID OFF! 🚀" : "Correct!");
    } else {
      setStreak(0);
      if (riskMode) {
        setScore(Math.max(0, score - 500)); // Lose 500 for failed risk
        setFeedbackMessage("Risk Failed! -500 pts 😱");
      } else {
        setFeedbackMessage("Incorrect");
      }
    }
    setShowRationale(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < activeChapter.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowRationale(false);
      setAiExplanation(null);
      setFeedbackMessage('');
      setRiskMode(false);
    } else {
      setGameState('summary');
    }
  };

  const saveScoreToLeaderboard = async () => {
      if (!user || !playerName.trim()) return;
      setIsSubmittingScore(true);
      try {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'scores'), {
              playerName: playerName.trim(),
              score: score,
              chapterTitle: activeChapter.title,
              rank: getRank(score),
              timestamp: serverTimestamp(),
              uid: user.uid
          });
          setIsSubmittingScore(false);
          setGameState('leaderboard');
      } catch (error) {
          console.error("Error saving score:", error);
          setIsSubmittingScore(false);
      }
  };

  const getRank = (s) => {
    if (s < 1000) return "Novice";
    if (s < 2500) return "Apprentice";
    if (s < 4000) return "Expert RN";
    return "Clinical Legend 👑";
  };

  const handleAiTutor = async () => {
    setIsAiLoading(true);
    const q = activeChapter.questions[currentQuestionIndex];
    const prompt = `Context: Nursing Student Game. Question: "${q.text}". Answer: "${q.options[q.correctIndex]}". Rationale: "${q.rationale}". Task: Give a very short, funny mnemonic to remember this.`;
    const text = await callGemini(prompt);
    setAiExplanation(text);
    setIsAiLoading(false);
  };

  // --- SCREENS ---
  
  const Leaderboard = () => {
      const [scores, setScores] = useState([]);
      useEffect(() => {
          if (!db) return;
          const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'scores'), limit(50));
          return onSnapshot(q, (snap) => {
              const d = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              d.sort((a, b) => b.score - a.score);
              setScores(d);
          });
      }, []);

      return (
          <div className="min-h-screen bg-slate-900 p-6 text-white font-sans flex flex-col items-center">
              <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center">
                          <Crown className="w-8 h-8 mr-3 text-yellow-400" /> CLASS LEGENDS
                      </h2>
                      <button onClick={() => setGameState('menu')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Back</button>
                  </div>
                  
                  {scores.length > 0 && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 flex items-center animate-pulse">
                          <Sword className="w-6 h-6 text-yellow-400 mr-3" />
                          <div>
                              <div className="text-xs uppercase tracking-widest text-yellow-400 font-bold">Current Champion to Beat</div>
                              <div className="text-xl font-bold text-white">{scores[0].playerName} — {scores[0].score} pts</div>
                          </div>
                      </div>
                  )}

                  <div className="space-y-3">
                      {scores.map((entry, idx) => (
                          <div key={entry.id} className="flex items-center p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition">
                              <div className="w-10 font-black text-2xl text-slate-500 italic">#{idx + 1}</div>
                              <div className="flex-1">
                                  <div className="font-bold text-lg text-white">{entry.playerName}</div>
                                  <div className="text-xs text-slate-400">{entry.chapterTitle}</div>
                              </div>
                              <div className="font-mono text-xl text-cyan-400 font-bold">{entry.score}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  const GameScreen = () => {
    const q = activeChapter.questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
        <div className="max-w-3xl mx-auto w-full p-6 flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => setGameState('menu')} className="text-slate-400 hover:text-white transition">← Exit</button>
            <div className="flex items-center gap-4">
               {streak > 2 && (
                   <div className="px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/50 rounded-full text-sm font-bold flex items-center animate-bounce">
                       <Flame className="w-4 h-4 mr-1" /> {streak}x Streak ({getMultiplier()}x Multiplier)
                   </div>
               )}
               <div className="font-mono text-2xl font-black text-cyan-400">{score}</div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex + 1) / activeChapter.questions.length) * 100}%` }} />
            </div>
            
            <h2 className="text-2xl font-bold leading-relaxed mb-8 mt-2">{q.text}</h2>

            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                let style = "p-5 rounded-xl border-2 text-left font-medium transition-all duration-200 w-full flex items-center ";
                if (showRationale) {
                  if (idx === q.correctIndex) style += "border-green-500 bg-green-500/20 text-green-100";
                  else if (idx === selectedOption) style += "border-red-500 bg-red-500/20 text-red-100";
                  else style += "border-white/5 opacity-50";
                } else {
                  if (selectedOption === idx) style += "border-cyan-500 bg-cyan-500/20 text-cyan-100";
                  else style += "border-white/10 hover:bg-white/5 hover:border-white/30";
                }
                return (
                  <button key={idx} onClick={() => !showRationale && setSelectedOption(idx)} className={style}>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 text-sm font-bold">{String.fromCharCode(65 + idx)}</div>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto sticky bottom-6">
            {!showRationale ? (
               <div className="flex gap-4">
                   <button 
                     onClick={() => setRiskMode(!riskMode)}
                     className={`flex-1 py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center border-2 ${riskMode ? 'bg-red-600 border-red-500 text-white animate-pulse' : 'bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10'}`}
                   >
                       {riskMode ? "⚠️ RISK ACTIVE (-500/+DOUBLE)" : "🎲 RISK IT (+DOUBLE PTS)"}
                   </button>
                   <button 
                     onClick={submitAnswer}
                     disabled={selectedOption === null}
                     className={`flex-[2] py-4 rounded-xl font-black text-lg transition-all shadow-lg ${selectedOption === null ? 'bg-slate-700 text-slate-500' : 'bg-cyan-500 text-white hover:bg-cyan-400 hover:scale-[1.02]'}`}
                   >
                       LOCK IN
                   </button>
               </div>
            ) : (
                <div className="animate-in slide-in-from-bottom duration-300">
                    <div className={`p-6 rounded-2xl mb-4 border ${selectedOption === q.correctIndex ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <div className="font-bold text-lg mb-2 flex items-center">
                            {selectedOption === q.correctIndex ? <CheckCircle className="mr-2 text-green-400" /> : <XCircle className="mr-2 text-red-400" />}
                            {feedbackMessage}
                        </div>
                        <p className="text-slate-300 leading-relaxed">{q.rationale}</p>
                        
                        {/* AI Section */}
                        <div className="mt-4 pt-4 border-t border-white/10">
                            {!aiExplanation ? (
                                <button onClick={handleAiTutor} disabled={isAiLoading} className="text-sm text-purple-300 hover:text-purple-200 flex items-center">
                                    {isAiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    Generate Fun Mnemonic
                                </button>
                            ) : (
                                <div className="text-sm text-purple-200 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 mt-2">
                                    <Sparkles className="w-4 h-4 inline mr-2" /> {aiExplanation}
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={nextQuestion} className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-lg hover:bg-slate-200 transition-all flex items-center justify-center">
                        NEXT <ArrowRight className="ml-2" />
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- MENU ---
  if (gameState === 'menu') {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80')] bg-cover bg-center bg-no-repeat">
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm" />
              <div className="relative z-10 w-full max-w-4xl">
                  <div className="text-center mb-12">
                      <h1 className="text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                          RN <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">MASTERY</span>
                      </h1>
                      <p className="text-xl text-slate-400">Classroom Competitive Edition v2.0</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                          <h3 className="text-slate-400 font-bold mb-4 uppercase text-sm tracking-wider">Select Module</h3>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                              {INITIAL_DATA.map(ch => (
                                  <button key={ch.id} onClick={() => startChapter(ch)} className="w-full p-4 bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 rounded-xl text-left transition-all group">
                                      <div className="flex items-center">
                                          <div className="p-2 bg-white/10 rounded-lg mr-4 text-white group-hover:text-cyan-300">{ch.icon}</div>
                                          <div>
                                              <div className="font-bold text-white group-hover:text-cyan-300">{ch.title}</div>
                                              <div className="text-xs text-slate-400">{ch.questions.length} Questions</div>
                                          </div>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md flex flex-col justify-center items-center text-center">
                          <Trophy className="w-16 h-16 text-yellow-400 mb-6 drop-shadow-glow" />
                          <h2 className="text-2xl font-bold text-white mb-2">Class Leaderboard</h2>
                          <p className="text-slate-300 mb-8">Compete with your classmates for the top spot!</p>
                          <button onClick={() => setGameState('leaderboard')} className="px-8 py-3 bg-white text-slate-900 font-bold rounded-full hover:scale-105 transition-transform">
                              View Rankings
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- SUMMARY ---
  if (gameState === 'summary') {
      const rank = getRank(score);
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
              <div className="w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center shadow-2xl animate-fade-in">
                  <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/50 animate-bounce">
                      <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">MODULE COMPLETE!</h2>
                  <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-cyan-300 font-bold text-sm mb-8">{activeChapter.title}</div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                          <div className="text-4xl font-black text-cyan-400">{score}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase">Final Score</div>
                      </div>
                      <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                          <div className="text-lg font-bold text-yellow-400 flex items-center"><Star className="w-4 h-4 mr-1" /> {rank}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase">Rank</div>
                      </div>
                  </div>

                  <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                      <h3 className="text-white font-bold mb-4">Submit to Leaderboard</h3>
                      <div className="flex gap-2">
                          <input 
                             type="text" 
                             placeholder="Your Name" 
                             value={playerName}
                             onChange={e => setPlayerName(e.target.value)}
                             className="flex-1 bg-slate-900/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500 transition"
                          />
                          <button 
                             onClick={saveScoreToLeaderboard}
                             disabled={!playerName.trim() || isSubmittingScore}
                             className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg px-6 transition disabled:opacity-50"
                          >
                             {isSubmittingScore ? <Loader2 className="animate-spin" /> : "Save"}
                          </button>
                      </div>
                  </div>

                  <button onClick={() => setGameState('menu')} className="text-slate-400 hover:text-white transition">Skip & Return to Menu</button>
              </div>
          </div>
      );
  }

  if (gameState === 'playing') return <GameScreen />;
  if (gameState === 'leaderboard') return <Leaderboard />;
  
  return null;
}
