# 🚀 Quick Start: Add Your First Chapter in 5 Minutes

This guide walks you through adding a complete new chapter to the system.

## Step 1: Edit chapters.json (2 minutes)

Open `/data/chapters.json` and add your chapter:

```json
{
  "id": "ch23",
  "title": "Ch 23: Cardiovascular Assessment",
  "description": "Heart anatomy, ECG, cardiac diseases",
  "iconName": "Heart"
}
```

**Important:** Add it BEFORE the `day-to-be-wrong` entry (keep that last).

## Step 2: Create Question File (3 minutes)

Create `/data/ch23-questions.json`:

```json
[
  {
    "id": "ch23_q01",
    "text": "Your question here?",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctIndex": 0,
    "rationale": "Explanation of why the answer is correct.",
    "tags": {
      "concept": "Main Topic",
      "skill": "Assessment",
      "bloom": "Knowledge"
    }
  }
]
```

**Pro Tip:** Copy from `ch23-questions-EXAMPLE.json` to get started faster!

## Step 3: Test It! (30 seconds)

1. Refresh your browser (Ctrl+R or Cmd+R)
2. Open browser console (F12)
3. Look for: `✅ Question system initialized`
4. Your chapter should appear in the chapter selector!

## That's It! 🎉

Your new chapter is now:
- ✅ Available in Study Mode
- ✅ Available in Ranked Mode
- ✅ Integrated with all game features
- ✅ Tracked in leaderboards
- ✅ Supported by AI tutor

---

## Common Issues

### ❌ Chapter doesn't appear
- Check JSON syntax (use jsonlint.com)
- Check browser console for errors
- Make sure file is named correctly: `ch23-questions.json`

### ❌ Questions show "undefined"
- Check that `correctIndex` matches an option
- Make sure all required fields are present
- Verify JSON commas and brackets

### ❌ Icon doesn't show
- Check available icons in ADDING_CONTENT.md
- Most common: Heart, Brain, Activity, Shield, Bug

---

## Next Steps

**Add more questions:** Just add more objects to your questions array!

**Add SATA questions:** Use `"type": "SATA"` and `correctIndices: [0, 2]`

**Add another chapter:** Repeat steps 1-3 with ch24, ch25, etc.

**Create a custom game:** Edit `data/games-registry.json`

---

## Example: Complete Chapter 23

See `data/ch23-questions-EXAMPLE.json` for a complete example with:
- Standard questions
- SATA (select all that apply)
- Priority questions
- Clinical scenarios

Just rename it to `ch23-questions.json` to activate it!

---

Need more help? Check `ADDING_CONTENT.md` for the complete guide.
