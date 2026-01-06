# RN MASTERY - Nursing Education Game

A competitive, gamified learning platform for nursing students covering Chapters 18-22 (Immune System, Connective Tissue, MDROs, and HIV/AIDS).

## Features

### Core Gameplay
- **5 Comprehensive Modules**: Ch 18-22 with 15 questions each (75 total)
- **Scoring System**: Base 100 points per correct answer
- **Streak Multipliers**: 1.5x (3 streak), 2x (5 streak), 3x (10 streak)
- **Risk Mode**: Double points or lose 500 - high stakes!
- **Real-time Feedback**: Instant rationales for every answer

### New Improvements ✨

#### 🔀 Smart Question Shuffling
- **Randomized Order**: Questions shuffle every time you play a chapter
- **No Memorization**: Test your actual knowledge, not pattern memory
- **Fair Assessment**: Prevents "Answer C then A" shortcuts

#### 📞 50/50 Lifeline
- **One Per Module**: Just like Who Wants to Be a Millionaire!
- **Strategic Help**: Removes 2 incorrect answers, leaving correct + 1 distractor
- **NCLEX Prep**: Practice narrowing down difficult concepts
- **Smart Usage**: Lifeline only available before answering

#### 📝 Missed Question Review
- **Learning from Mistakes**: Most valuable study happens after errors
- **Expandable Panel**: Shows all incorrect answers on Summary screen
- **Detailed Breakdown**: 
  - Your selected answer
  - Correct answer
  - Full rationale explanation
- **Efficient Study**: Focus on your weak areas

#### Keyboard Shortcuts
- **1-4**: Select answer options
- **Enter**: Submit answer / Continue to next question
- Faster gameplay for power users!

#### Progress Tracking
- **Personal Best Scores**: Saved locally per chapter
- **Detailed Stats**: Accuracy percentage, correct/incorrect count
- **New Record Celebrations**: Visual feedback for beating your high score

#### Exit Safety
- **Confirmation Dialog**: Prevents accidental exits during active games
- No more lost progress!

#### Enhanced Leaderboard
- **Chapter Filters**: View rankings by specific chapter or all chapters
- **User Highlighting**: Your entry stands out in cyan
- **Current Champion Display**: See the top score to beat

#### AI-Powered Study
- **Gemini Integration**: Generate fun mnemonics for questions
- Set your API key in `.env` file

## Setup

### Installation
```bash
npm install
```

### Environment Variables
1. Copy `.env.example` to `.env`
2. Add your Gemini API key:
```
REACT_APP_GEMINI_API_KEY=your_api_key_here
```
Get your key from: https://makersuite.google.com/app/apikey

### Running
```bash
npm start
```

## Firebase Setup (Optional)
The leaderboard feature requires Firebase configuration. The app will work without it, but scores won't be saved globally.

## Game Mechanics

### Scoring
- **Correct Answer**: 100 × Multiplier
- **Risk Mode Success**: 2× points
- **Risk Mode Failure**: -500 points
- **Streak Bonus**: Builds with consecutive correct answers

### Ranks
- **0-999**: Novice
- **1000-2499**: Apprentice
- **2500-3999**: Expert RN
- **4000+**: Clinical Legend 👑

## Course Content

### Ch 18: Immune Assessment
Anatomy, function, immunity types, WBC, first/second-line defenses

### Ch 19: Immune Disorders
Hypersensitivities (I-IV), allergies, anaphylaxis, autoimmunity, transplant rejection

### Ch 20: Connective Tissue
OA vs RA, Lupus, Gout, Scleroderma, CREST syndrome, Fibromyalgia

### Ch 21: MDROs
Transmission routes, MRSA, VRE, C. diff, CRE, antibiotic stewardship, PPE

### Ch 22: HIV/AIDS
Progression, CD4 counts, PrEP/PEP, ART, opportunistic infections, U=U

## Technologies
- React 18
- Tailwind CSS
- Firebase (Firestore + Auth)
- Lucide Icons
- Google Gemini AI

## License
Educational use only

---
*Built for nursing students to master critical concepts through competitive, engaging gameplay.*
