import React, { useState, useEffect } from 'react';
import { Shield, Bug, Bone, Activity, AlertCircle, Brain, Trophy, ArrowRight, CheckCircle, XCircle, Flame, Split, Loader2, Sparkles, Target, Crown, Lock, GraduationCap, Save, Download, Settings, Zap, Clock, Timer, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { collection, addDoc, onSnapshot, query, limit, serverTimestamp, getDocs, where } from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";

// Import Firebase config
import { db, auth } from './firebase';

// Import tag overlay system and modes engine
import { enrichQuestions, getExamTip } from './questionTags/index';
import { MODES, getPool } from './modes';
import InstructorMode from './components/InstructorMode';
import { transformToRankedQuestion, scoreRationale, calculateTimeMultiplier, detectAnswerPattern } from './questionTransformer';

// Log Firebase status
console.log('Firebase initialized:', { db: !!db, auth: !!auth });

// --- GEMINI API INTEGRATION ---
const callGemini = async (prompt) => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "AIzaSyAT-wsupPN4ROtkDzkYVJ9yRJiGa4LvvV8";
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

// --- APP ID ---
let appId = 'rn-mastery-game';
if (typeof window !== 'undefined' && typeof window.__app_id !== 'undefined') {
  appId = window.__app_id;
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
  // Core Game State
  const [gameState, setGameState] = useState('menu'); 
  const [gameMode, setGameMode] = useState('study'); // 'study' or 'ranked'
  const [studyModeScores, setStudyModeScores] = useState(() => {
    const saved = localStorage.getItem('rnMasteryStudyScores');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentPerformance, setCurrentPerformance] = useState(100); // Track current session performance
  const [activeChapter, setActiveChapter] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showRationale, setShowRationale] = useState(false);
  
  // Scoring & Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState([]);
  
  // New Features
  const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [confidence, setConfidence] = useState(null);
  
  // Ranked Mode specific
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeSpent, setTimeSpent] = useState(0);
  const [selectedRationale, setSelectedRationale] = useState(null);
  const [showRationaleSelection, setShowRationaleSelection] = useState(false);
  const [recentAnswerIndices, setRecentAnswerIndices] = useState([]);
  const [lastRationaleTier, setLastRationaleTier] = useState(null);
  
  // Instructor Mode
  const [showInstructorMode, setShowInstructorMode] = useState(false);
  const [customChapters, setCustomChapters] = useState([]);
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  
  // Weakness & Analytics Tracking
  const [weaknessStats, setWeaknessStats] = useState(() => {
    const saved = localStorage.getItem('rnMasteryWeakness');
    return saved ? JSON.parse(saved) : { missedBySkill: {}, missedByConcept: {}, missedByBloom: {} };
  });
  
  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('rnMasteryAnalytics');
    return saved ? JSON.parse(saved) : {
      totalAttempts: 0,
      correctCount: 0,
      missedCount: 0,
      confidenceStats: { sureCorrect: 0, sureWrong: 0, guessCorrect: 0, guessWrong: 0 }
    };
  });
  
  // AI States
  const [aiExplanation, setAiExplanation] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiStudyGuide, setAiStudyGuide] = useState(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  
  // Firebase States
  const [user, setUser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [submittedChapters, setSubmittedChapters] = useState([]);
  const [firebaseStatus, setFirebaseStatus] = useState({ connected: !!db && !!auth, authenticated: false, initializing: true });

  // --- LOAD CUSTOM CHAPTERS FROM FIREBASE ---
  useEffect(() => {
    const loadCustomChapters = async () => {
      if (!db) return;
      try {
        const querySnapshot = await getDocs(collection(db, 'customChapters'));
        const chapters = [];
        querySnapshot.forEach((doc) => {
          chapters.push({ ...doc.data(), id: doc.id });
        });
        setCustomChapters(chapters);
      } catch (error) {
        console.error('Error loading custom chapters:', error);
      }
    };
    loadCustomChapters();
    
    // Load unlocked chapters from Firestore
    const loadUnlockedChapters = async () => {
      if (!db) return;
      try {
        const docSnap = await getDocs(collection(db, 'settings'));
        const settingsDoc = docSnap.docs.find(d => d.id === 'chapterAccess');
        if (settingsDoc) {
          setUnlockedChapters(settingsDoc.data().unlocked || []);
        } else {
          // If no settings doc exists, unlock all by default
          setUnlockedChapters(['ch18', 'ch19', 'ch20', 'ch21', 'ch22', 'quiz1']);
        }
      } catch (error) {
        console.error('Error loading chapter locks:', error);
        // Default: unlock all built-in chapters on error
        setUnlockedChapters(['ch18', 'ch19', 'ch20', 'ch21', 'ch22', 'quiz1']);
      }
    };
    loadUnlockedChapters();
  }, []);

  // --- TIMER FOR RANKED MODE ---
  useEffect(() => {
    if (gameMode !== 'ranked' || gameState !== 'playing' || showRationale) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - auto submit with current answer or null
          handleAnswer(selectedOption, 'TIMEOUT');
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameMode, gameState, showRationale, currentQuestionIndex, selectedOption]);

  // --- FIREBASE AUTH & DATA LOADING ---
  useEffect(() => {
    if (!auth || !db) {
      console.error('Firebase not initialized properly');
      setFirebaseStatus({ connected: false, authenticated: false, initializing: false });
      return;
    }

    setFirebaseStatus({ connected: true, authenticated: false, initializing: true });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log('Auth state changed:', u ? `User logged in: ${u.uid}` : 'No user');
      setUser(u);
      setFirebaseStatus({ connected: true, authenticated: !!u, initializing: false });
      
      if (u && db) {
        try {
          const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'scores'),
            where('uid', '==', u.uid)
          );
          const snapshot = await getDocs(q);
          const chapters = snapshot.docs.map(doc => doc.data().chapterTitle);
          setSubmittedChapters([...new Set(chapters)]);
          console.log('Loaded submitted chapters:', chapters);
        } catch (e) {
          console.error('Error fetching submitted chapters:', e);
        }
      }
    });
    
    // Trigger authentication immediately
    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        if (typeof window !== 'undefined' && window.__initial_auth_token) {
          console.log('Signing in with custom token');
          await signInWithCustomToken(auth, window.__initial_auth_token);
        } else {
          console.log('Attempting anonymous sign in...');
          const result = await signInAnonymously(auth);
          console.log('Anonymous sign in successful:', result.user.uid);
        }
      } catch (error) {
        console.error('Auth initialization FAILED:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Show alert for specific errors
        if (error.code === 'auth/operation-not-allowed') {
          alert('⚠️ Anonymous authentication is disabled.\n\nPlease enable it in:\nFirebase Console → Authentication → Sign-in method → Anonymous → Enable');
        } else {
          alert('Authentication failed: ' + error.message);
        }
        
        setFirebaseStatus({ connected: true, authenticated: false, initializing: false });
      }
    };
    
    initAuth();
    
    return () => unsubscribe();
  }, []);

  // --- RANK MODE ACCESS CONTROL ---
  const isRankModeUnlocked = (chapterId) => {
    const chapterScore = studyModeScores[chapterId];
    return chapterScore && chapterScore.percentage >= 85;
  };
  
  const getStudyModePercentage = (chapterId) => {
    return studyModeScores[chapterId]?.percentage || 0;
  };

  // --- GAME LOGIC ---
  const startChapter = (chapter, mode = MODES.CHAPTER_REVIEW) => {
    const chapterId = chapter.id || chapter.chapterId;
    
    // Check Rank Mode access
    if (gameMode === 'ranked' && !isRankModeUnlocked(chapterId)) {
      const currentScore = getStudyModePercentage(chapterId);
      alert(`🔒 Rank Mode Locked\n\nYou need 85% in Study Mode to unlock Rank Mode.\n\nCurrent Study Mode score: ${currentScore}%\n\nComplete Study Mode first to demonstrate mastery!`);
      return;
    }
    // Get questions directly from the selected chapter
    let chapterQuestions = enrichQuestions(chapter.questions);
    
    if (chapterQuestions.length === 0) {
      alert("No questions found for this chapter.");
      return;
    }
    
    // Filter and transform questions for Ranked Mode
    if (gameMode === 'ranked') {
      // Filter for higher-order Bloom levels (APPLICATION, ANALYSIS, PRIORITIZATION)
      const higherOrderBlooms = ['APPLICATION', 'ANALYSIS', 'PRIORITIZATION', 'CLINICAL_JUDGMENT', 'EVALUATE', 'SYNTHESIS'];
      const filteredQuestions = chapterQuestions.filter(q => 
        q.bloom && higherOrderBlooms.some(level => 
          q.bloom.toUpperCase().includes(level)
        )
      );
      
      // Fall back to all questions if no higher-order questions found
      chapterQuestions = filteredQuestions.length >= 5 ? filteredQuestions : chapterQuestions;
      
      // Transform questions for clinical scenarios
      chapterQuestions = chapterQuestions.map(q => transformToRankedQuestion(q));
    }
    
    setActiveChapter(chapter);
    setQuestions(chapterQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setMissedQuestions([]);
    setRecentAnswerIndices([]);
    setGameState('playing');
    resetTurn();
    
    // Start timer for Ranked Mode
    if (gameMode === 'ranked') {
      setTimeLeft(30);
      setTimeSpent(0);
    }
  };

  const resetTurn = () => {
    setSelectedOption(null);
    setConfidence(null);
    setSelectedRationale(null);
    setShowRationaleSelection(false);
    setLastRationaleTier(null);
    
    // Reset timer for ranked mode
    if (gameMode === 'ranked') {
      setTimeLeft(30);
      setTimeSpent(0);
    }
    setShowRationale(false);
    setAiExplanation(null);
    setFiftyFiftyUsed(false);
    setHiddenOptions([]);
  };

  const useFiftyFifty = () => {
    if (fiftyFiftyUsed || showRationale) return;
    const q = questions[currentQuestionIndex];
    const incorrectIndices = q.options.map((_, i) => i).filter(i => i !== q.correctIndex);
    const toHide = incorrectIndices.sort(() => Math.random() - 0.5).slice(0, 2);
    setHiddenOptions(toHide);
    setFiftyFiftyUsed(true);
  };

  const handleAnswer = (optionIndex, confLevel) => {
    setSelectedOption(optionIndex);
    setConfidence(confLevel);
    
    // In Ranked Mode with rationale requirement, show rationale selection first
    if (gameMode === 'ranked' && questions[currentQuestionIndex].requiresRationale && !showRationaleSelection) {
      setShowRationaleSelection(true);
      return; // Don't process answer yet
    }
    
    const q = questions[currentQuestionIndex];
    const isCorrect = optionIndex === q.correctIndex;
    
    // Track answer pattern for ranked mode
    if (gameMode === 'ranked') {
      const newPattern = [...recentAnswerIndices, optionIndex].slice(-5);
      setRecentAnswerIndices(newPattern);
      
      // Detect and warn about patterns
      if (detectAnswerPattern(newPattern)) {
        console.warn('Answer pattern detected - possible guessing');
      }
    }
    
    // Calculate points
    let points = 0;
    let timeMultiplier = 1.0;
    let rationaleScore = null;
    let rationaleTier = null;
    
    if (isCorrect) {
      setCorrectCount(correctCount + 1);
      
      if (gameMode === 'ranked') {
        // Check rationale quality first
        if (q.requiresRationale && selectedRationale !== null) {
          const rationaleResult = scoreRationale(selectedRationale, q.correctRationaleIndex || 0);
          rationaleScore = rationaleResult.score;
          rationaleTier = rationaleResult.tier;
          
          // ZERO POINTS for correct answer with incorrect rationale
          if (rationaleTier === 'incorrect') {
            points = 0;
            setStreak(0); // Break streak for wrong reasoning
          } else {
            // Calculate points for correct/weak rationale
            // Base points
            points = confLevel === 'SURE' ? 150 : 100;
            
            // Streak bonus
            points += streak * 50;
            
            // Time multiplier
            timeMultiplier = calculateTimeMultiplier(timeSpent, q.timeLimit || 30);
            points = Math.round(points * timeMultiplier);
            
            // Rationale adjustment
            if (rationaleTier === 'weak') {
              points = Math.round(points * 0.5); // 50% of points for weak rationale
            }
            // Full points for correct rationale (no adjustment)
            
            // Pattern penalty
            if (detectAnswerPattern(recentAnswerIndices)) {
              points = Math.round(points * 0.5); // 50% penalty for patterns
            }
            
            setStreak(streak + 1); // Maintain streak for weak rationale
          }
        } else {
          // No rationale required (shouldn't happen in ranked mode)
          points = confLevel === 'SURE' ? 150 : 100;
          setStreak(streak + 1);
        }
      } else {
        setStreak(streak + 1);
      }
    } else {
      setIncorrectCount(incorrectCount + 1);
      setStreak(0);
      
      // Track missed question
      setMissedQuestions([...missedQuestions, {
        question: q,
        selectedAnswer: optionIndex,
        questionNumber: currentQuestionIndex + 1,
        timeSpent: gameMode === 'ranked' ? timeSpent : null,
        selectedRationale: gameMode === 'ranked' ? selectedRationale : null,
      }]);
      
      // Update weakness stats
      if (q.skill || q.concept) {
        const newWeakness = { ...weaknessStats };
        
        if (Array.isArray(q.skill)) {
          q.skill.forEach(skill => {
            newWeakness.missedBySkill = newWeakness.missedBySkill || {};
            newWeakness.missedBySkill[skill] = (newWeakness.missedBySkill[skill] || 0) + 1;
          });
        }
        
        if (q.concept) {
          newWeakness.missedByConcept = newWeakness.missedByConcept || {};
          newWeakness.missedByConcept[q.concept] = (newWeakness.missedByConcept[q.concept] || 0) + 1;
        }
        
        if (q.bloom) {
          newWeakness.missedByBloom = newWeakness.missedByBloom || {};
          newWeakness.missedByBloom[q.bloom] = (newWeakness.missedByBloom[q.bloom] || 0) + 1;
        }
        
        setWeaknessStats(newWeakness);
        localStorage.setItem('rnMasteryWeakness', JSON.stringify(newWeakness));
      }
    }
    
    setScore(score + points);
    
    // Update analytics
    const category = confLevel === 'SURE' 
      ? (isCorrect ? 'sureCorrect' : 'sureWrong')
      : (isCorrect ? 'guessCorrect' : 'guessWrong');
    
    const newAnalytics = {
      ...analytics,
      totalAttempts: analytics.totalAttempts + 1,
      correctCount: analytics.correctCount + (isCorrect ? 1 : 0),
      missedCount: analytics.missedCount + (isCorrect ? 0 : 1),
      confidenceStats: {
        ...analytics.confidenceStats,
        [category]: analytics.confidenceStats[category] + 1
      }
    };
    setAnalytics(newAnalytics);
    localStorage.setItem('rnMasteryAnalytics', JSON.stringify(newAnalytics));
    
    // Save to Firebase analytics if user is authenticated
    if (user && db) {
      try {
        const q = questions[currentQuestionIndex];
        addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'analytics'), {
          uid: user.uid,
          questionId: q.id,
          chapterTitle: activeChapter.title,
          isCorrect,
          confidence: confLevel,
          timeSpent: gameMode === 'ranked' ? timeSpent : null,
          timeMultiplier: gameMode === 'ranked' ? timeMultiplier : null,
          rationaleCorrect: gameMode === 'ranked' && q.requiresRationale ? (selectedRationale === (q.correctRationaleIndex || 0)) : null,
          rationaleTier: gameMode === 'ranked' && q.requiresRationale ? rationaleTier : null,
          timestamp: serverTimestamp()
        }).catch(err => console.error('Analytics save error:', err));
      } catch (e) {
        console.error('Analytics error:', e);
      }
    }
    
    setShowRationale(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetTurn();
      
      // Check performance in Rank Mode and redirect if below 70%
      if (gameMode === 'ranked' && currentQuestionIndex > 0) {
        const currentPerf = Math.round((correctCount / (currentQuestionIndex + 1)) * 100);
        setCurrentPerformance(currentPerf);
        
        if (currentPerf < 70 && currentQuestionIndex >= 4) {
          alert(`⚠️ Performance Alert\n\nYour current Rank Mode score is ${currentPerf}%.\n\nReturning to Study Mode to strengthen your understanding.\n\nCome back when you're ready to score 85%+!`);
          setGameState('menu');
          setGameMode('study');
          return;
        }
      }
    } else {
      // End of quiz - trigger confetti for good scores
      const percentage = Math.round((correctCount / questions.length) * 100);
      
      // Save Study Mode scores for Rank Mode unlocking
      if (gameMode === 'study' && activeChapter) {
        const chapterId = activeChapter.id || activeChapter.chapterId;
        const newScores = {
          ...studyModeScores,
          [chapterId]: {
            percentage,
            correctCount,
            totalQuestions: questions.length,
            timestamp: new Date().toISOString()
          }
        };
        setStudyModeScores(newScores);
        localStorage.setItem('rnMasteryStudyScores', JSON.stringify(newScores));
        
        // Show unlock message if threshold reached
        if (percentage >= 85) {
          setTimeout(() => {
            alert(`🎉 Rank Mode Unlocked!\n\nYou scored ${percentage}% in Study Mode.\n\nYou can now attempt Rank Mode for this chapter!`);
          }, 1500);
        }
      }
      
      if (percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1']
        });
        
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
      
      setGameState('summary');
    }
  };

  const getRank = (s) => {
    if (s < 1000) return "Novice";
    if (s < 2000) return "Apprentice";
    if (s < 3000) return "Expert RN";
    return "Clinical Legend 👑";
  };

  const handleAiTutor = async () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      setAiExplanation(`💡 AI Tutor Feature

To enable AI-powered mnemonics and clinical pearls, set up a Google Gemini API key.

Get your free API key at: https://aistudio.google.com/app/apikey

For now, review the rationale provided above to understand this concept!`);
      setIsAiLoading(false);
      return;
    }
    
    setIsAiLoading(true);
    const q = questions[currentQuestionIndex];
    const prompt = `Context: Nursing Student Game - Clinical Pearls Focus. Question: "${q.text}". Answer: "${q.options[q.correctIndex]}". Rationale: "${q.rationale}". Task: Give a very short, memorable mnemonic AND a clinical pearl (real-world nursing insight) to help remember this concept in practice.`;
    const text = await callGemini(prompt);
    setAiExplanation(text);
    setIsAiLoading(false);
  };

  const handleGenerateStudyGuide = async () => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      setAiStudyGuide(`📚 AI Study Guide Feature

To enable AI-generated study guides, you need to set up a Google Gemini API key:

1. Get a free API key at: https://aistudio.google.com/app/apikey
2. Add it to your .env file:
   REACT_APP_GEMINI_API_KEY=your_key_here
3. Rebuild and redeploy

For the deployed version, the instructor needs to add the API key directly to the code or use a backend service.

In the meantime, use the download feature to export your quiz results and create your own study guide!`);
      return;
    }
    
    setIsGuideLoading(true);
    const prompt = `Create a high-yield study guide for: "${activeChapter.title}". Include key concepts, clinical pearls, and NCLEX-style tips. Keep it concise (300 words max).`;
    const text = await callGemini(prompt);
    setAiStudyGuide(text);
    setIsGuideLoading(false);
  };

  const downloadStudyGuide = () => {
    if (!aiStudyGuide) return;
    
    const content = `AI STUDY GUIDE - ${activeChapter.title}
Generated: ${new Date().toLocaleString()}

==============================================
CHAPTER SUMMARY
==============================================
${activeChapter.title}
Score: ${score} | Accuracy: ${Math.round((correctCount / questions.length) * 100)}%
Questions Correct: ${correctCount}/${questions.length}

==============================================
AI-GENERATED STUDY NOTES
==============================================

${aiStudyGuide}

==============================================
MISSED QUESTIONS REVIEW
==============================================

${missedQuestions.length > 0 ? missedQuestions.map((missed, idx) => `
Question ${missed.questionNumber}:
${missed.question.text}

Your Answer: ${missed.question.options[missed.selectedAnswer]}
Correct Answer: ${missed.question.options[missed.question.correctIndex]}

Rationale: ${missed.question.rationale}

---
`).join('\n') : 'No missed questions - Perfect score!'}

==============================================
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChapter.title.replace(/\s+/g, '_')}_Study_Guide.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveScoreToLeaderboard = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name before submitting!');
      return;
    }
    
    if (!user) {
      alert('Authentication required. Please wait a moment and try again.');
      return;
    }
    
    if (submittedChapters.includes(activeChapter.title)) {
      alert('You have already submitted a score for this chapter!');
      return;
    }

    setIsSubmittingScore(true);
    try {
      console.log('Saving score to leaderboard:', {
        playerName: playerName.trim(),
        score,
        chapterTitle: activeChapter.title,
        uid: user.uid
      });
      
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'scores'), {
        playerName: playerName.trim(),
        score: score,
        chapterTitle: activeChapter.title,
        rank: getRank(score),
        timestamp: serverTimestamp(),
        uid: user.uid
      });
      
      console.log('Score saved successfully!');
      setSubmittedChapters([...submittedChapters, activeChapter.title]);
      setIsSubmittingScore(false);
      alert('Score submitted successfully! 🎉');
      setGameState('leaderboard');
    } catch (error) {
      console.error("Error saving score:", error);
      alert(`Failed to save score: ${error.message}. Please check your internet connection and try again.`);
      setIsSubmittingScore(false);
    }
  };

  // --- RENDER SCREENS ---

  const MenuScreen = () => (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="max-w-5xl w-full animate-in fade-in zoom-in-95 duration-500">
        <header className="text-center mb-8">
          <h1 className="text-6xl font-black mb-2 tracking-tighter">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">RN</span>
            <span className="text-white"> MASTERY</span>
          </h1>
          <p className="text-slate-400 text-xl font-medium">Classroom Edition v5.0</p>
          
          {/* Mode Toggle */}
          <div className="flex justify-center mt-6 gap-4">
            <button 
              onClick={() => setGameMode('study')} 
              className={`px-6 py-2 rounded-full font-bold flex items-center transition-all ${
                gameMode === 'study' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" /> Study Mode
            </button>
            <button 
              onClick={() => setGameMode('ranked')} 
              className={`px-6 py-2 rounded-full font-bold flex items-center transition-all ${
                gameMode === 'ranked' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4 mr-2" /> Ranked Mode
            </button>
          </div>
          
          {gameMode === 'ranked' && (
            <p className="text-slate-500 text-sm mt-3">
              🔒 One-shot submission • High stakes scoring
            </p>
          )}
        </header>

        {/* Chapter Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...INITIAL_DATA, ...customChapters].map(chapter => {
            const chapterId = chapter.id || chapter.chapterId;
            const isCompleted = submittedChapters.includes(chapter.title);
            const isChapterLocked = !unlockedChapters.includes(chapterId);
            const rankModeUnlocked = isRankModeUnlocked(chapterId);
            const studyScore = getStudyModePercentage(chapterId);
            const isRankedLocked = gameMode === 'ranked' && (!rankModeUnlocked || isCompleted);
            const isLocked = isChapterLocked || isRankedLocked;
            
            return (
              <button 
                key={chapterId}
                disabled={isLocked}
                onClick={() => startChapter(chapter)} 
                className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all group relative overflow-hidden ${
                  isLocked
                    ? 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800 border-slate-700 hover:border-cyan-500 hover:bg-slate-750'
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Ranked
                  </div>
                )}
                
                {isChapterLocked && (
                  <div className="absolute top-2 left-2 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> Locked
                  </div>
                )}
                
                <div className={`p-4 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
                  gameMode === 'ranked' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  {chapter.icon}
                </div>
                
                <h3 className="font-bold text-lg text-white">{chapter.title}</h3>
                <div className="text-xs text-slate-400 mt-1">{chapter.questions?.length || 25} Questions</div>
                
                {/* Study Mode Score & Rank Mode Status */}
                {gameMode === 'ranked' && (
                  <div className="mt-2 text-xs">
                    {rankModeUnlocked ? (
                      <span className="text-green-400 font-semibold">✓ Unlocked ({studyScore}%)</span>
                    ) : (
                      <span className="text-yellow-400 font-semibold">🔒 Need 85% ({studyScore}%)</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button 
            onClick={() => setGameState('leaderboard')} 
            className="text-slate-400 hover:text-white flex items-center text-sm transition"
          >
            <Crown className="w-4 h-4 mr-2" /> View Leaderboard
          </button>
          <button 
            onClick={() => setShowInstructorMode(true)} 
            className="text-slate-400 hover:text-white flex items-center text-sm transition"
          >
            <Settings className="w-4 h-4 mr-2" /> Instructor Mode
          </button>
        </div>
      </div>
    </div>
  );

  const GameScreen = () => {
    const q = questions[currentQuestionIndex];
    const examTip = getExamTip(q);
    
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGameState('menu')} 
              className="text-slate-400 hover:text-white transition"
            >
              Exit
            </button>
            {q.concept && (
              <div className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300">
                {q.concept.replace(/_/g, ' ')}
              </div>
            )}
            {gameMode === 'ranked' && (
              <div className={`px-3 py-1 rounded-full border text-xs font-bold ${
                timeLeft <= 10 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' :
                timeLeft <= 20 ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' :
                'bg-slate-800 border-slate-700 text-slate-300'
              }`}>
                ⏱️ {timeLeft}s
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`flex items-center font-bold ${
              streak > 2 ? 'text-orange-400 animate-pulse' : 'text-slate-500'
            }`}>
              <Flame className="w-5 h-5 mr-1" /> {streak}
            </div>
            <div className="font-mono text-xl font-black text-white">{score}</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-1 max-w-3xl mx-auto w-full p-8 flex flex-col justify-center">
          <div className="mb-2 text-slate-500 text-sm font-bold">
            Question {currentQuestionIndex + 1} / {questions.length}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold leading-relaxed mb-8">
            {q.text}
          </h2>

          {/* Options */}
          <div className="grid gap-3 mb-8">
            {q.options.map((opt, idx) => {
              if (hiddenOptions.includes(idx)) return null;
              
              let style = "p-5 rounded-xl border-2 text-left font-medium transition-all w-full flex items-center ";
              
              if (showRationale) {
                if (idx === q.correctIndex) {
                  style += "bg-green-500/20 border-green-500 text-green-100";
                } else if (idx === selectedOption) {
                  style += "bg-red-500/20 border-red-500 text-red-100";
                } else {
                  style += "bg-slate-800 border-slate-700 opacity-50";
                }
              } else {
                style += selectedOption === idx
                  ? "bg-cyan-500/20 border-cyan-500 text-white"
                  : "bg-slate-800 border-slate-700 hover:border-cyan-500 hover:bg-slate-750";
              }
              
              // Lock options if in ranked mode and rationale selection is shown (answer submitted)
              const isLocked = gameMode === 'ranked' && showRationaleSelection;

              return (
                <button 
                  key={idx} 
                  disabled={showRationale || isLocked}
                  onClick={() => !isLocked && setSelectedOption(idx)}
                  className={style + (isLocked ? " cursor-not-allowed opacity-75" : "")}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mr-4 text-sm font-bold text-slate-300 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Action Buttons */}
          {!showRationale ? (
            <>
              {/* Rationale Selection for Ranked Mode */}
              {showRationaleSelection && gameMode === 'ranked' && q.rationaleOptions && (
                <div className="mb-6 p-6 bg-purple-900/20 border border-purple-500/30 rounded-xl">
                  <h3 className="text-lg font-bold text-purple-300 mb-4">Select Your Reasoning:</h3>
                  <div className="grid gap-2">
                    {q.rationaleOptions.map((rationale, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRationale(idx)}
                        className={`p-3 rounded-lg text-left text-sm border-2 transition-all ${
                          selectedRationale === idx
                            ? 'bg-purple-500/20 border-purple-500 text-white'
                            : 'bg-slate-800 border-slate-700 hover:border-purple-500 text-slate-300'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}. {rationale}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                {/* Hide 50/50 in Ranked Mode */}
                {gameMode !== 'ranked' && (
                  <button 
                    onClick={useFiftyFifty} 
                    disabled={fiftyFiftyUsed} 
                    className="p-4 bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="50/50 Lifeline"
                  >
                    <Split className="w-6 h-6" />
                  </button>
                )}
                
                {/* In ranked mode with rationale, only show submit after rationale selected */}
                {(!showRationaleSelection || selectedRationale !== null) ? (
                  <>
                    <button 
                      onClick={() => handleAnswer(selectedOption, 'GUESS')} 
                      disabled={selectedOption === null} 
                      className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                      I'm Guessing 🤔
                    </button>
                    
                    <button 
                      onClick={() => handleAnswer(selectedOption, 'SURE')} 
                      disabled={selectedOption === null} 
                      className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    >
                      I'm Sure! 🚀
                    </button>
                  </>
                ) : (
                  <div className="flex-1 py-4 bg-purple-600/20 border-2 border-purple-500 text-purple-300 rounded-xl font-bold text-center">
                    Select a rationale to continue
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Rationale Display */
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-4 mb-6">
                {selectedOption === q.correctIndex ? (
                  <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400 shrink-0" />
                )}
                
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-1 ${
                    selectedOption === q.correctIndex ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {selectedOption === q.correctIndex ? "Correct!" : "Incorrect"}
                  </h3>
                  
                  {/* Time-based performance feedback for Ranked Mode */}
                  {gameMode === 'ranked' && selectedOption === q.correctIndex && (
                    <div className="mb-3">
                      {timeSpent < 3 ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">Too fast! ({timeSpent}s) - Score penalty applied for rushed answer</span>
                        </div>
                      ) : timeSpent <= 15 ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          <Zap className="w-4 h-4" />
                          <span className="font-semibold">Excellent timing! ({timeSpent}s) - Bonus points earned 🎯</span>
                        </div>
                      ) : timeSpent <= 22 ? (
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">Good pace ({timeSpent}s) - Full points awarded</span>
                        </div>
                      ) : timeSpent <= 30 ? (
                        <div className="flex items-center gap-2 text-orange-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">Close call ({timeSpent}s) - Small time penalty</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">Overtime ({timeSpent}s) - Score penalty applied</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Rationale quality feedback for Ranked Mode */}
                  {gameMode === 'ranked' && lastRationaleTier && (
                    <div className="mb-3">
                      {lastRationaleTier === 'correct' ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">Excellent reasoning! Full points for clinical judgment ✓</span>
                        </div>
                      ) : lastRationaleTier === 'weak' ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">Partial credit - Reasoning shows surface understanding but lacks depth</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <XCircle className="w-4 h-4" />
                          <span className="font-semibold">Incorrect reasoning - Zero points. Right answer requires right rationale!</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Rationale quality feedback for Ranked Mode */}
                  {gameMode === 'ranked' && lastRationaleTier && (
                    <div className="mb-3">
                      {lastRationaleTier === 'correct' ? (
                        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">Excellent reasoning! Full points for clinical judgment ✓</span>
                        </div>
                      ) : lastRationaleTier === 'weak' ? (
                        <div className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">Partial credit - Reasoning shows surface understanding but lacks depth</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <XCircle className="w-4 h-4" />
                          <span className="font-semibold">Incorrect reasoning - Zero points. Right answer requires right rationale!</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <p className="text-slate-300 leading-relaxed mb-4">{q.rationale}</p>
                  
                  {/* Exam Tip */}
                  {examTip && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3 items-start">
                      <Target className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                          NCLEX Strategy
                        </div>
                        <p className="text-sm text-blue-200 font-medium">{examTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI Tutor & Next Button */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                {/* Disable AI Tutor in Ranked Mode */}
                {gameMode !== 'ranked' && (
                  <>
                    {!aiExplanation ? (
                      <button 
                        onClick={handleAiTutor} 
                        disabled={isAiLoading} 
                        className="text-sm text-purple-400 hover:text-purple-300 flex items-center transition"
                      >
                        {isAiLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Get Mnemonic
                      </button>
                    ) : (
                      <div className="text-sm text-purple-300 flex items-start">
                        <Sparkles className="w-3 h-3 mr-1 mt-0.5 shrink-0" /> 
                        <span>{aiExplanation}</span>
                      </div>
                    )}
                  </>
                )}
                
                {gameMode === 'ranked' && <div></div>} {/* Spacer */}
                
                <button 
                  onClick={nextQuestion} 
                  className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center ml-auto"
                >
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SummaryScreen = () => {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const alreadySubmitted = submittedChapters.includes(activeChapter.title);

    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-2xl animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/50">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-black mb-2">MODULE COMPLETE</h2>
          <div className="text-slate-400 mb-8 font-bold">{activeChapter.title}</div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <div className="text-4xl font-black text-white">{score}</div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">Score</div>
            </div>
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-700">
              <div className={`text-4xl font-black ${
                accuracy >= 80 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-400' : 'text-orange-400'
              }`}>
                {accuracy}%
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase mt-1">Accuracy</div>
            </div>
          </div>

          {/* AI Study Guide */}
          <div className="mb-6">
            {!aiStudyGuide ? (
              <button 
                onClick={handleGenerateStudyGuide} 
                disabled={isGuideLoading} 
                className="w-full py-3 bg-purple-600/20 border border-purple-500/50 text-purple-300 rounded-xl font-bold hover:bg-purple-600/30 transition-colors flex items-center justify-center"
              >
                {isGuideLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generate Study Guide
              </button>
            ) : (
              <>
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-left max-h-40 overflow-y-auto mb-3">
                  <div className="text-xs text-purple-300 font-bold mb-2">AI STUDY NOTES:</div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{aiStudyGuide}</p>
                </div>
                
                <button 
                  onClick={downloadStudyGuide} 
                  className="w-full py-3 bg-blue-600/20 border border-blue-500/50 text-blue-300 rounded-xl font-bold hover:bg-blue-600/30 transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  💾 Download Study Guide
                </button>
              </>
            )}
          </div>

          {/* Ranked Mode Submission */}
          {gameMode === 'ranked' && (
            <div className="mb-4">
              {/* Firebase Status Indicator */}
              <div className="mb-3 flex items-center justify-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${
                  firebaseStatus.authenticated ? 'bg-green-400' : 
                  firebaseStatus.initializing ? 'bg-yellow-400 animate-pulse' : 
                  firebaseStatus.connected ? 'bg-yellow-400' : 
                  'bg-red-400'
                }`}></div>
                <span className="text-slate-400">
                  {firebaseStatus.authenticated ? 'Ready to submit' : 
                   firebaseStatus.initializing ? 'Connecting to server...' :
                   firebaseStatus.connected ? 'Authenticating...' : 
                   'Offline - scores cannot be saved'}
                </span>
              </div>
              
              {alreadySubmitted ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                  <Lock className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                  <p className="text-yellow-400 font-bold text-sm">Score already submitted</p>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                  <h3 className="text-white font-bold mb-3 text-sm">Submit to Leaderboard</h3>
                  {firebaseStatus.initializing && (
                    <p className="text-yellow-400 text-xs mb-2 flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Initializing connection...
                    </p>
                  )}
                  {!firebaseStatus.authenticated && !firebaseStatus.initializing && firebaseStatus.connected && (
                    <p className="text-yellow-400 text-xs mb-2">⏳ Authenticating...</p>
                  )}
                  {!firebaseStatus.connected && (
                    <p className="text-red-400 text-xs mb-2">⚠️ Not connected to server. Check your internet connection.</p>
                  )}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={playerName} 
                      onChange={e => setPlayerName(e.target.value)} 
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 text-sm"
                      disabled={!firebaseStatus.authenticated}
                    />
                    <button 
                      onClick={saveScoreToLeaderboard} 
                      disabled={isSubmittingScore || !playerName.trim() || !firebaseStatus.authenticated} 
                      className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title={
                        firebaseStatus.initializing ? 'Connecting...' :
                        !firebaseStatus.authenticated ? 'Waiting for authentication...' : 
                        !playerName.trim() ? 'Enter your name first' : 
                        'Submit score'
                      }
                    >
                      {isSubmittingScore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Return to Menu */}
          <button 
            onClick={() => setGameState('menu')} 
            className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-all"
          >
            Return to Menu
          </button>
        </div>
      </div>
    );
  };

  const LeaderboardScreen = () => {
    const [scores, setScores] = useState([]);
    
    useEffect(() => {
      if (!db) return;
      const q = query(
        collection(db, 'artifacts', appId, 'public', 'data', 'scores'),
        limit(50)
      );
      const unsub = onSnapshot(q, (snap) => {
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => b.score - a.score);
        setScores(data);
      });
      return () => unsub();
    }, []);

    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center font-sans">
        <div className="max-w-2xl w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black flex items-center">
              <Crown className="w-8 h-8 mr-3 text-yellow-400" /> LEADERBOARD
            </h2>
            <button 
              onClick={() => setGameState('menu')} 
              className="text-slate-400 hover:text-white transition"
            >
              Back
            </button>
          </div>
          
          <div className="space-y-2">
            {scores.map((s, i) => (
              <div 
                key={s.id} 
                className="bg-slate-800 p-4 rounded-xl flex items-center border border-slate-700 hover:border-slate-600 transition"
              >
                <div className={`w-8 font-bold ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-600' : 'text-slate-500'
                }`}>
                  #{i + 1}
                </div>
                
                <div className="flex-1 ml-4">
                  <div className="font-bold text-white">{s.playerName}</div>
                  <div className="text-xs text-slate-400">{s.chapterTitle}</div>
                </div>
                
                <div className="text-cyan-400 font-mono font-bold text-lg">{s.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  if (showInstructorMode) {
    return <InstructorMode onExit={() => {
      setShowInstructorMode(false);
      // Reload custom chapters and unlocked chapters
      if (db) {
        getDocs(collection(db, 'customChapters')).then(querySnapshot => {
          const chapters = [];
          querySnapshot.forEach((doc) => {
            chapters.push({ ...doc.data(), id: doc.id });
          });
          setCustomChapters(chapters);
        });
        
        getDocs(collection(db, 'settings')).then(querySnapshot => {
          const settingsDoc = querySnapshot.docs.find(d => d.id === 'chapterAccess');
          if (settingsDoc) {
            setUnlockedChapters(settingsDoc.data().unlocked || []);
          }
        });
      }
    }} />;
  }
  
  if (gameState === 'menu') return <MenuScreen />;
  if (gameState === 'playing') return <GameScreen />;
  if (gameState === 'summary') return <SummaryScreen />;
  if (gameState === 'leaderboard') return <LeaderboardScreen />;
  
  return <MenuScreen />;
}
