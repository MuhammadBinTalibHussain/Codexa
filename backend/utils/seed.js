// Run from the backend/ folder with: node utils/seed.js
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Snippet = require("../models/Snippet");
const Review = require("../models/Review");
const AIReport = require("../models/AIReport");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Snippet.deleteMany();
    await Review.deleteMany();
    await AIReport.deleteMany();

    const passwordHash = await bcrypt.hash("Password123!", 12);
    const users = await User.create([
      { username: "Muhammad_admin", email: "muhammadtalibhussain56@gmail.com", passwordHash, role: "admin" },
      { username: "HuzaifaCodes", email: "uzaifa@codepulse.dev", passwordHash, role: "user" },
      { username: "alireviews", email: "ali@codepulse.dev", passwordHash, role: "user" },
    ]);

    const snippets = await Snippet.create([
      {
        title: "Debounce Function",
        code: "function debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
        language: "JavaScript",
        author: users[0]._id,
      },
      {
        title: "Binary Search",
        code: "def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
        language: "Python",
        author: users[1]._id,
      },
      {
        title: "Reverse a Linked List",
        code: "public ListNode reverseList(ListNode head) {\n    ListNode prev = null;\n    while (head != null) {\n        ListNode next = head.next;\n        head.next = prev;\n        prev = head;\n        head = next;\n    }\n    return prev;\n}",
        language: "Java",
        author: users[2]._id,
      },
      {
        title: "Fetch With Timeout",
        code: "async function fetchWithTimeout(url, ms) {\n  const controller = new AbortController();\n  const timer = setTimeout(() => controller.abort(), ms);\n  const res = await fetch(url, { signal: controller.signal });\n  clearTimeout(timer);\n  return res;\n}",
        language: "JavaScript",
        author: users[0]._id,
      },
      {
        title: "Quick Sort",
        code: "func quickSort(_ arr: [Int]) -> [Int] {\n    if arr.count <= 1 { return arr }\n    let pivot = arr[arr.count / 2]\n    let less = arr.filter { $0 < pivot }\n    let equal = arr.filter { $0 == pivot }\n    let greater = arr.filter { $0 > pivot }\n    return quickSort(less) + equal + quickSort(greater)\n}",
        language: "Swift",
        author: users[1]._id,
      },
    ]);

    const reviewerCycle = [users[1]._id, users[2]._id, users[0]._id];
    const sampleComments = [
      "Clean and easy to follow, nice work.",
      "Consider adding input validation here.",
      "Efficient approach, runs well on large inputs.",
      "Could use a few inline comments for clarity.",
      "Solid implementation, matches best practices.",
    ];

    const reviewDocs = [];
    snippets.forEach((snippet, i) => {
      for (let j = 0; j < 2; j++) {
        reviewDocs.push({
          snippet: snippet._id,
          reviewer: reviewerCycle[(i + j) % reviewerCycle.length],
          comment: sampleComments[(i + j) % sampleComments.length],
          rating: ((i + j) % 5) + 1,
          helpfulVotes: (i + j) * 2,
        });
      }
    });
    await Review.create(reviewDocs);

    await AIReport.create([
      {
        snippet: snippets[0]._id,
        readability: 88,
        maintainability: 82,
        performance: 90,
        overall: 87,
        suggestions: ["Add JSDoc comments", "Consider a max-wait option"],
      },
      {
        snippet: snippets[1]._id,
        readability: 91,
        maintainability: 85,
        performance: 80,
        overall: 85,
        suggestions: ["Add type hints", "Handle the empty array edge case"],
      },
    ]);

    console.log("Seed data inserted successfully:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Snippets: ${snippets.length}`);
    console.log(`- Reviews: ${reviewDocs.length}`);
    console.log("- AI Reports: 2");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedData();