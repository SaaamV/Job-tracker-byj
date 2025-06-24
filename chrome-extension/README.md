# 🚀 Job Tracker Chrome Extension

## 📋 Overview

The Job Tracker Chrome Extension automatically detects and saves job applications from popular job sites like LinkedIn, Indeed, Glassdoor, and more. It seamlessly integrates with your Job Tracker System to provide a comprehensive job search management solution.

## ✨ Features

### 🎯 **Smart Job Detection**
- **Auto-Detection**: Automatically identifies job postings on supported sites
- **Data Extraction**: Intelligently extracts job title, company, location, salary, and more
- **Site Support**: Works on LinkedIn, Indeed, Glassdoor, AngelList, ZipRecruiter, and others

### 💾 **Seamless Data Sync**
- **Cloud Sync**: Automatically syncs with your Job Tracker System
- **Offline Support**: Works offline and syncs when connection is restored
- **Local Backup**: All data is saved locally for reliability

### 🔄 **Smart Automation**
- **Application Detection**: Automatically prompts to save when you submit applications
- **Quick Save**: One-click save from job listing pages
- **Form Pre-fill**: Automatically fills job details in the tracking form

### 📊 **Real-time Stats**
- **Application Counter**: Track total applications and weekly progress
- **Recent Activity**: View your latest job applications
- **Connection Status**: Monitor sync status with the cloud

## 🛠 Installation Instructions

### **Method 1: Load as Unpacked Extension (Development)**

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle "Developer mode" in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to the `chrome-extension` folder
   - Click "Select Folder"

4. **Verify Installation**
   - The Job Tracker extension should appear in your extensions list
   - Look for the 📊 icon in your Chrome toolbar

### **Method 2: Package and Install (Production)**

1. **Package the Extension**
   - Go to `chrome://extensions/`
   - Click "Pack extension"
   - Select the `chrome-extension` folder
   - Click "Pack Extension"

2. **Install the .crx File**
   - Drag the generated `.crx` file to Chrome
   - Click "Add Extension" when prompted

## 🎮 How to Use

### **Basic Usage**

1. **Visit a Job Site**
   - Go to LinkedIn, Indeed, Glassdoor, etc.
   - The extension automatically activates

2. **Track a Job**
   - Click the floating "Track Job" button
   - Review auto-detected information
   - Add any additional details
   - Click "Save Application"

3. **Quick Access**
   - Click the extension icon in Chrome toolbar
   - View stats and recent applications
   - Access quick actions

### **Advanced Features**

#### **Auto Application Detection**
- When you submit a job application, the extension automatically prompts you to save it
- Review the detected information and save to your tracker

#### **Quick Save from Job Cards**
- On LinkedIn, hover over job cards to see quick save buttons
- One-click saving without opening the full job posting

#### **Bulk Actions**
- Save multiple jobs quickly during browsing sessions
- Batch sync to your main Job Tracker System

## 🔧 Configuration

### **Extension Settings**
Access settings by clicking the extension icon → Settings

- **Auto-Sync**: Enable/disable automatic cloud synchronization
- **Notifications**: Control application tracking notifications
- **Auto-Detect**: Automatically detect application submissions
- **Quick Save**: Enable quick save buttons on job listings

### **API Configuration**
The extension connects to your deployed Job Tracker System:
- **API URL**: `https://job-tracker-mario263.vercel.app/api`
- **Sync Interval**: Every 30 minutes
- **Offline Mode**: Automatic fallback when cloud is unavailable

## 🌐 Supported Job Sites

### **Fully Supported** (Advanced extraction + auto-detection)
- **LinkedIn** - Jobs, Easy Apply, job cards
- **Indeed** - Job postings, quick apply
- **Glassdoor** - Job listings, company pages
- **AngelList/Wellfound** - Startup jobs
- **ZipRecruiter** - Job search results

### **Partially Supported** (Basic extraction)
- **Jobvite** - Company career pages
- **Workday** - Enterprise job portals
- **Lever** - Startup hiring pages
- **Greenhouse** - Company career sites

### **Generic Support**
- Any website with job postings (manual extraction)
- Company career pages
- Custom job boards

## 🔒 Privacy & Security

### **Data Collection**
- **Job Data Only**: Only collects job-related information you choose to save
- **No Personal Data**: Does not access personal emails, messages, or profile data
- **Local Storage**: All data is stored locally in your browser first

### **Permissions Used**
- **activeTab**: To read job information from current page
- **storage**: To save your job applications locally
- **tabs**: To open your Job Tracker System
- **scripting**: To inject the tracking interface

### **Data Security**
- **HTTPS Only**: All API communications use secure HTTPS
- **Local Backup**: Data is always available locally
- **No Third Parties**: Data is only shared with your Job Tracker System

## 🐛 Troubleshooting

### **Extension Not Working**

1. **Check Extension Status**
   - Go to `chrome://extensions/`
   - Ensure Job Tracker is enabled
   - Check for error messages

2. **Refresh the Page**
   - Reload the job site page
   - The extension should re-initialize

3. **Re-inject Content Script**
   - Click the extension icon
   - Click "Track This Job" to manually activate

### **Data Not Syncing**

1. **Check Connection**
   - Click extension icon to see connection status
   - Ensure you have internet connectivity

2. **Manual Sync**
   - Click extension icon → "Open Job Tracker"
   - Data will sync when you visit the main application

3. **Local Backup**
   - Your data is always saved locally
   - It will sync automatically when connection is restored

### **Job Detection Issues**

1. **Supported Sites**
   - Ensure you're on a supported job site
   - Some sites may have changed their structure

2. **Manual Entry**
   - You can always manually enter job information
   - The extension works on any website

3. **Refresh and Retry**
   - Sometimes a page refresh helps with detection
   - Try visiting the job posting directly

## 🔄 Updates & Maintenance

### **Automatic Updates**
- The extension checks for updates automatically
- Updates are applied seamlessly in the background

### **Data Migration**
- Your data is automatically migrated during updates
- No manual intervention required

### **Backup Recommendations**
- Regularly visit your main Job Tracker System
- Export your data periodically for extra safety

## 📞 Support

### **Need Help?**
- **Documentation**: Visit the main Job Tracker System for full documentation
- **Issues**: Report problems through the main application
- **Feature Requests**: Submit suggestions via the main system

### **Version Information**
- **Current Version**: 1.0.0
- **Last Updated**: June 2025
- **Compatibility**: Chrome 88+, Edge 88+

## 🎉 Tips & Best Practices

### **Maximize Efficiency**
1. **Enable Auto-Detection**: Let the extension automatically detect applications
2. **Use Quick Save**: Save jobs while browsing with one click
3. **Review Data**: Always review auto-detected information for accuracy
4. **Regular Sync**: Visit your main Job Tracker System regularly

### **Workflow Optimization**
1. **Browse → Save → Track**: Browse jobs, save interesting ones, track applications
2. **Batch Processing**: Save multiple jobs during a browsing session
3. **Follow-up Management**: Use the main system for detailed follow-up tracking

---

**🎯 Happy Job Hunting!** The extension is designed to make your job search more organized and efficient. Combined with the main Job Tracker System, you have a complete solution for managing your career journey.
