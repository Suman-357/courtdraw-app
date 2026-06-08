const Session = require('../models/Session');
const Match = require('../models/Match');
const PlayerStat = require('../models/PlayerStat');
const Group = require('../models/Group');
const asyncWrapper = require('../utils/asyncWrapper');
const { AppError } = require('../utils/errorHandler');

exports.createSession = asyncWrapper(async (req, res, next) => {
  const { groupId, presentPlayers, courtCount, manualTeams } = req.body;

  let teams;

  if (manualTeams && manualTeams.length > 0) {
    // Manual mode: admin has pre-assigned teams
    if (manualTeams.length < 2) {
      return next(new AppError('You need at least 2 teams.', 400));
    }
    teams = manualTeams.map(t => ({
      teamId: `team_${Math.random().toString(36).substr(2, 9)}`,
      players: t.players,
      wins: 0
    }));
  } else {
    // Auto mode: shuffle and pair
    if (!presentPlayers || presentPlayers.length < 4) {
      return next(new AppError('You need at least 4 players to generate matchups.', 400));
    }
    const shuffled = [...presentPlayers].sort(() => 0.5 - Math.random());
    teams = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        teams.push({
          teamId: `team_${Math.random().toString(36).substr(2, 9)}`,
          players: [shuffled[i], shuffled[i+1]],
          wins: 0
        });
      } else {
        teams[teams.length - 1].players.push(shuffled[i]);
      }
    }
  }

  // 2) Generate Round Robin Matchups
  let matchups = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matchups.push({
        matchId: `match_${Math.random().toString(36).substr(2, 9)}`,
        teamA: teams[i].teamId,
        teamB: teams[j].teamId,
        winnerTeamId: null,
        status: 'pending',
        courtNumber: null
      });
    }
  }

  // Shuffle matchups
  matchups = matchups.sort(() => 0.5 - Math.random());

  // Assign courts
  let activeMatches = 0;
  matchups.forEach(m => {
    if (activeMatches < (courtCount || 3)) {
      m.status = 'active';
      m.courtNumber = activeMatches + 1;
      activeMatches++;
    }
  });

  const newSession = await Session.create({
    groupId,
    presentPlayers,
    courtCount: courtCount || 3,
    teams,
    matchups
  });

  await newSession.populate({
    path: 'presentPlayers teams.players fines.players',
    select: 'name username _id'
  });

  res.status(201).json({
    status: 'success',
    data: {
      session: newSession
    }
  });
});

exports.getSessionsByGroup = asyncWrapper(async (req, res, next) => {
  const sessions = await Session.find({ groupId: req.query.groupId }).sort('-date');
  
  res.status(200).json({
    status: 'success',
    results: sessions.length,
    data: {
      sessions
    }
  });
});

exports.recordMatch = asyncWrapper(async (req, res, next) => {
  const { id, matchId } = req.params;
  const { winnerTeamId } = req.body;

  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  const match = session.matchups.find(m => m.matchId === matchId);
  if (!match || match.status !== 'active') return next(new AppError('Match not active or not found', 400));

  const team = session.teams.find(t => t.teamId === winnerTeamId);
  if (!team) return next(new AppError('Winning team not found in session', 400));

  // Update logic
  team.wins += 1;
  match.winnerTeamId = winnerTeamId;
  match.status = 'completed';
  
  const freedCourt = match.courtNumber;
  match.courtNumber = null;

  // Cycle queue
  const nextMatch = session.matchups.find(m => m.status === 'pending');
  if (nextMatch) {
    nextMatch.status = 'active';
    nextMatch.courtNumber = freedCourt;
  }

  await session.save();
  await session.populate({
    path: 'presentPlayers teams.players fines.players',
    select: 'name username _id'
  });

  // Create Global Match Record
  await Match.create({
    sessionId: session._id,
    groupId: session.groupId,
    teamA: session.teams.find(t => t.teamId === match.teamA).players,
    teamB: session.teams.find(t => t.teamId === match.teamB).players,
    winnerTeamId
  });

  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

exports.closeSession = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  
  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  if (session.status === 'closed') {
    return next(new AppError('Session is already closed', 400));
  }

  // Calculate Fines (lowest wins tie logic)
  const group = await Group.findById(session.groupId);
  const basePenalty = group ? group.defaultPenaltyAmount : 5;

  // Extract raw teams data before populate mangles it
  const teamsData = session.teams.map(t => ({
    teamId: t.teamId,
    players: t.players.map(p => p._id || p),
    wins: t.wins
  }));

  console.log('=== FINE CALCULATION DEBUG ===');
  console.log('basePenalty:', basePenalty);
  console.log('courtCount:', session.courtCount);
  console.log('teamsData:', JSON.stringify(teamsData, null, 2));

  const sortedTeams = [...teamsData].sort((a, b) => a.wins - b.wins);
  
  let finesAssigned = 0;
  const numToFine = session.courtCount || 1;
  const uniqueWinCounts = Array.from(new Set(sortedTeams.map(t => t.wins)));

  console.log('numToFine:', numToFine);
  console.log('uniqueWinCounts:', uniqueWinCounts);

  session.fines = [];

  for (const winCount of uniqueWinCounts) {
    if (finesAssigned >= numToFine) break;

    const tiedTeams = sortedTeams.filter(t => t.wins === winCount);
    const spotsRemaining = numToFine - finesAssigned;
    
    console.log(`winCount=${winCount}, tiedTeams=${tiedTeams.length}, spotsRemaining=${spotsRemaining}`);

    if (tiedTeams.length <= spotsRemaining) {
      tiedTeams.forEach(t => {
        session.fines.push({
          teamId: t.teamId,
          players: t.players,
          amount: basePenalty,
          reason: 'Lowest wins penalty'
        });
      });
      finesAssigned += tiedTeams.length;
    } else {
      const penaltyPool = spotsRemaining * basePenalty;
      const splitAmount = penaltyPool / tiedTeams.length;
      
      tiedTeams.forEach(t => {
        session.fines.push({
          teamId: t.teamId,
          players: t.players,
          amount: splitAmount,
          reason: 'Tied for lowest wins (Split fine)'
        });
      });
      finesAssigned += spotsRemaining;
    }
  }

  console.log('Final fines:', JSON.stringify(session.fines, null, 2));
  console.log('=== END DEBUG ===');
  
  session.status = 'closed';
  await session.save();
  await session.populate({
    path: 'presentPlayers teams.players fines.players',
    select: 'name username _id'
  });

  // Update Player Stats
  // Build a map of wins/losses per player for this session
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

  // Auto-deactivate guest players so they don't appear in future sessions
  const allPlayerIds = session.teams.flatMap(t => t.players);
  await User.updateMany(
    { _id: { $in: allPlayerIds }, isGuest: true },
    { isActive: false }
  );

  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});

exports.addRematch = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { teamA, teamB } = req.body;

  const session = await Session.findById(id);
  if (!session) return next(new AppError('Session not found', 404));

  if (session.status === 'closed') {
    return next(new AppError('Cannot add rematch to a closed session', 400));
  }

  // Calculate court number if there are free courts
  const activeCount = session.matchups.filter(m => m.status === 'active').length;
  let courtNumber = null;
  let status = 'pending';

  if (activeCount < session.courtCount) {
    // Find next available court number (1 to courtCount)
    const usedCourts = session.matchups.filter(m => m.status === 'active').map(m => m.courtNumber);
    for (let i = 1; i <= session.courtCount; i++) {
      if (!usedCourts.includes(i)) {
        courtNumber = i;
        status = 'active';
        break;
      }
    }
  }

  const newMatch = {
    matchId: `match_${Math.random().toString(36).substr(2, 9)}`,
    teamA,
    teamB,
    winnerTeamId: null,
    status,
    courtNumber
  };

  session.matchups.push(newMatch);
  await session.save();
  await session.populate({
    path: 'presentPlayers teams.players fines.players',
    select: 'name username _id'
  });

  res.status(200).json({
    status: 'success',
    data: {
      session
    }
  });
});
