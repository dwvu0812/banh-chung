import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User, { UserRole } from "../models/User";
import Deck from "../models/Deck";
import Collocation from "../models/Collocation";
import {
  allCollocations,
  collocationDeckStructure,
} from "../data/collocations";
import { generateTTSUrl } from "../lib/tts";

// Load environment exactly like server does
if (process.env.NODE_ENV !== "production") {
  const envFile = ".env.development";
  dotenv.config({ path: envFile });
  console.log(`Loaded environment from ${envFile}`);
} else {
  console.log("Using environment variables from Railway");
  dotenv.config();
}

async function importCollocations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // Find or create system super admin user
    let systemUser = await User.findOne({
      email: "system@banh-chung.com",
      role: UserRole.SUPER_ADMIN,
    });

    if (!systemUser) {
      console.log("Creating system super admin user...");
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash("system123", salt);

      systemUser = new User({
        username: "system",
        email: "system@banh-chung.com",
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        learningSettings: {
          dailyTarget: 50,
          voiceSpeed: 1.0,
        },
      });

      await systemUser.save();
      console.log("✅ System user created");
    } else {
      console.log("✅ System user already exists");
    }

    // Create or update collocation decks
    console.log("Creating collocation decks...");
    const createdDecks = [];

    for (const deckData of collocationDeckStructure) {
      let deck = await Deck.findOne({
        name: deckData.name,
        user: systemUser._id,
      });

      if (!deck) {
        deck = new Deck({
          name: deckData.name,
          description: deckData.description,
          user: systemUser._id,
          isPublic: deckData.isPublic,
        });
        await deck.save();
        console.log(`  ✅ Created deck: ${deckData.name}`);
      } else {
        console.log(`  ✓ Deck already exists: ${deckData.name}`);
      }

      createdDecks.push({ deck, category: deckData.category });
    }

    // Import collocations
    console.log("Importing collocations...");
    let importedCount = 0;
    let skippedCount = 0;

    for (const collocationData of allCollocations) {
      // Find the appropriate deck for this collocation
      const deckInfo = createdDecks.find(
        (d) => d.category === collocationData.category
      );
      if (!deckInfo) {
        console.warn(
          `  ⚠ No deck found for category: ${collocationData.category}`
        );
        continue;
      }

      // Check if collocation already exists
      const existingCollocation = await Collocation.findOne({
        phrase: collocationData.phrase,
        deck: deckInfo.deck._id,
      });

      if (existingCollocation) {
        skippedCount++;
        continue;
      }

      // Generate TTS URL for pronunciation
      const audioUrl = generateTTSUrl(collocationData.phrase, "en-US");

      // Create new collocation
      const collocation = new Collocation({
        phrase: collocationData.phrase,
        meaning: collocationData.meaning,
        components: collocationData.components,
        examples: collocationData.examples,
        pronunciation: audioUrl,
        tags: collocationData.tags,
        deck: deckInfo.deck._id,
        user: systemUser._id,
        difficulty: collocationData.difficulty,
        srsData: {
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReview: new Date(),
        },
      });

      await collocation.save();
      importedCount++;

      if (importedCount % 10 === 0) {
        console.log(`  📝 Imported ${importedCount} collocations...`);
      }
    }

    console.log("\n=== IMPORT SUMMARY ===");
    console.log(`✅ Imported ${importedCount} new collocations`);
    console.log(`⏭ Skipped ${skippedCount} existing collocations`);
    console.log(`📚 Created ${createdDecks.length} decks`);
    console.log(`👤 System user: system@banh-chung.com`);

    console.log("\n=== COLLOCATION DISTRIBUTION ===");
    for (const deckInfo of createdDecks) {
      const count = await Collocation.countDocuments({
        deck: deckInfo.deck._id,
      });
      console.log(`  📖 ${deckInfo.deck.name}: ${count} collocations`);
    }

    console.log("\n🎉 Collocations import completed successfully!");
  } catch (error) {
    console.error("Error importing collocations:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  importCollocations();
}

export default importCollocations;
