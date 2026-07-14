import { useEffect, useState } from 'react'
import { listPatents } from '../api/patents'
import { listLicenses } from '../api/licenses'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import DataTable from '../components/ui/DataTable'
import AnimatedCounter from '../components/ui/AnimatedCounter'
import { useToast } from '../components/ui/Toast'

export default function ReportsPage() {
  const { addToast } = useToast()
  
  // Data State
  const [patents, setPatents] = useState([])
  const [licenses, setLicenses] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [department, setDepartment] = useState('')
  
  // Active Preview State: 'Financial' | 'Prosecution' | 'Audit'
  const [activePreview, setActivePreview] = useState('Financial')
  const [previewSearchQuery, setPreviewSearchQuery] = useState('')
  
  // Chart Metric Toggle: 'revenue' | 'royalty'
  const [chartMetric, setChartMetric] = useState('revenue')

  // Dynamic Column Selector State
  const [selectedColumns, setSelectedColumns] = useState([])
  
  // Custom dropdown selector: null | 'Financial' | 'Prosecution' | 'Audit'
  const [activeDropdown, setActiveDropdown] = useState(null)

  // Available Columns Schema
  const availableColumns = {
    Financial: [
      { key: 'id', label: 'License ID' },
      { key: 'title', label: 'License Agreement' },
      { key: 'licensee_name', label: 'Licensee Company' },
      { key: 'royalty_rate', label: 'Royalty Rate (%)', render: (r) => <span className="font-mono">{r.royalty_rate}%</span> },
      { key: 'revenue_ytd', label: 'YTD Revenue (Rs.)', render: (r) => <span className="font-mono font-bold text-indigo">Rs. {r.revenue_ytd?.toLocaleString()}</span> },
      { key: 'status', label: 'Status', render: (r) => <span className="capitalize font-semibold text-[10px] bg-teal-light text-teal px-2 py-0.5 rounded">{r.status}</span> },
      { key: 'signing_date', label: 'Signing Date' },
      { key: 'expiry_date', label: 'Expiry Date' }
    ],
    Prosecution: [
      { key: 'patent_number', label: 'Patent #' },
      { key: 'title', label: 'Patent Title' },
      { key: 'jurisdiction', label: 'Jurisdiction' },
      { key: 'assignee', label: 'Assignee' },
      { key: 'status', label: 'Status', render: (r) => <span className="capitalize font-semibold text-[10px] bg-indigo-light text-indigo px-2 py-0.5 rounded">{r.status.replace('_', ' ')}</span> },
      { key: 'filing_date', label: 'Filing Date' },
      { key: 'next_due_date', label: 'Next Due Date' },
      { key: 'budget', label: 'Filing Budget (Rs.)', render: (r) => <span className="font-mono">Rs. {r.budget?.toLocaleString() || '0'}</span> }
    ],
    Audit: [
      { key: 'id', label: 'Log ID' },
      { key: 'user', label: 'Operator' },
      { key: 'role', label: 'Role', render: (r) => <span className="uppercase text-[9px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">{r.role.replace('_', ' ')}</span> },
      { key: 'action', label: 'Administrative Action' },
      { key: 'time', label: 'Timestamp', render: (r) => <span className="font-mono text-[10px] text-ink/40">{r.time}</span> }
    ]
  }

  // Initialize selected columns when changing report type
  useEffect(() => {
    setSelectedColumns(availableColumns[activePreview].map(c => c.key))
  }, [activePreview])

  useEffect(() => {
    // Generate mock audit logs specifically for the report preview
    const mockLogs = [
      { id: 1, user: "Aisha Bennett", role: "ttc_staff", action: "Promoted PAT-8841 status to Office Action", time: "2026-07-13 08:35:12" },
      { id: 2, user: "Elena Brooks", role: "super_admin", action: "Assigned Attorney Aisha Bennett to PAT-8540 case", time: "2026-07-13 08:22:45" },
      { id: 3, user: "Rohan Gupta", role: "ttc_staff", action: "Created License Apple Inc. agreement", time: "2026-07-13 07:11:03" },
      { id: 4, user: "Prof. Daniel Shaw", role: "faculty", action: "Initiated Invention Disclosure DISC-1021", time: "2026-07-13 06:45:18" },
      { id: 5, user: "Sarah Staff Liaison", role: "ttc_staff", action: "Updated Agreement status to Active for NDA-990", time: "2026-07-12 14:10:05" },
      { id: 6, user: "TTC Administrator", role: "super_admin", action: "Approved user register request from Dr. Saman", time: "2026-07-12 11:22:00" }
    ]
    setLogs(mockLogs)

    Promise.all([listPatents(), listLicenses()])
      .then(([pats, lics]) => {
        setPatents(pats)
        setLicenses(lics)
      })
      .catch(err => {
        console.error(err)
        addToast('Failed to load data for reports.', 'danger')
      })
      .finally(() => setLoading(false))
  }, [])

  // Handle Export: CSV & JSON Format
  const handleExport = (reportType, format = 'csv') => {
    const dataToExport = getFilteredData(reportType)
    if (!dataToExport || dataToExport.length === 0) {
      addToast('No data matches the selected filters to export.', 'warning')
      return
    }

    const renderedCols = availableColumns[reportType].filter(c => selectedColumns.includes(c.key))

    if (format === 'json') {
      const exportedData = dataToExport.map(item => {
        const record = {}
        renderedCols.forEach(col => {
          record[col.label] = item[col.key]
        })
        return record
      })
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' })
      triggerDownload(blob, `${reportType.toLowerCase()}_report_${new Date().toISOString().slice(0,10)}.json`)
      addToast(`Exported ${exportedData.length} entries as JSON`, 'success')
    } else {
      // Export CSV
      const headers = renderedCols.map(c => c.label)
      const rows = dataToExport.map(item => 
        renderedCols.map(col => {
          const val = item[col.key] === null || item[col.key] === undefined ? '' : String(item[col.key])
          return `"${val.replace(/"/g, '""')}"`
        })
      )
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      triggerDownload(blob, `${reportType.toLowerCase()}_report_${new Date().toISOString().slice(0,10)}.csv`)
      addToast(`Exported ${dataToExport.length} entries as CSV`, 'success')
    }
  }

  const triggerDownload = (blob, fileName) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', fileName)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset Filters helper
  const handleResetFilters = () => {
    setStartDate('')
    setEndDate('')
    setDepartment('')
    setPreviewSearchQuery('')
    addToast('Filters reset successfully.', 'success')
  }

  // Filter Logic
  const getFilteredData = (type) => {
    let source = []
    if (type === 'Financial') source = licenses
    else if (type === 'Prosecution') source = patents
    else if (type === 'Audit') source = logs

    return source.filter(item => {
      // Text Search Query Filter
      let matchesSearch = true
      if (previewSearchQuery) {
        const q = previewSearchQuery.toLowerCase()
        if (type === 'Financial') {
          matchesSearch = item.title?.toLowerCase().includes(q) || 
                          item.licensee_name?.toLowerCase().includes(q) || 
                          item.status?.toLowerCase().includes(q)
        } else if (type === 'Prosecution') {
          matchesSearch = item.title?.toLowerCase().includes(q) || 
                          item.patent_number?.toLowerCase().includes(q) || 
                          item.status?.toLowerCase().includes(q) ||
                          item.assignee?.toLowerCase().includes(q)
        } else if (type === 'Audit') {
          matchesSearch = item.user?.toLowerCase().includes(q) || 
                          item.action?.toLowerCase().includes(q) || 
                          item.role?.toLowerCase().includes(q)
        }
      }

      // Date Range Filter
      let matchesDate = true
      const dateStr = type === 'Financial' ? item.signing_date : 
                      type === 'Prosecution' ? item.filing_date : 
                      type === 'Audit' ? item.time : null
      
      if (dateStr) {
        const itemTime = new Date(dateStr).getTime()
        if (startDate) {
          const startTime = new Date(startDate).getTime()
          if (itemTime < startTime) matchesDate = false
        }
        if (endDate) {
          const endTime = new Date(endDate).getTime() + 86400000 // End-of-day offset
          if (itemTime > endTime) matchesDate = false
        }
      }

      // Mock Department Filter (For illustration/prosecution)
      let matchesDept = true
      if (department && type === 'Prosecution') {
        const dummyDeptMatch = department === 'Computer Eng.' ? item.title.toLowerCase().includes('scheduler') || item.title.toLowerCase().includes('watermarking') :
                               department === 'Electrical & Info' ? item.title.toLowerCase().includes('bio') || item.title.toLowerCase().includes('wearable') : true
        matchesDept = dummyDeptMatch
      }

      return matchesSearch && matchesDate && matchesDept
    })
  }

  // Previews data structures
  const activeFilteredData = getFilteredData(activePreview)
  const renderedColumns = availableColumns[activePreview].filter(c => selectedColumns.includes(c.key))

  // Chart data calculations
  const totalYtdRevenue = licenses.reduce((sum, item) => sum + (item.revenue_ytd || 0), 0)
  const avgRoyalty = licenses.length > 0 ? (licenses.reduce((acc, curr) => acc + (curr.royalty_rate || 0), 0) / licenses.length).toFixed(1) : '0.0'
  const topLic = licenses.length > 0 ? licenses.reduce((max, curr) => (curr.revenue_ytd || 0) > (max.revenue_ytd || 0) ? curr : max, licenses[0]) : null
  const grantedRate = patents.length > 0 ? ((patents.filter(p => p.status === 'granted').length / patents.length) * 100).toFixed(0) : '0'

  const patentStatusList = ['drafting', 'filed', 'office_action', 'granted']
  const patentStatusCounts = patentStatusList.reduce((acc, st) => {
    acc[st] = patents.filter(p => p.status === st).length
    return acc
  }, {})

  return (
    <>
      <PageHeader
        title="Audit & Financial Reports"
        description="Compile portfolio-level financial summaries, prosecution SLA tracking, and audit trails."
        icon={
          <svg className="w-5 h-5 text-indigo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
      />

      {/* Advanced Performance Metrics Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">YTD Revenue Sum</span>
          <div className="text-xl font-black text-ink mt-1 flex items-baseline gap-1">
            Rs. <AnimatedCounter value={totalYtdRevenue} />
          </div>
          <span className="text-[9px] text-teal font-semibold mt-1 block">Live ledger compilation</span>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Average Royalty Rate</span>
          <div className="text-xl font-black text-indigo mt-1 flex items-baseline gap-1">
            {avgRoyalty}%
          </div>
          <span className="text-[9px] text-ink/40 mt-1 block">Across active licenses</span>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Patent Grant Rate</span>
          <div className="text-xl font-black text-teal mt-1 flex items-baseline gap-1">
            {grantedRate}%
          </div>
          <span className="text-[9px] text-teal font-semibold mt-1 block">Of all filed patents</span>
        </div>
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs">
          <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Top License Partner</span>
          <div className="text-sm font-black text-ink mt-1.5 truncate">
            {topLic ? topLic.licensee_name : 'None'}
          </div>
          <span className="text-[9px] text-indigo font-semibold mt-0.5 block">
            Rs. {topLic ? topLic.revenue_ytd?.toLocaleString() : '0'} YTD
          </span>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-xs mb-8">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Auditing Filters</h4>
          <button 
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-indigo hover:text-indigo-dark transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Input
            type="date"
            label="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            label="End Date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <Select
            label="Filter Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Civil & Environmental">Civil & Environmental</option>
            <option value="Electrical & Info">Electrical & Info</option>
            <option value="Marine & Naval">Marine & Naval</option>
            <option value="Mechanical & Mfg">Mechanical & Mfg</option>
            <option value="Computer Eng.">Computer Eng.</option>
          </Select>
        </div>
      </div>

      {/* Dynamic Graph/Metrics Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 stagger-children">
        {/* Metric Chart 1: Licensing YTD Distribution */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Licensing Portfolio Distribution</h4>
              <p className="text-[11px] text-ink/40 mt-1">Live metrics across active technology transfer agreements.</p>
            </div>
            
            {/* Metric Toggle */}
            <div className="flex bg-paper p-0.5 rounded-lg border border-line shrink-0 select-none">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all cursor-pointer ${chartMetric === 'revenue' ? 'bg-surface text-indigo shadow-xs' : 'text-ink/40 hover:text-ink/70'}`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartMetric('royalty')}
                className={`px-2 py-1 text-[9px] font-bold uppercase rounded-md transition-all cursor-pointer ${chartMetric === 'royalty' ? 'bg-surface text-indigo shadow-xs' : 'text-ink/40 hover:text-ink/70'}`}
              >
                Royalty
              </button>
            </div>
          </div>
          
          <div className="flex items-end justify-start h-40 gap-4 pt-4 border-b border-line overflow-x-auto pb-2 mt-4">
            {loading ? (
              <div className="w-full text-center text-xs text-ink/45">Loading charts...</div>
            ) : licenses.length === 0 ? (
              <div className="w-full text-center text-xs text-ink/45">No license revenue data found.</div>
            ) : (
              licenses.map((lic, i) => {
                const maxVal = chartMetric === 'revenue' 
                  ? Math.max(...licenses.map(l => l.revenue_ytd || 0), 1)
                  : Math.max(...licenses.map(l => l.royalty_rate || 0), 1)

                const currentVal = chartMetric === 'revenue' ? (lic.revenue_ytd || 0) : (lic.royalty_rate || 0)
                const heightPercent = (currentVal / maxVal) * 85
                
                return (
                  <div key={lic.id || i} className="flex-1 min-w-[70px] flex flex-col items-center gap-1 group">
                    <span className="text-[8px] font-bold text-indigo opacity-0 group-hover:opacity-100 transition-opacity duration-150 tabular shrink-0">
                      {chartMetric === 'revenue' ? `Rs. ${(currentVal / 1000).toFixed(0)}k` : `${currentVal}%`}
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-indigo/80 hover:bg-indigo transition-all duration-300 relative cursor-pointer flex items-end justify-center"
                      style={{ height: `${Math.max(heightPercent, 8)}px` }}
                    >
                      <span className="text-[8px] font-bold text-white mb-1 rotate-90 origin-bottom sm:rotate-0 sm:origin-center select-none">
                        {((currentVal / maxVal) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-ink/50 truncate w-full text-center select-none" title={lic.licensee_name}>
                      {lic.licensee_name.split(' ')[0]}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Metric Chart 2: Patent SLA Compliance status */}
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-2">Patent Portfolio Status Distribution</h4>
            <p className="text-[11px] text-ink/40">Real-time status breakdown indexes for active cases.</p>
          </div>
          
          <div className="space-y-3.5 my-3">
            {loading ? (
              <div className="w-full text-center text-xs text-ink/45">Loading statistics...</div>
            ) : (
              patentStatusList.map(status => {
                const count = patentStatusCounts[status] || 0
                const percent = patents.length > 0 ? (count / patents.length) * 100 : 0
                const colorMap = {
                  drafting: 'bg-amber',
                  filed: 'bg-indigo',
                  office_action: 'bg-rust',
                  granted: 'bg-teal'
                }
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-ink/80 capitalize">
                      <span>{status.replace('_', ' ')}</span>
                      <span className="tabular">{count} cases ({percent.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-paper rounded-full overflow-hidden border border-line/40">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colorMap[status]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Reports Card Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 stagger-children">
        {/* Financial reports */}
        <div className={`bg-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-200 ${activePreview === 'Financial' ? 'border-indigo ring-1 ring-indigo' : 'border-line hover:border-ink/20'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Financial Report</h3>
              {activePreview === 'Financial' && <span className="text-[9px] font-bold text-indigo uppercase bg-indigo-light px-2 py-0.5 rounded">Active Preview</span>}
            </div>
            <p className="text-[11px] text-ink/45 mb-4">Export active IP licensing royalties, patent filing budgets, and attorney fees.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex flex-col gap-3 mt-6">
            <span className="text-xs font-bold text-indigo tabular">
              YTD: Rs. {totalYtdRevenue.toLocaleString()}
            </span>
            <div className="flex gap-2 w-full">
              <Button variant="ghost" className="flex-1 py-1 px-2.5 text-[11px] h-7 border border-line animate-fade-in" onClick={() => setActivePreview('Financial')}>
                Preview
              </Button>
              <div className="relative flex-1">
                <Button
                  variant="ghost"
                  className="w-full py-1 px-2.5 text-[11px] h-7 border border-line flex items-center justify-between gap-1 select-none cursor-pointer hover:bg-paper"
                  onClick={() => setActiveDropdown(activeDropdown === 'Financial' ? null : 'Financial')}
                >
                  <span>Export</span>
                  <svg className="w-3 h-3 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                {activeDropdown === 'Financial' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute right-0 bottom-8 mb-1 w-32 rounded-xl bg-surface border border-line shadow-lg py-1.5 z-20 animate-fade-in">
                      <button
                        onClick={() => { handleExport('Financial', 'csv'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => { handleExport('Financial', 'json'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        Export JSON
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Prosecution SLA report */}
        <div className={`bg-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-200 ${activePreview === 'Prosecution' ? 'border-indigo ring-1 ring-indigo' : 'border-line hover:border-ink/20'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Prosecution SLA</h3>
              {activePreview === 'Prosecution' && <span className="text-[9px] font-bold text-indigo uppercase bg-indigo-light px-2 py-0.5 rounded">Active Preview</span>}
            </div>
            <p className="text-[11px] text-ink/45 mb-4">Track response timelines for office actions and examiner escalations.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex flex-col gap-3 mt-6">
            <span className="text-xs font-bold text-indigo tabular">
              Cases: {patents.length} active
            </span>
            <div className="flex gap-2 w-full">
              <Button variant="ghost" className="flex-1 py-1 px-2.5 text-[11px] h-7 border border-line animate-fade-in" onClick={() => setActivePreview('Prosecution')}>
                Preview
              </Button>
              <div className="relative flex-1">
                <Button
                  variant="ghost"
                  className="w-full py-1 px-2.5 text-[11px] h-7 border border-line flex items-center justify-between gap-1 select-none cursor-pointer hover:bg-paper"
                  onClick={() => setActiveDropdown(activeDropdown === 'Prosecution' ? null : 'Prosecution')}
                >
                  <span>Export</span>
                  <svg className="w-3 h-3 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                {activeDropdown === 'Prosecution' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute right-0 bottom-8 mb-1 w-32 rounded-xl bg-surface border border-line shadow-lg py-1.5 z-20 animate-fade-in">
                      <button
                        onClick={() => { handleExport('Prosecution', 'csv'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => { handleExport('Prosecution', 'json'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        Export JSON
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audit trail reports */}
        <div className={`bg-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-200 ${activePreview === 'Audit' ? 'border-indigo ring-1 ring-indigo' : 'border-line hover:border-ink/20'}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Audit Trails</h3>
              {activePreview === 'Audit' && <span className="text-[9px] font-bold text-indigo uppercase bg-indigo-light px-2 py-0.5 rounded">Active Preview</span>}
            </div>
            <p className="text-[11px] text-ink/45 mb-4">Log system login metadata, roles revisions, and approval history.</p>
          </div>
          <div className="border-t border-line/50 pt-4 flex flex-col gap-3 mt-6">
            <span className="text-xs font-bold text-indigo">
              Logs Count: {logs.length} entries
            </span>
            <div className="flex gap-2 w-full">
              <Button variant="ghost" className="flex-1 py-1 px-2.5 text-[11px] h-7 border border-line animate-fade-in" onClick={() => setActivePreview('Audit')}>
                Preview
              </Button>
              <div className="relative flex-1">
                <Button
                  variant="ghost"
                  className="w-full py-1 px-2.5 text-[11px] h-7 border border-line flex items-center justify-between gap-1 select-none cursor-pointer hover:bg-paper"
                  onClick={() => setActiveDropdown(activeDropdown === 'Audit' ? null : 'Audit')}
                >
                  <span>Export</span>
                  <svg className="w-3 h-3 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>
                
                {activeDropdown === 'Audit' && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                    <div className="absolute right-0 bottom-8 mb-1 w-32 rounded-xl bg-surface border border-line shadow-lg py-1.5 z-20 animate-fade-in">
                      <button
                        onClick={() => { handleExport('Audit', 'csv'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-teal shrink-0" />
                        Export CSV
                      </button>
                      <button
                        onClick={() => { handleExport('Audit', 'json'); setActiveDropdown(null); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] font-semibold text-ink/80 hover:bg-paper transition-colors flex items-center gap-1.5 cursor-pointer border-none bg-transparent"
                      >
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                        Export JSON
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Live Preview Panel */}
      {activePreview && (
        <div className="bg-surface border border-line rounded-2xl p-6 shadow-xs animate-fade-in mb-8">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4 border-b border-line pb-4">
            <div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
                Live Data Preview ({activePreview} Report)
              </h3>
              <p className="text-[11px] text-ink/40 mt-0.5">
                Displaying {activeFilteredData.length} records. Toggle chips to build/customize columns.
              </p>
            </div>
            
            <div className="w-full sm:max-w-xs shrink-0">
              <Input
                placeholder={`Search inside preview...`}
                value={previewSearchQuery}
                onChange={(e) => setPreviewSearchQuery(e.target.value)}
                className="py-1 px-3 text-xs"
              />
            </div>
          </div>

          {/* Custom Column Builder Chips */}
          <div className="space-y-1.5 mb-5 bg-paper p-3 rounded-xl border border-line">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">Custom Report Column Builder</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableColumns[activePreview].map(col => {
                const isSelected = selectedColumns.includes(col.key)
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedColumns.length > 1) {
                          setSelectedColumns(selectedColumns.filter(c => c !== col.key))
                        } else {
                          addToast('At least one column must remain checked.', 'warning')
                        }
                      } else {
                        setSelectedColumns([...selectedColumns, col.key])
                      }
                    }}
                    className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo/10 text-indigo border-indigo'
                        : 'bg-surface text-ink/35 border-line hover:text-ink/60'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    {col.label}
                  </button>
                )
              })}
            </div>
          </div>

          <DataTable
            columns={renderedColumns}
            rows={activeFilteredData}
            loading={loading}
            emptyLabel="No records matched the active filters or search queries."
          />
        </div>
      )}
    </>
  )
}
