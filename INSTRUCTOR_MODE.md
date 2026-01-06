# Instructor Mode Guide

## Overview
Instructor Mode allows you to dynamically add, edit, and manage custom chapters without redeploying the app. All custom chapters are stored in Firebase Firestore and load automatically for all users.

## Accessing Instructor Mode

1. From the main menu, click **"Instructor Mode"** button at the bottom
2. Enter the password: `nursing2024`
3. You'll see the Chapter Management dashboard

## Features

### 📝 Add New Chapters
- Click **"Add New Chapter"** button
- Fill in chapter details:
  - **Chapter ID**: Unique identifier (e.g., `ch23`, `ch24`)
  - **Icon**: Emoji or icon (e.g., 📚, 🏥, 💉)
  - **Title**: Chapter name (e.g., "Chapter 23: Advanced Topics")
  - **Description**: Brief description of content

### ❓ Add Questions
- In the chapter editor, use the question form to add questions
- Each question requires:
  - Question text
  - 4 answer options
  - Correct answer selection
  - Rationale (explanation)
- Questions auto-generate IDs based on chapter ID (e.g., `ch23_q01`)
- Click **"Add Question"** to add to the chapter
- Remove questions with the trash icon

### ✏️ Edit Chapters
- Click the edit icon (pencil) on any chapter card
- Modify chapter details or questions
- Click **"Save Chapter"** when done

### 🗑️ Delete Chapters
- Click the trash icon on any chapter card
- Confirm deletion (cannot be undone)

### 💾 Export/Import

**Export All Chapters:**
- Click **"Export All"** to download a JSON backup
- Saves to: `chapters-backup-{timestamp}.json`
- Use for backups or sharing with other instructors

**Import Chapters:**
- Click **"Import"** and select a JSON file
- All chapters in the file will be added to the database
- Useful for bulk uploads or restoring backups

## Technical Details

### Data Storage
- Custom chapters stored in Firebase Firestore collection: `customChapters`
- Each chapter document contains:
  ```json
  {
    "chapterId": "ch23",
    "title": "Chapter 23: Advanced Topics",
    "description": "Description text",
    "icon": "📚",
    "questions": [
      {
        "id": "ch23_q01",
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "rationale": "Explanation"
      }
    ]
  }
  ```

### Question Format
Custom chapter questions use the same format as built-in questions, ensuring compatibility with:
- Tag overlay system (can be enhanced later)
- Ranked/Study modes
- Scoring system
- AI study guide generation
- All game features

### Security Notes
- **Password**: Change `INSTRUCTOR_PASSWORD` in `InstructorMode.jsx` (line 16)
- For production, implement proper Firebase Authentication
- Current setup uses simple password for quick classroom access

## Workflow Examples

### Adding a Single Chapter
1. Access Instructor Mode
2. Click "Add New Chapter"
3. Set Chapter ID: `ch23`, Title: "Chapter 23: Pharmacology"
4. Add 25 questions using the question form
5. Click "Save Chapter"
6. Exit Instructor Mode
7. Chapter appears immediately on main menu

### Bulk Import
1. Create JSON file with multiple chapters
2. Access Instructor Mode
3. Click "Import"
4. Select your JSON file
5. All chapters added to database
6. Exit and refresh

### Backup Before Editing
1. Access Instructor Mode
2. Click "Export All" to create backup
3. Make your edits
4. If needed, restore from backup JSON

## Integration with Game

Custom chapters automatically:
- ✅ Appear on main menu alongside built-in chapters
- ✅ Work in both Study and Ranked modes
- ✅ Support all game features (50/50 lifeline, streak, confetti)
- ✅ Save to leaderboard
- ✅ Generate AI study guides
- ✅ Track in analytics

## Future Enhancements

Potential additions for Instructor Mode:
- Tag editor (concept, skill, Bloom level)
- Bulk question upload via CSV
- Question preview/test mode
- Student progress tracking per chapter
- Analytics dashboard
- Multi-instructor accounts
- Question bank sharing

## Support

For issues or feature requests:
- Check Firebase console for data
- Verify Firebase configuration in `firebase.js`
- Check browser console for errors
- Ensure Firestore rules allow read/write to `customChapters` collection

## Password

**Default Password**: `nursing2024`

Change in: `/src/components/InstructorMode.jsx` line 16
