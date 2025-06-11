import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User";
import Deck from "../models/Deck";
import Flashcard from "../models/Flashcard";
import { sampleUsers, sampleDecks, sampleFlashcards } from "./englishVietnameseSeedData";

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
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
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${userData.username}`);
    }

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

    console.log("\n=== SEED DATA SUMMARY ===");
    console.log(`✅ Created ${createdUsers.length} users`);
    console.log(`✅ Created ${createdDecks.length} decks`);
    console.log(`✅ Created ${sampleFlashcards.length} flashcards`);
    
    console.log("\n=== USER ACCOUNTS ===");
    sampleUsers.forEach((user, index) => {
      console.log(`👤 ${user.username} (${user.email}) - Password: ${user.password}`);
    });

    console.log("\n=== DECK DISTRIBUTION ===");
    createdDecks.forEach((deck, index) => {
      const owner = createdUsers.find(user => user._id.equals(deck.user));
      const cardCount = sampleFlashcards.filter(card => card.deckIndex === index).length;
      console.log(`📚 "${deck.name}" - Owner: ${owner?.username} - Cards: ${cardCount}`);
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
