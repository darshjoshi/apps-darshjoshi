'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Copy, ExternalLink, Check, ArrowLeft } from 'lucide-react';

interface SearchQuery {
  id: string;
  title: string;
  description: string;
  query: string;
  category: 'recent' | 'platform' | 'location' | 'skill' | 'advanced';
}

export default function JobFinderTry() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [platforms, setPlatforms] = useState<string[]>(['greenhouse', 'lever', 'workday']);
  const [companies, setCompanies] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [exclusions, setExclusions] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [customUrls, setCustomUrls] = useState('');

  // Results state
  const [queries, setQueries] = useState<SearchQuery[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from URL parameters on mount
  useEffect(() => {
    const title = searchParams.get('title');
    const skillsParam = searchParams.get('skills');
    const locationParam = searchParams.get('location');
    const level = searchParams.get('level');
    const platformsParam = searchParams.get('platforms');
    const companiesParam = searchParams.get('companies');
    const date = searchParams.get('date');
    const excludeParam = searchParams.get('exclude');
    const remote = searchParams.get('remote');

    if (title && !isLoaded) {
      setJobTitle(title);
      setSkills(skillsParam || '');
      setLocation(locationParam || '');
      setExperienceLevel(level || 'all');
      setPlatforms(platformsParam ? platformsParam.split(',') : ['greenhouse', 'lever', 'workday']);
      setCompanies(companiesParam || '');
      setDateRange(date || 'week');
      setExclusions(excludeParam || '');
      setRemoteOnly(remote === 'true');
      setCustomUrls(searchParams.get('customUrls') || '');

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
    greenhouse: 'site:greenhouse.io OR site:boards.greenhouse.io',
    lever: 'site:jobs.lever.co',
    workday: 'site:myworkdayjobs.com',
    taleo: 'site:taleo.net/careersection',
    jobvite: 'site:jobs.jobvite.com',
  };

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry / Junior' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior / Lead' },
    { value: 'staff', label: 'Staff / Principal' },
  ];

  const dateRanges = [
    { value: 'today', label: 'Today (24h)' },
    { value: '3days', label: '3 Days' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'none', label: 'Any Time' },
  ];

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
    if (experienceLevel !== 'all') params.set('level', experienceLevel);
    if (platforms.length > 0) params.set('platforms', platforms.join(','));
    if (companies) params.set('companies', companies);
    if (dateRange !== 'week') params.set('date', dateRange);
    if (exclusions) params.set('exclude', exclusions);
    if (remoteOnly) params.set('remote', 'true');
    if (customUrls) params.set('customUrls', customUrls);

    // Update URL without page reload
    router.push(`/job-finder/try?${params.toString()}`, { scroll: false });

    const generatedQueries: SearchQuery[] = [];
    const dateFilter = getDateFilter();

    // Build platform sites including custom URLs
    const platformSitesList = platforms.map(p => platformUrls[p]);
    if (customUrls.trim()) {
      // Parse custom URLs (comma-separated)
      const customSites = customUrls.split(',').map(url => {
        const trimmed = url.trim();
        // Add site: prefix if not present
        return trimmed.startsWith('site:') ? trimmed : `site:${trimmed}`;
      }).filter(Boolean);
      platformSitesList.push(...customSites);
    }
    const platformSites = platformSitesList.join(' OR ');

    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const exclusionArray = exclusions.split(',').map(s => s.trim()).filter(Boolean);

    // Helper functions for readable descriptions
    const getPlatformNames = () => {
      const names = platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1));
      if (customUrls.trim()) {
        names.push('Custom URLs');
      }
      return names.join(', ');
    };
    const getDateRangeLabel = () => dateRanges.find(r => r.value === dateRange)?.label || 'Any Time';

    // Build level-specific search terms and exclusions
    const baseExclusions = [...exclusionArray];
    let levelDescriptor = '';
    let levelInclusionTerms = '';

    if (experienceLevel === 'entry') {
      // ADD positive search terms for entry level
      levelInclusionTerms = '("Junior" OR "Entry Level" OR "Entry-Level" OR "New Grad" OR "Graduate" OR "Associate" OR "Early Career")';
      levelDescriptor = 'entry-level, junior, early career, and new grad';
      // Also exclude senior terms as backup
      baseExclusions.push('Senior', 'Lead', 'Staff', 'Principal', 'Director', 'VP');
    } else if (experienceLevel === 'mid') {
      // ADD positive search terms for mid level
      levelInclusionTerms = '("Mid Level" OR "Mid-Level" OR "Experienced" OR "Professional")';
      levelDescriptor = 'mid-level and experienced';
      baseExclusions.push('Junior', 'Entry', 'Senior', 'Director', 'VP', 'Principal');
    } else if (experienceLevel === 'senior') {
      // ADD positive search terms for senior level
      levelInclusionTerms = '("Senior" OR "Lead" OR "Staff")';
      levelDescriptor = 'senior, lead, and staff';
      baseExclusions.push('Junior', 'Entry', 'Director', 'VP', 'Principal', 'C-Level');
    } else if (experienceLevel === 'staff') {
      // ADD positive search terms for staff/executive level
      levelInclusionTerms = '("Staff" OR "Principal" OR "Director" OR "VP" OR "Executive" OR "C-Level")';
      levelDescriptor = 'staff, principal, and executive';
      baseExclusions.push('Junior', 'Entry', 'Associate');
    }

    const exclusionString = baseExclusions.length > 0 ? baseExclusions.map(e => `-"${e}"`).join(' ') : '';
    const getLevelDescription = () => {
      return levelDescriptor ? ` Targets ${levelDescriptor} positions.` : '';
    };

    // Location logic
    let locationFilter = '';
    if (remoteOnly) {
      locationFilter = '("remote" OR "work from home" OR "WFH")';
    } else if (location.trim()) {
      const locationVariations = location.split(',').map(l => `"${l.trim()}"`).join(' OR ');
      locationFilter = `(${locationVariations})`;
    }

    // Query 1: Recent Jobs - Multi-Platform
    if (platforms.length > 0 || customUrls.trim()) {
      const q1 = [
        `(${platformSites})`,
        `"${jobTitle}"`,
        levelInclusionTerms,
        locationFilter,
        exclusionString,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'recent-multi',
        title: 'Recent Jobs Across All Selected Platforms',
        description: `Searches ${getPlatformNames()} for "${jobTitle}" posted in the last ${getDateRangeLabel()}.${getLevelDescription()} Broadest coverage.`,
        query: q1,
        category: 'recent',
      });
    }

    // Query 2: Skills-Focused
    if (skillsArray.length > 0) {
      const skillsQuery = skillsArray.map(s => `"${s}"`).join(' OR ');
      const q2 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        `"${jobTitle}"`,
        levelInclusionTerms,
        `(${skillsQuery})`,
        locationFilter,
        exclusionString,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'skills-focused',
        title: 'Skills-Matched Jobs',
        description: `Prioritizes jobs mentioning your skills: ${skillsArray.join(', ')}.${getLevelDescription()} Higher relevance.`,
        query: q2,
        category: 'skill',
      });
    }

    // Query 3: Individual Platform Queries (top 2 platforms)
    if (platforms.length >= 2) {
      platforms.slice(0, 2).forEach((platform) => {
        const q = [
          platformUrls[platform],
          `"${jobTitle}"`,
          levelInclusionTerms,
          locationFilter,
          exclusionString,
          dateFilter,
        ].filter(Boolean).join(' ');

        generatedQueries.push({
          id: `platform-${platform}`,
          title: `${platform.charAt(0).toUpperCase() + platform.slice(1)}-Only Search`,
          description: `Searches only ${platform.charAt(0).toUpperCase() + platform.slice(1)} for focused results from this ATS.`,
          query: q,
          category: 'platform',
        });
      });
    }

    // Query 4: Location-Specific (if not remote-only)
    if (location.trim() && !remoteOnly) {
      const q4 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        `"${jobTitle}"`,
        levelInclusionTerms,
        locationFilter,
        exclusionString,
        dateFilter,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'location-focused',
        title: 'Location-Focused Search',
        description: `Emphasizes your target location(s): ${location}. Best for geo-specific searches.`,
        query: q4,
        category: 'location',
      });
    }

    // Query 5: Company-Specific (if companies provided)
    if (companies.trim()) {
      const companyArray = companies.split(',').map(c => c.trim());
      const companyQuery = companyArray.map(c => `"${c}"`).join(' OR ');
      const q5 = [
        platforms.length > 0 ? `(${platformSites})` : '',
        `"${jobTitle}"`,
        levelInclusionTerms,
        `(${companyQuery})`,
        locationFilter,
        exclusionString,
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
        `"${jobTitle}"`,
        levelInclusionTerms,
        locationFilter,
        exclusionString,
        `after:${todayDate}`,
      ].filter(Boolean).join(' ');

      generatedQueries.push({
        id: 'ultra-fresh',
        title: 'Posted Today Only',
        description: `Shows only jobs posted in the last 24 hours.${getLevelDescription()} Absolute freshest listings.`,
        query: q6,
        category: 'recent',
      });
    }

    // Query 7: Broad Search (no ATS filter)
    const q7 = [
      `"${jobTitle}"`,
      levelInclusionTerms,
      skillsArray.length > 0 ? `(${skillsArray.map(s => `"${s}"`).join(' OR ')})` : '',
      locationFilter,
      exclusionString,
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
        `"${jobTitle}"`,
        levelInclusionTerms,
        '("remote" OR "work from home")',
        exclusionString,
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

    setQueries(generatedQueries);
  };

  const handleCopy = async (query: string, id: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleBackToForm = () => {
    // Clear queries to show form, keep form state intact
    setQueries([]);
    // Keep URL params but just hide results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    // Full reset - clear everything and go back to /try
    setJobTitle('');
    setSkills('');
    setLocation('');
    setExperienceLevel('all');
    setPlatforms(['greenhouse', 'lever', 'workday']);
    setCompanies('');
    setDateRange('week');
    setExclusions('');
    setRemoteOnly(false);
    setCustomUrls('');
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
              {/* Job Title */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  JOB TITLE / ROLE <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-600 mt-1">Use exact title variations you want to find</p>
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

                <div className="flex items-end">
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

              {/* Experience Level - Custom UI */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  EXPERIENCE LEVEL
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setExperienceLevel(level.value)}
                      className={`px-4 py-3 border-2 font-mono text-sm font-bold transition-colors ${
                        experienceLevel === level.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-black hover:border-black'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Automatically excludes irrelevant seniority levels</p>
              </div>

              {/* ATS Platforms */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  TARGET ATS PLATFORMS
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['greenhouse', 'lever', 'workday', 'taleo', 'jobvite'].map((platform) => (
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
                      <span className="text-sm font-mono font-bold uppercase">{platform}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-1">Select ATS platforms to search. More platforms = more results.</p>
              </div>

              {/* Custom URLs */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  CUSTOM URLS (Optional)
                </label>
                <input
                  type="text"
                  value={customUrls}
                  onChange={(e) => setCustomUrls(e.target.value)}
                  placeholder="e.g., careers.company.com/jobs, jobs.example.com"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-600 mt-1">Add custom job board URLs (comma-separated). No need to include &quot;site:&quot; prefix.</p>
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
                <p className="text-xs text-gray-600 mt-1">Recent postings have less competition</p>
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

              {/* Exclusions */}
              <div>
                <label className="block text-sm font-mono font-bold mb-2">
                  EXCLUDE TERMS (Optional)
                </label>
                <input
                  type="text"
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="e.g., Contract, Intern, C++"
                  className="w-full px-4 py-3 border-2 border-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
                <p className="text-xs text-gray-600 mt-1">Terms to exclude from results (comma-separated)</p>
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
                <span className="px-2 py-1 bg-green-50 border border-green-600 text-xs font-mono text-green-800">
                  <strong>Level:</strong> {experienceLevels.find(l => l.value === experienceLevel)?.label}
                  {experienceLevel === 'entry' && ' (Entry, Junior, Early Career, New Grad)'}
                  {experienceLevel === 'mid' && ' (Mid-Level, Experienced)'}
                  {experienceLevel === 'senior' && ' (Senior, Lead, Staff)'}
                  {experienceLevel === 'staff' && ' (Staff, Principal, Executive)'}
                </span>
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
                  <strong>Platforms:</strong> {platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                </span>
                {customUrls && (
                  <span className="px-2 py-1 bg-blue-50 border border-blue-300 text-xs font-mono text-blue-700">
                    <strong>Custom URLs:</strong> {customUrls}
                  </span>
                )}
                <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                  <strong>Recency:</strong> {dateRanges.find(r => r.value === dateRange)?.label}
                </span>
                {companies && (
                  <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs font-mono">
                    <strong>Companies:</strong> {companies}
                  </span>
                )}
                {exclusions && (
                  <span className="px-2 py-1 bg-red-50 border border-red-300 text-xs font-mono text-red-700">
                    <strong>Also Excluding:</strong> {exclusions}
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

                {/* Explanation for level targeting */}
                {experienceLevel === 'entry' && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 mb-4">
                    ✓ Optimized for: Entry-level, Junior, Early Career, and New Grad positions
                  </p>
                )}
                {experienceLevel === 'mid' && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 mb-4">
                    ✓ Optimized for: Mid-level and Experienced professional positions
                  </p>
                )}
                {experienceLevel === 'senior' && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 mb-4">
                    ✓ Optimized for: Senior, Lead, and Staff positions
                  </p>
                )}
                {experienceLevel === 'staff' && (
                  <p className="text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 mb-4">
                    ✓ Optimized for: Staff, Principal, and Executive positions
                  </p>
                )}

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
                    href={`https://www.google.com/search?q=${encodeURIComponent(q.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
            <h3 className="text-lg font-bold mb-3">💡 Pro Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
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
            </ul>
          </div>
        </section>
      )}
    </AppLayout>
  );
}
