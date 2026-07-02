const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const achievements = [
  // ─── SESSIONS HOSTED ───
  { key: 'sessions_hosted_1', tier: 1, name: 'First Steps', description: 'Host your first study session', icon: '📚', category: 'Sessions', xpReward: 10, requirement: 1 },
  { key: 'sessions_hosted_2', tier: 2, name: 'Session Leader', description: 'Host 10 study sessions', icon: '📚', category: 'Sessions', xpReward: 25, requirement: 10 },
  { key: 'sessions_hosted_3', tier: 3, name: 'Session King', description: 'Host 50 study sessions', icon: '📚', category: 'Sessions', xpReward: 100, requirement: 50 },

  // ─── SESSIONS JOINED ───
  { key: 'sessions_joined_1', tier: 1, name: 'Squad Up', description: 'Join your first study session', icon: '🤝', category: 'Sessions', xpReward: 10, requirement: 1 },
  { key: 'sessions_joined_2', tier: 2, name: 'Team Player', description: 'Join 10 study sessions', icon: '🤝', category: 'Sessions', xpReward: 25, requirement: 10 },
  { key: 'sessions_joined_3', tier: 3, name: 'Aggie All-Star', description: 'Join 50 study sessions', icon: '🤝', category: 'Sessions', xpReward: 100, requirement: 50 },

  // ─── SESSION ATTENDANCE ───
  { key: 'sessions_attended_1', tier: 1, name: 'Show Up', description: 'Check in to your first session via QR', icon: '✅', category: 'Sessions', xpReward: 15, requirement: 1 },
  { key: 'sessions_attended_2', tier: 2, name: 'Present', description: 'Check in to 10 sessions via QR', icon: '✅', category: 'Sessions', xpReward: 30, requirement: 10 },
  { key: 'sessions_attended_3', tier: 3, name: 'Never Miss', description: 'Check in to 30 sessions via QR', icon: '✅', category: 'Sessions', xpReward: 75, requirement: 30 },

  // ─── SESSION VARIETY ───
  { key: 'session_variety_1', tier: 1, name: 'Multi-Subject', description: 'Host sessions for 3 different courses', icon: '🎯', category: 'Sessions', xpReward: 15, requirement: 3 },
  { key: 'session_variety_2', tier: 2, name: 'Course Master', description: 'Host sessions for 10 different courses', icon: '🎯', category: 'Sessions', xpReward: 35, requirement: 10 },
  { key: 'session_variety_3', tier: 3, name: 'Curriculum King', description: 'Host sessions for 25 different courses', icon: '🎯', category: 'Sessions', xpReward: 80, requirement: 25 },

  // ─── SESSION MEMBERS ───
  { key: 'session_members_1', tier: 1, name: 'Growing Group', description: 'Have a session fill up to max capacity', icon: '👥', category: 'Sessions', xpReward: 20, requirement: 1 },
  { key: 'session_members_2', tier: 2, name: 'Pack Leader', description: 'Have 5 sessions fill to max capacity', icon: '👥', category: 'Sessions', xpReward: 40, requirement: 5 },
  { key: 'session_members_3', tier: 3, name: 'House Full', description: 'Have 20 sessions fill to max capacity', icon: '👥', category: 'Sessions', xpReward: 90, requirement: 20 },

  // ─── QR CHECK-IN HOST ───
  { key: 'qr_host_1', tier: 1, name: 'QR Ready', description: 'Show a QR code for the first time as host', icon: '📱', category: 'Sessions', xpReward: 10, requirement: 1 },
  { key: 'qr_host_2', tier: 2, name: 'Check-In Pro', description: 'Show QR codes for 10 sessions', icon: '📱', category: 'Sessions', xpReward: 25, requirement: 10 },
  { key: 'qr_host_3', tier: 3, name: 'QR Legend', description: 'Show QR codes for 50 sessions', icon: '📱', category: 'Sessions', xpReward: 75, requirement: 50 },

  // ─── MESSAGES SENT ───
  { key: 'messages_sent_1', tier: 1, name: 'Icebreaker', description: 'Send your first direct message', icon: '💬', category: 'Messages', xpReward: 10, requirement: 1 },
  { key: 'messages_sent_2', tier: 2, name: 'Communicator', description: 'Send 100 direct messages', icon: '💬', category: 'Messages', xpReward: 25, requirement: 100 },
  { key: 'messages_sent_3', tier: 3, name: 'Chatterbox', description: 'Send 500 direct messages', icon: '💬', category: 'Messages', xpReward: 75, requirement: 500 },

  // ─── GROUP CHAT MESSAGES ───
  { key: 'group_messages_1', tier: 1, name: 'Group Voice', description: 'Send your first group chat message', icon: '👥', category: 'Messages', xpReward: 10, requirement: 1 },
  { key: 'group_messages_2', tier: 2, name: 'Group Vibe', description: 'Send 100 group chat messages', icon: '👥', category: 'Messages', xpReward: 25, requirement: 100 },
  { key: 'group_messages_3', tier: 3, name: 'Group Legend', description: 'Send 500 group chat messages', icon: '👥', category: 'Messages', xpReward: 75, requirement: 500 },

  // ─── CONNECTIONS ───
  { key: 'connections_1', tier: 1, name: 'Linked Up', description: 'Make your first connection', icon: '🔗', category: 'Connections', xpReward: 10, requirement: 1 },
  { key: 'connections_2', tier: 2, name: 'Networked', description: 'Make 10 connections', icon: '🔗', category: 'Connections', xpReward: 25, requirement: 10 },
  { key: 'connections_3', tier: 3, name: 'The Connector', description: 'Make 50 connections', icon: '🔗', category: 'Connections', xpReward: 75, requirement: 50 },

  // ─── CONNECTION REQUESTS SENT ───
  { key: 'connection_requests_1', tier: 1, name: 'Reach Out', description: 'Send your first connection request', icon: '📨', category: 'Connections', xpReward: 5, requirement: 1 },
  { key: 'connection_requests_2', tier: 2, name: 'Social Butterfly', description: 'Send 20 connection requests', icon: '📨', category: 'Connections', xpReward: 20, requirement: 20 },
  { key: 'connection_requests_3', tier: 3, name: 'Network Builder', description: 'Send 100 connection requests', icon: '📨', category: 'Connections', xpReward: 60, requirement: 100 },

  // ─── BRAIN GAMES PLAYED ───
  { key: 'games_played_1', tier: 1, name: 'Game On', description: 'Play your first Brain Game', icon: '🎮', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_played_2', tier: 2, name: 'Game Head', description: 'Play 10 Brain Games', icon: '🎮', category: 'Brain Games', xpReward: 30, requirement: 10 },
  { key: 'games_played_3', tier: 3, name: 'Game Addict', description: 'Play 50 Brain Games', icon: '🎮', category: 'Brain Games', xpReward: 100, requirement: 50 },

  // ─── BRAIN GAMES WON ───
  { key: 'games_won_1', tier: 1, name: 'First Blood', description: 'Win your first Brain Game', icon: '🏆', category: 'Brain Games', xpReward: 20, requirement: 1 },
  { key: 'games_won_2', tier: 2, name: 'Clutch', description: 'Win 10 Brain Games', icon: '🏆', category: 'Brain Games', xpReward: 50, requirement: 10 },
  { key: 'games_won_3', tier: 3, name: 'Undefeated', description: 'Win 25 Brain Games', icon: '🏆', category: 'Brain Games', xpReward: 150, requirement: 25 },

  // ─── XP EARNED ───
  { key: 'xp_earned_1', tier: 1, name: 'XP Grind', description: 'Earn 100 total XP', icon: '⚡', category: 'Brain Games', xpReward: 10, requirement: 100 },
  { key: 'xp_earned_2', tier: 2, name: 'XP Hunter', description: 'Earn 500 total XP', icon: '⚡', category: 'Brain Games', xpReward: 30, requirement: 500 },
  { key: 'xp_earned_3', tier: 3, name: 'XP God', description: 'Earn 2000 total XP', icon: '⚡', category: 'Brain Games', xpReward: 100, requirement: 2000 },

  // ─── WIN STREAK ───
  { key: 'win_streak_1', tier: 1, name: 'Hot Streak', description: 'Win 2 Brain Games in a row', icon: '🔥', category: 'Brain Games', xpReward: 20, requirement: 2 },
  { key: 'win_streak_2', tier: 2, name: 'On Fire', description: 'Win 5 Brain Games in a row', icon: '🔥', category: 'Brain Games', xpReward: 50, requirement: 5 },
  { key: 'win_streak_3', tier: 3, name: 'Untouchable', description: 'Win 10 Brain Games in a row', icon: '🔥', category: 'Brain Games', xpReward: 150, requirement: 10 },

  // ─── DAILY CHALLENGE ───
  { key: 'daily_challenge_1', tier: 1, name: 'Daily Grinder', description: 'Complete your first Daily Flash Challenge', icon: '🔥', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'daily_challenge_2', tier: 2, name: 'Habit Formed', description: 'Complete 10 Daily Flash Challenges', icon: '🔥', category: 'Brain Games', xpReward: 30, requirement: 10 },
  { key: 'daily_challenge_3', tier: 3, name: 'Daily Legend', description: 'Complete 30 Daily Flash Challenges', icon: '🔥', category: 'Brain Games', xpReward: 100, requirement: 30 },

  // ─── DAILY CHALLENGE PERFECT ───
  { key: 'daily_challenge_perfect_1', tier: 1, name: 'Sharp', description: 'Answer a Daily Flash Challenge correctly', icon: '💡', category: 'Brain Games', xpReward: 15, requirement: 1 },
  { key: 'daily_challenge_perfect_2', tier: 2, name: 'Razor Sharp', description: 'Answer 10 Daily Flash Challenges correctly', icon: '💡', category: 'Brain Games', xpReward: 40, requirement: 10 },
  { key: 'daily_challenge_perfect_3', tier: 3, name: 'Einstein', description: 'Answer 25 Daily Flash Challenges correctly', icon: '💡', category: 'Brain Games', xpReward: 100, requirement: 25 },

  // ─── DAILY TRIVIA ───
  { key: 'daily_trivia_1', tier: 1, name: 'Trivia Time', description: 'Complete your first Daily Trivia', icon: '🧠', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'daily_trivia_2', tier: 2, name: 'Trivia Buff', description: 'Complete 10 Daily Trivia sessions', icon: '🧠', category: 'Brain Games', xpReward: 30, requirement: 10 },
  { key: 'daily_trivia_3', tier: 3, name: 'Trivia God', description: 'Complete 30 Daily Trivia sessions', icon: '🧠', category: 'Brain Games', xpReward: 100, requirement: 30 },

  // ─── DAILY TRIVIA PERFECT ───
  { key: 'trivia_perfect_1', tier: 1, name: 'Clean Sweep', description: 'Get a perfect score on Daily Trivia', icon: '🎯', category: 'Brain Games', xpReward: 25, requirement: 1 },
  { key: 'trivia_perfect_2', tier: 2, name: 'Flawless', description: 'Get 5 perfect scores on Daily Trivia', icon: '🎯', category: 'Brain Games', xpReward: 60, requirement: 5 },
  { key: 'trivia_perfect_3', tier: 3, name: 'Infallible', description: 'Get 15 perfect scores on Daily Trivia', icon: '🎯', category: 'Brain Games', xpReward: 150, requirement: 15 },

  // ─── SPEED DEMON ───
  { key: 'speed_1', tier: 1, name: 'Quick Draw', description: 'Answer a Brain Game question in under 3 seconds', icon: '⚡', category: 'Brain Games', xpReward: 15, requirement: 1 },
  { key: 'speed_2', tier: 2, name: 'Speed Demon', description: 'Answer 10 questions in under 3 seconds', icon: '⚡', category: 'Brain Games', xpReward: 35, requirement: 10 },
  { key: 'speed_3', tier: 3, name: 'Lightning', description: 'Answer 50 questions in under 3 seconds', icon: '⚡', category: 'Brain Games', xpReward: 100, requirement: 50 },

  // ─── KUDOS RECEIVED ───
  { key: 'kudos_received_1', tier: 1, name: 'Appreciated', description: 'Receive your first Kudos', icon: '⭐', category: 'Kudos', xpReward: 10, requirement: 1 },
  { key: 'kudos_received_2', tier: 2, name: 'Fan Favorite', description: 'Receive 10 Kudos', icon: '⭐', category: 'Kudos', xpReward: 30, requirement: 10 },
  { key: 'kudos_received_3', tier: 3, name: 'Campus Icon', description: 'Receive 50 Kudos', icon: '⭐', category: 'Kudos', xpReward: 100, requirement: 50 },

  // ─── KUDOS GIVEN ───
  { key: 'kudos_given_1', tier: 1, name: 'Shoutout', description: 'Give your first Kudos', icon: '🌟', category: 'Kudos', xpReward: 10, requirement: 1 },
  { key: 'kudos_given_2', tier: 2, name: 'Hype Man', description: 'Give 10 Kudos', icon: '🌟', category: 'Kudos', xpReward: 25, requirement: 10 },
  { key: 'kudos_given_3', tier: 3, name: 'Aggie Spirit', description: 'Give 50 Kudos', icon: '🌟', category: 'Kudos', xpReward: 75, requirement: 50 },

  // ─── KUDOS TAGS ───
  { key: 'kudos_tags_1', tier: 1, name: 'Known For', description: 'Receive 3 different Kudos tag types', icon: '🏅', category: 'Kudos', xpReward: 15, requirement: 3 },
  { key: 'kudos_tags_2', tier: 2, name: 'Well Rounded', description: 'Receive 6 different Kudos tag types', icon: '🏅', category: 'Kudos', xpReward: 35, requirement: 6 },
  { key: 'kudos_tags_3', tier: 3, name: 'All That', description: 'Receive all Kudos tag types', icon: '🏅', category: 'Kudos', xpReward: 100, requirement: 10 },

  // ─── PROFILE COMPLETION ───
  { key: 'profile_bio_1', tier: 1, name: 'Introduced', description: 'Add a bio to your profile', icon: '✍️', category: 'Profile', xpReward: 10, requirement: 1 },
  { key: 'profile_avatar_1', tier: 1, name: 'Face Reveal', description: 'Upload a profile picture', icon: '📸', category: 'Profile', xpReward: 10, requirement: 1 },
  { key: 'profile_banner_1', tier: 1, name: 'Banner Up', description: 'Upload your first banner', icon: '🖼️', category: 'Profile', xpReward: 10, requirement: 1 },
  { key: 'profile_banner_2', tier: 2, name: 'Gallery', description: 'Upload 2 banners', icon: '🖼️', category: 'Profile', xpReward: 20, requirement: 2 },
  { key: 'profile_banner_3', tier: 3, name: 'Showcase', description: 'Upload 3 banners', icon: '🖼️', category: 'Profile', xpReward: 40, requirement: 3 },
  { key: 'profile_vibe_1', tier: 1, name: 'Vibe Set', description: 'Set your study vibe status', icon: '🔥', category: 'Profile', xpReward: 10, requirement: 1 },
  { key: 'profile_border_1', tier: 1, name: 'Glow Up', description: 'Customize your avatar border', icon: '🎨', category: 'Profile', xpReward: 10, requirement: 1 },
  { key: 'profile_complete_1', tier: 1, name: 'Half Way', description: 'Reach 50% profile completion', icon: '📊', category: 'Profile', xpReward: 15, requirement: 50 },
  { key: 'profile_complete_2', tier: 2, name: 'Almost There', description: 'Reach 75% profile completion', icon: '📊', category: 'Profile', xpReward: 25, requirement: 75 },
  { key: 'profile_complete_3', tier: 3, name: 'Fully Loaded', description: 'Reach 100% profile completion', icon: '📊', category: 'Profile', xpReward: 50, requirement: 100 },

  // ─── EARLY ADOPTER ───
  { key: 'early_adopter_1', tier: 1, name: 'OG', description: 'Join Aggie StudyBuddy', icon: '🐾', category: 'Special', xpReward: 25, requirement: 1 },
  { key: 'early_adopter_2', tier: 2, name: 'Day One', description: 'Be among the first 100 users', icon: '🐾', category: 'Special', xpReward: 50, requirement: 1 },
  { key: 'early_adopter_3', tier: 3, name: 'Founding Aggie', description: 'Be among the first 50 users', icon: '🐾', category: 'Special', xpReward: 100, requirement: 1 },

  // ─── CAMPUS MAP ───
  { key: 'campus_map_1', tier: 1, name: 'Explorer', description: 'Visit the Campus Map', icon: '🗺️', category: 'Special', xpReward: 5, requirement: 1 },
  { key: 'campus_map_2', tier: 2, name: 'Navigator', description: 'Use Campus Map directions 5 times', icon: '🗺️', category: 'Special', xpReward: 15, requirement: 5 },
  { key: 'campus_map_3', tier: 3, name: 'Cartographer', description: 'Use Campus Map directions 20 times', icon: '🗺️', category: 'Special', xpReward: 40, requirement: 20 },

  // ─── NIGHT OWL ───
  { key: 'night_owl_1', tier: 1, name: 'Night Owl', description: 'Host a session that starts after 9 PM', icon: '🦉', category: 'Special', xpReward: 10, requirement: 1 },
  { key: 'night_owl_2', tier: 2, name: 'Midnight Grinder', description: 'Host 5 sessions after 9 PM', icon: '🦉', category: 'Special', xpReward: 25, requirement: 5 },
  { key: 'night_owl_3', tier: 3, name: 'No Sleep', description: 'Host 20 sessions after 9 PM', icon: '🦉', category: 'Special', xpReward: 75, requirement: 20 },

  // ─── EARLY BIRD ───
  { key: 'early_bird_1', tier: 1, name: 'Early Bird', description: 'Host a session before 8 AM', icon: '🌅', category: 'Special', xpReward: 10, requirement: 1 },
  { key: 'early_bird_2', tier: 2, name: 'Rise & Grind', description: 'Host 5 sessions before 8 AM', icon: '🌅', category: 'Special', xpReward: 25, requirement: 5 },
  { key: 'early_bird_3', tier: 3, name: 'Dawn Warrior', description: 'Host 20 sessions before 8 AM', icon: '🌅', category: 'Special', xpReward: 75, requirement: 20 },

  // ─── WEEKEND WARRIOR ───
  { key: 'weekend_1', tier: 1, name: 'Weekend Mode', description: 'Host a session on a weekend', icon: '🎉', category: 'Special', xpReward: 10, requirement: 1 },
  { key: 'weekend_2', tier: 2, name: 'Weekend Warrior', description: 'Host 5 sessions on weekends', icon: '🎉', category: 'Special', xpReward: 25, requirement: 5 },
  { key: 'weekend_3', tier: 3, name: 'No Days Off', description: 'Host 20 sessions on weekends', icon: '🎉', category: 'Special', xpReward: 75, requirement: 20 },

  // ─── LIBRARY RAT ───
  { key: 'library_1', tier: 1, name: 'Library Card', description: 'Host a session at Bluford Library', icon: '📖', category: 'Special', xpReward: 10, requirement: 1 },
  { key: 'library_2', tier: 2, name: 'Library Rat', description: 'Host 5 sessions at Bluford Library', icon: '📖', category: 'Special', xpReward: 25, requirement: 5 },
  { key: 'library_3', tier: 3, name: 'Librarian', description: 'Host 20 sessions at Bluford Library', icon: '📖', category: 'Special', xpReward: 75, requirement: 20 },

  // ─── FULL HOUSE ───
  { key: 'full_session_1', tier: 1, name: 'Packed', description: 'Host a session with max participants', icon: '🏠', category: 'Sessions', xpReward: 15, requirement: 1 },
  { key: 'full_session_2', tier: 2, name: 'Always Full', description: 'Host 5 full sessions', icon: '🏠', category: 'Sessions', xpReward: 35, requirement: 5 },
  { key: 'full_session_3', tier: 3, name: 'Sold Out', description: 'Host 20 full sessions', icon: '🏠', category: 'Sessions', xpReward: 90, requirement: 20 },

  // ─── NOTIFICATION ───
  { key: 'notifications_1', tier: 1, name: 'Plugged In', description: 'Enable Brain Game notifications', icon: '🔔', category: 'Profile', xpReward: 5, requirement: 1 },

  // ─── VERIFIED ───
  { key: 'verified_1', tier: 1, name: 'Verified', description: 'Verify your email address', icon: '✅', category: 'Profile', xpReward: 15, requirement: 1 },

  // ─── KUDOS STREAK ───
  { key: 'kudos_streak_1', tier: 1, name: 'Good Energy', description: 'Give Kudos 3 days in a row', icon: '💫', category: 'Kudos', xpReward: 15, requirement: 3 },
  { key: 'kudos_streak_2', tier: 2, name: 'Positive Vibes', description: 'Give Kudos 7 days in a row', icon: '💫', category: 'Kudos', xpReward: 35, requirement: 7 },
  { key: 'kudos_streak_3', tier: 3, name: 'Sunshine', description: 'Give Kudos 30 days in a row', icon: '💫', category: 'Kudos', xpReward: 100, requirement: 30 },

  // ─── MESSAGES RECEIVED ───
  { key: 'messages_received_1', tier: 1, name: 'Popular', description: 'Receive 10 direct messages', icon: '📩', category: 'Messages', xpReward: 10, requirement: 10 },
  { key: 'messages_received_2', tier: 2, name: 'Inbox Hero', description: 'Receive 100 direct messages', icon: '📩', category: 'Messages', xpReward: 25, requirement: 100 },
  { key: 'messages_received_3', tier: 3, name: 'Fan Mail', description: 'Receive 500 direct messages', icon: '📩', category: 'Messages', xpReward: 75, requirement: 500 },

  // ─── SESSION TAGS ───
  { key: 'session_tags_1', tier: 1, name: 'Tagger', description: 'Add tags to a study session', icon: '🏷️', category: 'Sessions', xpReward: 5, requirement: 1 },
  { key: 'session_tags_2', tier: 2, name: 'Organizer', description: 'Add tags to 10 study sessions', icon: '🏷️', category: 'Sessions', xpReward: 15, requirement: 10 },
  { key: 'session_tags_3', tier: 3, name: 'Catalogued', description: 'Add tags to 30 study sessions', icon: '🏷️', category: 'Sessions', xpReward: 50, requirement: 30 },

  // ─── LONG SESSIONS ───
  { key: 'long_session_1', tier: 1, name: 'Deep Dive', description: 'Host a session lasting 2+ hours', icon: '⏰', category: 'Sessions', xpReward: 15, requirement: 1 },
  { key: 'long_session_2', tier: 2, name: 'Marathon', description: 'Host 5 sessions lasting 2+ hours', icon: '⏰', category: 'Sessions', xpReward: 35, requirement: 5 },
  { key: 'long_session_3', tier: 3, name: 'Endurance', description: 'Host 20 sessions lasting 2+ hours', icon: '⏰', category: 'Sessions', xpReward: 90, requirement: 20 },

  // ─── CONNECTIONS ACCEPTED ───
  { key: 'connections_accepted_1', tier: 1, name: 'Welcome', description: 'Accept your first connection request', icon: '🤜', category: 'Connections', xpReward: 10, requirement: 1 },
  { key: 'connections_accepted_2', tier: 2, name: 'Open Arms', description: 'Accept 10 connection requests', icon: '🤜', category: 'Connections', xpReward: 25, requirement: 10 },
  { key: 'connections_accepted_3', tier: 3, name: 'Community', description: 'Accept 50 connection requests', icon: '🤜', category: 'Connections', xpReward: 75, requirement: 50 },

  // ─── BRAIN GAMES CATEGORY ───
  { key: 'games_hbcu_1', tier: 1, name: 'Historically', description: 'Play a Brain Game in the HBCU History category', icon: '✊', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_hbcu_2', tier: 2, name: 'Roots', description: 'Play 5 HBCU History Brain Games', icon: '✊', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_hbcu_3', tier: 3, name: 'Historian', description: 'Play 20 HBCU History Brain Games', icon: '✊', category: 'Brain Games', xpReward: 75, requirement: 20 },

  { key: 'games_cs_1', tier: 1, name: 'Bit Flip', description: 'Play a Computer Science Brain Game', icon: '💻', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_cs_2', tier: 2, name: 'Coder', description: 'Play 5 Computer Science Brain Games', icon: '💻', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_cs_3', tier: 3, name: 'Dev Mode', description: 'Play 20 Computer Science Brain Games', icon: '💻', category: 'Brain Games', xpReward: 75, requirement: 20 },

  { key: 'games_math_1', tier: 1, name: 'Calculated', description: 'Play a Math Brain Game', icon: '➕', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_math_2', tier: 2, name: 'Number Cruncher', description: 'Play 5 Math Brain Games', icon: '➕', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_math_3', tier: 3, name: 'Mathematician', description: 'Play 20 Math Brain Games', icon: '➕', category: 'Brain Games', xpReward: 75, requirement: 20 },

  { key: 'games_science_1', tier: 1, name: 'Molecule', description: 'Play a Science Brain Game', icon: '🔬', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_science_2', tier: 2, name: 'Lab Rat', description: 'Play 5 Science Brain Games', icon: '🔬', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_science_3', tier: 3, name: 'Scientist', description: 'Play 20 Science Brain Games', icon: '🔬', category: 'Brain Games', xpReward: 75, requirement: 20 },

  { key: 'games_engineering_1', tier: 1, name: 'Blueprint', description: 'Play an Engineering Brain Game', icon: '⚙️', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_engineering_2', tier: 2, name: 'Wrenched', description: 'Play 5 Engineering Brain Games', icon: '⚙️', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_engineering_3', tier: 3, name: 'Engineer', description: 'Play 20 Engineering Brain Games', icon: '⚙️', category: 'Brain Games', xpReward: 75, requirement: 20 },

  { key: 'games_business_1', tier: 1, name: 'Startup', description: 'Play a Business Brain Game', icon: '📈', category: 'Brain Games', xpReward: 10, requirement: 1 },
  { key: 'games_business_2', tier: 2, name: 'Executive', description: 'Play 5 Business Brain Games', icon: '📈', category: 'Brain Games', xpReward: 25, requirement: 5 },
  { key: 'games_business_3', tier: 3, name: 'CEO', description: 'Play 20 Business Brain Games', icon: '📈', category: 'Brain Games', xpReward: 75, requirement: 20 },

  // ─── SPECIAL MILESTONES ───
  { key: 'milestone_1', tier: 1, name: 'Rising Aggie', description: 'Earn your first achievement', icon: '🌱', category: 'Special', xpReward: 5, requirement: 1 },
  { key: 'milestone_2', tier: 2, name: 'Decorated', description: 'Earn 10 achievements', icon: '🎖️', category: 'Special', xpReward: 25, requirement: 10 },
  { key: 'milestone_3', tier: 3, name: 'Hall of Fame', description: 'Earn 25 achievements', icon: '🏛️', category: 'Special', xpReward: 100, requirement: 25 },

  { key: 'total_xp_milestone_1', tier: 1, name: 'Getting Started', description: 'Earn 50 total XP across all activities', icon: '🌟', category: 'Special', xpReward: 10, requirement: 50 },
  { key: 'total_xp_milestone_2', tier: 2, name: 'Power User', description: 'Earn 500 total XP across all activities', icon: '🌟', category: 'Special', xpReward: 30, requirement: 500 },
  { key: 'total_xp_milestone_3', tier: 3, name: 'Elite Aggie', description: 'Earn 2000 total XP across all activities', icon: '🌟', category: 'Special', xpReward: 100, requirement: 2000 },

  // ─── REJOIN APPROVED ───
  { key: 'rejoin_approved_1', tier: 1, name: 'Second Chance', description: 'Approve someone to rejoin your session', icon: '🔄', category: 'Sessions', xpReward: 10, requirement: 1 },
  { key: 'rejoin_approved_2', tier: 2, name: 'Forgiving', description: 'Approve 5 rejoin requests', icon: '🔄', category: 'Sessions', xpReward: 25, requirement: 5 },
  { key: 'rejoin_approved_3', tier: 3, name: 'Open Door', description: 'Approve 20 rejoin requests', icon: '🔄', category: 'Sessions', xpReward: 75, requirement: 20 },

  // ─── GROUP CHAT ACTIVE ───
  { key: 'group_active_1', tier: 1, name: 'In the Chat', description: 'Send a message in a group chat', icon: '💬', category: 'Messages', xpReward: 5, requirement: 1 },
  { key: 'group_active_2', tier: 2, name: 'Chat Regular', description: 'Send 50 group chat messages', icon: '💬', category: 'Messages', xpReward: 20, requirement: 50 },
  { key: 'group_active_3', tier: 3, name: 'Chat Legend', description: 'Send 200 group chat messages', icon: '💬', category: 'Messages', xpReward: 60, requirement: 200 },

  // ─── PERFECT ATTENDANCE ───
  { key: 'perfect_attendance_1', tier: 1, name: 'Punctual', description: 'Check in to a session right when it starts', icon: '⏱️', category: 'Sessions', xpReward: 10, requirement: 1 },
  { key: 'perfect_attendance_2', tier: 2, name: 'On Time', description: 'Check in on time to 5 sessions', icon: '⏱️', category: 'Sessions', xpReward: 25, requirement: 5 },
  { key: 'perfect_attendance_3', tier: 3, name: 'Never Late', description: 'Check in on time to 20 sessions', icon: '⏱️', category: 'Sessions', xpReward: 75, requirement: 20 },

  // ─── LEADERBOARD ───
  { key: 'leaderboard_1', tier: 1, name: 'Ranked', description: 'Appear on the Brain Games leaderboard', icon: '📊', category: 'Brain Games', xpReward: 15, requirement: 1 },
  { key: 'leaderboard_2', tier: 2, name: 'Top 10', description: 'Reach top 10 on the leaderboard', icon: '📊', category: 'Brain Games', xpReward: 50, requirement: 10 },
  { key: 'leaderboard_3', tier: 3, name: 'Number One', description: 'Reach #1 on the leaderboard', icon: '📊', category: 'Brain Games', xpReward: 200, requirement: 1 },

  // ─── CAMPUS LOCATIONS ───
  { key: 'locations_1', tier: 1, name: 'Campus Rookie', description: 'Host sessions at 2 different buildings', icon: '🏛️', category: 'Special', xpReward: 10, requirement: 2 },
  { key: 'locations_2', tier: 2, name: 'Campus Regular', description: 'Host sessions at 5 different buildings', icon: '🏛️', category: 'Special', xpReward: 30, requirement: 5 },
  { key: 'locations_3', tier: 3, name: 'Campus Legend', description: 'Host sessions at all buildings', icon: '🏛️', category: 'Special', xpReward: 100, requirement: 10 },
]

async function main() {
  console.log('Seeding achievements...')
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { key: a.key },
      create: a,
      update: a
    })
  }
  console.log(`✅ Seeded ${achievements.length} achievements!`)
  
}

main().catch(console.error).finally(() => prisma.$disconnect())
module.exports = { achievements }