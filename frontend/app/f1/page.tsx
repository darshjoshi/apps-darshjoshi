'use client';

import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AppLayout';
import { Flag, Zap, Cloud, Trophy, Gauge, Timer, GitCompare, ArrowUpDown, Clock, BarChart3, Users, History } from 'lucide-react';
import { useEffect, useState } from 'react';

const dashboards = [
  {
    id: 'position-river',
    name: 'Position River',
    tag: 'UNTAPPED DATA',
    description: 'All 20 drivers\' positions lap-by-lap as flowing lines. Interactive, covering 2018-2026.',
    icon: BarChart3,
  },
  {
    id: 'overtake-map',
    name: 'Overtake Map',
    tag: 'WORLD\'S FIRST',
    description: 'Official overtake data from F1\'s OvertakeSeries feed. Real data, not guesses.',
    icon: Zap,
  },
  {
    id: 'strategy-scorecard',
    name: 'Strategy Scorecard',
    tag: 'UNIQUE ANALYSIS',
    description: 'Tyre strategy timelines with compound stints. See which teams make the best calls.',
    icon: Timer,
  },
  {
    id: 'pit-crew',
    name: 'Pit Crew Leaderboard',
    tag: 'GRANULAR DATA',
    description: 'Team rankings by stationary AND pit lane time. Track crew improvement.',
    icon: Clock,
  },
  {
    id: 'weather-impact',
    name: 'Weather Impact',
    tag: '178 SAMPLES/RACE',
    description: '163K+ weather data points nobody has analyzed. Temperature vs lap time correlation.',
    icon: Cloud,
  },
  {
    id: 'championship',
    name: 'Championship Momentum',
    tag: 'UNTAPPED DATA',
    description: 'Live WDC/WCC projected standings during each race. Championship swings.',
    icon: Trophy,
  },
  {
    id: 'speed-traps',
    name: 'Speed & Power',
    tag: 'DEEP ANALYSIS',
    description: 'Speed trap readings at 4 measurement points. Power vs downforce analysis.',
    icon: Gauge,
  },
  {
    id: 'race-control',
    name: 'Race Control',
    tag: '113+ MSGS/RACE',
    description: 'Visual timeline of flags, penalties, safety cars. Filterable categories.',
    icon: Flag,
  },
  {
    id: 'head-to-head',
    name: 'Driver H2H',
    tag: 'COMPARE ANY TWO',
    description: 'Compare any two drivers — position, pace, strategy, pit stops.',
    icon: GitCompare,
  },
  {
    id: 'grid-vs-finish',
    name: 'Grid vs Finish',
    tag: 'RACE CRAFT',
    description: 'Who gains most on race day? Grid to finish with positions delta.',
    icon: ArrowUpDown,
  },
  {
    id: 'timing-stats',
    name: 'Timing Deep Dive',
    tag: 'MINI-SECTORS',
    description: '~25 mini-sector segments vs the standard 3. 10x resolution.',
    icon: Users,
  },
  {
    id: 'history',
    name: 'Historical Records',
    tag: 'SINCE 1950',
    description: 'Race results and championship standings. 75+ years of F1 history.',
    icon: History,
  },
];

const stats = [
  { value: '33', label: 'DATA FEEDS', sublabel: 'PER SESSION' },
  { value: '5', label: 'UNTAPPED', sublabel: 'ZERO USERS WORLDWIDE' },
  { value: '163K+', label: 'WEATHER', sublabel: 'DATA POINTS' },
  { value: '1950', label: 'HISTORY', sublabel: 'TO PRESENT' },
];

const uniqueFeatures = [
  'Uses OvertakeSeries for official overtake analysis (everyone else guesses)',
  'Correlates 163K+ weather data points with lap performance',
  'Visualizes live championship prediction swings lap-by-lap',
  'Grades strategy effectiveness with position-change analysis',
  'Tracks pit crew improvement trends across entire seasons',
  'Shows pre-computed lap positions (zero processing needed)',
  'Breaks down pit lane entry, stationary, and exit timing',
  'Compares starting grid to finishing positions with delta scoring',
];

function AnimatedCounter({ value, delay }: { value: string; delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <span className={`inline-block transition-all duration-500 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {value}
    </span>
  );
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div className={`transition-all duration-700 ease-out ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

export default function F1Landing() {
  return (
    <AppLayout appName="F1 EVERYTHING">
      {/* Hero Section */}
      <FadeIn delay={100}>
        <section className="mb-12">
          <div className="border-2 border-black bg-white relative overflow-hidden">
            {/* Racing stripe accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-black to-red-500" />

            <div className="p-8">
              <div className="inline-block px-3 py-1 border-2 border-black bg-black text-white text-xs font-mono font-bold mb-6 tracking-widest">
                DATA NOBODY ELSE USES
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter leading-none">
                    F1
                    <span className="inline-block border-b-4 border-black ml-3">Everything</span>
                  </h1>
                  <p className="text-sm font-mono text-gray-500 mt-3">12 DASHBOARDS / 33 DATA FEEDS / 2018-2026</p>
                </div>
                <Link href="/f1/dashboard">
                  <button className="group px-8 py-4 border-2 border-black bg-black text-white font-mono font-bold text-sm hover:bg-white hover:text-black transition-all duration-200 cursor-pointer relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      OPEN DASHBOARD
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                    </span>
                  </button>
                </Link>
              </div>

              <div className="space-y-4 text-sm leading-relaxed max-w-3xl">
                <p>
                  F1 broadcasts 33 data feeds per session. Most analytics tools use fewer than 10.
                  <strong> 5 feeds have zero users worldwide.</strong> F1 Everything is the first tool
                  to use all of them.
                </p>
                <p className="text-gray-600">
                  OvertakeSeries gives you official overtake counts. WeatherDataSeries provides 178
                  samples per race. ChampionshipPrediction shows live WDC/WCC projections. All free,
                  all deterministic, zero LLM costs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Stats */}
      <FadeIn delay={250}>
        <section className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <div key={stat.label} className="border-2 border-black p-5 bg-white group hover:bg-black hover:text-white transition-all duration-200 cursor-default relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-black group-hover:bg-white transition-colors duration-200" />
                <div className="text-4xl font-bold mb-1 font-mono tracking-tighter">
                  <AnimatedCounter value={stat.value} delay={400 + i * 150} />
                </div>
                <div className="text-xs font-mono font-bold tracking-wider">{stat.label}</div>
                <div className="text-xs font-mono text-gray-500 group-hover:text-gray-400 mt-0.5">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* 12 Dashboards Grid */}
      <FadeIn delay={400}>
        <section className="mb-12">
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">12 Dashboards</h2>
              <span className="text-xs font-mono text-gray-500">SELECT ANY RACE FROM 2018-2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {dashboards.map((d, i) => {
                const Icon = d.icon;
                return (
                  <div key={d.id}
                    className="p-5 border-b border-r border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-default group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 border-2 border-black flex items-center justify-center shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-200">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm truncate">{d.name}</h3>
                        </div>
                        <span className="inline-block px-1.5 py-0.5 bg-black text-white text-[10px] font-mono font-bold tracking-wider mb-2">
                          {d.tag}
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed">{d.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* How It Works */}
      <FadeIn delay={500}>
        <section className="mb-12">
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black p-6">
              <h2 className="text-2xl font-bold tracking-tight">How It Works</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                { step: '01', title: 'Pick a Race', desc: 'Select any season (2018-2026) and race weekend. Every session available — Practice, Qualifying, Sprint, Race.' },
                { step: '02', title: 'Choose a View', desc: '12 dashboards showing different race aspects. Position battles, strategy, weather, speed, and more.' },
                { step: '03', title: 'Explore Data', desc: 'Interactive charts with hover details, filtering, and comparisons. Smarter than TV commentary.' },
              ].map((item, i) => (
                <div key={item.step} className={`p-8 ${i < 2 ? 'border-r border-gray-200' : ''} group`}>
                  <div className="text-5xl font-bold font-mono text-gray-200 group-hover:text-black transition-colors duration-300 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* What Nobody Else Does */}
      <FadeIn delay={600}>
        <section className="mb-12">
          <div className="border-2 border-black bg-white">
            <div className="border-b-2 border-black p-6">
              <h2 className="text-2xl font-bold tracking-tight">What Nobody Else Does</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {uniqueFeatures.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors duration-150 group">
                  <span className="w-8 h-8 border-2 border-gray-300 group-hover:border-black group-hover:bg-black group-hover:text-white flex items-center justify-center text-xs font-mono font-bold transition-all duration-200 shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeIn>

      {/* CTA */}
      <FadeIn delay={700}>
        <section className="mb-12">
          <div className="border-2 border-black bg-black text-white p-12 text-center relative overflow-hidden">
            {/* Racing stripe */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />

            <h2 className="text-3xl font-bold mb-3 tracking-tight">See the Data Nobody Shows You</h2>
            <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto font-mono">
              Free. No login. No API keys. Just F1 data processed and visualized
              in ways no other tool does.
            </p>
            <Link href="/f1/dashboard">
              <button className="group px-10 py-4 border-2 border-white bg-white text-black font-mono font-bold text-sm hover:bg-transparent hover:text-white transition-all duration-200 cursor-pointer">
                <span className="flex items-center gap-2">
                  OPEN DASHBOARD
                  <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </span>
              </button>
            </Link>
          </div>
        </section>
      </FadeIn>
    </AppLayout>
  );
}
