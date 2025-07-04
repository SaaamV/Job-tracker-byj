// Site-specific job data extraction modules

const SiteDetectors = {
  detectJobSite() {
    const hostname = window.location.hostname.toLowerCase();
    
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('indeed')) return 'indeed';
    if (hostname.includes('glassdoor')) return 'glassdoor';
    if (hostname.includes('angel') || hostname.includes('wellfound')) return 'angellist';
    if (hostname.includes('ziprecruiter')) return 'ziprecruiter';
    if (hostname.includes('jobvite')) return 'jobvite';
    if (hostname.includes('workday')) return 'workday';
    if (hostname.includes('lever')) return 'lever';
    if (hostname.includes('greenhouse')) return 'greenhouse';
    
    return 'generic';
  },

  extractLinkedInData() {
    return {
      jobTitle: this.getTextContent([
        '.top-card-layout__title',
        '.jobs-unified-top-card__job-title h1',
        'h1.t-24.t-bold.inline',
        '.job-details-jobs-unified-top-card__job-title h1',
        '.jobs-unified-top-card__job-title a'
      ]),
      company: this.getTextContent([
        '.topcard__org-name-link',
        '.jobs-unified-top-card__company-name a',
        '.job-details-jobs-unified-top-card__company-name a',
        '.topcard__flavor--metadata a',
        '.jobs-unified-top-card__company-name'
      ]),
      location: this.getTextContent([
        '.topcard__flavor--bullet',
        '.jobs-unified-top-card__bullet',
        '.job-details-jobs-unified-top-card__primary-description-text',
        '.jobs-unified-top-card__primary-description'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'LinkedIn',
      jobType: this.extractJobType(),
      description: this.getTextContent([
        '.jobs-description__content',
        '.jobs-box__html-content',
        '.description__text'
      ])
    };
  },

  extractIndeedData() {
    return {
      jobTitle: this.getTextContent([
        '[data-testid="jobsearch-JobInfoHeader-title"]',
        '.jobsearch-JobInfoHeader-title',
        'h1.icl-u-xs-mb--xs.icl-u-xs-mt--none.jobsearch-JobInfoHeader-title',
        'h1[data-testid="jobsearch-JobInfoHeader-title"]'
      ]),
      company: this.getTextContent([
        '[data-testid="inlineHeader-companyName"]',
        '.icl-u-lg-mr--sm.icl-u-xs-mr--xs',
        'a[data-testid="inlineHeader-companyName"]',
        '[data-testid="inlineHeader-companyName"] span'
      ]),
      location: this.getTextContent([
        '[data-testid="job-location"]',
        '.icl-u-colorForeground--secondary.icl-u-xs-mt--xs',
        '[data-testid="job-location"] div'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Indeed',
      salaryRange: this.getTextContent([
        '.icl-u-xs-mr--xs.attribute_snippet',
        '[data-testid="job-salary"]'
      ]),
      description: this.getTextContent([
        '#jobDescriptionText',
        '.jobsearch-jobDescriptionText'
      ])
    };
  },

  extractGlassdoorData() {
    return {
      jobTitle: this.getTextContent([
        '[data-test="job-title"]',
        '.css-17x46n0.e1tk4kwz5',
        'h1[data-test="job-title"]'
      ]),
      company: this.getTextContent([
        '[data-test="employer-name"]',
        '.css-87uc0g.e1tk4kwz1',
        'span[data-test="employer-name"]'
      ]),
      location: this.getTextContent([
        '[data-test="job-location"]',
        '.css-56kyx5.e1tk4kwz0'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Glassdoor',
      salaryRange: this.getTextContent([
        '[data-test="detailSalary"]',
        '.css-1oxck3i.e2u4hf18'
      ]),
      description: this.getTextContent([
        '[data-test="jobDescriptionContent"]',
        '.desc'
      ])
    };
  },

  extractAngelListData() {
    return {
      jobTitle: this.getTextContent([
        '[data-test="JobTitle"]',
        '.styles_jobTitle__3vWnh',
        'h1[data-test="JobTitle"]'
      ]),
      company: this.getTextContent([
        '[data-test="StartupLink"]',
        '.styles_startupLink__3xOHh'
      ]),
      location: this.getTextContent([
        '[data-test="JobLocations"]',
        '.styles_locationLink__2omlv'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'AngelList',
      salaryRange: this.getTextContent([
        '[data-test="SalaryRange"]',
        '.styles_salaryRange__2zJpd'
      ]),
      description: this.getTextContent([
        '[data-test="JobDescription"]',
        '.styles_description__1y84D'
      ])
    };
  },

  extractZipRecruiterData() {
    return {
      jobTitle: this.getTextContent([
        'h1.job_title',
        '.job_header h1'
      ]),
      company: this.getTextContent([
        '.company_name a',
        '.hiring_company_text a'
      ]),
      location: this.getTextContent([
        '.location',
        '.job_location'
      ]),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'ZipRecruiter',
      salaryRange: this.getTextContent([
        '.salary_range',
        '.compensation_text'
      ]),
      description: this.getTextContent([
        '.job_description',
        '.jobDescriptionSection'
      ])
    };
  },

  extractGenericData() {
    const titleSelectors = [
      'h1', '[class*="title"]', '[class*="job-title"]', 
      '[class*="position"]', '[id*="title"]'
    ];
    
    const companySelectors = [
      '[class*="company"]', '[class*="employer"]', 
      '[class*="organization"]', '[class*="firm"]'
    ];

    const locationSelectors = [
      '[class*="location"]', '[class*="address"]', 
      '[class*="city"]', '[class*="geo"]'
    ];

    return {
      jobTitle: this.getTextContent(titleSelectors),
      company: this.getTextContent(companySelectors),
      location: this.getTextContent(locationSelectors),
      jobUrl: window.location.href.split('?')[0],
      jobPortal: 'Other',
      description: this.getTextContent(['[class*="description"]', '[class*="details"]'])
    };
  },

  getTextContent(selectors) {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return '';
  },

  extractJobType() {
    const jobTypeKeywords = {
      'Full-time': ['full time', 'full-time', 'fulltime', 'permanent'],
      'Part-time': ['part time', 'part-time', 'parttime'],
      'Contract': ['contract', 'contractor', 'freelance', 'temporary', 'temp'],
      'Internship': ['intern', 'internship', 'trainee'],
      'Remote': ['remote', 'work from home', 'wfh', 'distributed'],
      'Hybrid': ['hybrid', 'flexible']
    };

    const pageText = document.body.textContent.toLowerCase();
    
    for (const [type, keywords] of Object.entries(jobTypeKeywords)) {
      if (keywords.some(keyword => pageText.includes(keyword))) {
        return type;
      }
    }
    
    return '';
  }
};

window.SiteDetectors = SiteDetectors;