import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User, { UserRole } from "../models/User";
import Deck from "../models/Deck";
import Flashcard from "../models/Flashcard";
import Collocation from "../models/Collocation";
import { sampleUsers, sampleDecks, sampleFlashcards } from "./englishVietnameseSeedData";
import { collocationDecks, sampleCollocations } from "./collocationSeedData";
import { generateTTSUrl } from "../lib/tts";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await Collocation.deleteMany({});
    await Flashcard.deleteMany({});
    await Deck.deleteMany({});
    await User.deleteMany({});
    console.log("Existing data cleared");

    // Create users with hashed passwords
    console.log("Creating users...");
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash,
        learningSettings: userData.learningSettings,
        role: UserRole.USER,
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.username}`);
    }

    // Create a super admin user
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("admin123", salt);
    const superAdmin = new User({
      username: "superadmin",
      email: "admin@banh-chung.com",
      passwordHash: adminPasswordHash,
      role: UserRole.SUPER_ADMIN,
      learningSettings: {
        dailyTarget: 50,
        voiceSpeed: 1.0,
      },
    });
    const savedAdmin = await superAdmin.save();
    createdUsers.push(savedAdmin);
    console.log("Created super admin user");

    // Create decks
    console.log("Creating decks...");
    const createdDecks = [];
    
    for (const deckData of sampleDecks) {
      const deck = new Deck({
        name: deckData.name,
        description: deckData.description,
        user: createdUsers[deckData.userIndex]._id,
      });
      
      const savedDeck = await deck.save();
      createdDecks.push(savedDeck);
      console.log(`Created deck: ${deckData.name}`);
    }

    // Create flashcards
    console.log("Creating flashcards...");
    
    for (const cardData of sampleFlashcards) {
      const flashcard = new Flashcard({
        word: cardData.word,
        definition: cardData.definition,
        pronunciation: cardData.pronunciation,
        examples: cardData.examples,
        deck: createdDecks[cardData.deckIndex]._id,
        user: createdUsers[cardData.userIndex]._id,
        srsData: cardData.srsData,
      });
      
      await flashcard.save();
      console.log(`Created flashcard: ${cardData.word}`);
    }

    // Create collocation decks
    console.log("Creating collocation decks...");
    const createdCollocationDecks = [];
    
    for (const deckData of collocationDecks) {
      const deck = new Deck({
        name: deckData.name,
        description: deckData.description,
        user: savedAdmin._id, // Assign to super admin
      });
      
      const savedDeck = await deck.save();
      createdCollocationDecks.push(savedDeck);
      console.log(`Created collocation deck: ${deckData.name}`);
    }

    // Create collocations
    console.log("Creating collocations...");
    
    for (const collocationData of sampleCollocations) {
      const audioUrl = generateTTSUrl(collocationData.phrase, "en-US");
      
      const collocation = new Collocation({
        phrase: collocationData.phrase,
        meaning: collocationData.meaning,
        components: collocationData.components,
        examples: collocationData.examples,
        pronunciation: audioUrl,
        tags: collocationData.tags,
        deck: createdCollocationDecks[collocationData.deckIndex]._id,
        user: savedAdmin._id, // Assign to super admin
        difficulty: collocationData.difficulty,
        srsData: {
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: new Date(),
        },
      });
      
      await collocation.save();
      console.log(`Created collocation: ${collocationData.phrase}`);
    }

    console.log("\n=== SEED DATA SUMMARY ===");
    console.log(`✅ Created ${createdUsers.length} users (including super admin)`);
    console.log(`✅ Created ${createdDecks.length} flashcard decks`);
    console.log(`✅ Created ${sampleFlashcards.length} flashcards`);
    console.log(`✅ Created ${createdCollocationDecks.length} collocation decks`);
    console.log(`✅ Created ${sampleCollocations.length} collocations`);
    
    console.log("\n=== USER ACCOUNTS ===");
    sampleUsers.forEach((user, index) => {
      console.log(`👤 ${user.username} (${user.email}) - Password: ${user.password}`);
    });
    console.log(`👑 superadmin (admin@banh-chung.com) - Password: admin123 [SUPER ADMIN]`);

    console.log("\n=== FLASHCARD DECK DISTRIBUTION ===");
    createdDecks.forEach((deck, index) => {
      const owner = createdUsers.find(user => user._id.equals(deck.user));
      const cardCount = sampleFlashcards.filter(card => card.deckIndex === index).length;
      console.log(`📚 "${deck.name}" - Owner: ${owner?.username} - Cards: ${cardCount}`);
    });

    console.log("\n=== COLLOCATION DECK DISTRIBUTION ===");
    createdCollocationDecks.forEach((deck, index) => {
      const collocationCount = sampleCollocations.filter(col => col.deckIndex === index).length;
      console.log(`📖 "${deck.name}" - Owner: superadmin - Collocations: ${collocationCount}`);
    });

    console.log("\n🎉 Database seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;
