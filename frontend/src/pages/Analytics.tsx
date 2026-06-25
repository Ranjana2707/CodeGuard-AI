import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { BarChart3, Award, Bug, Clock, TrendingUp } from 'lucide-react'
import { dashboardService } from '../services/apiServices'
import { StatCard, SeverityBar } from '../components/ui/index'

const DAYS_OPTIONS = [7, 30, 90]

const MOCK_TIMELINE = [
  { date:'Jun 3', count:28 }, { date:'Jun 4', count:34 }, { date:'Jun 5', count:22 },
  { date:'Jun 6', count:41 }, { date:'Jun 7', count:35 }, { date:'Jun 8', count:48 },
  { date:'Jun 9', count:52 }, { date:'Jun 10', count:39 },
]

const MOCK_BY_LANG = [
  { language:'JavaScript', count:32 }, { language:'Python', count:25 },
  { language:'Java', count:21 },       { language:'TypeScript', count:14 },
  { language:'Go', count:5 },          { language:'PHP', count:3 },
]

const MOCK_VULNS = [
  { type:'SQL Injection', count:24 }, { type:'Hardcoded Secrets', count:18 },
  { type:'XSS', count:15 },           { type:'Insecure Deserialization', count:12 },
  { type:'Broken Auth', count:10 },   { type:'Path Traversal', count:7 },
]

const LANG_COLORS = ['#388bfd','#3fb950','#d29922','#bc8cff','#39c5cf','#f85149']
const VULN_COLORS = ['#f85149','#d29922','#e3b341','#bc8cff','#388bfd','#39c5cf']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="text-text-muted mb-1">{label}</div>
      <div className="font-semibold text-brand-blue">{payload[0].value} reviews</div>
    </div>
  )
}

export default function Analytics() {
  const [days, setDays] = useState(30)

  const { data } = useQuery({
    queryKey: ['analytics', days],
    queryFn: () => dashboardService.analytics(days),
  })

  const analytics = data?.data?.data
  const timeline = analytics?.reviewsOverTime ?? MOCK_TIMELINE
  const byLang   = MOCK_BY_LANG
  const vulns    = analytics?.topVulnerabilities?.map((v) => ({ type: v.type, count: v.count })) ?? MOCK_VULNS

  const sevBarItems = [
    { label:'Critical', count: analytics?.issuesBySeverity?.find(s=>s.severity==='CRITICAL')?.count ?? 38, max:60,  color:'#f85149' },
    { label:'High',     count: analytics?.issuesBySeverity?.find(s=>s.severity==='HIGH')?.count     ?? 72, max:120, color:'#d29922' },
    { label:'Medium',   count: analytics?.issuesBySeverity?.find(s=>s.severity==='MEDIUM')?.count   ?? 134,max:200, color:'#e3b341' },
    { label:'Low',      count: analytics?.issuesBySeverity?.find(s=>s.severity==='LOW')?.count      ?? 201,max:300, color:'#3fb950' },
  ]

  return (
    <>
      <div className="page-header">
        <h1 className="page-title"><BarChart3 size={18} className="text-brand-blue" />Analytics</h1>
        <div className="flex gap-1.5">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`btn btn-sm ${days === d ? 'btn-primary' : 'btn-ghost'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="page-content space-y-5">
        {/* Top stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Avg Security Score" value="67/100"  change="↑ 5% this month" changeType="up"   icon={Award}     iconColor="text-brand-yellow" delay={0} />
          <StatCard label="Issues Detected"    value="1,247"   change="Last 30 days"                        icon={Bug}       iconColor="text-brand-blue"   delay={0.05} />
          <StatCard label="Fix Rate"           value="71.5%"   change="↑ 3% this week"  changeType="up"   icon={TrendingUp} iconColor="text-brand-green"  delay={0.1} />
          <StatCard label="Avg Review Time"    value="4.2s"    change="↓ 0.8s faster"   changeType="up"   icon={Clock}     iconColor="text-brand-purple"  delay={0.15} />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-[1fr_340px] gap-4">
          {/* Timeline */}
          <motion.div
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="card"
          >
            <div className="card-header">
              <h2 className="card-title"><BarChart3 size={15} className="text-brand-blue" />Reviews Over Time</h2>
              <span className="text-xs text-text-muted">Last {days} days</span>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeline} margin={{ top:5, right:5, bottom:5, left:-10 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#388bfd" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#388bfd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                  <XAxis dataKey="date" tick={{ fill:'#6e7681', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'#6e7681', fontSize:11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="count"
                    stroke="#388bfd" strokeWidth={2}
                    fill="url(#blueGrad)"
                    dot={{ fill:'#388bfd', strokeWidth:0, r:4 }}
                    activeDot={{ r:5, fill:'#388bfd' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Severity breakdown */}
            <motion.div
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
              className="card"
            >
              <div className="card-header"><h2 className="card-title">Issue Severity</h2></div>
              <div className="card-body"><SeverityBar items={sevBarItems} /></div>
            </motion.div>

            {/* By language */}
            <motion.div
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
              className="card"
            >
              <div className="card-header"><h2 className="card-title">By Language</h2></div>
              <div className="card-body p-2">
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={byLang} margin={{ top:0, right:0, bottom:0, left:-20 }}>
                    <XAxis dataKey="language" tick={{ fill:'#6e7681', fontSize:10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:'#6e7681', fontSize:10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background:'#161b22', border:'1px solid #30363d', borderRadius:8, fontSize:12 }} />
                    <Bar dataKey="count" radius={[3,3,0,0]}>
                      {byLang.map((_, i) => <Cell key={i} fill={LANG_COLORS[i % LANG_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Top vulnerabilities bar chart */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="card"
        >
          <div className="card-header">
            <h2 className="card-title"><Bug size={15} className="text-brand-red" />Top Vulnerability Types</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vulns} layout="vertical" margin={{ top:0, right:20, bottom:0, left:140 }}>
                <XAxis type="number" tick={{ fill:'#6e7681', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="type" tick={{ fill:'#8b949e', fontSize:12 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={{ background:'#161b22', border:'1px solid #30363d', borderRadius:8, fontSize:12 }} />
                <Bar dataKey="count" radius={[0,4,4,0]}>
                  {vulns.map((_, i) => <Cell key={i} fill={VULN_COLORS[i % VULN_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </>
  )
}
