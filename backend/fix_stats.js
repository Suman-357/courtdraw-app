const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Session = require('./models/Session');
const PlayerStat = require('./models/PlayerStat');
const Group = require('./models/Group');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const DB = process.env.MONGODB_URI;

mongoose.connect(DB).then(async () => {
  console.log('DB connection successful!');
  
  try {
    // 1. Reset all PlayerStats
    await PlayerStat.updateMany({}, { sessionsPlayed: 0, totalWins: 0, finesPaid: 0 });
    console.log('Reset all player stats to 0.');

    // 2. Fetch all closed sessions
    const sessions = await Session.find({ status: 'closed' });
    console.log(`Found ${sessions.length} closed sessions. Re-calculating stats...`);

    for (const session of sessions) {
      for (const team of session.teams) {
        const teamFine = session.fines.find(f => f.teamId === team.teamId);
        const perPlayerFine = teamFine ? (teamFine.amount / team.players.length) : 0;
        
        for (const playerId of team.players) {
          await PlayerStat.findOneAndUpdate(
            { userId: playerId, groupId: session.groupId },
            { 
              $inc: { 
                sessionsPlayed: 1, 
                totalWins: team.wins,
                finesPaid: perPlayerFine
              } 
            },
            { upsert: true, new: true }
          );
        }
      }
    }
    
    console.log('Stats successfully re-calculated based on session history!');
  } catch (err) {
    console.error('Error fixing stats:', err);
  }
  
  process.exit();
});
