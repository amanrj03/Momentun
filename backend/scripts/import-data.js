const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Initialize Prisma with new Supabase connection
const prisma = new PrismaClient();

async function importData(filename) {
  try {
    console.log('🔄 Starting data import...');
    
    // Read the export file
    const filepath = path.join(__dirname, 'exports', filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Export file not found: ${filepath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    console.log('📊 Import Stats:');
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Videos: ${data.videos.length}`);
    console.log(`   - Video Likes: ${data.videoLikes.length}`);
    console.log(`   - Video Saves: ${data.videoSaves.length}`);
    console.log(`   - Watch History: ${data.watchHistory.length}`);
    
    // Import users and profiles
    console.log('🔄 Importing users and profiles...');
    for (const user of data.users) {
      const { adminProfile, creatorProfile, viewerProfile, ...userData } = user;
      
      // Create user
      const createdUser = await prisma.user.create({
        data: userData
      });
      
      // Create associated profile based on role
      if (adminProfile) {
        await prisma.adminProfile.create({
          data: {
            ...adminProfile,
            userId: createdUser.id
          }
        });
      }
      
      if (creatorProfile) {
        await prisma.creatorProfile.create({
          data: {
            ...creatorProfile,
            userId: createdUser.id
          }
        });
      }
      
      if (viewerProfile) {
        await prisma.viewerProfile.create({
          data: {
            ...viewerProfile,
            userId: createdUser.id
          }
        });
      }
    }
    
    // Import videos
    console.log('🔄 Importing videos...');
    for (const video of data.videos) {
      await prisma.video.create({
        data: video
      });
    }
    
    // Import video likes
    console.log('🔄 Importing video likes...');
    for (const like of data.videoLikes) {
      await prisma.videoLike.create({
        data: like
      });
    }
    
    // Import video saves
    console.log('🔄 Importing video saves...');
    for (const save of data.videoSaves) {
      await prisma.videoSave.create({
        data: save
      });
    }
    
    // Import watch history
    console.log('🔄 Importing watch history...');
    for (const history of data.watchHistory) {
      await prisma.watchHistory.create({
        data: history
      });
    }
    
    console.log('✅ Data imported successfully!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get filename from command line argument
const filename = process.argv[2];
if (!filename) {
  console.error('❌ Please provide the export filename as an argument');
  console.log('Usage: node import-data.js <filename>');
  process.exit(1);
}

importData(filename);