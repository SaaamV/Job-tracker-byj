// Professional statistics calculator for export reports

function calculateProfessionalStats(applications, contacts) {
  const totalApplications = applications.length;
  const totalContacts = contacts.length;
  const totalResumes = window.jobTracker?.resumes?.length || window.resumes?.length || 0;
  
  // Calculate time-based statistics
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const lastWeek = applications.filter(app => 
    new Date(app.applicationDate || app.dateAdded) >= oneWeekAgo
  ).length;
  
  const thisMonth = applications.filter(app => 
    new Date(app.applicationDate || app.dateAdded) >= oneMonthAgo
  ).length;
  
  // Status-based calculations
  const interviewStatuses = ['Phone Screen', 'Technical Assessment', 'Interview Scheduled', 'Final Interview'];
  const responseStatuses = ['Under Review', 'Phone Screen', 'Technical Assessment', 'Interview Scheduled', 'Final Interview', 'Offer'];
  const offerStatuses = ['Offer'];
  const activeStatuses = ['Applied', 'Under Review', 'Phone Screen', 'Technical Assessment', 'Interview Scheduled', 'Final Interview'];
  
  const interviewCount = applications.filter(app => interviewStatuses.includes(app.status)).length;
  const responseCount = applications.filter(app => responseStatuses.includes(app.status)).length;
  const offerCount = applications.filter(app => offerStatuses.includes(app.status)).length;
  const activeApplications = applications.filter(app => activeStatuses.includes(app.status)).length;
  
  // Calculate rates
  const interviewRate = totalApplications > 0 ? Math.round((interviewCount / totalApplications) * 100) : 0;
  const responseRate = totalApplications > 0 ? Math.round((responseCount / totalApplications) * 100) : 0;
  const offerRate = totalApplications > 0 ? Math.round((offerCount / totalApplications) * 100) : 0;
  
  // Response time calculation
  const responseTimes = applications
    .filter(app => responseStatuses.includes(app.status) && app.applicationDate)
    .map(app => {
      const appDate = new Date(app.applicationDate);
      const daysSince = Math.floor((now - appDate) / (1000 * 60 * 60 * 24));
      return daysSince;
    });
  
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((sum, days) => sum + days, 0) / responseTimes.length)
    : 0;
  
  // Follow-up calculations
  const pendingFollowups = applications.filter(app => 
    app.followUpDate && new Date(app.followUpDate) <= now && activeStatuses.includes(app.status)
  ).length;
  
  // Contact statistics
  const highValueContacts = contacts.filter(contact => 
    ['Recruiter', 'Hiring Manager'].includes(contact.relationship)
  ).length;
  
  const recentContactActivity = contacts.filter(contact => 
    contact.lastContactDate && new Date(contact.lastContactDate) >= oneWeekAgo
  ).length;
  
  return {
    totalApplications,
    totalContacts,
    totalResumes,
    lastWeek,
    thisMonth,
    interviewRate,
    responseRate,
    offerRate,
    avgResponseTime,
    activeApplications,
    pendingFollowups,
    highValueContacts,
    recentContactActivity
  };
}

// Export for global use
window.calculateProfessionalStats = calculateProfessionalStats;