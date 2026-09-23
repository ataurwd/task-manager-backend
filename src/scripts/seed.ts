import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User';
import Note from '../models/Note';
import Post from '../models/Post';
import { connectDB, disconnectDB } from '../config/db';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Cleaning old data...');

    await Promise.all([
      User.deleteMany({}),
      Note.deleteMany({}),
      Post.deleteMany({})
    ]);

    console.log('[Seed] Seeding Users with interests and roles...');

    const admin = await User.create({
      name: 'Admin Master',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin',
      interests: ['technology', 'chess', 'design']
    });

    const alice = await User.create({
      name: 'Alice Cooper',
      email: 'alice@example.com',
      password: 'Password123!',
      role: 'user',
      interests: ['chess', 'reading', 'hiking']
    });

    const bob = await User.create({
      name: 'Bob Marley',
      email: 'bob@example.com',
      password: 'Password123!',
      role: 'user',
      interests: ['reading', 'music', 'gaming']
    });

    const charlie = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: 'Password123!',
      role: 'user',
      interests: ['technology', 'gaming', 'chess']
    });

    const diana = await User.create({
      name: 'Diana Prince',
      email: 'diana@example.com',
      password: 'Password123!',
      role: 'user',
      interests: ['design', 'photography', 'travel']
    });

    console.log('[Seed] Seeding Notes with ownership...');

    await Note.create([
      { title: "Alice's Secret Project", content: "Architecture draft for quarterly roadmap.", userId: alice._id },
      { title: "Alice's Book List", content: "1. Clean Code, 2. Designing Data-Intensive Applications", userId: alice._id },
      { title: "Bob's Jam Session", content: "Chord progressions for Sunday acoustic session.", userId: bob._id },
      { title: "Bob's Grocery Checklist", content: "Avocados, sourdough bread, oat milk, coffee beans.", userId: bob._id },
      { title: "Charlie's Tech Radar", content: "Explore Rust, Bun, WebAssembly and MongoDB Atlas Vector Search.", userId: charlie._id },
      { title: "Diana's Design System", content: "Color palette tokens: primary 600, slate 800, emerald 500.", userId: diana._id },
      { title: "Admin System Notice", content: "Scheduled database maintenance this Saturday at 02:00 UTC.", userId: admin._id }
    ]);

    console.log('[Seed] Seeding Posts for Scenario 2 ($lookup)...');

    await Post.create([
      { title: "Getting Started with Node.js and TypeScript", content: "A deep dive into building scalable enterprise REST APIs.", authorId: alice._id },
      { title: "Why MongoDB Aggregation Pipelines Rock", content: "Learn how to optimize single-pass data transformations using $lookup and $unwind.", authorId: alice._id },
      { title: "Top 5 Reggae Tracks of All Time", content: "Music that heals the soul and powers through tough debug sessions.", authorId: bob._id },
      { title: "Building Cloud Native Apps with Microservices", content: "Best practices for containerized architectures and Kubernetes clusters.", authorId: charlie._id },
      { title: "Minimalist UI Design Principles", content: "How spacing, typography, and contrast shape modern developer dashboards.", authorId: diana._id }
    ]);

    console.log('✅ [Seed] Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account: admin@example.com / Password123!');
    console.log('User Account:  alice@example.com / Password123!');
    console.log('User Account:  bob@example.com   / Password123!');
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
