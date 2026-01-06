# Question Transformation System
## Study Mode → Ranked Mode Conversions

This document explains how questions are transformed from Study Mode (knowledge/comprehension) into Ranked Mode (clinical application/prioritization).

---

## Transformation Types

### 1. Teaching Error → Patient Misunderstanding with Risk
**Purpose**: Convert educational assessment into patient safety scenario

**Study Mode Example:**
```
"The nurse is teaching about first-line defense. 
Which patient statement indicates the need for further education?"
```

**Ranked Mode Transformation:**
```
"A patient with immune compromise makes the following statement. 
Which indicates a misunderstanding that could lead to complications?"

Options enhanced with:
- Time pressure: "within the next 5 minutes"
- Context: "noting recent lab changes"
- Outcomes: "to prevent infection"
```

**Key Change**: From "needs teaching" to "at risk for complications"

---

### 2. Correlation/Function → Clinical Finding Interpretation
**Purpose**: Convert theoretical knowledge into urgent assessment

**Study Mode Example:**
```
"The nurse correlates the function of the thymus gland to which outcome?"
Options: WBC development, T-cell development, etc.
```

**Ranked Mode Transformation:**
```
"A patient presents with abnormal immune function. 
The nurse anticipates which clinical manifestation will require priority intervention?"

Options transformed:
- "T-cell dysfunction immediately"
- "T-cell deficiency - considering patient history"
- "T-cell abnormality to prevent complications"
```

**Key Change**: From "what is the function" to "what finding requires action"

---

### 3. Identification → Prioritization/Triage
**Purpose**: Convert classification into clinical decision-making

**Study Mode Example:**
```
"Which type of leukocyte releases heparin as part of the inflammatory response?"
Options: Basophil, Eosinophil, Monocyte, Neutrophil
```

**Ranked Mode Transformation:**
```
"The nurse is caring for multiple patients. 
Which assessment finding related to inflammatory response requires immediate attention?"

Options enhanced:
- "Basophil-related response within 5 minutes"
- "Eosinophil elevation while monitoring vital signs"
- "Monocyte changes - observing current symptoms"
- "Neutrophil dysfunction as first priority"
```

**Key Change**: From "which type does X" to "which requires immediate attention"

---

### 4. Appropriate Action → Preventing Complications
**Purpose**: Emphasize consequences and deterioration prevention

**Study Mode Example:**
```
"A nurse is caring for a patient with leukocytosis. 
Which action is most appropriate?"
```

**Ranked Mode Transformation:**
```
"A patient with leukocytosis is at risk for deterioration. 
Which intervention should the nurse implement first?"

Options enhanced:
- "Assess for infection source before condition worsens"
- "Monitor vital signs immediately to prevent complications"
- "Initiate isolation precautions to stabilize condition"
```

**Key Change**: From "most appropriate" to "prevent deterioration"

---

### 5. Lab/Test Knowledge → Immediate Clinical Decision
**Purpose**: Convert test knowledge into critical result response

**Study Mode Example:**
```
"Which lab test measures immune function?"
Options: CBC, T-cell count, etc.
```

**Ranked Mode Transformation:**
```
"The nurse receives critical lab values related to immune function. 
Which finding poses the greatest immediate threat?"

Options transformed:
- "T-cell count <200 - requires immediate notification"
- "WBC 25,000 within the next 5 minutes"
- "Neutrophil <500 as first priority"
- "CD4 count critically low to ensure safety"
```

**Key Change**: From "what measures X" to "which critical result needs action"

---

## Answer Option Enhancements

All answer options are enhanced with randomized additions:

### Time Pressure (40% of questions)
- "within the next 5 minutes"
- "immediately to prevent deterioration"
- "while monitoring vital signs"
- "before condition worsens"
- "as first priority"

### Patient Context (30% of questions)
- "considering patient history"
- "noting recent lab changes"
- "observing current symptoms"
- "based on assessment findings"

### Clinical Outcomes (30% of questions)
- "to prevent complications"
- "to stabilize condition"
- "to ensure safety"
- "to reduce risk"

---

## Additional Transformation Features

### Question Shuffling
- Answer order randomized each playthrough
- Prevents memorization of "answer is always C"
- Correct index tracked through transformation

### Clinical Urgency Prefixes
When existing scenario detected, adds:
- "PRIORITY: "
- "The nurse must first: "
- "The most important action is: "
- "To prevent complications, the nurse should: "

---

## Implementation Notes

**Location**: `src/questionTransformer.js`

**Key Functions**:
- `transformToRankedQuestion()` - Main transformation entry point
- `convertToScenario()` - Routes to appropriate transformation type
- `transformOptions()` - Enhances answer choices with clinical detail
- `shuffleOptions()` - Randomizes answer order

**Question Metadata Used**:
- `concept` - The core nursing concept being tested
- `skill` - Skills array (PRIORITY, TEACHING_ERROR, LAB_INTERPRETATION, etc.)
- `bloom` - Bloom's taxonomy level (Knowledge, Comprehension, Application, etc.)
- `rationale` - Original explanation (used to generate reasoning options)

---

## Design Philosophy

1. **Same Concept, Different Application**
   - Study Mode: "What is X?"
   - Ranked Mode: "Patient with X - what's the priority?"

2. **Prevent Memorization**
   - Question text completely rewritten
   - Answer order randomized
   - Options enhanced with new details

3. **Clinical Reasoning Focus**
   - Emphasizes urgency and prioritization
   - Requires understanding consequences
   - Tests ability to apply knowledge, not recall facts

4. **Randomization for Variety**
   - Different transformation each playthrough
   - Multiple enhancement strategies
   - Ensures fresh challenges

---

## Testing Your Transformations

To see transformations in action:

1. **Study Mode**: Select a chapter, choose "Study Mode"
   - Questions appear in original format
   - Hints and AI tutor available

2. **Ranked Mode**: Same chapter, choose "Ranked Mode"
   - Questions transformed with clinical context
   - 30-second timer enforced
   - No hints/AI assistance

3. **Compare**: Note how the same concept is tested differently
   - Study: Knowledge recall
   - Ranked: Clinical application

---

## Future Enhancements

Potential additions to transformation system:

- Add lab values to questions (e.g., "BP 85/50, HR 120")
- Include patient age/demographics for context
- Add time-of-day considerations (e.g., "Night shift RN notes...")
- Include multiple symptoms requiring triage
- Generate scenario-specific rationales based on patient context
