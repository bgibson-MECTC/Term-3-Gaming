import React, { useState, useEffect } from 'react';
import { Shield, Bug, Bone, Activity, AlertCircle, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, limit, serverTimestamp, getDocs, where } from "firebase/firestore";

// Import components
import ChapterSelector from './components/ChapterSelector';
import Question from './components/Question';
import ScoreBoard from './components/ScoreBoard';
import ProgressBar from './components/ProgressBar';
import Summary from './components/Summary';
import Leaderboard from './components/Leaderboard';
import ExitConfirmModal from './components/ExitConfirmModal';
import ModeSelector from './components/ModeSelector';

// Import tag overlay system and modes engine
import { enrichQuestions, getExamTip } from './questionTags/index';
import { MODES, getPool } from './modes';

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
        id: "ch18_q01",
        text: "The nurse is teaching a group of patients about first-line defense against infection. Which patient statement indicates the need for further education?",
        options: ["The skin is a first-line defense.", "A sneeze is a mechanical defense.", "My saliva is a biochemical defense.", "A cut with pus is a mechanical first-line defense."],
        correctIndex: 3,
        rationale: "A cut with pus indicates an inflammatory response (second-line defense), not a first-line defense."
      },
      {
        id: "ch18_q02",
        text: "The nurse correlates the function of the thymus gland to which outcome?",
        options: ["WBC development", "T-cell development", "Cytokine production", "B-cell production"],
        correctIndex: 1,
        rationale: "The thymus gland is the primary site for the maturation and development of T-cells."
      },
      {
        id: "ch18_q03",
        text: "Which type of leukocyte releases heparin as part of the inflammatory response?",
        options: ["Basophil", "Eosinophil", "Monocyte", "Neutrophil"],
        correctIndex: 0,
        rationale: "Basophils release histamine and heparin during the inflammatory response."
      },
      {
        id: "ch18_q04",
        text: "A nurse is caring for a patient who is experiencing leukocytosis. Which action is most appropriate?",
        options: ["Assessing for source of infection", "Assessing for bleeding", "Reverse isolation", "Electric razor use"],
        correctIndex: 0,
        rationale: "Leukocytosis (elevated WBC) is a sign of infection. The priority is to find the cause."
      },
      {
        id: "ch18_q05",
        text: "Breastfeeding provides which type of immunity?",
        options: ["Natural Active", "Artificial Active", "Natural Passive", "Artificial Passive"],
        correctIndex: 2,
        rationale: "Natural Passive Immunity occurs when antibodies are passed from mother to baby (placenta/breastmilk)."
      },
      {
        id: "ch18_q06",
        text: "Which age-related change increases an older adult's susceptibility to cancer?",
        options: ["Thymus involution", "Increased autoantibodies", "Decreased Cytotoxic T-cell surveillance", "Increased vaccine response"],
        correctIndex: 2,
        rationale: "Decreased surveillance by Cytotoxic T-cells allows malignant cells to proliferate."
      },
      {
        id: "ch18_q07",
        text: "A 'Left Shift' in WBC differential indicates:",
        options: ["Viral infection", "Acute bacterial infection", "Parasitic infection", "Allergy"],
        correctIndex: 1,
        rationale: "A 'Left Shift' means increased immature neutrophils (bands), a sign of acute bacterial infection."
      },
      {
        id: "ch18_q08",
        text: "Which finding suggests potential immune deficiency?",
        options: ["BP 120/80", "Frequent, recurrent infections", "Seasonal allergies", "Mild fatigue"],
        correctIndex: 1,
        rationale: "Frequent, severe, or recurrent infections are the hallmark of immune deficiency."
      },
      {
        id: "ch18_q09",
        text: "Which organ filters old blood cells and foreign antigens from the blood?",
        options: ["Thymus", "Spleen", "Tonsils", "Bone Marrow"],
        correctIndex: 1,
        rationale: "The spleen filters blood and mounts immune responses to blood-borne pathogens."
      },
      {
        id: "ch18_q10",
        text: "Which immunoglobulin crosses the placenta?",
        options: ["IgM", "IgA", "IgG", "IgE"],
        correctIndex: 2,
        rationale: "IgG is the most abundant and the only Ig that crosses the placenta."
      },
      {
        id: "ch18_q11",
        text: "A hard, fixed, non-tender lymph node suggests:",
        options: ["Infection", "Malignancy", "Aging", "Inflammation"],
        correctIndex: 1,
        rationale: "Malignant nodes are hard, fixed, and non-tender. Infected nodes are soft and tender."
      },
      {
        id: "ch18_q12",
        text: "Elevated Eosinophils indicate:",
        options: ["Bacterial infection", "Viral infection", "Parasitic infection/Allergy", "Autoimmune flare"],
        correctIndex: 2,
        rationale: "Eosinophils rise during allergic reactions and parasitic infections."
      },
      {
        id: "ch18_q13",
        text: "Which nutrient is critical for antibody synthesis?",
        options: ["Protein", "Carbs", "Fats", "Fiber"],
        correctIndex: 0,
        rationale: "Protein is essential for antibody production. Malnutrition compromises immunity."
      },
      {
        id: "ch18_q14",
        text: "Primary function of B-Lymphocytes?",
        options: ["Cellular attack", "Phagocytosis", "Humoral immunity (Antibodies)", "Histamine release"],
        correctIndex: 2,
        rationale: "B-cells produce antibodies (Humoral Immunity)."
      },
      {
        id: "ch18_q15",
        text: "Inflammation causes which vascular change?",
        options: ["Vasoconstriction", "Vasodilation & permeability", "Decreased flow", "Decreased permeability"],
        correctIndex: 1,
        rationale: "Vasodilation (heat/redness) and permeability (swelling) allow immune cells to reach the site."
      },
      {
        id: "ch18_q16",
        text: "Natural Killer (NK) cells are part of which immunity?",
        options: ["Adaptive", "Innate", "Passive", "Artificial"],
        correctIndex: 1,
        rationale: "NK cells provide immediate, non-specific defense as part of innate immunity."
      },
      {
        id: "ch18_q17",
        text: "Which WBC is the 'first responder' to bacterial infection?",
        options: ["Lymphocyte", "Monocyte", "Neutrophil", "Basophil"],
        correctIndex: 2,
        rationale: "Neutrophils are the most abundant and first to arrive at infection sites."
      },
      {
        id: "ch18_q18",
        text: "Complement system activation results in:",
        options: ["Decreased inflammation", "Pathogen lysis", "Antibody suppression", "WBC destruction"],
        correctIndex: 1,
        rationale: "Complement creates membrane attack complexes that lyse pathogens."
      },
      {
        id: "ch18_q19",
        text: "Memory B-cells provide:",
        options: ["Immediate response", "Long-term immunity", "Phagocytosis", "Inflammation"],
        correctIndex: 1,
        rationale: "Memory cells enable faster, stronger responses upon re-exposure."
      },
      {
        id: "ch18_q20",
        text: "Which finding suggests lymphoma?",
        options: ["Painful, mobile nodes", "Painless, fixed lymphadenopathy", "Fever only", "Normal CBC"],
        correctIndex: 1,
        rationale: "Painless, fixed nodes that don't resolve are concerning for malignancy."
      },
      {
        id: "ch18_q21",
        text: "Neutropenia increases risk for:",
        options: ["Bleeding", "Infection", "Allergy", "Clotting"],
        correctIndex: 1,
        rationale: "Low neutrophils (<1500) significantly increase infection risk."
      },
      {
        id: "ch18_q22",
        text: "Monocytes differentiate into:",
        options: ["Neutrophils", "Macrophages", "T-cells", "Platelets"],
        correctIndex: 1,
        rationale: "Monocytes leave blood and become tissue macrophages."
      },
      {
        id: "ch18_q23",
        text: "IgM indicates:",
        options: ["Past infection", "Active/recent infection", "Vaccine response", "Allergy"],
        correctIndex: 1,
        rationale: "IgM is the first antibody produced during acute infection."
      },
      {
        id: "ch18_q24",
        text: "Interferons are released in response to:",
        options: ["Bacteria", "Viruses", "Parasites", "Allergens"],
        correctIndex: 1,
        rationale: "Interferons 'interfere' with viral replication."
      },
      {
        id: "ch18_q25",
        text: "CD4 cells are also called:",
        options: ["Killer T-cells", "Helper T-cells", "B-cells", "NK cells"],
        correctIndex: 1,
        rationale: "CD4+ T-cells are helper cells that coordinate immune responses."
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
        id: "ch19_q01",
        text: "Which Ig is a mediator in allergic responses?",
        options: ["IgA", "IgD", "IgE", "IgG"],
        correctIndex: 2,
        rationale: "IgE binds to mast cells and triggers histamine release in allergies."
      },
      {
        id: "ch19_q02",
        text: "Latex sensitivity is cross-reactive with:",
        options: ["Strawberries", "Shellfish", "Bananas/Avocados", "Peanuts"],
        correctIndex: 2,
        rationale: "Bananas, avocados, and kiwis share similar proteins with latex."
      },
      {
        id: "ch19_q03",
        text: "Signs of Anaphylaxis (Type I) include:",
        options: ["Delayed rash", "Jaundice", "Stridor, wheezing, hypotension", "Joint pain"],
        correctIndex: 2,
        rationale: "Stridor and hypotension indicate life-threatening airway constriction and shock."
      },
      {
        id: "ch19_q04",
        text: "A hemolytic transfusion reaction is which type?",
        options: ["Type I", "Type II (Cytotoxic)", "Type III", "Type IV"],
        correctIndex: 1,
        rationale: "Antibodies attacking donor RBCs is a Type II Cytotoxic reaction."
      },
      {
        id: "ch19_q05",
        text: "SLE (Lupus) is which type of hypersensitivity?",
        options: ["Type I", "Type II", "Type III (Immune Complex)", "Type IV"],
        correctIndex: 2,
        rationale: "SLE involves immune complex deposition in tissues (Type III)."
      },
      {
        id: "ch19_q06",
        text: "Priority for a severe bee sting reaction?",
        options: ["Oral antihistamine", "Epinephrine IM", "Ice", "Drive to hospital"],
        correctIndex: 1,
        rationale: "Epinephrine is the life-saving priority to reverse anaphylaxis."
      },
      {
        id: "ch19_q07",
        text: "The TB skin test (PPD) is which reaction type?",
        options: ["Type I", "Type II", "Type III", "Type IV (Delayed)"],
        correctIndex: 3,
        rationale: "PPD is a T-cell mediated Delayed (Type IV) reaction."
      },
      {
        id: "ch19_q08",
        text: "First-line drug for angioedema of the lips/tongue?",
        options: ["Fluids", "Epinephrine", "Steroids", "Benadryl"],
        correctIndex: 1,
        rationale: "Airway compromise requires Epinephrine immediately."
      },
      {
        id: "ch19_q09",
        text: "Goodpasture's syndrome (antibodies attack lung/kidney) is:",
        options: ["Autoimmunity", "Immunodeficiency", "Gammopathy", "Alloimmunity"],
        correctIndex: 0,
        rationale: "Autoimmunity is the loss of self-tolerance attacking own tissues."
      },
      {
        id: "ch19_q10",
        text: "Crucial intervention for B-cell deficiency?",
        options: ["Avoid live vaccines", "Daily steroids", "Plasmapheresis", "High potassium"],
        correctIndex: 0,
        rationale: "Without antibodies, live vaccines can cause the actual disease."
      },
      {
        id: "ch19_q11",
        text: "Serum Sickness is which type of reaction?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 2,
        rationale: "Serum sickness is a Type III immune complex reaction."
      },
      {
        id: "ch19_q12",
        text: "Sign of allergic reaction to antibiotics?",
        options: ["HR 72", "Diffuse pruritus/urticaria", "Hunger", "Low urine output"],
        correctIndex: 1,
        rationale: "Itching and hives are classic signs of allergy."
      },
      {
        id: "ch19_q13",
        text: "Important instruction before allergy skin testing?",
        options: ["Stop antihistamines 48-72h prior", "Fast 12h", "Apply lotion", "Double allergy meds"],
        correctIndex: 0,
        rationale: "Antihistamines suppress the skin response and cause false negatives."
      },
      {
        id: "ch19_q14",
        text: "Hyperacute transplant rejection occurs:",
        options: ["Minutes to hours", "6 months", "Years", "If meds stopped"],
        correctIndex: 0,
        rationale: "Hyperacute rejection is immediate and antibody-mediated."
      },
      {
        id: "ch19_q15",
        text: "Cell type responsible for Type IV reactions?",
        options: ["B-cells", "Sensitized T-cells", "Neutrophils", "Mast cells"],
        correctIndex: 1,
        rationale: "Type IV is cell-mediated by T-cells, not antibodies."
      },
      {
        id: "ch19_q16",
        text: "Which medication suppresses Type I allergic reactions?",
        options: ["Antihistamines", "NSAIDs", "ACE inhibitors", "Beta blockers"],
        correctIndex: 0,
        rationale: "Antihistamines block histamine release from mast cells in Type I reactions."
      },
      {
        id: "ch19_q17",
        text: "Hemolytic transfusion reaction is which type?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 1,
        rationale: "Type II cytotoxic reaction occurs when antibodies attack transfused RBCs."
      },
      {
        id: "ch19_q18",
        text: "Contact dermatitis from poison ivy is which type?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 3,
        rationale: "Poison ivy causes a delayed Type IV cell-mediated hypersensitivity."
      },
      {
        id: "ch19_q19",
        text: "Classic sign of Systemic Lupus Erythematosus (SLE)?",
        options: ["Butterfly rash", "Spider veins", "Clubbing", "Pallor"],
        correctIndex: 0,
        rationale: "Malar (butterfly) rash across cheeks and nose is characteristic of SLE."
      },
      {
        id: "ch19_q20",
        text: "Priority nursing action during anaphylaxis?",
        options: ["Establish IV access", "Administer epinephrine", "Get vital signs", "Call physician"],
        correctIndex: 1,
        rationale: "Epinephrine is the first-line treatment to reverse bronchospasm and vasodilation."
      },
      {
        id: "ch19_q21",
        text: "Which immunosuppressant requires monitoring for nephrotoxicity?",
        options: ["Azathioprine", "Prednisone", "Cyclosporine", "Methotrexate"],
        correctIndex: 2,
        rationale: "Cyclosporine can damage kidneys; monitor creatinine and BUN levels."
      },
      {
        id: "ch19_q22",
        text: "Positive ANA test suggests which condition?",
        options: ["Diabetes", "Hypertension", "Autoimmune disorder", "Bacterial infection"],
        correctIndex: 2,
        rationale: "Antinuclear antibodies (ANA) indicate autoimmune conditions like SLE."
      },
      {
        id: "ch19_q23",
        text: "Chronic transplant rejection time frame?",
        options: ["Minutes", "Hours to days", "Months to years", "Never occurs"],
        correctIndex: 2,
        rationale: "Chronic rejection is a slow progressive process occurring months to years post-transplant."
      },
      {
        id: "ch19_q24",
        text: "Food most commonly causing Type I allergies in children?",
        options: ["Wheat", "Peanuts", "Corn", "Rice"],
        correctIndex: 1,
        rationale: "Peanuts cause severe IgE-mediated allergic reactions and anaphylaxis in children."
      },
      {
        id: "ch19_q25",
        text: "Teaching point for clients with latex allergy?",
        options: ["Only avoid powdered gloves", "Report to healthcare providers", "Allergy decreases over time", "Safe to use latex at home"],
        correctIndex: 1,
        rationale: "Clients must inform all healthcare providers to ensure latex-free equipment and gloves."
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
        id: "ch20_q01",
        text: "Highest risk for Osteoarthritis (OA)?",
        options: ["40yo admin", "45yo construction", "55yo obese female machinist", "60yo accountant"],
        correctIndex: 2,
        rationale: "Risk factors: Age >55, Female, Obesity, Repetitive motion."
      },
      {
        id: "ch20_q02",
        text: "Non-pharm therapy for Lupus?",
        options: ["Avoid sun/Use sunscreen", "Increase sun", "Limit fluids", "High protein only"],
        correctIndex: 0,
        rationale: "Sun exposure triggers SLE flares (photosensitivity)."
      },
      {
        id: "ch20_q03",
        text: "Finding associated with RA (not OA)?",
        options: ["Asymmetrical pain", "Heberden's nodes", "Symmetrical pain/Morning stiffness >1hr", "Crepitus"],
        correctIndex: 2,
        rationale: "RA is systemic, symmetrical, and causes prolonged morning stiffness."
      },
      {
        id: "ch20_q04",
        text: "Medication for ACUTE Gout flare?",
        options: ["Allopurinol", "Colchicine", "Febuxostat", "Methotrexate"],
        correctIndex: 1,
        rationale: "Colchicine treats acute inflammation. Allopurinol prevents future attacks."
      },
      {
        id: "ch20_q05",
        text: "In CREST syndrome, 'R' stands for:",
        options: ["Rash", "Raynaud's Phenomenon", "Renal", "Rigidity"],
        correctIndex: 1,
        rationale: "Calcinosis, Raynaud's, Esophageal dysfunction, Sclerodactyly, Telangiectasia."
      },
      {
        id: "ch20_q06",
        text: "Dietary modification for Gout?",
        options: ["High protein", "Low purine (no organ meat/alcohol)", "Gluten-free", "Fluid restriction"],
        correctIndex: 1,
        rationale: "Purines break down into uric acid, which causes Gout."
      },
      {
        id: "ch20_q07",
        text: "Adverse effect of Methotrexate?",
        options: ["Weight gain", "Bone marrow suppression", "Insomnia", "Hyperactivity"],
        correctIndex: 1,
        rationale: "Methotrexate causes immunosuppression/bone marrow suppression."
      },
      {
        id: "ch20_q08",
        text: "Heberden's nodes are a sign of:",
        options: ["RA", "Osteoarthritis", "Gout", "Lupus"],
        correctIndex: 1,
        rationale: "Bony overgrowths on distal joints (Heberden's) are classic OA."
      },
      {
        id: "ch20_q09",
        text: "Fibromyalgia involves:",
        options: ["Inflammation", "Autoimmunity", "Central sensitization/Amplified pain", "Uric acid"],
        correctIndex: 2,
        rationale: "Fibromyalgia is a non-inflammatory chronic pain syndrome."
      },
      {
        id: "ch20_q10",
        text: "Hallmark of Sjögren's syndrome?",
        options: ["Dry eyes/mouth", "Weakness", "Kidney stones", "Tremors"],
        correctIndex: 0,
        rationale: "Sjögren's attacks moisture glands (eyes/mouth)."
      },
      {
        id: "ch20_q11",
        text: "Specific lab for SLE (Lupus)?",
        options: ["RF", "Anti-dsDNA", "Uric Acid", "CRP"],
        correctIndex: 1,
        rationale: "Anti-dsDNA and Anti-Smith are highly specific for Lupus."
      },
      {
        id: "ch20_q12",
        text: "Scleroderma patient with swallowing difficulty?",
        options: ["Esophageal dysfunction", "Infection", "Anxiety", "Side effect"],
        correctIndex: 0,
        rationale: "Esophageal hardening causes dysphagia (CREST)."
      },
      {
        id: "ch20_q13",
        text: "Best exercise for knee OA?",
        options: ["Jogging", "Heavy weights", "Swimming/Water aerobics", "Bed rest"],
        correctIndex: 2,
        rationale: "Low-impact water exercise reduces joint stress."
      },
      {
        id: "ch20_q14",
        text: "Raynaud's trigger to avoid?",
        options: ["Warmth", "Cold & Stress", "Water", "Elevation"],
        correctIndex: 1,
        rationale: "Cold and stress trigger vasospasm in digits."
      },
      {
        id: "ch20_q15",
        text: "Indication for Arthroplasty (Joint Replacement)?",
        options: ["Diagnosis", "Uncontrolled pain/mobility loss", "Age <40", "Cream failure"],
        correctIndex: 1,
        rationale: "Surgery is the last resort for severe pain/loss of function."
      },
      {
        id: "ch20_q16",
        text: "First-line DMARD for Rheumatoid Arthritis?",
        options: ["Prednisone", "Methotrexate", "Ibuprofen", "Acetaminophen"],
        correctIndex: 1,
        rationale: "Methotrexate is the gold standard DMARD to slow RA progression."
      },
      {
        id: "ch20_q17",
        text: "Lab value elevated in Rheumatoid Arthritis?",
        options: ["Glucose", "Rheumatoid Factor (RF)", "Hemoglobin", "Sodium"],
        correctIndex: 1,
        rationale: "Rheumatoid Factor is an autoantibody present in 70-80% of RA patients."
      },
      {
        id: "ch20_q18",
        text: "Teaching for patient on Methotrexate?",
        options: ["Take with grapefruit juice", "Avoid folic acid", "Avoid alcohol", "Double dose if missed"],
        correctIndex: 2,
        rationale: "Alcohol increases hepatotoxicity risk with Methotrexate."
      },
      {
        id: "ch20_q19",
        text: "Joint most commonly affected by Gout?",
        options: ["Hip", "Shoulder", "Great toe (MTP joint)", "Elbow"],
        correctIndex: 2,
        rationale: "Gout classically presents in the first metatarsophalangeal joint (big toe)."
      },
      {
        id: "ch20_q20",
        text: "Complication of untreated Osteoarthritis?",
        options: ["Increased flexibility", "Joint deformity & disability", "Hyperglycemia", "Anemia"],
        correctIndex: 1,
        rationale: "Progressive cartilage loss leads to deformity and loss of function."
      },
      {
        id: "ch20_q21",
        text: "Medication that can trigger Gout attack?",
        options: ["Thiazide diuretics", "Beta blockers", "Calcium channel blockers", "ACE inhibitors"],
        correctIndex: 0,
        rationale: "Diuretics increase uric acid levels by reducing renal excretion."
      },
      {
        id: "ch20_q22",
        text: "Lab test to confirm diagnosis of Gout?",
        options: ["CBC", "Synovial fluid analysis for urate crystals", "Chest X-ray", "EKG"],
        correctIndex: 1,
        rationale: "Needle-shaped urate crystals in joint fluid confirm Gout."
      },
      {
        id: "ch20_q23",
        text: "Expected X-ray finding in Osteoarthritis?",
        options: ["Joint space widening", "Joint space narrowing & bone spurs", "Fractures", "Soft tissue swelling only"],
        correctIndex: 1,
        rationale: "OA shows decreased joint space and osteophytes (bone spurs)."
      },
      {
        id: "ch20_q24",
        text: "Priority teaching for Lupus patient about pregnancy?",
        options: ["Safe to get pregnant anytime", "High-risk; requires specialist care", "Stop all medications", "Avoid prenatal vitamins"],
        correctIndex: 1,
        rationale: "SLE pregnancies are high-risk due to flares and complications; need MFM specialist."
      },
      {
        id: "ch20_q25",
        text: "Biologic therapy for severe Rheumatoid Arthritis?",
        options: ["Aspirin", "TNF inhibitors (Etanercept)", "Tylenol", "Vitamin D"],
        correctIndex: 1,
        rationale: "TNF-alpha inhibitors target specific immune pathways in RA."
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
        id: "ch21_q01",
        text: "Contact Transmission involves:",
        options: ["Insect bite", "Direct/Indirect contact", "Airborne particles", "Ingestion"],
        correctIndex: 1,
        rationale: "Direct contact or contact with contaminated surfaces."
      },
      {
        id: "ch21_q02",
        text: "Vector-Borne Transmission involves:",
        options: ["Insects (ticks/mosquitoes)", "Direct contact", "Breathing", "Food"],
        correctIndex: 0,
        rationale: "Vectors are living organisms (insects) that transmit disease."
      },
      {
        id: "ch21_q03",
        text: "Airborne Transmission involves:",
        options: ["Doorknobs", "Breathing small suspended particles", "Food", "Droplets >5 microns"],
        correctIndex: 1,
        rationale: "Airborne pathogens remain suspended in air for long periods."
      },
      {
        id: "ch21_q04",
        text: "Common MDRO requiring Contact Precautions?",
        options: ["Strep", "MRSA", "Flu", "Shingles"],
        correctIndex: 1,
        rationale: "MRSA is a resistant organism spread by contact."
      },
      {
        id: "ch21_q05",
        text: "Priority for C. diff?",
        options: ["Mask", "Soap & Water hand wash", "Negative pressure", "Open door"],
        correctIndex: 1,
        rationale: "Alcohol does not kill C. diff spores; mechanical washing is required."
      },
      {
        id: "ch21_q06",
        text: "VRE is spread via:",
        options: ["Contact", "Airborne", "Water", "Mosquitoes"],
        correctIndex: 0,
        rationale: "VRE survives on surfaces/hands; spread by contact."
      },
      {
        id: "ch21_q07",
        text: "Highest risk for MDRO?",
        options: ["Broken arm", "ICU with central line/antibiotics", "Cold", "Outpatient"],
        correctIndex: 1,
        rationale: "Invasive devices and antibiotic use increase MDRO risk."
      },
      {
        id: "ch21_q08",
        text: "Acinetobacter baumannii is associated with:",
        options: ["Food", "VAP/Wound infections in ICU", "Sore throat", "Ticks"],
        correctIndex: 1,
        rationale: "Opportunistic pathogen common in ICUs/ventilators."
      },
      {
        id: "ch21_q09",
        text: "Antibiotic Stewardship means:",
        options: ["Antibiotics for all", "Right drug/dose/duration", "Creating drugs", "No antibiotics"],
        correctIndex: 1,
        rationale: "Optimizing use to prevent resistance."
      },
      {
        id: "ch21_q10",
        text: "Donning PPE order?",
        options: ["Gloves first", "Gown -> Gloves", "Mask -> Gloves", "Gloves -> Mask"],
        correctIndex: 1,
        rationale: "Gown first, then gloves over cuffs."
      },
      {
        id: "ch21_q11",
        text: "Most contaminated PPE item (remove first)?",
        options: ["Mask", "Gown", "Gloves", "Goggles"],
        correctIndex: 2,
        rationale: "Gloves are most contaminated."
      },
      {
        id: "ch21_q12",
        text: "CRE are dangerous because:",
        options: ["Viral", "Resistant to carbapenems", "Affect kids", "Waterborne"],
        correctIndex: 1,
        rationale: "Resistant to last-resort antibiotics."
      },
      {
        id: "ch21_q13",
        text: "Cohort isolation involves:",
        options: ["Same organism roommates", "Any roommate", "Home", "Negative pressure"],
        correctIndex: 0,
        rationale: "Patients with the SAME active infection can share a room."
      },
      {
        id: "ch21_q14",
        text: "Best way to break transmission?",
        options: ["Diagnosis", "Hand Hygiene", "Nutrition", "Vaccines"],
        correctIndex: 1,
        rationale: "Hand hygiene is #1 for preventing spread."
      },
      {
        id: "ch21_q15",
        text: "Standard Precautions apply to:",
        options: ["Infected only", "HIV only", "All patients", "Surgical only"],
        correctIndex: 2,
        rationale: "Universal standard for all patients."
      },
      {
        id: "ch21_q16",
        text: "Transmission-based precaution for active TB?",
        options: ["Contact", "Droplet", "Airborne", "Standard only"],
        correctIndex: 2,
        rationale: "TB requires airborne precautions with N95 respirator."
      },
      {
        id: "ch21_q17",
        text: "PPE removal (doffing) order?",
        options: ["Mask first", "Gloves -> Gown -> Mask -> Goggles", "Gown first", "Goggles first"],
        correctIndex: 1,
        rationale: "Remove most contaminated items first (gloves) before touching face."
      },
      {
        id: "ch21_q18",
        text: "Type of precaution for Influenza?",
        options: ["Contact", "Airborne", "Droplet", "Protective environment"],
        correctIndex: 2,
        rationale: "Influenza spreads via large droplets; requires surgical mask."
      },
      {
        id: "ch21_q19",
        text: "ESBL organisms are resistant to:",
        options: ["All antibiotics", "Beta-lactam antibiotics", "Antifungals", "Antivirals"],
        correctIndex: 1,
        rationale: "Extended-spectrum beta-lactamase breaks down penicillins and cephalosporins."
      },
      {
        id: "ch21_q20",
        text: "Contact precautions require:",
        options: ["N95 mask", "Gown and gloves", "Negative pressure room", "PAPR"],
        correctIndex: 1,
        rationale: "Gown and gloves prevent transmission via direct contact."
      },
      {
        id: "ch21_q21",
        text: "CRE stands for:",
        options: ["Carbapenem-Resistant Enterobacteriaceae", "Common Respiratory Enterococcus", "Chronic Renal Encephalopathy", "Continuous Renal Excretion"],
        correctIndex: 0,
        rationale: "CRE are 'superbugs' resistant to carbapenem antibiotics."
      },
      {
        id: "ch21_q22",
        text: "Negative pressure room is required for:",
        options: ["MRSA", "C. diff", "Tuberculosis", "VRE"],
        correctIndex: 2,
        rationale: "Negative pressure prevents airborne particles from escaping the room."
      },
      {
        id: "ch21_q23",
        text: "Priority action if exposed to blood/bodily fluids?",
        options: ["Document later", "Wash area immediately & report", "Continue working", "Wait until end of shift"],
        correctIndex: 1,
        rationale: "Immediate washing and reporting enables timely post-exposure prophylaxis."
      },
      {
        id: "ch21_q24",
        text: "MDROs develop resistance primarily due to:",
        options: ["Proper antibiotic use", "Overuse and misuse of antibiotics", "Handwashing", "Vaccination"],
        correctIndex: 1,
        rationale: "Inappropriate antibiotic use drives selection of resistant strains."
      },
      {
        id: "ch21_q25",
        text: "Which patient requires protective environment (reverse isolation)?",
        options: ["MRSA infection", "Neutropenic cancer patient", "Diabetic", "Post-op day 1"],
        correctIndex: 1,
        rationale: "Immunocompromised patients need protection from environmental pathogens."
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
        id: "ch22_q01",
        text: "Correct HIV progression?",
        options: ["Acute->AIDS", "Viral transmission -> Seroconversion -> Acute -> Chronic -> AIDS", "AIDS first", "Transmission->AIDS"],
        correctIndex: 1,
        rationale: "Transmission > Antibodies > Acute Sx > Latency > AIDS."
      },
      {
        id: "ch22_q02",
        text: "Sign of deterioration in HIV?",
        options: ["Undetectable load", "Weight loss >10%", "Night sweats", "CD4 600"],
        correctIndex: 1,
        rationale: "Wasting syndrome (>10% loss) indicates progression."
      },
      {
        id: "ch22_q03",
        text: "PrEP is:",
        options: ["Vaccine", "Daily med to prevent HIV", "After sex", "Cure"],
        correctIndex: 1,
        rationale: "Pre-Exposure Prophylaxis prevents acquisition."
      },
      {
        id: "ch22_q04",
        text: "CD4 count of 180 indicates:",
        options: ["Acute HIV", "AIDS", "Adherence", "Normal"],
        correctIndex: 1,
        rationale: "AIDS < 200 CD4 cells."
      },
      {
        id: "ch22_q05",
        text: "Opportunistic Infection (OI) in AIDS?",
        options: ["Strep", "PCP Pneumonia", "Flu", "Eczema"],
        correctIndex: 1,
        rationale: "PCP is a classic OI."
      },
      {
        id: "ch22_q06",
        text: "Goal of ART?",
        options: ["Cure", "Undetectable viral load", "Increase virus", "Decrease CD4"],
        correctIndex: 1,
        rationale: "Suppress virus to undetectable levels."
      },
      {
        id: "ch22_q07",
        text: "Kaposi's Sarcoma presents as:",
        options: ["Purple/red skin lesions", "White patches", "Diarrhea", "Blindness"],
        correctIndex: 0,
        rationale: "Cancer of blood vessels causing purple lesions."
      },
      {
        id: "ch22_q08",
        text: "Needle stick priority?",
        options: ["Wait", "PEP within 72h", "Antibiotics", "Retire"],
        correctIndex: 1,
        rationale: "Post-Exposure Prophylaxis ASAP (max 72h)."
      },
      {
        id: "ch22_q09",
        text: "Undetectable viral load means:",
        options: ["Cured", "Gone", "Untransmittable (U=U)", "Stop meds"],
        correctIndex: 2,
        rationale: "Cannot transmit sexually, but must keep taking meds."
      },
      {
        id: "ch22_q10",
        text: "Oral Thrush presents as:",
        options: ["Blisters", "Creamy white patches", "Bleeding", "Taste loss"],
        correctIndex: 1,
        rationale: "Fungal infection, white patches."
      },
      {
        id: "ch22_q11",
        text: "HIV Screening/Confirmation test?",
        options: ["CBC", "CXR", "4th Gen Antigen/Antibody", "UA"],
        correctIndex: 2,
        rationale: "Detects p24 antigen and antibodies early."
      },
      {
        id: "ch22_q12",
        text: "IRIS is:",
        options: ["Collapse", "Immune recovery causing inflammation", "Stop meds", "Mutation"],
        correctIndex: 1,
        rationale: "Recovering immune system attacks old infections."
      },
      {
        id: "ch22_q13",
        text: "Vertical Transmission:",
        options: ["Sex", "Needles", "Mother-to-child", "Blood"],
        correctIndex: 2,
        rationale: "Perinatal transmission."
      },
      {
        id: "ch22_q14",
        text: "ART Adherence requirement:",
        options: ["When sick", "95%+", "Double dose", "Stop if side effects"],
        correctIndex: 1,
        rationale: "Strict adherence prevents resistance."
      },
      {
        id: "ch22_q15",
        text: "TB in HIV:",
        options: ["Rare", "Leading cause of death", "Untreatable", "No isolation"],
        correctIndex: 1,
        rationale: "Major coinfection and killer."
      },
      {
        id: "ch22_q16",
        text: "Window period for HIV testing refers to:",
        options: ["Treatment duration", "Time between infection and detectable antibodies", "CD4 recovery time", "Viral load doubling time"],
        correctIndex: 1,
        rationale: "It takes 2-12 weeks for antibodies to develop; tests may be negative during this time."
      },
      {
        id: "ch22_q17",
        text: "Common side effect of Efavirenz (NNRTI)?",
        options: ["Weight gain", "Vivid dreams/CNS effects", "Hair loss", "Diarrhea"],
        correctIndex: 1,
        rationale: "Efavirenz commonly causes neuropsychiatric side effects including vivid dreams."
      },
      {
        id: "ch22_q18",
        text: "PrEP (Pre-Exposure Prophylaxis) is for:",
        options: ["Treating HIV infection", "Preventing HIV in high-risk individuals", "Curing AIDS", "Treating opportunistic infections"],
        correctIndex: 1,
        rationale: "PrEP (Truvada/Descovy) reduces HIV acquisition risk by >90% when taken consistently."
      },
      {
        id: "ch22_q19",
        text: "CD4 count indicating severe immunosuppression/AIDS?",
        options: [">500", "350-500", "200-350", "<200"],
        correctIndex: 3,
        rationale: "CD4 <200 defines AIDS and dramatically increases opportunistic infection risk."
      },
      {
        id: "ch22_q20",
        text: "Cryptococcal meningitis in AIDS patients presents with:",
        options: ["Rash", "Severe headache & altered mental status", "Cough", "Diarrhea"],
        correctIndex: 1,
        rationale: "Fungal meningitis causes headache, fever, and neurological changes."
      },
      {
        id: "ch22_q21",
        text: "Adherence requirement for ART effectiveness?",
        options: ["50%", "75%", ">95%", "Take when sick"],
        correctIndex: 2,
        rationale: "Strict adherence >95% prevents resistance and maintains viral suppression."
      },
      {
        id: "ch22_q22",
        text: "Wasting syndrome (HIV-associated) is defined as:",
        options: ["Weight gain", ">10% unintentional weight loss", "Increased muscle mass", "Fluid retention"],
        correctIndex: 1,
        rationale: "AIDS wasting involves severe involuntary weight loss with muscle depletion."
      },
      {
        id: "ch22_q23",
        text: "Integrase inhibitor example?",
        options: ["Raltegravir", "Efavirenz", "Lamivudine", "Ritonavir"],
        correctIndex: 0,
        rationale: "Raltegravir (Isentress) blocks HIV integration into host DNA."
      },
      {
        id: "ch22_q24",
        text: "Patient education about ART resistance?",
        options: ["Missing doses has no effect", "Resistance develops with inconsistent use", "Double dose if missed", "Stop meds if feeling better"],
        correctIndex: 1,
        rationale: "Inconsistent dosing allows viral replication and mutation to resistant strains."
      },
      {
        id: "ch22_q25",
        text: "Legal requirement for HIV status disclosure?",
        options: ["Must tell everyone", "Varies by state; often required to inform sexual partners", "Never required", "Only employers need to know"],
        correctIndex: 1,
        rationale: "Laws vary; many states criminalize non-disclosure to sexual partners."
      }
    ]
  },
  {
    id: 'quiz1',
    title: 'Review for Quiz 1',
    icon: <Brain className="w-6 h-6" />,
    description: 'Mixed Review: Chapters 18-22.',
    questions: [
      {
        id: "quiz1_q01",
        text: "Which antibody provides passive immunity in breast milk?",
        options: ["IgG", "IgM", "IgA", "IgE"],
        correctIndex: 2,
        rationale: "IgA is secreted in mucous membranes and breast milk."
      },
      {
        id: "quiz1_q02",
        text: "Contact dermatitis is which hypersensitivity type?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 3,
        rationale: "Type IV delayed cell-mediated reaction (e.g., poison ivy)."
      },
      {
        id: "quiz1_q03",
        text: "Heberden's nodes are found in:",
        options: ["Rheumatoid Arthritis", "Osteoarthritis", "Gout", "Lupus"],
        correctIndex: 1,
        rationale: "Bony enlargements at DIP joints characteristic of OA."
      },
      {
        id: "quiz1_q04",
        text: "Why is soap and water required for C. diff?",
        options: ["Smells better", "Alcohol doesn't kill spores", "Faster", "Required by law"],
        correctIndex: 1,
        rationale: "Mechanical action of soap and water removes C. diff spores; alcohol doesn't."
      },
      {
        id: "quiz1_q05",
        text: "CD4 count at AIDS diagnosis?",
        options: [">500", "350-500", "200-350", "<200"],
        correctIndex: 3,
        rationale: "AIDS is defined by CD4 <200 or opportunistic infections."
      },
      {
        id: "quiz1_q06",
        text: "Which cell type produces antibodies?",
        options: ["T-cells", "Plasma cells (B-cells)", "Neutrophils", "Basophils"],
        correctIndex: 1,
        rationale: "B-cells differentiate into plasma cells that secrete antibodies."
      },
      {
        id: "quiz1_q07",
        text: "Butterfly rash is associated with:",
        options: ["RA", "OA", "SLE (Lupus)", "Gout"],
        correctIndex: 2,
        rationale: "Malar rash across cheeks/nose is classic for Systemic Lupus Erythematosus."
      },
      {
        id: "quiz1_q08",
        text: "Priority action during anaphylaxis?",
        options: ["Call physician", "Administer epinephrine", "Start IV", "Take vital signs"],
        correctIndex: 1,
        rationale: "Epinephrine IM is the first-line life-saving treatment."
      },
      {
        id: "quiz1_q09",
        text: "MRSA requires which precautions?",
        options: ["Standard only", "Contact", "Airborne", "Droplet"],
        correctIndex: 1,
        rationale: "MRSA spreads via direct contact; gown and gloves required."
      },
      {
        id: "quiz1_q10",
        text: "Goal of antiretroviral therapy (ART)?",
        options: ["Cure HIV", "Increase CD4", "Undetectable viral load", "Kill all T-cells"],
        correctIndex: 2,
        rationale: "ART suppresses HIV replication to undetectable levels."
      },
      {
        id: "quiz1_q11",
        text: "Inflammation is part of which immunity?",
        options: ["Adaptive", "Innate", "Passive", "Artificial"],
        correctIndex: 1,
        rationale: "Inflammation is a non-specific innate immune response."
      },
      {
        id: "quiz1_q12",
        text: "Serum sickness is which type of reaction?",
        options: ["Type I", "Type II", "Type III", "Type IV"],
        correctIndex: 2,
        rationale: "Type III immune complex-mediated hypersensitivity."
      },
      {
        id: "quiz1_q13",
        text: "Which medication prevents Gout attacks long-term?",
        options: ["Colchicine", "Allopurinol", "Prednisone", "NSAIDs"],
        correctIndex: 1,
        rationale: "Allopurinol reduces uric acid production to prevent future flares."
      },
      {
        id: "quiz1_q14",
        text: "Hand hygiene is most effective at preventing:",
        options: ["Aging", "MDRO transmission", "Genetic diseases", "Cancer"],
        correctIndex: 1,
        rationale: "Proper handwashing is the #1 method to break infection chain."
      },
      {
        id: "quiz1_q15",
        text: "Kaposi's Sarcoma appears as:",
        options: ["White patches", "Purple skin lesions", "Yellow nodules", "Clear blisters"],
        correctIndex: 1,
        rationale: "Vascular cancer causing purple/red lesions in AIDS patients."
      },
      {
        id: "quiz1_q16",
        text: "Which antibody is first to respond in infection?",
        options: ["IgA", "IgE", "IgG", "IgM"],
        correctIndex: 3,
        rationale: "IgM appears first during acute infection ('M for iMmediate')."
      },
      {
        id: "quiz1_q17",
        text: "Anaphylaxis involves which antibody?",
        options: ["IgA", "IgE", "IgG", "IgM"],
        correctIndex: 1,
        rationale: "IgE binds to allergens and triggers mast cell degranulation."
      },
      {
        id: "quiz1_q18",
        text: "Lab most specific for SLE?",
        options: ["CBC", "Anti-dsDNA", "CRP", "Uric acid"],
        correctIndex: 1,
        rationale: "Anti-dsDNA and Anti-Smith antibodies are highly specific for Lupus."
      },
      {
        id: "quiz1_q19",
        text: "Standard precautions apply to:",
        options: ["Infected patients only", "HIV patients only", "All patients", "Surgical patients only"],
        correctIndex: 2,
        rationale: "Standard precautions are used universally for all patient care."
      },
      {
        id: "quiz1_q20",
        text: "Undetectable = Untransmittable (U=U) means:",
        options: ["HIV is cured", "Cannot transmit HIV sexually", "Can stop medications", "CD4 is restored"],
        correctIndex: 1,
        rationale: "Sustained viral suppression prevents sexual transmission of HIV."
      },
      {
        id: "quiz1_q21",
        text: "Which immunity provides immediate, non-specific defense?",
        options: ["Adaptive", "Innate", "Passive", "Humoral"],
        correctIndex: 1,
        rationale: "Innate immunity (barriers, inflammation, phagocytes) responds immediately."
      },
      {
        id: "quiz1_q22",
        text: "First-line DMARD for Rheumatoid Arthritis?",
        options: ["Prednisone", "Methotrexate", "Ibuprofen", "Tylenol"],
        correctIndex: 1,
        rationale: "Methotrexate is the gold-standard DMARD to slow RA progression."
      },
      {
        id: "quiz1_q23",
        text: "PPE doffing order (removal)?",
        options: ["Mask first", "Gloves -> Gown -> Mask", "Gown first", "Random order"],
        correctIndex: 1,
        rationale: "Remove most contaminated items (gloves) first, mask last."
      },
      {
        id: "quiz1_q24",
        text: "PEP (Post-Exposure Prophylaxis) must start within:",
        options: ["1 week", "72 hours", "1 month", "No time limit"],
        correctIndex: 1,
        rationale: "PEP is most effective when started within 72 hours of HIV exposure."
      },
      {
        id: "quiz1_q25",
        text: "Neutrophils primarily fight which infections?",
        options: ["Viral", "Bacterial", "Parasitic", "Fungal"],
        correctIndex: 1,
        rationale: "Neutrophils are first responders to bacterial infections."
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
  
  // Weakness Tracking States
  const [weaknessStats, setWeaknessStats] = useState(() => {
    const saved = localStorage.getItem('rnMasteryWeakness');
    return saved ? JSON.parse(saved) : { missedBySkill: {}, missedByConcept: {}, missedByBloom: {} };
  });
  
  // Mode & Confidence States
  const [currentMode, setCurrentMode] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('rnMasteryAnalytics');
    return saved ? JSON.parse(saved) : {
      totalAttempts: 0,
      correctCount: 0,
      missedCount: 0,
      confidenceStats: {
        sureCorrect: 0,
        sureWrong: 0,
        guessCorrect: 0,
        guessWrong: 0
      }
    };
  });
  
  // AI States
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Firebase
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submittedChapters, setSubmittedChapters] = useState([]);

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
    if (auth) return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch submitted chapters for ranked mode
        try {
          const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'scores'),
            where('uid', '==', u.uid)
          );
          const snapshot = await getDocs(q);
          const chapters = snapshot.docs.map(doc => doc.data().chapterTitle);
          setSubmittedChapters([...new Set(chapters)]);
        } catch (e) {
          console.error('Error fetching submitted chapters:', e);
        }
      }
    });
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
    // Enrich questions with metadata tags
    const enrichedChapter = {
      ...chapter,
      questions: enrichQuestions(chapter.questions)
    };
    
    // Shuffle questions for randomization
    const shuffledChapter = {
      ...enrichedChapter,
      questions: shuffleArray(enrichedChapter.questions)
    };
    
    setActiveChapter(shuffledChapter);
    setCurrentMode(null);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedQuestions([]);
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
    setConfidence(null);
    setGameState('playing');
    setSelectedOption(null);
    setShowRationale(false);
    setAiExplanation(null);
    setFeedbackMessage('');
    setRiskMode(false);
  };

  const startMode = (mode, chapterId) => {
    // Get all questions from all chapters and enrich with tags
    const allQuestions = INITIAL_DATA.flatMap(ch => 
      enrichQuestions(ch.questions)
    );
    
    // Get filtered pool based on selected mode
    const missedIds = missedQuestions.map(mq => mq.question.id);
    const pool = getPool(allQuestions, mode, { chapterId, missedIds });
    
    if (pool.length === 0) {
      alert('No questions available for this mode!');
      return;
    }
    
    // Find mode info for display
    const { MODE_INFO } = require('./modes');
    const modeInfo = MODE_INFO[mode];
    
    // Create virtual chapter with filtered questions
    const modeChapter = {
      id: chapterId || mode,
      title: modeInfo.title,
      icon: modeInfo.icon,
      description: modeInfo.description,
      questions: shuffleArray(pool)
    };
    
    setActiveChapter(modeChapter);
    setCurrentMode(mode);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedQuestions([]);
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
    setConfidence(null);
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
      
      // Update weakness stats
      if (currentQuestion.skill || currentQuestion.concept) {
        const newWeakness = { ...weaknessStats };
        
        // Track by skill
        if (Array.isArray(currentQuestion.skill)) {
          currentQuestion.skill.forEach(skill => {
            newWeakness.missedBySkill = newWeakness.missedBySkill || {};
            newWeakness.missedBySkill[skill] = (newWeakness.missedBySkill[skill] || 0) + 1;
          });
        }
        
        // Track by concept
        if (currentQuestion.concept) {
          newWeakness.missedByConcept = newWeakness.missedByConcept || {};
          newWeakness.missedByConcept[currentQuestion.concept] = 
            (newWeakness.missedByConcept[currentQuestion.concept] || 0) + 1;
        }
        
        // Track by Bloom level
        if (currentQuestion.bloom) {
          newWeakness.missedByBloom = newWeakness.missedByBloom || {};
          newWeakness.missedByBloom[currentQuestion.bloom] = 
            (newWeakness.missedByBloom[currentQuestion.bloom] || 0) + 1;
        }
        
        setWeaknessStats(newWeakness);
        localStorage.setItem('rnMasteryWeakness', JSON.stringify(newWeakness));
      }
      
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
      setConfidence(null);
      setHiddenOptions([]); // Reset hidden options for new question
    } else {
      const isNewRecord = savePersonalBest(activeChapter.id, score);
      const percentage = Math.round((correctCount / activeChapter.questions.length) * 100);
      
      // Victory confetti for good scores (70% or higher)
      if (percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
        });
        // Extra confetti for perfect scores
        if (percentage === 100) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#FFD700', '#FFA500']
            });
          }, 300);
        }
      }
      
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
          // Update local submitted chapters list
          if (!submittedChapters.includes(activeChapter.title)) {
            setSubmittedChapters([...submittedChapters, activeChapter.title]);
          }
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
    const prompt = `Context: Nursing Student Game - Clinical Pearls Focus. Question: "${q.text}". Answer: "${q.options[q.correctIndex]}". Rationale: "${q.rationale}". Task: Give a very short, memorable mnemonic AND a clinical pearl (real-world nursing insight or case study tip) to help remember this concept in practice.`;
    const text = await callGemini(prompt);
    setAiExplanation(text);
    setIsAiLoading(false);
  };

  const handleConfidenceSelect = (conf) => {
    setConfidence(conf);
    
    const currentQuestion = activeChapter.questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctIndex;
    
    // Determine which confidence category
    const key = conf === 'SURE' 
      ? (isCorrect ? 'sureCorrect' : 'sureWrong')
      : (isCorrect ? 'guessCorrect' : 'guessWrong');
    
    // Update analytics
    const newAnalytics = {
      ...analytics,
      totalAttempts: analytics.totalAttempts + 1,
      correctCount: isCorrect ? analytics.correctCount + 1 : analytics.correctCount,
      missedCount: isCorrect ? analytics.missedCount : analytics.missedCount + 1,
      confidenceStats: {
        ...analytics.confidenceStats,
        [key]: analytics.confidenceStats[key] + 1
      }
    };
    
    setAnalytics(newAnalytics);
    localStorage.setItem('rnMasteryAnalytics', JSON.stringify(newAnalytics));
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
    const examTip = getExamTip(q);
    
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
              examTip={examTip}
              confidence={confidence}
              onSelectOption={setSelectedOption}
              onAiTutor={handleAiTutor}
              onNextQuestion={nextQuestion}
              onConfidenceSelect={handleConfidenceSelect}
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

  const ModeSelectScreen = () => {
    return (
      <ModeSelector
        chapters={INITIAL_DATA}
        analytics={analytics}
        onSelectMode={startMode}
        onBack={() => setGameState('menu')}
      />
    );
  };

  // --- MAIN RENDER ---
  if (gameState === 'menu') {
    return (
      <ChapterSelector 
        chapters={INITIAL_DATA}
        onSelectChapter={startChapter}
        onViewLeaderboard={() => setGameState('leaderboard')}
        onPracticeModes={() => setGameState('modeSelector')}
        submittedChapters={submittedChapters}
      />
    );
  }

  if (gameState === 'modeSelector') return <ModeSelectScreen />;

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
        hasSubmitted={submittedChapters.includes(activeChapter.title)}
        aiExplanation={aiExplanation}
      />
    );
  }

  if (gameState === 'playing') return <GameScreen />;
  if (gameState === 'leaderboard') return <LeaderboardScreen />;
  
  return null;
}
