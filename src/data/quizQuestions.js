export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary difference between Boundary Value Analysis (BVA) and Equivalence Partitioning (EP)?",
    options: [
      "BVA tests extreme boundaries of input ranges (e.g. min, min-1, max+1), whereas EP divides input data into valid/invalid partitions.",
      "BVA is only used for UI testing, whereas EP is used for backend DB testing.",
      "EP tests edge cases only at zero, whereas BVA tests positive numbers only.",
      "There is no difference; both terms mean identical testing techniques."
    ],
    correctIndex: 0,
    explanation: "Boundary Value Analysis focuses on boundary values of partitions, as errors most frequently occur at boundary edges."
  },
  {
    id: 2,
    question: "In Bug Lifecycle, what state is a bug in after a developer claims to have fixed it, but BEFORE QA re-tests it?",
    options: [
      "Closed",
      "Resolved / Ready for Retest",
      "Deferred",
      "Re-opened"
    ],
    correctIndex: 1,
    explanation: "Once resolved by dev, it enters 'Resolved' or 'Ready for QA / Retest' state before QA verifies and Closes it."
  },
  {
    id: 3,
    question: "Which of the following describes high Severity but low Priority?",
    options: [
      "Company logo is slightly blurry on homepage.",
      "Spelling mistake on a minor contact page.",
      "Application crashes on an obscure legacy operating system feature used by 0.01% of users.",
      "Payment button does not process transactions on Black Friday."
    ],
    correctIndex: 2,
    explanation: "A crash is high severity (system failure), but if it affects almost no active users or a legacy edge-case feature, fixing it may have low business priority."
  },
  {
    id: 4,
    question: "What is the main objective of Regression Testing?",
    options: [
      "To test newly added features for the first time.",
      "To verify that recent code changes/fixes have NOT broken existing working functionality.",
      "To test system performance under maximum concurrent user load.",
      "To check security vulnerabilities against SQL injection."
    ],
    correctIndex: 1,
    explanation: "Regression testing ensures that existing system features remain intact after software modifications."
  },
  {
    id: 5,
    question: "What is Smoke Testing (Sanity Testing)?",
    options: [
      "Exhaustive testing of every single component in detail.",
      "A quick high-level build verification test to ensure basic critical features work before detailed testing begins.",
      "Testing the physical hardware temperature under high CPU usage.",
      "Writing automated Selenium unit test scripts."
    ],
    correctIndex: 1,
    explanation: "Smoke testing determines whether the build is stable enough to proceed with further deep testing."
  },
  {
    id: 6,
    question: "If a text field accepts names between 3 and 20 characters, which test cases represent Boundary Value Analysis?",
    options: [
      "0, 10, 50 characters",
      "2, 3, 4, 19, 20, 21 characters",
      "5, 10, 15 characters",
      "Only 20 characters"
    ],
    correctIndex: 1,
    explanation: "Boundary values for range 3 to 20 are just below lower bound (2), at lower bound (3), just above lower bound (4), just below upper (19), at upper (20), and just above upper (21)."
  },
  {
    id: 7,
    question: "Which key element is mandatory in a professional Bug Report?",
    options: [
      "Exact Steps to Reproduce",
      "Expected Behavior vs Actual Behavior",
      "Severity rating and Environment details",
      "All of the above"
    ],
    correctIndex: 3,
    explanation: "A thorough defect report requires clear reproduction steps, environment details, expected/actual outcome, and severity."
  },
  {
    id: 8,
    question: "What is Black Box Testing?",
    options: [
      "Testing software without internal knowledge of the code implementation or database structure.",
      "Testing internal C++ source code pointers and memory management.",
      "Testing compiled binary bytecode using a hex editor.",
      "Testing done exclusively by automated CI/CD pipelines."
    ],
    correctIndex: 0,
    explanation: "Black box testing examines functionality based strictly on requirements without peering into internal code logic."
  }
];
