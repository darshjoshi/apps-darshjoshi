'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Copy, ExternalLink, Check, ArrowLeft } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

interface SearchQuery {
  id: string;
  title: string;
  description: string;
  query: string;
  category: 'recent' | 'platform' | 'location' | 'skill' | 'advanced' | 'alternative';
}

interface PopularSearch {
  label: string;
  title: string;
  aliases: string[];
}

const popularSearches: PopularSearch[] = [
  { label: 'Software Engineer', title: 'Software Engineer', aliases: ['SWE', 'Software Developer'] },
  { label: 'Data Engineer', title: 'Data Engineer', aliases: ['Data Infrastructure Engineer', 'Analytics Engineer'] },
  { label: 'AI Engineer', title: 'AI Engineer', aliases: ['Artificial Intelligence Engineer', 'ML Engineer', 'Machine Learning Engineer'] },
  { label: 'Data Analyst', title: 'Data Analyst', aliases: ['BI Analyst', 'Business Intelligence Analyst'] },
  { label: 'DevOps', title: 'DevOps Engineer', aliases: ['SRE', 'Site Reliability Engineer', 'Platform Engineer'] },
  { label: 'Data Scientist', title: 'Data Scientist', aliases: ['Applied Scientist', 'Research Scientist'] },
  { label: 'Product Manager', title: 'Product Manager', aliases: ['PM', 'Product Lead', 'Product Owner'] },
  { label: 'Cybersecurity', title: 'Cybersecurity Engineer', aliases: ['Security Engineer', 'InfoSec Engineer', 'Security Analyst'] },
  { label: 'UX Researcher', title: 'UX Researcher', aliases: ['User Researcher', 'Design Researcher'] },
];

function JobFinderTryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [titleAliases, setTitleAliases] = useState<string[]>([]);
  const [selectedPopularSearch, setSelectedPopularSearch] = useState<string | null>(null);
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['greenhouse', 'lever', 'workday']);
  const [companies, setCompanies] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [includeLinkedIn, setIncludeLinkedIn] = useState(false);
  const [showLinkedInDisclaimer, setShowLinkedInDisclaimer] = useState(false);

  // Results state
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from URL parameters on mount
  useEffect(() => {
    const title = searchParams.get('title');
    const skillsParam = searchParams.get('skills');
    const locationParam = searchParams.get('location');
    const platformsParam = searchParams.get('platforms');
    const companiesParam = searchParams.get('companies');
    const date = searchParams.get('date');
    const remote = searchParams.get('remote');

    if (title && !isLoaded) {
      setJobTitle(title);
      const aliasesParam = searchParams.get('aliases');
      setTitleAliases(aliasesParam ? aliasesParam.split(',') : []);
      setSkills(skillsParam || '');
      setLocation(locationParam || '');
      setPlatforms(platformsParam ? platformsParam.split(',') : ['greenhouse', 'lever', 'workday']);
      setCompanies(companiesParam || '');
      setDateRange(date || 'week');
      setRemoteOnly(remote === 'true');
      const linkedinParam = searchParams.get('linkedin');
      setIncludeLinkedIn(linkedinParam === 'true');

      setIsLoaded(true);

      // Trigger query generation after state is set
      setTimeout(() => {
        if (title) {
          const btn = document.querySelector<HTMLButtonElement>('[data-generate-btn]');
          if (btn) btn.click();
        }
      }, 100);
    } else if (!isLoaded) {
      setIsLoaded(true);
    }
  }, [searchParams, isLoaded]);

  const platformUrls: Record<string, string> = {
    greenhouse: 'site:greenhouse.io',
    lever: 'site:jobs.lever.co',
    workday: 'site:myworkdayjobs.com',
    taleo: 'site:taleo.net/careersection',
    jobvite: 'site:jobs.jobvite.com',
    icims: 'site:icims.com',
    smartrecruiters: 'site:jobs.smartrecruiters.com',
    ashby: 'site:jobs.ashbyhq.com',
    workable: 'site:apply.workable.com',
    rippling: 'site:ats.rippling.com',
  };

  const platformLabels: Record<string, string> = {
    greenhouse: 'Greenhouse',
    lever: 'Lever',
    workday: 'Workday',
    taleo: 'Taleo',
    jobvite: 'Jobvite',
    icims: 'iCIMS',
    smartrecruiters: 'SmartRecruiters',
    ashby: 'Ashby',
    workable: 'Workable',
    rippling: 'Rippling',
  };

  const dateRanges = [
    { value: 'today', label: 'Today (24h)' },
    { value: '3days', label: '3 Days' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'none', label: 'Any Time' },
  ];

  const tbsParams: Record<string, string> = {
    today: '&tbs=qdr:d',
    '3days': '&tbs=qdr:d3',
    week: '&tbs=qdr:w',
    month: '&tbs=qdr:m',
    none: '',
  };

  const getGoogleUrl = (query: string): string => {
    const base = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return base + (tbsParams[dateRange] || '');
  };

  const getDateFilter = (): string => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    switch (dateRange) {
      case 'today':
        return `after:${formatDate(today)}`;
      case '3days':
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);
        return `after:${formatDate(threeDaysAgo)}`;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return `after:${formatDate(weekAgo)}`;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setDate(today.getDate() - 30);
        return `after:${formatDate(monthAgo)}`;
      default:
        return '';
    }
  };

  const generateQueries = () => {
    if (!jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    // Build URL parameters
    const params = new URLSearchParams();
    params.set('title', jobTitle);
    if (skills) params.set('skills', skills);
    if (location) params.set('location', location);
    if (platforms.length > 0) params.set('platforms', platforms.join(','));
    if (companies) params.set('companies', companies);
    if (dateRange !== 'week') params.set('date', dateRange);
    if (remoteOnly) params.set('remote', 'true');
    if (includeLinkedIn) params.set('linkedin', 'true');
    if (titleAliases.length > 0) params.set('aliases', titleAliases.join(','));

    // Update URL without page reload
    router.push(`/job-finder/try?${params.toString()}`, { scroll: false });

    const generatedQueries: SearchQuery[] = [];
    const dateFilter = getDateFilter();

    // Build platform sites
    const platformSites = platforms.map(p => platformUrls[p]).join(' OR ');

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);

    // Build title filter with aliases for broader matching
    const titleFilter = titleAliases.length > 0
      ? `("${jobTitle}" OR ${titleAliases.map(a => `"${a}"`).join(' OR ')})`
      : `"${jobTitle}"`;

    // Helper functions for readable descriptions
    const getPlatformNames = () => {
      return platforms.map(p => platformLabels[p] || p).join(', ');
    };
    const getDateRangeLabel = () => dateRanges.find(r => r.value === dateRange)?.label || 'Any Time';

    // Location logic
    let locationFilter = '';
    if (remoteOnly) {
      locationFilter = '("remote" OR "work from home" OR "WFH")';
    } else if (location.trim()) {
      const locationVariations = location.split(',').map(l => `"${l.trim()}"`).join(' OR ');
      locationFilter = `(${locationVariations})`;
    }

    // Query 1: Recent Jobs - Multi-Platform
    if (platforms.length > 0) {
      const q1 = [
        `(${platformSites})`,
        titleFilter,
        locationFilter,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'recent-multi',
        title: 'Recent Jobs Across All Selected Platforms',
        description: `Searches ${getPlatformNames()} for "${jobTitle}" posted in the last ${getDateRangeLabel()}. Broadest coverage.`,
        query: q1,
        category: 'recent',
      });
    }

    // Query 2: Skills-Focused
    if (skillsArray.length > 0) {
      const skillsQuery = skillsArray.map(s => `"${s}"`).join(' OR ');
      const q2 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        titleFilter,
        `(${skillsQuery})`,
        locationFilter,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'skills-focused',
        title: 'Skills-Matched Jobs',
        description: `Prioritizes jobs mentioning your skills: ${skillsArray.join(', ')}. Higher relevance.`,
        query: q2,
        category: 'skill',
      });
    }

    // Query 3: Individual Platform Queries (top 2 platforms)
    if (platforms.length >= 2) {
      platforms.slice(0, 2).forEach((platform) => {
        const q = [
          platformUrls[platform],
          titleFilter,
          locationFilter,
          dateFilter,
        ].filter(Boolean).join(' ');

        generatedQueries.push({
          id: `platform-${platform}`,
          title: `${platformLabels[platform] || platform}-Only Search`,
          description: `Searches only ${platformLabels[platform] || platform} for focused results from this ATS.`,
          query: q,
          category: 'platform',
        });
      });
    }

    // Query 4: Company-Specific (if companies provided)
    if (companies.trim()) {
      const companyArray = companies.split(',').map(c => c.trim());
      const companyQuery = companyArray.map(c => `"${c}"`).join(' OR ');
      const q5 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        titleFilter,
        `(${companyQuery})`,
        locationFilter,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'company-specific',
        title: 'Target Companies Only',
        description: `Searches only for positions at: ${companyArray.join(', ')}. Narrow focus.`,
        query: q5,
        category: 'advanced',
      });
    }

    // Query 6: Ultra-Fresh (today only)
    if (dateRange !== 'today') {
      const todayDate = new Date().toISOString().split('T')[0];
      const q6 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        titleFilter,
        locationFilter,
        `after:${todayDate}`,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'ultra-fresh',
        title: 'Posted Today Only',
        description: 'Shows only jobs posted in the last 24 hours. Absolute freshest listings.',
        query: q6,
        category: 'recent',
      });
    }

    // Query 7: Broad Search (no ATS filter)
    const q7 = [
      titleFilter,
      skillsArray.length > 0 ? `(${skillsArray.map(s => `"${s}"`).join(' OR ')})` : '',
      locationFilter,
      dateFilter,
    ].filter(Boolean).join(' ');

    generatedQueries.push({
      id: 'broad-search',
      title: 'Broad Search (All Sources)',
      description: 'Searches across all websites, not just ATS platforms. Maximum coverage.',
      query: q7,
      category: 'advanced',
    });

    // Query 8: Remote-First (if not already remote-only)
    if (!remoteOnly && location.trim()) {
      const q8 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        titleFilter,
        '("remote" OR "work from home")',
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'remote-first',
        title: 'Remote Opportunities',
        description: 'Focuses on remote/WFH positions. Good alternative if local options are limited.',
        query: q8,
        category: 'location',
      });
    }

    // Query: Startup Job Boards
    const startupQ = [
      '(site:workatastartup.com OR site:wellfound.com/jobs OR site:builtin.com/job/)',
      titleFilter,
      locationFilter,
      dateFilter,
    ].filter(Boolean).join(' ');

    generatedQueries.push({
      id: 'startup-boards',
      title: 'Startup Job Boards',
      description: 'Searches Y Combinator\'s Work at a Startup, Wellfound (AngelList), and BuiltIn. Great for startup and scale-up roles.',
      query: startupQ,
      category: 'alternative',
    });

    // LinkedIn Queries (only when opted in)
    if (includeLinkedIn) {
      // Query: LinkedIn Jobs (X-Ray)
      const linkedinQ = [
        'site:linkedin.com/jobs/view',
        titleFilter,
        locationFilter,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'linkedin-xray',
        title: 'LinkedIn Jobs (X-Ray)',
        description: 'Searches LinkedIn job postings via Google, bypassing the LinkedIn login wall. See public job listings without an account.',
        query: linkedinQ,
        category: 'alternative',
      });

      // Query: LinkedIn Posts (Hiring Announcements)
      const linkedinPostsQ = [
        'site:linkedin.com/posts/',
        `("hiring" OR "we're hiring" OR "join our team" OR "open role")`,
        titleFilter,
        locationFilter,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'linkedin-posts',
        title: 'LinkedIn Posts (Hiring Announcements)',
        description: 'Finds hiring managers and recruiters posting about openings on their LinkedIn feed. These informal announcements often appear before formal listings.',
        query: linkedinPostsQ,
        category: 'alternative',
      });
    }

    posthog?.capture('queries_generated', {
      job_title: jobTitle,
      title_aliases: titleAliases,
      has_aliases: titleAliases.length > 0,
      used_popular_search: selectedPopularSearch,
      platforms: platforms,
      date_range: dateRange,
      has_skills: skills.trim().length > 0,
      has_location: location.trim().length > 0,
      remote_only: remoteOnly,
      include_linkedin: includeLinkedIn,
      has_companies: companies.trim().length > 0,
      query_count: generatedQueries.length,
    });

    setQueries(generatedQueries);
  };

  const handleCopy = async (query: string, id: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(id);
      posthog?.capture('query_copied', {
        query_id: id,
        query_category: queries.find(q => q.id === id)?.category,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackToForm = () => {
    posthog?.capture('search_edited');
    // Clear queries to show form, keep form state intact
    setQueries([]);
    // Keep URL params but just hide results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    posthog?.capture('search_reset');
    // Full reset - clear everything and go back to /try
    setJobTitle('');
    setTitleAliases([]);
    setSelectedPopularSearch(null);
    setSkills('');
    setLocation('');
    setPlatforms(['greenhouse', 'lever', 'workday']);
    setCompanies('');
    setDateRange('week');
    setRemoteOnly(false);
    setIncludeLinkedIn(false);
    setQueries([]);
    router.push('/job-finder/try');
  };

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  return (
    <AppLayout appName="JOB SEARCH X-RAY" backUrl="/job-finder">
      {/* Form */}
      {queries.length === 0 && (
        <section className="mb-12">
          <div className="border-2 border-black p-6 bg-white">
            <h2 className="text-2xl font-bold font-mono mb-6">Build Your Job Search Queries</h2>

            <div className="space-y-6">
              {/* Popular Searches */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  POPULAR SEARCHES
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <button
                      key={search.label}
                      onClick={() => {
                        setJobTitle(search.title);
                        setTitleAliases(search.aliases);
                        setSelectedPopularSearch(search.label);
                        posthog?.capture('popular_search_selected', {
                          title: search.title,
                          aliases: search.aliases,
                        });
                      }}
                      className={`px-3 py-2 border-2 font-mono text-xs font-bold transition-colors ${
                        jobTitle === search.title && titleAliases.length > 0
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                    >
                      {search.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Quick-fill with keyword variations included (e.g., &quot;SWE&quot; for Software Engineer)</p>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  JOB TITLE / ROLE <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => {
                    setJobTitle(e.target.value);
                    setTitleAliases([]);
                    setSelectedPopularSearch(null);
                  }}
                  placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                {titleAliases.length > 0 ? (
                  <p className="text-xs text-gray-600 mt-1">
                    Also searching: {titleAliases.join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 mt-1">Use exact title variations you want to find, or pick a popular search above</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  REQUIRED SKILLS (comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g., Python, React, SQL, AWS"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-600 mt-1">Comma-separated list of skills to prioritize</p>
              </div>

              {/* Location & Remote */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-mono font-bold mb-2">
                    LOCATION (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., San Francisco, New York, Bay Area"
                    disabled={remoteOnly}
                    className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                  />
                  <p className="text-xs text-gray-600 mt-1">Leave blank to search all locations</p>
                </div>

                <div className="flex items-start pt-7">
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-black bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => {
                        setRemoteOnly(e.target.checked);
                        if (e.target.checked) setLocation('');
                      }}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-mono font-bold">REMOTE ONLY</span>
                  </label>
                </div>
              </div>

              {/* ATS Platforms */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  TARGET ATS PLATFORMS
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {Object.keys(platformUrls).map((platform) => (
                    <label
                      key={platform}
                      className={`flex items-center gap-2 px-4 py-3 border-2 cursor-pointer transition-colors ${
                        platforms.includes(platform)
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white hover:border-black'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-mono font-bold">{platformLabels[platform]}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Select ATS platforms to search. More platforms = more results. Selecting 5+ may produce longer queries.</p>
              </div>

              {/* LinkedIn (Experimental) */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  LINKEDIN SEARCH (EXPERIMENTAL)
                </label>
                <button
                  onClick={() => {
                    if (!includeLinkedIn) {
                      posthog?.capture('linkedin_disclaimer_shown');
                      setShowLinkedInDisclaimer(true);
                    } else {
                      posthog?.capture('linkedin_toggled', { enabled: false });
                      setIncludeLinkedIn(false);
                    }
                  }}
                  className={`px-4 py-3 border-2 font-mono text-sm font-bold transition-colors ${
                    includeLinkedIn
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white text-black hover:border-black'
                  }`}
                >
                  {includeLinkedIn ? 'LINKEDIN ENABLED' : 'ENABLE LINKEDIN QUERIES'}
                </button>
                <p className="text-xs text-gray-600 mt-1">
                  Adds LinkedIn job listings and hiring post searches. Requires LinkedIn login for best results.
                </p>
              </div>

              {/* Date Range - Custom UI */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  JOB POSTING RECENCY
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => setDateRange(range.value)}
                      className={`px-4 py-3 border-2 font-mono text-sm font-bold transition-colors ${
                        dateRange === range.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Google&apos;s native time filter is auto-applied when you click &quot;SEARCH GOOGLE&quot;. The <code className="bg-gray-100 px-1">after:</code> operator in the query text provides secondary reinforcement.</p>
              </div>

              {/* Companies (Optional) */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  TARGET COMPANIES (Optional)
                </label>
                <input
                  type="text"
                  value={companies}
                  onChange={(e) => setCompanies(e.target.value)}
                  placeholder="e.g., Stripe, Airbnb, Meta"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-600 mt-1">Comma-separated list of specific companies to target</p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateQueries}
                disabled={!jobTitle.trim()}
                data-generate-btn
                className="w-full px-6 py-4 border-2 border-black bg-black text-white font-mono font-bold text-lg
                         hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                GENERATE SEARCH QUERIES →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {queries.length > 0 && (
        <section className="mb-12">
          {/* Summary Header */}
          <div className="border-2 border-black p-6 bg-white mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold font-mono">Your Custom Search Queries</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Generated {queries.length} optimized queries based on your selections.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBackToForm}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white text-black font-mono font-bold text-sm
                           hover:bg-black hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  EDIT SEARCH
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-600 font-mono font-bold text-sm
                           hover:border-black hover:text-black transition-colors"
                >
                  RESET ALL
                </button>
              </div>
            </div>

            {/* Search Parameters Summary */}
            <div className="border-t-2 border-gray-200 pt-4 mt-4">
              <h3 className="text-xs font-mono font-bold text-gray-500 mb-2">SEARCH PARAMETERS:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                  <strong>Role:</strong> {jobTitle}
                </span>
                {skills && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>Skills:</strong> {skills}
                  </span>
                )}
                {remoteOnly ? (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>Location:</strong> Remote Only
                  </span>
                ) : location && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>Location:</strong> {location}
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                  <strong>Platforms:</strong> {platforms.map(p => platformLabels[p] || p).join(', ')}
                </span>
                <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                  <strong>Recency:</strong> {dateRanges.find(r => r.value === dateRange)?.label}
                </span>
                {includeLinkedIn && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>LinkedIn:</strong> Enabled
                  </span>
                )}
                {companies && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>Companies:</strong> {companies}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Query Cards */}
          <div className="space-y-4">
            {queries.map((q) => (
              <div key={q.id} className="border-2 border-black p-6 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-2 uppercase">
                      {q.category}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{q.title}</h3>
                    <p className="text-sm text-gray-600">{q.description}</p>
                  </div>
                </div>

                {/* Query Display */}
                <div className="bg-gray-50 border-2 border-gray-300 p-4 font-mono text-xs break-all mb-2 relative">
                  <code className="text-gray-800">{q.query}</code>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleCopy(q.query, q.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-white text-black font-mono font-bold text-sm
                             hover:bg-black hover:text-white transition-colors"
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        COPIED!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        COPY QUERY
                      </>
                    )}
                  </button>
                  <a
                    href={getGoogleUrl(q.query)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => posthog?.capture('query_searched_google', {
                      query_id: q.id,
                      query_category: q.category,
                    })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black bg-black text-white font-mono font-bold text-sm
                             hover:bg-white hover:text-black transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    SEARCH GOOGLE
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Tips Section */}
          <div className="border-2 border-black p-6 bg-white mt-6">
            <h3 className="text-lg font-bold mb-3">Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Start simple: just your job title + platforms + recency. Only add skills, location, or company filters if you&apos;re getting too many irrelevant results. Google X-Ray works best with fewer, broader terms.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Start with &quot;Recent Jobs&quot; queries for fresh postings with less competition</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Try platform-specific queries if you know your target companies use certain ATS systems</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Set up Google Alerts with these queries to get notified of new postings automatically</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Run queries daily or every few days to catch new listings early</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>Modify queries manually to experiment with different keyword combinations</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">→</span>
                <span>&quot;SEARCH GOOGLE&quot; links auto-apply Google&apos;s native time filter for more reliable date filtering than the <code className="bg-gray-100 px-1">after:</code> operator alone</span>
              </li>
            </ul>
          </div>
        </section>
      )}
      {/* LinkedIn Disclaimer Modal */}
      {showLinkedInDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="border-2 border-black bg-white p-6 max-w-md mx-4">
            <div className="inline-block px-2 py-0.5 bg-black text-white text-xs font-mono font-bold mb-3">
              EXPERIMENTAL
            </div>
            <h3 className="text-lg font-bold mb-2">LinkedIn Search Disclaimer</h3>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <p>LinkedIn search is <strong>experimental</strong>. A few things to know:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be <strong>logged into LinkedIn</strong> in your browser for best results</li>
                <li>Some results may still show a login prompt</li>
                <li>LinkedIn may limit the number of results you can view</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  posthog?.capture('linkedin_disclaimer_dismissed');
                  setShowLinkedInDisclaimer(false);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 bg-white text-black font-mono font-bold text-sm hover:border-black transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  posthog?.capture('linkedin_toggled', { enabled: true });
                  setIncludeLinkedIn(true);
                  setShowLinkedInDisclaimer(false);
                }}
                className="flex-1 px-4 py-3 border-2 border-black bg-black text-white font-mono font-bold text-sm hover:bg-white hover:text-black transition-colors"
              >
                I UNDERSTAND, ENABLE
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function JobFinderTry() {
  return (
    <Suspense fallback={
      <AppLayout appName="JOB SEARCH X-RAY" backUrl="/job-finder">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block px-4 py-2 border-2 border-black text-black text-sm font-mono font-bold mb-4">
              LOADING...
            </div>
            <p className="text-gray-600 font-mono text-sm">Initializing search tool</p>
          </div>
        </div>
      </AppLayout>
    }>
      <JobFinderTryContent />
    </Suspense>
  );
}
