const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('🔄 Starting data export...');
    
    // Export all data
    const data = {
      users: await prisma.user.findMany({
        include: {
          adminProfile: true,
          creatorProfile: true,
          viewerProfile: true,
        }
      }),
      videos: await prisma.video.findMany(),
      videoLikes: await prisma.videoLike.findMany(),
      videoSaves: await prisma.videoSave.findMany(),
      watchHistory: await prisma.watchHistory.findMany(),
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // Write data to JSON file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `database-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    console.log('✅ Data exported successfully!');
    console.log(`📁 File: ${filepath}`);
    console.log(`📊 Stats:`);
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Videos: ${data.videos.length}`);
    console.log(`   - Video Likes: ${data.videoLikes.length}`);
    console.log(`   - Video Saves: ${data.videoSaves.length}`);
    console.log(`   - Watch History: ${data.watchHistory.length}`);
    
  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();