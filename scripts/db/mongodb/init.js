// MongoDB initialization script for Ziririt Journey Sharing App
// This script sets up the initial database schema for posts and feed services

// Switch to the posts database
db = db.getSiblingDB('ziririt_posts');

// Create collections and indexes for posts
db.createCollection('posts');
db.posts.createIndex({ "userId": 1, "createdAt": -1 });
db.posts.createIndex({ "journeyId": 1, "progressDate": -1 });
db.posts.createIndex({ "createdAt": -1 });
db.posts.createIndex({ "hashtags": 1 });
db.posts.createIndex({ "userId": 1, "journeyId": 1, "progressDate": -1 });

// Create collections and indexes for likes
db.createCollection('likes');
db.likes.createIndex({ "postId": 1 });
db.likes.createIndex({ "userId": 1, "postId": 1 }, { unique: true });
db.likes.createIndex({ "userId": 1, "createdAt": -1 });

// Create collections and indexes for comments
db.createCollection('comments');
db.comments.createIndex({ "postId": 1, "createdAt": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "parentCommentId": 1 });

// Create collections and indexes for feed cache
db.createCollection('feed_cache');
db.feed_cache.createIndex({ "userId": 1, "page": 1 }, { unique: true });
db.feed_cache.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 3600 }); // 1 hour TTL

// Insert sample posts data
const samplePosts = [
  {
    id: "post_001",
    userId: "alice_goals_user_id", // This will be replaced with actual UUID from PostgreSQL
    journeyId: "journey_meditation_id",
    content: "Day 15 of my meditation journey! 🧘‍♀️ Today I managed to sit for 12 minutes without getting distracted. The consistency is really paying off - I feel more centered throughout the day.",
    mediaFiles: [],
    hashtags: ["meditation", "mindfulness", "consistency", "progress"],
    isMilestone: false,
    progressDate: new Date("2024-01-15T07:00:00Z"),
    createdAt: new Date("2024-01-15T07:30:00Z"),
    updatedAt: new Date("2024-01-15T07:30:00Z"),
    likesCount: 8,
    commentsCount: 3
  },
  {
    id: "post_002",
    userId: "alice_goals_user_id",
    journeyId: "journey_strength_id",
    content: "Deadlift PR today! 🏋️‍♀️ Finally hit 135lbs for 3 reps. The progressive overload approach is working. Form felt solid and controlled throughout.",
    mediaFiles: [
      {
        id: "media_001",
        url: "/media/alice/deadlift_pr.jpg",
        type: "image",
        thumbnailUrl: "/media/alice/deadlift_pr_thumb.jpg"
      }
    ],
    hashtags: ["strength", "deadlift", "PR", "progressiveoverload"],
    isMilestone: true,
    progressDate: new Date("2024-01-14T18:30:00Z"),
    createdAt: new Date("2024-01-14T19:00:00Z"),
    updatedAt: new Date("2024-01-14T19:00:00Z"),
    likesCount: 15,
    commentsCount: 7
  },
  {
    id: "post_003",
    userId: "bob_progress_user_id",
    journeyId: "journey_spanish_id", 
    content: "¡Hola! Had my first conversation entirely in Spanish with a native speaker today 🇪🇸 Still made mistakes but they understood everything I said. Confidence building!",
    mediaFiles: [],
    hashtags: ["spanish", "conversation", "milestone", "confidence"],
    isMilestone: true,
    progressDate: new Date("2024-01-13T16:00:00Z"),
    createdAt: new Date("2024-01-13T20:15:00Z"),
    updatedAt: new Date("2024-01-13T20:15:00Z"),
    likesCount: 12,
    commentsCount: 5
  },
  {
    id: "post_004",
    userId: "bob_progress_user_id",
    journeyId: "journey_photography_id",
    content: "Experimenting with natural lighting for portraits. This golden hour shot taught me so much about shadow positioning and subject placement.",
    mediaFiles: [
      {
        id: "media_002", 
        url: "/media/bob/golden_hour_portrait.jpg",
        type: "image",
        thumbnailUrl: "/media/bob/golden_hour_portrait_thumb.jpg"
      }
    ],
    hashtags: ["photography", "portrait", "goldenhour", "lighting"],
    isMilestone: false,
    progressDate: new Date("2024-01-12T17:45:00Z"),
    createdAt: new Date("2024-01-12T21:30:00Z"),
    updatedAt: new Date("2024-01-12T21:30:00Z"),
    likesCount: 9,
    commentsCount: 4
  },
  {
    id: "post_005",
    userId: "charlie_journey_user_id",
    journeyId: "journey_reading_id",
    content: "Finished 'Atomic Habits' tonight 📚 The 1% better concept really resonates with my journey. Taking notes on how to apply the habit stacking technique to my routine.",
    mediaFiles: [],
    hashtags: ["reading", "atomichabits", "selfimprovement", "habitstacking"],
    isMilestone: false,
    progressDate: new Date("2024-01-11T22:00:00Z"),
    createdAt: new Date("2024-01-11T22:30:00Z"),
    updatedAt: new Date("2024-01-11T22:30:00Z"),
    likesCount: 6,
    commentsCount: 2
  },
  {
    id: "post_006",
    userId: "charlie_journey_user_id",
    journeyId: "journey_workout_id",
    content: "Week 2 of home workouts complete! 💪 Did a full body circuit today - burpees are still my nemesis but I'm getting stronger. Consistency over perfection.",
    mediaFiles: [],
    hashtags: ["homeworkout", "circuit", "burpees", "consistency"],
    isMilestone: false,
    progressDate: new Date("2024-01-10T06:30:00Z"),
    createdAt: new Date("2024-01-10T07:00:00Z"),
    updatedAt: new Date("2024-01-10T07:00:00Z"),
    likesCount: 11,
    commentsCount: 6
  }
];

// Insert sample posts
db.posts.insertMany(samplePosts);

// Insert sample likes
const sampleLikes = [
  { id: "like_001", userId: "bob_progress_user_id", postId: "post_001", postType: "progress_post", createdAt: new Date("2024-01-15T08:00:00Z") },
  { id: "like_002", userId: "charlie_journey_user_id", postId: "post_001", postType: "progress_post", createdAt: new Date("2024-01-15T09:15:00Z") },
  { id: "like_003", userId: "alice_goals_user_id", postId: "post_003", postType: "progress_post", createdAt: new Date("2024-01-13T21:00:00Z") },
  { id: "like_004", userId: "charlie_journey_user_id", postId: "post_002", postType: "progress_post", createdAt: new Date("2024-01-14T20:30:00Z") },
  { id: "like_005", userId: "bob_progress_user_id", postId: "post_005", postType: "progress_post", createdAt: new Date("2024-01-12T08:45:00Z") },
  { id: "like_006", userId: "alice_goals_user_id", postId: "post_006", postType: "progress_post", createdAt: new Date("2024-01-10T08:30:00Z") }
];

db.likes.insertMany(sampleLikes);

// Insert sample comments
const sampleComments = [
  {
    id: "comment_001",
    userId: "bob_progress_user_id", 
    postId: "post_001",
    postType: "progress_post",
    content: "That's amazing progress Alice! I'm inspired to start my own meditation practice.",
    parentCommentId: null,
    createdAt: new Date("2024-01-15T08:30:00Z"),
    updatedAt: new Date("2024-01-15T08:30:00Z")
  },
  {
    id: "comment_002",
    userId: "alice_goals_user_id",
    postId: "post_001", 
    postType: "progress_post",
    content: "Thanks Bob! Start with just 5 minutes - that's how I began. Consistency matters more than duration at first.",
    parentCommentId: "comment_001",
    createdAt: new Date("2024-01-15T10:00:00Z"),
    updatedAt: new Date("2024-01-15T10:00:00Z")
  },
  {
    id: "comment_003",
    userId: "charlie_journey_user_id",
    postId: "post_002",
    postType: "progress_post", 
    content: "Incredible lift! Your form looks perfect. Any tips for someone just starting with deadlifts?",
    parentCommentId: null,
    createdAt: new Date("2024-01-14T20:00:00Z"),
    updatedAt: new Date("2024-01-14T20:00:00Z")
  },
  {
    id: "comment_004",
    userId: "alice_goals_user_id",
    postId: "post_003",
    postType: "progress_post",
    content: "¡Felicidades! That's such a huge milestone. Your dedication to daily practice is really showing results! 🎉",
    parentCommentId: null,
    createdAt: new Date("2024-01-13T21:30:00Z"),
    updatedAt: new Date("2024-01-13T21:30:00Z")
  }
];

db.comments.insertMany(sampleComments);

print("MongoDB initialization completed successfully!");
print("Created collections: posts, likes, comments, feed_cache");
print("Inserted sample data for development and testing");
print("Database ready for Ziririt Journey Sharing App");
