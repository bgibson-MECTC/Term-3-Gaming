import React, { useState, useEffect } from 'react';
import { Shield, Bug, Bone, Activity, AlertCircle } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, limit, serverTimestamp } from "firebase/firestore";

// Import components
import ChapterSelector from './components/ChapterSelector';
import Question from './components/Question';
import ScoreBoard from './components/ScoreBoard';
import ProgressBar from './components/ProgressBar';
import Summary from './components/Summary';
import Leaderboard from './components/Leaderboard';
import ExitConfirmModal from './components/ExitConfirmModal';

// --- GEMINI API INTEGRATION ---
const callGemini = async (prompt) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
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
  const [riskMode, setRiskMode] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('all');
  
  // New Feature States
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [missedQuestions, setMissedQuestions] = useState([]);
  
  // AI States
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
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

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('rnMasteryProgress');
    if (saved && gameState === 'playing') {
      try {
        const data = JSON.parse(saved);
        if (data.chapterId === activeChapter?.id) {
          // Resume confirmation could go here
        }
      } catch (e) {
        console.error('Error loading progress:', e);
      }
    }
  }, [gameState, activeChapter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState !== 'playing' || showRationale) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        const index = parseInt(key) - 1;
        if (index < activeChapter.questions[currentQuestionIndex].options.length) {
          setSelectedOption(index);
        }
      } else if (key === 'Enter' && selectedOption !== null) {
        if (showRationale) {
          nextQuestion();
        } else {
          submitAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, showRationale, selectedOption, activeChapter, currentQuestionIndex]);

  // --- LOGIC ---
  
  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const startChapter = (chapter) => {
    // Shuffle questions for randomization
    const shuffledChapter = {
      ...chapter,
      questions: shuffleArray(chapter.questions)
    };
    
    setActiveChapter(shuffledChapter);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedQuestions([]);
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
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

  const getPersonalBest = (chapterId) => {
    const bests = JSON.parse(localStorage.getItem('rnMasteryBests') || '{}');
    return bests[chapterId] || 0;
  };

  const savePersonalBest = (chapterId, score) => {
    const bests = JSON.parse(localStorage.getItem('rnMasteryBests') || '{}');
    if (score > (bests[chapterId] || 0)) {
      bests[chapterId] = score;
      localStorage.setItem('rnMasteryBests', JSON.stringify(bests));
      return true; // New record!
    }
    return false;
  };

  const submitAnswer = () => {
    if (selectedOption === null) return;
    const currentQuestion = activeChapter.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      const basePoints = 100;
      const multiplier = getMultiplier();
      let totalPoints = basePoints * multiplier;
      
      if (riskMode) totalPoints *= 2; // Double points for Risk
      
      setScore(Math.floor(score + totalPoints));
      setStreak(streak + 1);
      setFeedbackMessage(riskMode ? "RISK PAID OFF! 🚀" : "Correct!");
    } else {
      setIncorrectCount(incorrectCount + 1);
      setStreak(0);
      
      // Track missed question for review
      setMissedQuestions([...missedQuestions, {
        question: currentQuestion,
        selectedAnswer: selectedOption,
        questionNumber: currentQuestionIndex + 1
      }]);
      
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
      setHiddenOptions([]); // Reset hidden options for new question
    } else {
      const isNewRecord = savePersonalBest(activeChapter.id, score);
      if (isNewRecord) {
        setFeedbackMessage('🎉 NEW PERSONAL BEST!');
      }
      setGameState('summary');
    }
  };

  const handleExit = () => {
    if (gameState === 'playing' && currentQuestionIndex > 0) {
      setShowExitConfirm(true);
    } else {
      setGameState('menu');
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    setGameState('menu');
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

  const use50_50 = () => {
    if (fiftyFiftyUsed || showRationale) return;
    
    const currentQuestion = activeChapter.questions[currentQuestionIndex];
    const correctIndex = currentQuestion.correctIndex;
    
    // Get all incorrect answer indices
    const incorrectIndices = currentQuestion.options
      .map((_, idx) => idx)
      .filter(idx => idx !== correctIndex);
    
    // Randomly select 2 incorrect answers to hide
    const shuffledIncorrect = incorrectIndices.sort(() => Math.random() - 0.5);
    const toHide = shuffledIncorrect.slice(0, 2);
    
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
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
  
  const LeaderboardScreen = () => {
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
        <Leaderboard
          scores={scores}
          user={user}
          filter={leaderboardFilter}
          chapters={INITIAL_DATA}
          onFilterChange={setLeaderboardFilter}
          onBack={() => setGameState('menu')}
        />
      );
  };

  const GameScreen = () => {
    const q = activeChapter.questions[currentQuestionIndex];
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
        <div className="max-w-3xl mx-auto w-full p-6 flex-1 flex flex-col">
          {/* Exit Confirmation Modal */}
          {showExitConfirm && (
            <ExitConfirmModal 
              onCancel={() => setShowExitConfirm(false)}
              onConfirm={confirmExit}
            />
          )}

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={handleExit} className="text-slate-400 hover:text-white transition">← Exit</button>
            <ScoreBoard score={score} streak={streak} getMultiplier={getMultiplier} />
          </div>

          {/* Question Card with Progress Bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-6 shadow-2xl relative overflow-hidden">
            <ProgressBar currentIndex={currentQuestionIndex} total={activeChapter.questions.length} />
            
            <Question 
              question={q}
              selectedOption={selectedOption}
              showRationale={showRationale}
              feedbackMessage={feedbackMessage}
              aiExplanation={aiExplanation}
              isAiLoading={isAiLoading}
              hiddenOptions={hiddenOptions}
              onSelectOption={setSelectedOption}
              onAiTutor={handleAiTutor}
              onNextQuestion={nextQuestion}
            />
          </div>

          {/* Actions */}
          {!showRationale && (
            <div className="mt-auto sticky bottom-6 space-y-3">
              {/* 50/50 Lifeline Button */}
              {!fiftyFiftyUsed && (
                <div className="flex justify-center">
                  <button 
                    onClick={use50_50}
                    disabled={selectedOption !== null}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-all border-2 flex items-center gap-2 ${
                      selectedOption !== null 
                        ? 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white hover:scale-105 shadow-lg shadow-yellow-500/50'
                    }`}
                  >
                    <span className="text-xl">📞</span>
                    50/50 LIFELINE
                  </button>
                </div>
              )}
              {fiftyFiftyUsed && (
                <div className="text-center text-sm text-yellow-400 font-bold">
                  ✓ Lifeline Used
                </div>
              )}
              
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
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (gameState === 'menu') {
    return (
      <ChapterSelector 
        chapters={INITIAL_DATA}
        onSelectChapter={startChapter}
        onViewLeaderboard={() => setGameState('leaderboard')}
      />
    );
  }

  if (gameState === 'summary') {
    const rank = getRank(score);
    const personalBest = getPersonalBest(activeChapter.id);
    
    return (
      <Summary 
        score={score}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        totalQuestions={activeChapter.questions.length}
        chapterTitle={activeChapter.title}
        personalBest={personalBest}
        rank={rank}
        playerName={playerName}
        isSubmitting={isSubmittingScore}
        missedQuestions={missedQuestions}
        onPlayerNameChange={(e) => setPlayerName(e.target.value)}
        onSaveScore={saveScoreToLeaderboard}
        onReturnToMenu={() => setGameState('menu')}
      />
    );
  }

  if (gameState === 'playing') return <GameScreen />;
  if (gameState === 'leaderboard') return <LeaderboardScreen />;
  
  return null;
}
