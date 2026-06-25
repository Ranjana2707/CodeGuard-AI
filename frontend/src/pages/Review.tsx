import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import {
  ShieldSearch, Download, Code2, Upload, GitMerge,
  Loader2, CheckCircle2, AlertTriangle, Wand2, Trash2, FileCode,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { reviewService, type ReviewResponse } from '../services/apiServices'
import IssueCard from '../components/ui/IssueCard'
import { ScoreRing, SeverityBadge } from '../components/ui/index'
import clsx from 'clsx'

const LANGUAGES = ['javascript','typescript','python','java','go','php','csharp','sql','ruby','rust','cpp']

const SAMPLE_CODE: Record<string, string> = {
  javascript: `// Vulnerable authentication handler
function authenticateUser(username, password) {
  // SQL Injection vulnerability
  const query = "SELECT * FROM users WHERE username='" + username
    + "' AND password='" + password + "'";
  const result = db.execute(query);
  if (result.length > 0) {
    // Weak token generation
    const token = username + "_" + Date.now();
    document.cookie = "session=" + token;
    return { success: true, user: result[0] };
  }
  return { success: false };
}

// Hardcoded credentials
const API_SECRET = "sk-prod-xK92mNpQ7vR3jL8wT6yH4cB1dF0eA5";
const DB_PASSWORD = "admin123";

// XSS vulnerability
function renderUserInput(input) {
  document.getElementById('output').innerHTML = input;
}

// Path traversal
function readFile(filename) {
  return fs.readFileSync('/var/data/' + filename, 'utf8');
}`,
  python: `import subprocess, pickle, os

# Hardcoded secrets
DB_PASS = "supersecret123"
API_KEY = "hardcoded_api_key_12345"

# Command injection
def run_command(user_input):
    result = subprocess.run(user_input, shell=True, capture_output=True, text=True)
    return result.stdout

# Unsafe deserialization
def load_data(serialized_data):
    return pickle.loads(serialized_data)

# SQL injection
def get_user(user_id):
    query = f"SELECT * FROM users WHERE id = {user_id}"
    cursor.execute(query)
    return cursor.fetchone()

# XSS (Flask template)
def render_page(user_name):
    return f"<html><body>Welcome, {user_name}!</body></html>"`,
  java: `import java.sql.*; import java.io.*;

public class UserService {
    // Hardcoded credentials
    private static final String DB_URL = "jdbc:mysql://localhost/db";
    private static final String PASSWORD = "root123";
    private static final String SECRET = "jwt_secret_hardcoded";

    // SQL Injection
    public User findUser(String username) throws SQLException {
        Connection conn = DriverManager.getConnection(DB_URL, "root", PASSWORD);
        String sql = "SELECT * FROM users WHERE username = '" + username + "'";
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery(sql);
        return mapToUser(rs);  // Connection never closed
    }

    // Path traversal
    public void saveFile(String filename, byte[] data) throws IOException {
        FileOutputStream fos = new FileOutputStream("/uploads/" + filename);
        fos.write(data);
    }

    // Unsafe deserialization
    public Object deserialize(byte[] data) throws Exception {
        ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(data));
        return ois.readObject();
    }

    // Weak token
    public String generateToken(String userId) {
        return userId + "_" + System.currentTimeMillis();
    }
}`,
}

type Tab = 'paste' | 'upload' | 'diff'

export default function Review() {
  const [tab, setTab] = useState<Tab>('paste')
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(SAMPLE_CODE.javascript)
  const [result, setResult] = useState<ReviewResponse | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const analyzeMutation = useMutation({
    mutationFn: () => reviewService.analyze({ code, language }),
    onSuccess: (res) => {
      setResult(res.data.data)
      toast.success(`Analysis complete — ${res.data.data.issues.length} issues found`)
    },
    onError: () => toast.error('Analysis failed. Check your connection.'),
  })

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    if (SAMPLE_CODE[lang]) setCode(SAMPLE_CODE[lang])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCode(ev.target?.result as string)
      toast.success(`Loaded: ${file.name}`)
    }
    reader.readAsText(file)
  }

  const downloadReport = () => {
    if (!result) return
    const lines = [
      `# CodeGuard AI — Security Review Report`,
      `Generated: ${new Date().toLocaleString()}`,
      `Language: ${result.language}`,
      `File: ${result.fileName}`,
      `Security Score: ${result.securityScore}/100`,
      '',
      `## Summary`,
      result.summary,
      '',
      `## Issues Found (${result.issues.length})`,
      '',
      ...result.issues.flatMap((issue, i) => [
        `### ${i + 1}. ${issue.title} [${issue.severity}]`,
        `**Type:** ${issue.issueType}  |  **Line:** ${issue.lineNumber ?? 'N/A'}`,
        `**Description:** ${issue.description}`,
        `**Fix:** ${issue.fixSuggestion}`,
        '',
      ]),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `codeguard-report-${Date.now()}.md`
    a.click()
    toast.success('Report downloaded')
  }

  const counts = result
    ? result.issues.reduce(
        (acc, i) => { acc[i.severity] = (acc[i.severity] ?? 0) + 1; return acc },
        {} as Record<string, number>
      )
    : {}

  return (
    <>
      <div className="page-header">
        <h1 className="page-title"><Code2 size={18} className="text-brand-blue" />Code Review</h1>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="select text-xs"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar px-6">
        {([['paste','Paste Code',Code2],['upload','Upload File',Upload],['diff','Diff View',GitMerge]] as const).map(
          ([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)} className={clsx('tab-item', tab === id && 'active')}>
              <Icon size={14} />{label}
            </button>
          )
        )}
      </div>

      <div className="page-content flex gap-4 items-start">
        {/* Left: editor + output */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Editor */}
          <div className="card overflow-hidden">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <FileCode size={14} className="text-brand-blue" />
                <span className="text-xs text-text-secondary font-mono">
                  {language === 'javascript' ? 'snippet.js' :
                   language === 'python' ? 'snippet.py' :
                   language === 'java' ? 'Snippet.java' : `snippet.${language}`}
                </span>
                <span className="badge badge-info text-[10px]">AI-Ready</span>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setCode(SAMPLE_CODE[language] ?? SAMPLE_CODE.javascript); toast('Sample code loaded') }}
                >
                  <Wand2 size={12} /> Sample
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setCode(''); setResult(null) }}
                >
                  <Trash2 size={12} /> Clear
                </button>
                {tab === 'upload' && (
                  <>
                    <input ref={fileRef} type="file" accept=".js,.ts,.py,.java,.go,.php,.cs,.sql,.rb,.rs,.cpp" className="hidden" onChange={handleFileUpload} />
                    <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>
                      <Upload size={12} /> Load File
                    </button>
                  </>
                )}
              </div>
            </div>
            <Editor
              height="280px"
              language={language === 'csharp' ? 'csharp' : language}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              theme="vs-dark"
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                padding: { top: 12, bottom: 12 },
                fontFamily: '"SF Mono", Menlo, Monaco, "Courier New", monospace',
                renderLineHighlight: 'gutter',
              }}
            />
          </div>

          {/* Action bar */}
          <div className="flex gap-2">
            <button
              className="btn btn-primary flex-1 btn-lg"
              onClick={() => analyzeMutation.mutate()}
              disabled={analyzeMutation.isPending || !code.trim()}
            >
              {analyzeMutation.isPending ? (
                <><Loader2 size={15} className="animate-spin" /> Analyzing with AI…</>
              ) : (
                <><ShieldSearch size={15} /> Analyze with AI</>
              )}
            </button>
            {result && (
              <button className="btn btn-ghost btn-lg" onClick={downloadReport}>
                <Download size={15} /> Export Report
              </button>
            )}
          </div>

          {/* Loading state */}
          {analyzeMutation.isPending && (
            <div className="card p-8 flex flex-col items-center gap-3 text-text-secondary">
              <Loader2 size={28} className="animate-spin text-brand-blue" />
              <div className="text-sm">AI scanning for vulnerabilities, bugs, and security issues…</div>
              <div className="text-xs text-text-muted">This usually takes 3–8 seconds</div>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {result && !analyzeMutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* Summary banner */}
                <div className={clsx('border rounded-xl p-4', summaryStyle(result))}>
                  <div className="flex items-start gap-3">
                    {result.issues.length === 0 ? (
                      <CheckCircle2 size={20} className="text-brand-green flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle size={20} className="text-brand-red flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-sm mb-1">AI Review Summary</div>
                      <div className="text-[13px] text-text-secondary leading-relaxed">{result.summary}</div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {Object.entries(counts).map(([sev, count]) => (
                          <span key={sev} className={clsx('badge', sevBadge(sev))}>
                            {count} {sev}
                          </span>
                        ))}
                        {result.issues.length === 0 && (
                          <span className="badge badge-low">✓ No issues found</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issue cards */}
                {result.issues.map((issue, i) => (
                  <IssueCard key={i} issue={issue} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="w-72 flex-shrink-0 space-y-3">
          {/* Config */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xs">Analysis Config</h3>
            </div>
            <div className="card-body space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Scan Depth</label>
                <select className="select w-full text-xs">
                  <option>Deep (Recommended)</option>
                  <option>Standard</option>
                  <option>Quick</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1.5 block">Detection Focus</label>
                <div className="space-y-1.5 text-[12px] text-text-secondary">
                  {['Security vulnerabilities','Code quality & bugs','Performance issues','OWASP Top 10','Best practices'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-brand-blue" /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Score panel */}
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} className="card">
                <div className="card-header">
                  <h3 className="card-title text-xs">Security Score</h3>
                </div>
                <div className="card-body flex items-center gap-4">
                  <ScoreRing score={result.securityScore} size={80} />
                  <div className="flex-1 space-y-1">
                    {['CRITICAL','HIGH','MEDIUM','LOW'].map((sev) => (
                      counts[sev] ? (
                        <div key={sev} className="flex items-center justify-between text-xs">
                          <SeverityBadge severity={sev} />
                          <span className="text-text-muted">{counts[sev]}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="card">
            <div className="card-header"><h3 className="card-title text-xs">Quick Tips</h3></div>
            <div className="card-body space-y-2 text-[12px] text-text-secondary">
              <p>• Load a <strong className="text-text-primary">sample code</strong> to see the reviewer in action</p>
              <p>• The AI detects <strong className="text-text-primary">OWASP Top 10</strong> and more</p>
              <p>• Click any issue card to <strong className="text-text-primary">expand the fix</strong></p>
              <p>• Export your report as <strong className="text-text-primary">Markdown</strong></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function summaryStyle(result: ReviewResponse): string {
  const hasCritical = result.issues.some((i) => i.severity === 'CRITICAL')
  const hasHigh     = result.issues.some((i) => i.severity === 'HIGH')
  if (hasCritical)           return 'border-red-900 bg-red-950/30'
  if (hasHigh)               return 'border-orange-900 bg-orange-950/20'
  if (result.issues.length)  return 'border-yellow-900 bg-yellow-950/10'
  return 'border-green-900 bg-green-950/20'
}

function sevBadge(sev: string): string {
  const m: Record<string, string> = { CRITICAL:'badge-critical', HIGH:'badge-high', MEDIUM:'badge-medium', LOW:'badge-low' }
  return m[sev] ?? 'badge-neutral'
}
