function getGreetingByTime(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 4 && hour < 12) {
    return 'Good Morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  }

  if (hour >= 17 && hour < 22) {
    return 'Good Evening';
  }

  // 10 PM – 4 AM
  return 'Good Night';
}

module.exports = { getGreetingByTime };
