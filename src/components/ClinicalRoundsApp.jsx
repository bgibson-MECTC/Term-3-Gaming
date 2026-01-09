import React, { useState, useEffect, useRef } from 'react';
import { 
  Stethoscope, 
  Activity, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  BookOpen, 
  HeartPulse, 
  FileText, 
  Clipboard, 
  Beaker, 
  ArrowLeft,
  Thermometer,
  ShieldAlert,
  Play,
  PlusCircle,
  Clock,
  Timer,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

const ClinicalRoundsApp = ({ onBackToHub }) => {
  // Navigation State
  const [currentView, setCurrentView] = useState('lobby'); // lobby, chart, sbar, summary
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Game State
  const [shiftData, setShiftData] = useState({
    patientsSeen: [], // IDs of completed cases
    score: 0,
    streak: 0
  });

  // Timer State (15 minutes for the "Shift")
  const [timeLeft, setTimeLeft] = useState(900); // 900 seconds = 15 mins
  const [timerActive, setTimerActive] = useState(false);

  // Local Patient State
  const [activeTab, setActiveTab] = useState('overview'); 
  const [confidence, setConfidence] = useState(null); 
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showRationale, setShowRationale] = useState(false);
  
  // Scroll ref for auto-scrolling to new questions
  const questionAreaRef = useRef(null);

  // Timer Effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      // Optional: Auto-end game logic here
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --------------------------------------------------------------------------------
  // --- CONFIGURATION: ADD NEW CHAPTERS HERE ---
  // --------------------------------------------------------------------------------

  const patientData = [
    {
      id: 1,
      name: "Maria G.",
      age: 28,
      chapter: 'Ch 64: Assessment',
      acuity: 'Routine',
      chiefComplaint: "Positive home pregnancy test, requesting intake.",
      // Base Chart Data
      tabs: {
        history: "Obstetric Hx: Two previous live births (full term). One miscarriage at 12 weeks (2 years ago). Menarche age 12. Cycles regular.",
        vitals: "BP: 118/74, HR: 82, LMP: 6 weeks ago. BMI: 24.",
        notes: "Patient is anxious about miscarriage risk. Confirming current pregnancy today via urine hCG. Family Hx: Mother had cervical cancer."
      },
      // SBAR Handoff Options
      sbarOptions: [
        {
          id: 'A',
          text: "S: Maria G., 28yo. B: G3P2012. A: Needs Pap smear and hCG. R: Schedule mammogram.",
          correct: false
        },
        {
          id: 'B',
          text: "S: Maria G., 28yo, presenting for intake. B: G4P2012 (currently pregnant). Hx of 1 SAB. A: Vitals stable. Needs education on prenatal signs and screening. R: Schedule follow-up OB visit; no mammogram needed yet.",
          correct: true
        },
        {
          id: 'C',
          text: "S: Maria G., pregnant. B: G3P2002. A: High risk for cervical cancer. R: Immediate colposcopy.",
          correct: false
        }
      ],
      // Clinical Progression (Questions)
      questions: [
        {
          storyBeat: "Initial Assessment: You are reviewing Maria's obstetric history.",
          text: "Based on the intake data (2 Term births, 1 Miscarriage, Currently Pregnant), how would you document her GTPAL?",
          options: [
            { text: "G3 P2012", hint: "Don't forget the current pregnancy." },
            { text: "G4 P2012", hint: "" },
            { text: "G4 P2002", hint: "Check 'Term' vs 'Preterm' definitions." },
            { text: "G3 P2102", hint: "Did she have preterm births?" }
          ],
          correctIndex: 1,
          rationale: "Correct: G4 P2012. Gravida=4 (Current + 2 Term + 1 Abortion). Term=2. Preterm=0. Abortion=1. Living=2. (Ch 64)",
          topic: "GTPAL Calculation"
        },
        {
          storyBeat: "Physical Exam: You proceed to the pelvic examination.",
          text: "You assess the glands responsible for lubrication located just inside the vaginal opening. These are documented as:",
          options: [
            { text: "Skene's Glands", hint: "These are paraurethral." },
            { text: "Bartholin's Glands", hint: "" },
            { text: "Sebaceous Glands", hint: "These are skin glands." },
            { text: "Cowper's Glands", hint: "These are male anatomy." }
          ],
          correctIndex: 1,
          rationale: "Correct. Bartholin's glands (greater vestibular glands) are located just inside the vaginal opening and secrete mucus. (Ch 64)",
          topic: "Anatomy"
        },
        {
          storyBeat: "Health History: Maria mentions her mother had cervical cancer.",
          text: "She asks about screening. You explain that the Pap smear is the primary screening tool for:",
          options: [
            { text: "Ovarian Cancer", hint: "Pap does not screen for ovaries." },
            { text: "Endometrial Cancer", hint: "Pap is not diagnostic for this." },
            { text: "Cervical Cancer", hint: "" },
            { text: "Vaginal Infections only", hint: "It screens for cancer too." }
          ],
          correctIndex: 2,
          rationale: "Correct. The Pap smear screens for precancerous and cancerous cells on the cervix. (Ch 64)",
          topic: "Cancer Screening"
        },
        {
          storyBeat: "Inclusivity Check: A colleague asks about screening for a transgender male patient in the waiting room.",
          text: "Based on reproductive health guidelines (Ch 65/64), does a transgender man with a cervix need a Pap smear?",
          options: [
            { text: "No, testosterone therapy prevents cervical cancer.", hint: "Incorrect." },
            { text: "No, they should only see a urologist.", hint: "" },
            { text: "Yes, if they have a cervix, they require the same screening guidelines as cisgender women.", hint: "" },
            { text: "Only if they are symptomatic.", hint: "Screening is preventative." }
          ],
          correctIndex: 2,
          rationale: "Correct. It is important for transgender male patients to receive appropriate gynecologic care and recommended preventive screening exams, including Pap smears, if they have the relevant anatomy. (Ch 65 Snippet)",
          topic: "Transgender Health"
        },
        {
          storyBeat: "Documentation: Menstrual History.",
          text: "If Maria reported she had not had a period for the last 6 months (before pregnancy) despite not being pregnant then, you would document this as:",
          options: [
            { text: "Dysmenorrhea", hint: "Painful periods." },
            { text: "Menorrhagia", hint: "Heavy bleeding." },
            { text: "Amenorrhea", hint: "" },
            { text: "Metrorrhagia", hint: "Bleeding between periods." }
          ],
          correctIndex: 2,
          rationale: "Correct. Amenorrhea is the absence of menstruation. (Ch 64)",
          topic: "Reproductive Terminology"
        },
        {
          storyBeat: "Education: Signs of Pregnancy.",
          text: "Maria says 'I felt the baby move' (Quickening). Is this a Positive sign of pregnancy?",
          options: [
            { text: "Yes, movement is positive.", hint: "" },
            { text: "No, this is a Presumptive sign.", hint: "" },
            { text: "No, this is a Probable sign.", hint: "" },
            { text: "Yes, but only after 20 weeks.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Quickening is a Presumptive sign (subjective, felt by patient). Positive signs are objective (Fetal heart tones, Ultrasound). (Ch 64)",
          topic: "Signs of Pregnancy"
        },
        {
          storyBeat: "Procedure Prep: Colposcopy.",
          text: "The provider decides to perform a colposcopy due to an abnormal look of the cervix. How do you explain this?",
          options: [
            { text: "It is a surgery to remove the uterus.", hint: "" },
            { text: "It involves looking at the cervix with a magnifying instrument.", hint: "" },
            { text: "It is an x-ray of the fallopian tubes.", hint: "" },
            { text: "It samples the lining of the uterus.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Colposcopy uses a magnifying instrument (colposcope) to inspect the cervix, vagina, and vulva. (Ch 64)",
          topic: "Diagnostic Procedures"
        },
        {
          storyBeat: "Hormone Education.",
          text: "You explain that in early pregnancy, this hormone is crucial for maintaining the corpus luteum:",
          options: [
            { text: "FSH", hint: "" },
            { text: "hCG (Human Chorionic Gonadotropin)", hint: "" },
            { text: "Prolactin", hint: "" },
            { text: "Oxytocin", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. hCG maintains the corpus luteum in early pregnancy so it can produce progesterone. (Ch 64)",
          topic: "Physiology"
        },
        {
          storyBeat: "Discharge Planning: Mammogram Inquiry.",
          text: "She asks when she needs a mammogram. She is 28. What is the standard screening guideline for average risk?",
          options: [
            { text: "Start annually at age 45.", hint: "" },
            { text: "Start annually at age 21.", hint: "" },
            { text: "Only if you find a lump.", hint: "" },
            { text: "Every 6 months starting now.", hint: "" }
          ],
          correctIndex: 0,
          rationale: "Correct. For average risk women, annual mammograms typically begin at age 45 (ACS guidelines). (Ch 64)",
          topic: "Health Promotion"
        },
        {
          storyBeat: "Final Safety Check.",
          text: "Before she leaves, you verify her immunizations. Which vaccine is CONTRAINDICATED during pregnancy?",
          options: [
            { text: "Flu Vaccine (Inactivated)", hint: "Recommended." },
            { text: "Tdap", hint: "Recommended." },
            { text: "MMR (Measles Mumps Rubella)", hint: "" },
            { text: "Hepatitis B", hint: "Safe." }
          ],
          correctIndex: 2,
          rationale: "Correct. MMR is a live virus vaccine and is contraindicated during pregnancy due to teratogenic risk. (Ch 64)",
          topic: "Safety/Pharmacology"
        }
      ]
    },
    {
      id: 2,
      name: "Sarah L.",
      age: 45,
      chapter: 'Ch 65: Female Disorders',
      acuity: 'Urgent',
      chiefComplaint: "Follow-up on breast biopsy results.",
      tabs: {
        history: "No family history of breast cancer. Nonsmoker. Nulliparous (never gave birth).",
        vitals: "BP 124/80. Weight 68kg.",
        labs: "Pathology: Invasive Ductal Carcinoma.",
        imaging: "Mammo: Single mass, 1.8 cm. Nodes: Negative."
      },
      sbarOptions: [
        {
          id: 'A',
          text: "S: Sarah L. B: Stage I Breast CA. A: Anxiety high. Needs chemo. R: Admit to ICU.",
          correct: false
        },
        {
          id: 'B',
          text: "S: Sarah L., 45yo. B: Nulliparous, diagnosed with Stage I Invasive Ductal Carcinoma. A: Tumor <2cm, nodes neg. Anxiety regarding prognosis. R: Pre-op teaching for Mastectomy, Tamoxifen education, Psychosocial support.",
          correct: true
        },
        {
          id: 'C',
          text: "S: Sarah L. B: Breast CA. A: BP 124/80. R: Discharge home.",
          correct: false
        }
      ],
      questions: [
        {
          storyBeat: "Consultation: Delivering the news.",
          text: "Sarah sees 'Stage I' on her chart and panics. Based on her tumor size (<2cm) and negative nodes, what is your response?",
          options: [
            { text: "Stage I is highly aggressive.", hint: "" },
            { text: "Stage I describes a small localized tumor with no node involvement.", hint: "" },
            { text: "Stage I means it has spread to the chest wall.", hint: "" },
            { text: "You need chemotherapy immediately.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Stage I indicates a tumor <2cm and no lymph node involvement. Prognosis is generally good. (Ch 65)",
          topic: "Staging"
        },
        {
          storyBeat: "Risk Assessment.",
          text: "Sarah asks, 'Why did I get this?' You review her chart. Which factor listed is a known risk factor?",
          options: [
            { text: "Having low blood pressure.", hint: "" },
            { text: "Being Nulliparous (never having children).", hint: "" },
            { text: "Her age (45 is considered elderly).", hint: "" },
            { text: "Having regular menstrual cycles.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Nulliparity (or first child after 30) is a risk factor due to prolonged estrogen exposure. (Ch 65)",
          topic: "Risk Factors"
        },
        {
          storyBeat: "Screening Education.",
          text: "Sarah asks when she should have been doing self-exams. You teach that Breast Self-Exam (BSE) is best performed:",
          options: [
            { text: "During ovulation.", hint: "" },
            { text: "Right before menstruation.", hint: "Breasts are tender/swollen then." },
            { text: "5-7 days after menses begins.", hint: "" },
            { text: "Daily.", hint: "Too frequent." }
          ],
          correctIndex: 2,
          rationale: "Correct. 5-7 days after menses counts as the time when hormonal influence/swelling is lowest. (Ch 65)",
          topic: "Health Promotion"
        },
        {
          storyBeat: "Pre-Op Education: Surgery Type.",
          text: "She asks what a Modified Radical Mastectomy entails compared to a lumpectomy.",
          options: [
            { text: "It removes only the lump.", hint: "" },
            { text: "It removes the breast tissue and axillary nodes, but leaves the muscle.", hint: "" },
            { text: "It removes the breast, muscle, and all bones.", hint: "" },
            { text: "It is purely cosmetic.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Modified radical mastectomy removes breast tissue and axillary nodes but preserves the pectoralis major muscle. (Ch 65)",
          topic: "Surgical Procedures"
        },
        {
          storyBeat: "Post-Op Day 1: Drain Care.",
          text: "You observe a Jackson-Pratt (JP) drain. What is the correct nursing action?",
          options: [
            { text: "Leave it open to air.", hint: "" },
            { text: "Keep the bulb compressed to maintain suction.", hint: "" },
            { text: "Irrigate it with saline every hour.", hint: "" },
            { text: "Remove it if it has any drainage.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. The bulb must be compressed to create negative pressure (suction) for drainage. (Ch 65)",
          topic: "Post-Op Care"
        },
        {
          storyBeat: "Post-Op Safety: Lymphedema Precautions.",
          text: "The tech is about to take BP on Sarah's LEFT arm (the operative side). What do you do?",
          options: [
            { text: "Allow it, it's fine.", hint: "" },
            { text: "Stop the tech; use the right arm or leg.", hint: "" },
            { text: "Tell them to use a pediatric cuff.", hint: "" },
            { text: "Take it yourself on the left arm.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. BP, IVs, and blood draws are contraindicated on the affected arm to prevent lymphedema. (Ch 65)",
          topic: "Lymphedema Prevention"
        },
        {
          storyBeat: "Rehabilitation.",
          text: "To restore arm function on the affected side, which activity do you recommend post-op (after drain removal)?",
          options: [
            { text: "Keep the arm strictly immobilized in a sling for 6 weeks.", hint: "Causes frozen shoulder." },
            { text: "Wall climbing with fingers or rope turning.", hint: "" },
            { text: "Heavy weightlifting.", hint: "" },
            { text: "Ice packs only.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Wall climbing (spider walk) helps restore Range of Motion (ROM) without excessive strain. (Ch 65)",
          topic: "Rehab"
        },
        {
          storyBeat: "Discharge Meds: Tamoxifen.",
          text: "She is prescribed Tamoxifen. You explain its mechanism:",
          options: [
            { text: "It kills all fast-growing cells.", hint: "" },
            { text: "It blocks estrogen receptors on the tumor cells.", hint: "" },
            { text: "It increases estrogen levels.", hint: "" },
            { text: "It prevents nausea.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Tamoxifen is an anti-estrogen agent used for hormone-receptor-positive breast cancer. (Ch 65)",
          topic: "Pharmacology"
        },
        {
          storyBeat: "Side Effects Teaching.",
          text: "You warn Sarah about common side effects of Tamoxifen, which mimic:",
          options: [
            { text: "Hypoglycemia", hint: "" },
            { text: "Menopausal symptoms (hot flashes).", hint: "" },
            { text: "Hyperactivity", hint: "" },
            { text: "Severe weight loss", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. By blocking estrogen, Tamoxifen often causes hot flashes and other menopausal symptoms. (Ch 65)",
          topic: "Medication Side Effects"
        },
        {
          storyBeat: "Follow-Up: Psychosocial.",
          text: "Sarah reports feeling depressed about her body image. Best response?",
          options: [
            { text: "You should just be happy you survived.", hint: "" },
            { text: "Encourage her to join a support group for survivors.", hint: "" },
            { text: "Tell her to get plastic surgery immediately.", hint: "" },
            { text: "Ignore the comment.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Psychosocial support is critical. Support groups connect her with others sharing the experience. (Ch 65)",
          topic: "Psychosocial Care"
        }
      ]
    },
    {
      id: 3,
      name: "Robert T.",
      age: 68,
      chapter: 'Ch 66: Male Disorders',
      acuity: 'Admitted',
      chiefComplaint: "Difficulty starting stream, waking up 4x/night.",
      tabs: {
        history: "HTN, Hyperlipidemia. Father had prostate cancer.",
        vitals: "BP 130/85. PSA: 5.2 ng/mL (Abnormal > 4.0).",
        notes: "DRE: Prostate symmetrically enlarged, smooth, rubbery."
      },
      sbarOptions: [
        {
          id: 'A',
          text: "S: Robert T. B: BPH. A: PSA 5.2. R: Needs chemo.",
          correct: false
        },
        {
          id: 'B',
          text: "S: Robert T., 68yo. B: Hx of BPH, failed meds. Post-TURP day 1. A: CBI running, urine pink. Pain controlled with B&O. R: Continue CBI, monitor for clots, discharge teaching on lifting restrictions.",
          correct: true
        },
        {
          id: 'C',
          text: "S: Robert T. B: Prostate Cancer. A: DRE Hard/Nodular. R: Surgery.",
          correct: false
        }
      ],
      questions: [
        {
          storyBeat: "Initial Consult: DRE Results.",
          text: "Robert fears cancer. Based on the DRE (Smooth, Rubbery, Symmetrical), what condition is most likely?",
          options: [
            { text: "Prostate Cancer", hint: "Cancer is usually hard/irregular." },
            { text: "Benign Prostatic Hyperplasia (BPH)", hint: "" },
            { text: "Prostatitis", hint: "" },
            { text: "Testicular Cancer", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Smooth, rubbery enlargement is classic for BPH. Cancer presents as stony, hard, irregular nodules. (Ch 66)",
          topic: "Diagnosis"
        },
        {
          storyBeat: "Medication: Alpha Blockers.",
          text: "You prescribe Tamsulosin. What is the mechanism?",
          options: [
            { text: "Shrinks the prostate.", hint: "" },
            { text: "Relaxes smooth muscle of prostate/bladder neck.", hint: "" },
            { text: "Kills bacteria.", hint: "" },
            { text: "Lowers PSA.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Alpha blockers (Tamsulosin) relax smooth muscle to improve flow. (Ch 66)",
          topic: "Pharmacology"
        },
        {
          storyBeat: "Drug Interactions.",
          text: "Robert takes Sildenafil (Viagra). Risk with Alpha Blockers?",
          options: [
            { text: "Hypertension", hint: "" },
            { text: "Severe Hypotension.", hint: "" },
            { text: "Kidney failure", hint: "" },
            { text: "Hyperkalemia", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Both cause vasodilation. Taking together can cause dangerous hypotension. (Ch 66)",
          topic: "Safety"
        },
        {
          storyBeat: "Lifestyle Education.",
          text: "Robert asks about diet to support prostate health. You suggest:",
          options: [
            { text: "High fat, high red meat.", hint: "" },
            { text: "Decrease red meat and fats.", hint: "" },
            { text: "Increase calcium supplements.", hint: "" },
            { text: "No dietary changes needed.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Reducing red meat and fats is recommended for prostate health. (Ch 66)",
          topic: "Health Promotion"
        },
        {
          storyBeat: "Escalation: Surgery Prep.",
          text: "Meds failed. He is scheduled for TURP. He asks if there's an incision.",
          options: [
            { text: "Yes, abdominal.", hint: "" },
            { text: "No, the instrument goes up the urethra.", hint: "" },
            { text: "Yes, perineal.", hint: "" },
            { text: "No, radiation.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. TURP is endoscopic; the resectoscope is inserted through the urethra. (Ch 66)",
          topic: "Surgical Procedures"
        },
        {
          storyBeat: "Post-Op: CBI.",
          text: "Robert has a 3-way catheter (CBI). Drainage is bright red with clots. Priority?",
          options: [
            { text: "Call doctor.", hint: "" },
            { text: "Increase irrigation rate.", hint: "" },
            { text: "Clamp catheter.", hint: "" },
            { text: "Remove catheter.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Increase flow to flush clots. Goal is light pink. (Ch 66)",
          topic: "Post-Op Nursing Care"
        },
        {
          storyBeat: "Complication: Spasms.",
          text: "Robert has bladder spasms. Catheter is patent. Which med is indicated?",
          options: [
            { text: "Lasix", hint: "" },
            { text: "B&O Suppository", hint: "" },
            { text: "Aspirin", hint: "" },
            { text: "Warfarin", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. B&O suppositories are an antispasmodic/narcotic combo for TURP spasms. (Ch 66)",
          topic: "Pain Management"
        },
        {
          storyBeat: "Discharge: Activity.",
          text: "Going home. Vital activity instruction?",
          options: [
            { text: "Resume heavy lifting.", hint: "" },
            { text: "Avoid straining (Valsalva) and heavy lifting.", hint: "" },
            { text: "Restrict fluids.", hint: "" },
            { text: "Drive immediately.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Straining increases abdominal pressure and bleeding risk. (Ch 66)",
          topic: "Discharge Teaching"
        },
        {
          storyBeat: "Sexuality.",
          text: "Robert asks about sexual function post-TURP. You mention:",
          options: [
            { text: "Permanent impotence.", hint: "" },
            { text: "Retrograde Ejaculation.", hint: "" },
            { text: "Increased libido.", hint: "" },
            { text: "Infertility.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Semen may go into the bladder (cloudy urine) instead of exiting. Harmless but needs education. (Ch 66)",
          topic: "Sexual Health"
        },
        {
          storyBeat: "Screening Knowledge.",
          text: "He asks if he still needs DREs after this. You say:",
          options: [
            { text: "No, the prostate is gone.", hint: "" },
            { text: "Yes, the prostate capsule remains and can develop cancer.", hint: "" },
            { text: "Only PSA is needed.", hint: "" },
            { text: "No, BPH prevents cancer.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. In a TURP, only the inner tissue is removed. The capsule remains and is still subject to cancer risk. (Ch 66)",
          topic: "Health Maintenance"
        }
      ]
    },
    {
      id: 4,
      name: "Liam K.",
      age: 19,
      chapter: 'Ch 67: STIs',
      acuity: 'Routine',
      chiefComplaint: "STI Check / Counseling.",
      tabs: {
        history: "Sexually active with men (MSM). Multiple partners. Inconsistent condom use.",
        vitals: "Temp 99.1F.",
        notes: "Patient requests 'full panel' testing."
      },
      sbarOptions: [
        {
          id: 'A',
          text: "S: Liam K. B: STI exposure. A: Has Herpes. R: Acyclovir.",
          correct: false
        },
        {
          id: 'B',
          text: "S: Liam K., 19yo. B: MSM, multiple partners. A: Presents with painless chancre (Primary Syphilis), VDRL positive. R: Administer Penicillin G Benzathine IM, report to Health Dept, educate on partner notification.",
          correct: true
        },
        {
          id: 'C',
          text: "S: Liam K. B: No Hx. A: Healthy. R: Discharge.",
          correct: false
        }
      ],
      questions: [
        {
          storyBeat: "Intake: HPV.",
          text: "Liam hasn't had the HPV vaccine. He thinks it's 'for girls'. You explain it causes which cancers in men?",
          options: [
            { text: "Prostate", hint: "" },
            { text: "Penile, Anal, and Oropharyngeal.", hint: "" },
            { text: "Liver", hint: "" },
            { text: "Bone", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. HPV is strongly linked to penile, anal, and throat cancers in men. (Ch 67)",
          topic: "Health Promotion"
        },
        {
          storyBeat: "Physical Findings.",
          text: "You note painless, indurated ulcers (chancres) on the penis. Hallmark of:",
          options: [
            { text: "Herpes Simplex (HSV)", hint: "" },
            { text: "Primary Syphilis", hint: "" },
            { text: "HPV Warts", hint: "" },
            { text: "Gonorrhea", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. A painless chancre is the classic sign of Primary Syphilis. Herpes is painful. (Ch 67)",
          topic: "Diagnosis"
        },
        {
          storyBeat: "Diagnostics.",
          text: "Which blood test screens for Syphilis?",
          options: [
            { text: "PSA", hint: "" },
            { text: "VDRL or RPR", hint: "" },
            { text: "CBC", hint: "" },
            { text: "Bun/Creatinine", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. VDRL/RPR are screening tests. FTA-ABS confirms. (Ch 67)",
          topic: "Labs"
        },
        {
          storyBeat: "Differentiation.",
          text: "If the ulcers were painful vesicles that crusted over, you would suspect:",
          options: [
            { text: "Syphilis", hint: "" },
            { text: "Herpes Simplex Virus (HSV-2)", hint: "" },
            { text: "Chlamydia", hint: "" },
            { text: "HPV", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Herpes presents as painful, fluid-filled vesicles. (Ch 67)",
          topic: "Differential Diagnosis"
        },
        {
          storyBeat: "Disease Progression.",
          text: "Liam asks about untreated Syphilis risks. You mention Tertiary Syphilis affects:",
          options: [
            { text: "Lungs", hint: "" },
            { text: "Neuro/Cardio systems (Dementia/Aortic issues).", hint: "" },
            { text: "Muscles", hint: "" },
            { text: "Hair", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Neurosyphilis is a severe late-stage complication. (Ch 67)",
          topic: "Complications"
        },
        {
          storyBeat: "Treatment.",
          text: "Confirmed Syphilis. Drug of choice?",
          options: [
            { text: "Penicillin G Benzathine", hint: "" },
            { text: "Acyclovir", hint: "" },
            { text: "Metronidazole", hint: "" },
            { text: "Fluconazole", hint: "" }
          ],
          correctIndex: 0,
          rationale: "Correct. Penicillin G IM is the gold standard. (Ch 67)",
          topic: "Pharmacology"
        },
        {
          storyBeat: "Herpes Management (Hypothetical).",
          text: "Liam asks, 'If it was Herpes, can I cure it?'",
          options: [
            { text: "Yes, antibiotics cure it.", hint: "" },
            { text: "No, it's viral and recurrent. Antivirals manage outbreaks.", hint: "" },
            { text: "Yes, surgery removes it.", hint: "" },
            { text: "No, it is fatal.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Herpes is a chronic viral infection. Acyclovir/Valacyclovir shorten outbreaks but do not cure. (Ch 67)",
          topic: "Patient Education"
        },
        {
          storyBeat: "Partner Notification.",
          text: "Role in partner notification?",
          options: [
            { text: "Don't tell anyone.", hint: "" },
            { text: "Encourage notification/Report to Health Dept.", hint: "" },
            { text: "Post on social media.", hint: "" },
            { text: "Tell parents.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Syphilis is reportable. Partners need treatment (Expedited Partner Therapy where legal). (Ch 67)",
          topic: "Public Health"
        },
        {
          storyBeat: "Co-Infection Risk.",
          text: "Ulcers increase risk for which other infection?",
          options: [
            { text: "Flu", hint: "" },
            { text: "HIV", hint: "" },
            { text: "Malaria", hint: "" },
            { text: "Gout", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Ulcers break the skin barrier, facilitating HIV entry. (Ch 67)",
          topic: "Co-morbidities"
        },
        {
          storyBeat: "Follow-Up.",
          text: "When should Liam return for follow-up testing to ensure cure?",
          options: [
            { text: "Never.", hint: "" },
            { text: "6 and 12 months.", hint: "" },
            { text: "Tomorrow.", hint: "" },
            { text: "5 years.", hint: "" }
          ],
          correctIndex: 1,
          rationale: "Correct. Follow-up VDRL/RPR at 6 and 12 months is needed to ensure titers have decreased. (Ch 67)",
          topic: "Follow-Up Care"
        }
      ]
    }
  ];

  // --- ACTIONS ---

  const startShift = () => {
    setShiftData({ patientsSeen: [], score: 0, streak: 0 });
    setTimeLeft(900);
    setTimerActive(true);
    setCurrentView('lobby');
  };

  const openChart = (patient) => {
    setSelectedPatient(patient);
    setActiveTab('overview');
    setConfidence(null);
    setSelectedAnswer(null);
    setCurrentQuestionIndex(0);
    setShowRationale(false);
    setCurrentView('chart');
  };

  const handleAnswerSelection = (idx) => {
    if (!showRationale) setSelectedAnswer(idx);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    
    // Calculate Score
    const currentQuestion = selectedPatient.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctIndex;
    const points = isCorrect ? (confidence === 'high' ? 150 : 100) : 0;

    // Update global stats
    setShiftData(prev => ({
      ...prev,
      score: prev.score + points,
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    // Show Rationale
    setShowRationale(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < selectedPatient.questions.length - 1) {
      // Go to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setConfidence(null);
      setShowRationale(false);
      if (questionAreaRef.current) questionAreaRef.current.scrollTop = 0;
    } else {
      // Go to SBAR phase
      setCurrentView('sbar');
    }
  };

  const handleSBARSubmit = (isCorrect) => {
      // Bonus points for SBAR
      if (isCorrect) {
          setShiftData(prev => ({ ...prev, score: prev.score + 200 }));
      }
      
      const newHistory = [...shiftData.patientsSeen, selectedPatient.id];
      setShiftData(prev => ({ ...prev, patientsSeen: newHistory }));
      setCurrentView('lobby');
  };

  // --- RENDER HELPERS ---

  const renderTabContent = () => {
    const p = selectedPatient;
    
    // Helper to highlight abnormal values
    const highlightAbnormal = (text) => {
      if (text.includes("Abnormal")) {
         const parts = text.split("Abnormal");
         return <span>{parts[0]} <span className="font-bold text-red-600 bg-red-50 px-1 rounded">Abnormal {parts[1]}</span></span>
      }
      return text;
    };

    switch (activeTab) {
      case 'history':
        return (
          <div className="bg-white p-4 rounded border border-slate-200 animate-in fade-in duration-300">
            <h4 className="font-bold text-slate-700 flex items-center mb-2"><Clipboard className="w-4 h-4 mr-2"/> History & Risk Factors</h4>
            <p className="text-slate-600">{p.tabs.history}</p>
          </div>
        );
      case 'vitals':
         return (
          <div className="bg-white p-4 rounded border border-slate-200 animate-in fade-in duration-300">
            <h4 className="font-bold text-slate-700 flex items-center mb-2"><Activity className="w-4 h-4 mr-2"/> Vitals & Diagnostics</h4>
            <p className="text-slate-600 mb-2">{highlightAbnormal(p.tabs.vitals)}</p>
            {p.tabs.labs && <p className="text-slate-600 bg-yellow-50 p-2 rounded border border-yellow-100"><span className="font-semibold">Lab Alert:</span> {p.tabs.labs}</p>}
            {p.tabs.imaging && <p className="text-slate-600 bg-blue-50 p-2 rounded border border-blue-100 mt-2"><span className="font-semibold">Imaging:</span> {p.tabs.imaging}</p>}
          </div>
        );
      case 'notes':
         return (
          <div className="bg-white p-4 rounded border border-slate-200 animate-in fade-in duration-300">
            <h4 className="font-bold text-slate-700 flex items-center mb-2"><FileText className="w-4 h-4 mr-2"/> Provider Notes</h4>
            <p className="text-slate-600 italic">"{p.tabs.notes}"</p>
          </div>
        );
      default:
        return (
          <div className="bg-blue-50 p-4 rounded border border-blue-100 animate-in fade-in duration-300">
            <h4 className="font-bold text-blue-800 mb-2">Patient Overview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-blue-500 uppercase font-bold">Name</span>
                <p className="font-medium text-slate-800">{p.name}</p>
              </div>
              <div>
                <span className="text-xs text-blue-500 uppercase font-bold">Age</span>
                <p className="font-medium text-slate-800">{p.age}</p>
              </div>
              <div className="col-span-2">
                <span className="text-xs text-blue-500 uppercase font-bold">Chief Complaint</span>
                <p className="font-medium text-slate-800">{p.chiefComplaint}</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // --- VIEWS ---

  const LobbyView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nurse Station Dashboard</h2>
          <p className="text-slate-500">Shift Status: Active | Patients Remaining: {patientData.length - shiftData.patientsSeen.length}</p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
             <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider mb-1"><Timer className="w-4 h-4 mr-1"/> Shift Timer</div>
             <div className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>{formatTime(timeLeft)}</div>
          </div>
          <div className="text-right border-l pl-6">
            <div className="text-3xl font-bold text-blue-600">{shiftData.score} <span className="text-sm font-normal text-slate-400">PTS</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {patientData.map((patient) => {
          const isSeen = shiftData.patientsSeen.includes(patient.id);
          return (
            <button
              key={patient.id}
              onClick={() => !isSeen && openChart(patient)}
              disabled={isSeen}
              className={`flex items-center p-4 rounded-xl border transition-all ${
                isSeen 
                  ? 'bg-slate-50 border-slate-200 opacity-70 cursor-default' 
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer group'
              }`}
            >
              <div className={`p-3 rounded-full mr-4 ${isSeen ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-600'}`}>
                {isSeen ? <CheckCircle className="w-6 h-6"/> : <Users className="w-6 h-6"/>}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                   <h3 className="text-lg font-bold text-slate-800">{patient.name}</h3>
                   {isSeen && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Hand-off Complete</span>}
                </div>
                <p className="text-sm text-slate-500">{patient.chapter} • {patient.acuity}</p>
              </div>
              {!isSeen && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500"/>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const ChartView = () => {
    const currentQ = selectedPatient.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.correctIndex;
    const progressPercent = ((currentQuestionIndex) / selectedPatient.questions.length) * 100;

    return (
      <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
        {/* LEFT: EHR Panel */}
        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-lg">{selectedPatient.name}</h2>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-bold uppercase">{selectedPatient.acuity}</span>
            </div>
            <p className="text-xs text-slate-300">MRN: {selectedPatient.id}9924-X</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {['overview', 'history', 'vitals', 'notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold uppercase transition-colors border-b-2 ${
                  activeTab === tab 
                    ? 'border-blue-600 text-blue-600 bg-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 bg-slate-50 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>

        {/* RIGHT: Action Panel */}
        <div className="w-full md:w-2/3 flex flex-col h-full">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex-1 flex flex-col overflow-hidden">
             {/* Progress Bar */}
             <div className="h-2 w-full bg-slate-100">
                <div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{width: `${progressPercent}%`}}/>
            </div>
            
            {/* Scrollable Question Area */}
            <div ref={questionAreaRef} className="flex-1 overflow-y-auto p-6 md:p-8">
                {/* Clinical Update */}
                <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <div className="flex items-center text-blue-900 font-bold text-sm uppercase tracking-wide mb-1">
                        <Clock className="w-4 h-4 mr-2"/> Clinical Update
                    </div>
                    <p className="text-blue-900 text-lg leading-relaxed font-medium">{currentQ.storyBeat}</p>
                </div>

                {/* Question Text */}
                <div className="mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Decision Point {currentQuestionIndex + 1} of {selectedPatient.questions.length}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 leading-snug">{currentQ.text}</h3>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                {currentQ.options.map((opt, idx) => {
                    let borderClass = 'border-slate-200 hover:border-slate-300 bg-white';
                    if (selectedAnswer === idx) borderClass = 'border-blue-600 bg-blue-50 ring-1 ring-blue-600';
                    if (showRationale) {
                        if (idx === currentQ.correctIndex) borderClass = 'border-green-500 bg-green-50 ring-1 ring-green-500';
                        else if (selectedAnswer === idx) borderClass = 'border-red-500 bg-red-50 ring-1 ring-red-500';
                        else borderClass = 'opacity-40 border-slate-100';
                    }
                    return (
                    <button
                        key={idx}
                        disabled={showRationale}
                        onClick={() => handleAnswerSelection(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center ${borderClass}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex-shrink-0 flex items-center justify-center transition-colors ${showRationale && idx === currentQ.correctIndex ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300'}`}>
                            {showRationale && idx === currentQ.correctIndex && <CheckCircle className="w-5 h-5"/>}
                            {showRationale && selectedAnswer === idx && idx !== currentQ.correctIndex && <XCircle className="w-5 h-5 text-red-500 bg-white rounded-full"/>}
                            {!showRationale && selectedAnswer === idx && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"/>}
                        </div>
                        <span className={`text-base ${showRationale && idx === currentQ.correctIndex ? 'font-bold text-green-900' : 'text-slate-700'}`}>
                            {opt.text}
                        </span>
                    </button>
                    )
                })}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-6 bg-white border-t border-slate-200 z-10">
                 {!showRationale ? (
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2">
                            {['low', 'medium', 'high'].map(level => (
                            <button key={level} onClick={() => setConfidence(level)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${confidence === level ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' : 'bg-slate-100 text-slate-500'}`}>{level}</button>
                            ))}
                        </div>
                        <button disabled={!confidence || selectedAnswer === null} onClick={submitAnswer} className="flex-1 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center">
                            Confirm Decision <ChevronRight className="ml-2 w-4 h-4"/>
                        </button>
                    </div>
                  ) : (
                    <div>
                        <div className={`p-4 rounded-lg mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            <p className="font-bold mb-1">{isCorrect ? "Correct" : "Incorrect"}</p>
                            <p className="text-sm">{currentQ.rationale}</p>
                        </div>
                        <button onClick={nextQuestion} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex justify-center">
                            Continue <ChevronRight className="ml-2"/>
                        </button>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SBARView = () => (
      <div className="max-w-3xl mx-auto pt-10">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-center mb-6">
                  <FileCheck className="w-10 h-10 text-blue-600 mr-4"/>
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900">End of Shift Handoff (SBAR)</h2>
                      <p className="text-slate-500">Select the most accurate summary to report to the next nurse.</p>
                  </div>
              </div>
              
              <div className="space-y-4">
                  {selectedPatient.sbarOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSBARSubmit(opt.correct)}
                        className="w-full text-left p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                          <span className="font-bold text-slate-400 group-hover:text-blue-500 mb-2 block">Option {opt.id}</span>
                          <p className="text-slate-700 font-medium leading-relaxed">{opt.text}</p>
                      </button>
                  ))}
              </div>
          </div>
      </div>
  );

  const SummaryView = () => (
    <div className="max-w-lg mx-auto text-center pt-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <HeartPulse className="w-20 h-20 text-blue-500 mx-auto mb-6"/>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Shift Complete</h2>
        <div className="text-4xl font-bold text-blue-600 mb-8">{shiftData.score} PTS</div>
        <button onClick={startShift} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex justify-center items-center">
          Start New Shift <Play className="ml-2 w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">SimChart</h1>
            <p className="text-xs font-medium text-slate-500">Reproductive Health • Unit 4</p>
          </div>
        </div>
        {currentView === 'chart' ? (
           <button onClick={() => setCurrentView('lobby')} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
             <ArrowLeft className="w-4 h-4 mr-1.5"/> Lobby
           </button>
        ) : (
           <button onClick={onBackToHub} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200">
             <ArrowLeft className="w-4 h-4 mr-1.5"/> Back to Hub
           </button>
        )}
      </div>

      {currentView === 'lobby' && <LobbyView />}
      {currentView === 'chart' && <ChartView />}
      {currentView === 'sbar' && <SBARView />}
      {currentView === 'summary' && <SummaryView />}
    </div>
  );
};

export default ClinicalRoundsApp;
