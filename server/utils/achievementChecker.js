const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAndUnlockAchievements(userId, stats) {
  const newlyUnlocked = []

  try {
    // Get all achievements
    const allAchievements = await prisma.achievement.findMany()

    // Get already earned achievements
    const earned = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    })
    const earnedIds = new Set(earned.map(e => e.achievementId))

    // Check each achievement
    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue

      let unlocked = false

      switch (achievement.key) {
        // Sessions hosted
        case 'sessions_hosted_1': unlocked = (stats.sessionsHosted || 0) >= 1; break
        case 'sessions_hosted_2': unlocked = (stats.sessionsHosted || 0) >= 10; break
        case 'sessions_hosted_3': unlocked = (stats.sessionsHosted || 0) >= 50; break

        // Sessions joined
        case 'sessions_joined_1': unlocked = (stats.sessionsJoined || 0) >= 1; break
        case 'sessions_joined_2': unlocked = (stats.sessionsJoined || 0) >= 10; break
        case 'sessions_joined_3': unlocked = (stats.sessionsJoined || 0) >= 50; break

        // Sessions attended
        case 'sessions_attended_1': unlocked = (stats.sessionsAttended || 0) >= 1; break
        case 'sessions_attended_2': unlocked = (stats.sessionsAttended || 0) >= 10; break
        case 'sessions_attended_3': unlocked = (stats.sessionsAttended || 0) >= 30; break

        // Session variety
        case 'session_variety_1': unlocked = (stats.uniqueCourses || 0) >= 3; break
        case 'session_variety_2': unlocked = (stats.uniqueCourses || 0) >= 10; break
        case 'session_variety_3': unlocked = (stats.uniqueCourses || 0) >= 25; break

        // Full sessions
        case 'session_members_1': unlocked = (stats.fullSessions || 0) >= 1; break
        case 'session_members_2': unlocked = (stats.fullSessions || 0) >= 5; break
        case 'session_members_3': unlocked = (stats.fullSessions || 0) >= 20; break

        // QR host
        case 'qr_host_1': unlocked = (stats.qrShown || 0) >= 1; break
        case 'qr_host_2': unlocked = (stats.qrShown || 0) >= 10; break
        case 'qr_host_3': unlocked = (stats.qrShown || 0) >= 50; break

        // Messages sent
        case 'messages_sent_1': unlocked = (stats.messagesSent || 0) >= 1; break
        case 'messages_sent_2': unlocked = (stats.messagesSent || 0) >= 100; break
        case 'messages_sent_3': unlocked = (stats.messagesSent || 0) >= 500; break

        // Group messages
        case 'group_messages_1': unlocked = (stats.groupMessagesSent || 0) >= 1; break
        case 'group_messages_2': unlocked = (stats.groupMessagesSent || 0) >= 100; break
        case 'group_messages_3': unlocked = (stats.groupMessagesSent || 0) >= 500; break
        case 'group_active_1': unlocked = (stats.groupMessagesSent || 0) >= 1; break
        case 'group_active_2': unlocked = (stats.groupMessagesSent || 0) >= 50; break
        case 'group_active_3': unlocked = (stats.groupMessagesSent || 0) >= 200; break

        // Connections
        case 'connections_1': unlocked = (stats.connections || 0) >= 1; break
        case 'connections_2': unlocked = (stats.connections || 0) >= 10; break
        case 'connections_3': unlocked = (stats.connections || 0) >= 50; break
        case 'connection_requests_1': unlocked = (stats.connectionRequestsSent || 0) >= 1; break
        case 'connection_requests_2': unlocked = (stats.connectionRequestsSent || 0) >= 20; break
        case 'connection_requests_3': unlocked = (stats.connectionRequestsSent || 0) >= 100; break
        case 'connections_accepted_1': unlocked = (stats.connectionsAccepted || 0) >= 1; break
        case 'connections_accepted_2': unlocked = (stats.connectionsAccepted || 0) >= 10; break
        case 'connections_accepted_3': unlocked = (stats.connectionsAccepted || 0) >= 50; break

        // Brain games played
        case 'games_played_1': unlocked = (stats.gamesPlayed || 0) >= 1; break
        case 'games_played_2': unlocked = (stats.gamesPlayed || 0) >= 10; break
        case 'games_played_3': unlocked = (stats.gamesPlayed || 0) >= 50; break

        // Games won
        case 'games_won_1': unlocked = (stats.gamesWon || 0) >= 1; break
        case 'games_won_2': unlocked = (stats.gamesWon || 0) >= 10; break
        case 'games_won_3': unlocked = (stats.gamesWon || 0) >= 25; break

        // XP
        case 'xp_earned_1': unlocked = (stats.totalXP || 0) >= 100; break
        case 'xp_earned_2': unlocked = (stats.totalXP || 0) >= 500; break
        case 'xp_earned_3': unlocked = (stats.totalXP || 0) >= 2000; break

        // Win streak
        case 'win_streak_1': unlocked = (stats.winStreak || 0) >= 2; break
        case 'win_streak_2': unlocked = (stats.winStreak || 0) >= 5; break
        case 'win_streak_3': unlocked = (stats.winStreak || 0) >= 10; break

        // Daily challenge
        case 'daily_challenge_1': unlocked = (stats.dailyChallengesCompleted || 0) >= 1; break
        case 'daily_challenge_2': unlocked = (stats.dailyChallengesCompleted || 0) >= 10; break
        case 'daily_challenge_3': unlocked = (stats.dailyChallengesCompleted || 0) >= 30; break
        case 'daily_challenge_perfect_1': unlocked = (stats.dailyChallengesCorrect || 0) >= 1; break
        case 'daily_challenge_perfect_2': unlocked = (stats.dailyChallengesCorrect || 0) >= 10; break
        case 'daily_challenge_perfect_3': unlocked = (stats.dailyChallengesCorrect || 0) >= 25; break

        // Daily trivia
        case 'daily_trivia_1': unlocked = (stats.dailyTriviaCompleted || 0) >= 1; break
        case 'daily_trivia_2': unlocked = (stats.dailyTriviaCompleted || 0) >= 10; break
        case 'daily_trivia_3': unlocked = (stats.dailyTriviaCompleted || 0) >= 30; break
        case 'trivia_perfect_1': unlocked = (stats.triviaPerfectScores || 0) >= 1; break
        case 'trivia_perfect_2': unlocked = (stats.triviaPerfectScores || 0) >= 5; break
        case 'trivia_perfect_3': unlocked = (stats.triviaPerfectScores || 0) >= 15; break

        // Speed
        case 'speed_1': unlocked = (stats.fastAnswers || 0) >= 1; break
        case 'speed_2': unlocked = (stats.fastAnswers || 0) >= 10; break
        case 'speed_3': unlocked = (stats.fastAnswers || 0) >= 50; break

        // Kudos received
        case 'kudos_received_1': unlocked = (stats.kudosReceived || 0) >= 1; break
        case 'kudos_received_2': unlocked = (stats.kudosReceived || 0) >= 10; break
        case 'kudos_received_3': unlocked = (stats.kudosReceived || 0) >= 50; break

        // Kudos given
        case 'kudos_given_1': unlocked = (stats.kudosGiven || 0) >= 1; break
        case 'kudos_given_2': unlocked = (stats.kudosGiven || 0) >= 10; break
        case 'kudos_given_3': unlocked = (stats.kudosGiven || 0) >= 50; break

        // Kudos tags
        case 'kudos_tags_1': unlocked = (stats.uniqueKudosTags || 0) >= 3; break
        case 'kudos_tags_2': unlocked = (stats.uniqueKudosTags || 0) >= 6; break
        case 'kudos_tags_3': unlocked = (stats.uniqueKudosTags || 0) >= 10; break

        // Profile
        case 'profile_bio_1': unlocked = !!stats.hasBio; break
        case 'profile_avatar_1': unlocked = !!stats.hasAvatar; break
        case 'profile_banner_1': unlocked = (stats.bannerCount || 0) >= 1; break
        case 'profile_banner_2': unlocked = (stats.bannerCount || 0) >= 2; break
        case 'profile_banner_3': unlocked = (stats.bannerCount || 0) >= 3; break
        case 'profile_vibe_1': unlocked = !!stats.hasVibe; break
        case 'profile_border_1': unlocked = !!stats.hasBorder; break
        case 'profile_complete_1': unlocked = (stats.profileCompletion || 0) >= 50; break
        case 'profile_complete_2': unlocked = (stats.profileCompletion || 0) >= 75; break
        case 'profile_complete_3': unlocked = (stats.profileCompletion || 0) >= 100; break
        case 'notifications_1': unlocked = !!stats.gameNotificationsEnabled; break
        case 'verified_1': unlocked = !!stats.emailVerified; break

        // Special
        case 'early_adopter_1': unlocked = true; break
        case 'early_adopter_2': unlocked = (stats.userNumber || 999) <= 100; break
        case 'early_adopter_3': unlocked = (stats.userNumber || 999) <= 50; break
        case 'campus_map_1': unlocked = (stats.mapVisits || 0) >= 1; break
        case 'campus_map_2': unlocked = (stats.mapVisits || 0) >= 5; break
        case 'campus_map_3': unlocked = (stats.mapVisits || 0) >= 20; break
        case 'night_owl_1': unlocked = (stats.nightSessions || 0) >= 1; break
        case 'night_owl_2': unlocked = (stats.nightSessions || 0) >= 5; break
        case 'night_owl_3': unlocked = (stats.nightSessions || 0) >= 20; break
        case 'early_bird_1': unlocked = (stats.morningSessions || 0) >= 1; break
        case 'early_bird_2': unlocked = (stats.morningSessions || 0) >= 5; break
        case 'early_bird_3': unlocked = (stats.morningSessions || 0) >= 20; break
        case 'weekend_1': unlocked = (stats.weekendSessions || 0) >= 1; break
        case 'weekend_2': unlocked = (stats.weekendSessions || 0) >= 5; break
        case 'weekend_3': unlocked = (stats.weekendSessions || 0) >= 20; break
        case 'library_1': unlocked = (stats.librarySessions || 0) >= 1; break
        case 'library_2': unlocked = (stats.librarySessions || 0) >= 5; break
        case 'library_3': unlocked = (stats.librarySessions || 0) >= 20; break
        case 'full_session_1': unlocked = (stats.fullSessions || 0) >= 1; break
        case 'full_session_2': unlocked = (stats.fullSessions || 0) >= 5; break
        case 'full_session_3': unlocked = (stats.fullSessions || 0) >= 20; break
        case 'locations_1': unlocked = (stats.uniqueLocations || 0) >= 2; break
        case 'locations_2': unlocked = (stats.uniqueLocations || 0) >= 5; break
        case 'locations_3': unlocked = (stats.uniqueLocations || 0) >= 10; break
        case 'rejoin_approved_1': unlocked = (stats.rejectionsApproved || 0) >= 1; break
        case 'rejoin_approved_2': unlocked = (stats.rejectionsApproved || 0) >= 5; break
        case 'rejoin_approved_3': unlocked = (stats.rejectionsApproved || 0) >= 20; break

        // Session tags
        case 'session_tags_1': unlocked = (stats.taggedSessions || 0) >= 1; break
        case 'session_tags_2': unlocked = (stats.taggedSessions || 0) >= 10; break
        case 'session_tags_3': unlocked = (stats.taggedSessions || 0) >= 30; break

        // Long sessions
        case 'long_session_1': unlocked = (stats.longSessions || 0) >= 1; break
        case 'long_session_2': unlocked = (stats.longSessions || 0) >= 5; break
        case 'long_session_3': unlocked = (stats.longSessions || 0) >= 20; break

        // Brain games by category
        case 'games_hbcu_1': unlocked = (stats.hbcuGames || 0) >= 1; break
        case 'games_hbcu_2': unlocked = (stats.hbcuGames || 0) >= 5; break
        case 'games_hbcu_3': unlocked = (stats.hbcuGames || 0) >= 20; break
        case 'games_cs_1': unlocked = (stats.csGames || 0) >= 1; break
        case 'games_cs_2': unlocked = (stats.csGames || 0) >= 5; break
        case 'games_cs_3': unlocked = (stats.csGames || 0) >= 20; break
        case 'games_math_1': unlocked = (stats.mathGames || 0) >= 1; break
        case 'games_math_2': unlocked = (stats.mathGames || 0) >= 5; break
        case 'games_math_3': unlocked = (stats.mathGames || 0) >= 20; break
        case 'games_science_1': unlocked = (stats.scienceGames || 0) >= 1; break
        case 'games_science_2': unlocked = (stats.scienceGames || 0) >= 5; break
        case 'games_science_3': unlocked = (stats.scienceGames || 0) >= 20; break
        case 'games_engineering_1': unlocked = (stats.engineeringGames || 0) >= 1; break
        case 'games_engineering_2': unlocked = (stats.engineeringGames || 0) >= 5; break
        case 'games_engineering_3': unlocked = (stats.engineeringGames || 0) >= 20; break
        case 'games_business_1': unlocked = (stats.businessGames || 0) >= 1; break
        case 'games_business_2': unlocked = (stats.businessGames || 0) >= 5; break
        case 'games_business_3': unlocked = (stats.businessGames || 0) >= 20; break

        // Milestones
        case 'milestone_1': unlocked = (stats.totalAchievements || 0) >= 1; break
        case 'milestone_2': unlocked = (stats.totalAchievements || 0) >= 10; break
        case 'milestone_3': unlocked = (stats.totalAchievements || 0) >= 25; break
        case 'total_xp_milestone_1': unlocked = (stats.totalXP || 0) >= 50; break
        case 'total_xp_milestone_2': unlocked = (stats.totalXP || 0) >= 500; break
        case 'total_xp_milestone_3': unlocked = (stats.totalXP || 0) >= 2000; break
        case 'leaderboard_1': unlocked = (stats.leaderboardRank || 999) <= 20; break
        case 'leaderboard_2': unlocked = (stats.leaderboardRank || 999) <= 10; break
        case 'leaderboard_3': unlocked = (stats.leaderboardRank || 999) <= 1; break
        case 'messages_received_1': unlocked = (stats.messagesReceived || 0) >= 10; break
        case 'messages_received_2': unlocked = (stats.messagesReceived || 0) >= 100; break
        case 'messages_received_3': unlocked = (stats.messagesReceived || 0) >= 500; break
        case 'perfect_attendance_1': unlocked = (stats.onTimeCheckins || 0) >= 1; break
        case 'perfect_attendance_2': unlocked = (stats.onTimeCheckins || 0) >= 5; break
        case 'perfect_attendance_3': unlocked = (stats.onTimeCheckins || 0) >= 20; break
      }

      if (unlocked) {
        try {
          await prisma.userAchievement.create({
            data: { userId, achievementId: achievement.id }
          })
          // Give XP reward
          await prisma.userXP.upsert({
            where: { userId },
            create: { userId, totalXP: achievement.xpReward },
            update: { totalXP: { increment: achievement.xpReward } }
          })
          newlyUnlocked.push(achievement)
        } catch (err) {
          // Already earned (unique constraint) — skip
        }
      }
    }
  } catch (err) {
    console.error('Achievement check error:', err)
  }

  return newlyUnlocked
}

async function getUserStats(userId) {
  try {
    const [
      user,
      hostedSessions,
      joinedMembers,
      attendedMembers,
      messages,
      groupMessages,
      connections,
      xpData,
      dailyChallenges,
      dailyTrivia,
      kudosReceived,
      kudosGiven,
      userAchievements,
      totalUsers
    ] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { bio: true, avatar: true, banners: true, vibeTemplate: true, borderColor: true, gameNotifications: true, emailVerified: true, createdAt: true } }),
      prisma.session.findMany({ where: { hostId: userId }, select: { id: true, courseCode: true, location: true, time: true, date: true, status: true, members: true, tags: true, duration: true } }),
      prisma.sessionMember.findMany({ where: { userId }, select: { attended: true, checkedInAt: true, session: { select: { date: true, time: true } } } }),
      prisma.sessionMember.findMany({ where: { userId, attended: true } }),
      prisma.directMessage.count({ where: { senderId: userId } }),
      prisma.groupChatMessage.count({ where: { senderId: userId, isSystem: false } }),
      prisma.connection.count({ where: { OR: [{ fromId: userId }, { toId: userId }], status: 'accepted' } }),
      prisma.userXP.findUnique({ where: { userId } }),
      prisma.dailyChallengeAttempt.findMany({ where: { userId } }),
      prisma.dailyTriviaAttempt.findMany({ where: { userId } }),
      prisma.kudos.count({ where: { toUserId: userId } }),
      prisma.kudos.count({ where: { fromUserId: userId } }),
      prisma.userAchievement.count({ where: { userId } }),
      prisma.user.count()
    ])

    const userNumber = await prisma.user.count({ where: { createdAt: { lte: user?.createdAt } } })

    const uniqueKudosTags = await prisma.kudos.findMany({
      where: { toUserId: userId },
      select: { tag: true },
      distinct: ['tag']
    })

    const connectionRequestsSent = await prisma.connection.count({ where: { fromId: userId } })
    const connectionsAccepted = await prisma.connection.count({ where: { toId: userId, status: 'accepted' } })
    const messagesReceived = await prisma.directMessage.count({ where: { receiverId: userId } })

    const nightSessions = hostedSessions.filter(s => parseInt(s.time?.split(':')[0]) >= 21).length
    const morningSessions = hostedSessions.filter(s => parseInt(s.time?.split(':')[0]) < 8).length
    const weekendSessions = hostedSessions.filter(s => {
      const day = new Date(s.date).getDay()
      return day === 0 || day === 6
    }).length
    const librarySessions = hostedSessions.filter(s => s.location === 'Bluford Library').length
    const fullSessions = hostedSessions.filter(s => s.status === 'full' || s.members?.length >= s.maxParticipants).length
    const uniqueLocations = new Set(hostedSessions.map(s => s.location)).size
    const uniqueCourses = new Set(hostedSessions.map(s => s.courseCode)).size
    const taggedSessions = hostedSessions.filter(s => s.tags?.length > 0).length
    const longSessions = hostedSessions.filter(s => (s.duration || 0) >= 120).length

    const profileFields = [user?.bio, user?.avatar, user?.banners?.length > 0, user?.vibeTemplate, user?.borderColor]
    const profileCompletion = Math.round((profileFields.filter(Boolean).length / 8) * 100)

    return {
      sessionsHosted: hostedSessions.length,
      sessionsJoined: joinedMembers.length,
      sessionsAttended: attendedMembers.length,
      uniqueCourses,
      fullSessions,
      qrShown: hostedSessions.filter(s => s.hostAttended).length,
      messagesSent: messages,
      groupMessagesSent: groupMessages,
      messagesReceived,
      connections,
      connectionRequestsSent,
      connectionsAccepted,
      gamesPlayed: xpData?.gamesPlayed || 0,
      gamesWon: xpData?.gamesWon || 0,
      totalXP: xpData?.totalXP || 0,
      winStreak: xpData?.winStreak || 0,
      dailyChallengesCompleted: dailyChallenges.length,
      dailyChallengesCorrect: dailyChallenges.filter(d => d.isCorrect).length,
      dailyTriviaCompleted: dailyTrivia.length,
      triviaPerfectScores: dailyTrivia.filter(d => d.score === 15).length,
      kudosReceived,
      kudosGiven,
      uniqueKudosTags: uniqueKudosTags.length,
      hasBio: !!user?.bio,
      hasAvatar: !!user?.avatar,
      bannerCount: user?.banners?.length || 0,
      hasVibe: !!user?.vibeTemplate,
      hasBorder: !!user?.borderColor,
      profileCompletion,
      gameNotificationsEnabled: user?.gameNotifications !== false,
      emailVerified: !!user?.emailVerified,
      userNumber,
      nightSessions,
      morningSessions,
      weekendSessions,
      librarySessions,
      fullSessions,
      uniqueLocations,
      taggedSessions,
      longSessions,
      totalAchievements: userAchievements,
      fastAnswers: 0,
      mapVisits: 0,
      rejectionsApproved: 0,
      onTimeCheckins: 0,
      leaderboardRank: 999,
      hbcuGames: 0,
      csGames: 0,
      mathGames: 0,
      scienceGames: 0,
      engineeringGames: 0,
      businessGames: 0,
    }
  } catch (err) {
    console.error('getUserStats error:', err)
    return {}
  }
}

module.exports = { checkAndUnlockAchievements, getUserStats }