import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Deck from "../models/Deck";
import Flashcard from "../models/Flashcard";

dotenv.config();

const verifySeededData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to MongoDB");

    // Count documents
    const userCount = await User.countDocuments();
    const deckCount = await Deck.countDocuments();
    const flashcardCount = await Flashcard.countDocuments();

    console.log("\n=== DATABASE VERIFICATION ===");
    console.log(`👥 Users: ${userCount}`);
    console.log(`📚 Decks: ${deckCount}`);
    console.log(`🃏 Flashcards: ${flashcardCount}`);

    // Get sample data
    console.log("\n=== SAMPLE USER ===");
    const sampleUser = await User.findOne({ username: "nguyen_van_a" });
    if (sampleUser) {
      console.log(`Username: ${sampleUser.username}`);
      console.log(`Email: ${sampleUser.email}`);
      console.log(`Daily Target: ${sampleUser.learningSettings.dailyTarget}`);
      console.log(`Voice Speed: ${sampleUser.learningSettings.voiceSpeed}`);
    }

    // Get sample deck with flashcards
    console.log("\n=== SAMPLE DECK WITH FLASHCARDS ===");
    const sampleDeck = await Deck.findOne({ name: "Essential English Vocabulary" }).populate('user');
    if (sampleDeck) {
      console.log(`Deck: ${sampleDeck.name}`);
      console.log(`Description: ${sampleDeck.description}`);
      console.log(`Owner: ${(sampleDeck.user as any).username}`);
      
      const deckFlashcards = await Flashcard.find({ deck: sampleDeck._id });
      console.log(`Flashcards in deck: ${deckFlashcards.length}`);
      
      if (deckFlashcards.length > 0) {
        const firstCard = deckFlashcards[0];
        console.log(`\nSample Flashcard:`);
        console.log(`  Word: ${firstCard.word}`);
        console.log(`  Definition: ${firstCard.definition}`);
        console.log(`  Examples: ${firstCard.examples.length} examples`);
        console.log(`  SRS Interval: ${firstCard.srsData.interval} days`);
        console.log(`  SRS Repetitions: ${firstCard.srsData.repetitions}`);
        console.log(`  Next Review: ${firstCard.srsData.nextReview}`);
      }
    }

    // Check cards due for review
    console.log("\n=== CARDS DUE FOR REVIEW ===");
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const dueCards = await Flashcard.find({
      "srsData.nextReview": { $lte: today }
    }).populate('deck user');
    
    console.log(`Cards due for review today: ${dueCards.length}`);
    
    if (dueCards.length > 0) {
      dueCards.slice(0, 3).forEach((card, index) => {
        console.log(`  ${index + 1}. ${card.word} (${(card.deck as any).name}) - Owner: ${(card.user as any).username}`);
      });
    }

    // Check SRS distribution
    console.log("\n=== SRS DATA DISTRIBUTION ===");
    const newCards = await Flashcard.countDocuments({ "srsData.repetitions": 0 });
    const learningCards = await Flashcard.countDocuments({ 
      "srsData.repetitions": { $gte: 1, $lte: 2 } 
    });
    const reviewCards = await Flashcard.countDocuments({ 
      "srsData.repetitions": { $gte: 3 } 
    });
    
    console.log(`New cards (0 repetitions): ${newCards}`);
    console.log(`Learning cards (1-2 repetitions): ${learningCards}`);
    console.log(`Review cards (3+ repetitions): ${reviewCards}`);

    console.log("\n✅ Data verification completed successfully!");
    
  } catch (error) {
    console.error("Error verifying data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
};

// Run the verification if this file is executed directly
if (require.main === module) {
  verifySeededData();
}

export default verifySeededData;
