// Game Registry Configuration
// This file defines all available games and their properties

export const gamesConfig = {
  games: [
    {
      id: "rn-mastery",
      title: "RN Mastery Quiz",
      description: "Chapter-based review with adaptive learning",
      icon: "GraduationCap",
      category: "study",
      color: "from-blue-500 to-indigo-600",
      enabled: true,
      modes: ["study", "ranked"],
      supportsDynamicChapters: true
    },
    {
      id: "flashcards",
      title: "Flashcard Study",
      description: "Flip cards with spaced repetition - mark as Know It, Review, or Learning",
      icon: "CreditCard",
      category: "study",
      color: "from-indigo-500 to-purple-600",
      enabled: true,
      modes: ["flashcard"],
      supportsDynamicChapters: true
    },
    {
      id: "day-to-be-wrong",
      title: "A Day to be Wrong",
      description: "Clinical judgment - choose the least dangerous wrong answer",
      icon: "Scale",
      category: "clinical-judgment",
      color: "from-purple-500 to-pink-600",
      enabled: true,
      modes: ["ranked"],
      supportsDynamicChapters: false,
      specialMode: true
    },
    {
      id: "challenge-mode",
      title: "Challenge Scenarios",
      description: "Time-based resource management challenges",
      icon: "Zap",
      category: "challenge",
      color: "from-orange-500 to-red-600",
      enabled: true,
      modes: ["challenge"],
      supportsDynamicChapters: false
    },
    {
      id: "instructor-mode",
      title: "Instructor Panel",
      description: "Live classroom management and judgment panel",
      icon: "Crown",
      category: "instructor",
      color: "from-yellow-500 to-amber-600",
      enabled: true,
      modes: ["instructor"],
      requiresAuth: true
    }
  ],
  categories: [
    {
      id: "study",
      title: "Study & Review",
      icon: "BookOpen",
      description: "Self-paced learning modules"
    },
    {
      id: "clinical-judgment",
      title: "Clinical Judgment",
      icon: "Brain",
      description: "Decision-making scenarios"
    },
    {
      id: "challenge",
      title: "Challenges",
      icon: "Trophy",
      description: "Timed competitive modes"
    },
    {
      id: "instructor",
      title: "Instructor Tools",
      icon: "Users",
      description: "Classroom management"
    }
  ]
};
