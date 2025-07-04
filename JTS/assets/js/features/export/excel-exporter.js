// Excel export functionality

const ExcelExporter = {
  async exportToExcel() {
    try {
      if (typeof XLSX === 'undefined') {
        showMessage('Excel export library not loaded. Please refresh the page.', 'error');
        return;
      }

      const wb = XLSX.utils.book_new();
      
      // Get data from global state
      const currentApplications = window.jobTracker?.applications || window.applications || [];
      const currentContacts = window.jobTracker?.contacts || window.contacts || [];
      const currentResumes = window.jobTracker?.resumes || window.resumes || [];
      
      console.log('Export data:', { 
        applications: currentApplications.length, 
        contacts: currentContacts.length,
        resumes: currentResumes.length 
      });
      
      if (currentApplications.length === 0 && currentContacts.length === 0) {
        showMessage('No data to export. Please add some applications or contacts first.', 'error');
        return;
      }
      
      // Enhanced data processing
      const enhancedApplications = DataEnhancer.enhanceApplicationData(currentApplications);
      const enhancedContacts = DataEnhancer.enhanceContactData(currentContacts);
      const enhancedResumes = DataEnhancer.enhanceResumeData(currentResumes);
      
      // Professional Analytics
      const stats = calculateProfessionalStats(currentApplications, currentContacts);
      const analyticsData = this.generateAnalyticsData(stats);
      
      // Create worksheets
      if (enhancedApplications.length > 0) {
        const wsApplications = XLSX.utils.json_to_sheet(enhancedApplications);
        this.formatWorksheet(wsApplications, 'Applications');
        XLSX.utils.book_append_sheet(wb, wsApplications, 'Job Applications');
      }
      
      if (enhancedContacts.length > 0) {
        const wsContacts = XLSX.utils.json_to_sheet(enhancedContacts);
        this.formatWorksheet(wsContacts, 'Contacts');
        XLSX.utils.book_append_sheet(wb, wsContacts, 'Professional Contacts');
      }
      
      if (enhancedResumes.length > 0) {
        const wsResumes = XLSX.utils.json_to_sheet(enhancedResumes);
        this.formatWorksheet(wsResumes, 'Resumes');
        XLSX.utils.book_append_sheet(wb, wsResumes, 'Resume Versions');
      }
      
      // Analytics worksheet
      const wsAnalytics = XLSX.utils.json_to_sheet(analyticsData);
      this.formatWorksheet(wsAnalytics, 'Analytics');
      XLSX.utils.book_append_sheet(wb, wsAnalytics, 'Performance Analytics');
      
      // Export file
      const fileName = `JobTracker_Professional_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      showMessage('✅ Professional Excel report exported successfully!', 'success');
      
    } catch (error) {
      console.error('Excel export failed:', error);
      showMessage('❌ Failed to export Excel file', 'error');
    }
  },

  generateAnalyticsData(stats) {
    return [
      { 'Report Section': 'OVERVIEW', 'Metric': 'Total Applications Submitted', 'Value': stats.totalApplications, 'Benchmark': 'Industry Average: 50-100' },
      { 'Report Section': 'OVERVIEW', 'Metric': 'Total Professional Contacts', 'Value': stats.totalContacts, 'Benchmark': 'Recommended: 20+' },
      { 'Report Section': 'OVERVIEW', 'Metric': 'Total Resume Versions', 'Value': stats.totalResumes, 'Benchmark': 'Recommended: 2-3' },
      { 'Report Section': 'OVERVIEW', 'Metric': 'Report Generation Date', 'Value': new Date().toLocaleDateString(), 'Benchmark': 'Current' },
      { 'Report Section': 'PERFORMANCE', 'Metric': 'Interview Rate (%)', 'Value': stats.interviewRate + '%', 'Benchmark': 'Industry Average: 10-20%' },
      { 'Report Section': 'PERFORMANCE', 'Metric': 'Response Rate (%)', 'Value': stats.responseRate + '%', 'Benchmark': 'Industry Average: 25-35%' },
      { 'Report Section': 'PERFORMANCE', 'Metric': 'Offer Rate (%)', 'Value': stats.offerRate + '%', 'Benchmark': 'Industry Average: 2-5%' },
      { 'Report Section': 'PERFORMANCE', 'Metric': 'Average Response Time (Days)', 'Value': stats.avgResponseTime, 'Benchmark': 'Industry Average: 14-21 days' },
      { 'Report Section': 'ACTIVITY', 'Metric': 'Applications This Month', 'Value': stats.thisMonth, 'Benchmark': 'Recommended: 10-15/month' },
      { 'Report Section': 'ACTIVITY', 'Metric': 'Applications Last 7 Days', 'Value': stats.lastWeek, 'Benchmark': 'Recommended: 2-4/week' },
      { 'Report Section': 'PIPELINE', 'Metric': 'Active Applications', 'Value': stats.activeApplications, 'Benchmark': 'Monitor Progress' },
      { 'Report Section': 'PIPELINE', 'Metric': 'Pending Follow-ups', 'Value': stats.pendingFollowups, 'Benchmark': 'Take Action Soon' },
      { 'Report Section': 'NETWORK', 'Metric': 'High-Value Contacts', 'Value': stats.highValueContacts, 'Benchmark': 'Leverage Network' },
      { 'Report Section': 'NETWORK', 'Metric': 'Recent Contact Activity', 'Value': stats.recentContactActivity, 'Benchmark': 'Stay Engaged' }
    ];
  },

  formatWorksheet(worksheet, type) {
    // Apply basic formatting (XLSX library limitations)
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Set column widths
    worksheet['!cols'] = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      worksheet['!cols'][col] = { width: 15 };
    }
    
    // Freeze first row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  }
};

// Global export function
function exportToExcel() {
  ExcelExporter.exportToExcel();
}

window.ExcelExporter = ExcelExporter;