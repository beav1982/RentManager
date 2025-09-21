import { useMemo, useState, type ReactNode } from 'react'
import './App.css'

type SectionId =
  | 'properties'
  | 'units'
  | 'programs'
  | 'households'
  | 'compliance'
  | 'reports'
  | 'transactions'

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

type NavItem = {
  id: SectionId
  label: string
  description: string
  metric: string
}

const navItems: NavItem[] = [
  {
    id: 'properties',
    label: 'Properties',
    description: 'Portfolio occupancy, AMI mix, and availability by property.',
    metric: '7 active',
  },
  {
    id: 'units',
    label: 'Units',
    description: 'Unit availability, turns, and readiness across the portfolio.',
    metric: '312 total',
  },
  {
    id: 'programs',
    label: 'Programs',
    description: 'Manage subsidy programs, income limits, and rent schedules.',
    metric: '9 active',
  },
  {
    id: 'households',
    label: 'Households',
    description: 'Resident rosters, certifications, and household compliance.',
    metric: '281 occupied',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    description: 'Certification due dates, findings, and resolution workflows.',
    metric: '6 alerts',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Operational dashboards for occupancy, rent roll, and NOI.',
    metric: '4 dashboards',
  },
  {
    id: 'transactions',
    label: 'Transactions',
    description: 'Revenue, expenses, and ledger activity tied to reporting.',
    metric: '32 this week',
  },
]

const propertyPortfolio = [
  {
    name: 'Harbor Point Homes',
    code: 'HP-101',
    address: '123 Marina Blvd · Seattle, WA',
    ami: '60% AMI',
    occupancy: '97%',
    status: 'Stabilized',
  },
  {
    name: 'Cascade Heights',
    code: 'CH-204',
    address: '894 Summit Ave · Portland, OR',
    ami: '50% AMI',
    occupancy: '94%',
    status: 'Leasing',
  },
  {
    name: 'Riverwalk Flats',
    code: 'RF-033',
    address: '45 River St · Spokane, WA',
    ami: '80% AMI',
    occupancy: '99%',
    status: 'Stabilized',
  },
]

const unitMetrics = [
  { label: 'Ready', value: 28, tone: 'success' as BadgeTone },
  { label: 'Notice', value: 7, tone: 'warning' as BadgeTone },
  { label: 'Turn', value: 5, tone: 'info' as BadgeTone },
  { label: 'Down', value: 2, tone: 'danger' as BadgeTone },
]

const complianceAlerts = [
  {
    title: 'Certification due within 30 days',
    household: 'Lopez Household · Harbor Point',
    severity: 'warning' as BadgeTone,
    due: 'Apr 24',
    action: 'Start recertification',
  },
  {
    title: 'Income exceeds program limit',
    household: 'Nguyen Household · Riverwalk',
    severity: 'danger' as BadgeTone,
    due: 'Review income docs',
    action: 'Open compliance case',
  },
  {
    title: 'Inactive household - 45 days',
    household: 'Green Household · Cascade',
    severity: 'info' as BadgeTone,
    due: 'Last activity Feb 10',
    action: 'Log wellness check',
  },
]

const reportCards = [
  {
    label: 'Occupancy',
    value: '96.2%',
    delta: '+1.1%',
    meta: 'vs last month',
  },
  {
    label: 'Rent Roll',
    value: '$412K',
    delta: '+$18K',
    meta: 'collected MTD',
  },
  {
    label: 'Operating Expenses',
    value: '$238K',
    delta: '-3.4%',
    meta: 'budget variance',
  },
  {
    label: 'NOI',
    value: '$174K',
    delta: '+$9K',
    meta: 'rolling 3 mo.',
  },
]

const ledgerEntries = [
  {
    id: 'TX-9821',
    date: 'Mar 14, 2024',
    property: 'Harbor Point',
    category: 'Rent',
    description: 'Unit 304 rent payment',
    amount: '+$1,245.00',
  },
  {
    id: 'TX-9814',
    date: 'Mar 13, 2024',
    property: 'Riverwalk Flats',
    category: 'Maintenance',
    description: 'Elevator service contract',
    amount: '-$2,180.00',
  },
  {
    id: 'TX-9799',
    date: 'Mar 11, 2024',
    property: 'Cascade Heights',
    category: 'Rent',
    description: 'Unit 512 rent payment',
    amount: '+$1,125.00',
  },
]

const programCatalog = [
  {
    name: 'HUD Section 8',
    ami: '50% AMI',
    rentLimit: '$1,215',
    households: 142,
  },
  {
    name: 'LIHTC',
    ami: '60% AMI',
    rentLimit: '$1,385',
    households: 96,
  },
  {
    name: 'Workforce',
    ami: '80% AMI',
    rentLimit: '$1,645',
    households: 43,
  },
]

const householdTimeline = [
  {
    household: 'Davis Household',
    property: 'Harbor Point · Unit 405',
    certification: 'Annual Recertification',
    status: 'In progress',
    due: 'Due Apr 18',
  },
  {
    household: 'Vasquez Household',
    property: 'Cascade Heights · Unit 212',
    certification: 'Move-in Certification',
    status: 'Scheduled',
    due: 'Move-in Mar 28',
  },
  {
    household: 'Kim Household',
    property: 'Riverwalk Flats · Unit 118',
    certification: 'Interim Review',
    status: 'Documents pending',
    due: 'Requested Mar 10',
  },
]

function StatusBadge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action ? <div className="panel-action">{action}</div> : null}
      </header>
      <div className="panel-body">{children}</div>
    </section>
  )
}

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('properties')

  const activeItem = useMemo(
    () => navItems.find((item) => item.id === activeSection) ?? navItems[0],
    [activeSection],
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">RM</div>
          <div className="brand-copy">
            <span>RentManager</span>
            <small>Modern Housing CRM</small>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <div className="nav-label">{item.label}</div>
              <div className="nav-meta">
                <span>{item.metric}</span>
              </div>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <h3>Workflow parity check</h3>
          <p>
            Walk through property → unit → program → household → certification → transactions → reports →
            compliance to validate end-to-end parity with the FastAPI services.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <h1>{activeItem.label}</h1>
            <p>{activeItem.description}</p>
          </div>
          <div className="workspace-actions">
            <input className="search" placeholder="Search records" type="search" />
            <button className="ghost-btn">Filter</button>
            <button className="primary-btn">New record</button>
          </div>
        </header>

        <div className="workspace-content">{renderSection(activeSection)}</div>
      </main>
    </div>
  )
}

function renderSection(section: SectionId): ReactNode {
  switch (section) {
    case 'properties':
      return (
        <>
          <Panel title="Portfolio snapshot" subtitle="Live data synchronized from the properties service.">
            <div className="summary-grid">
              <SummaryCard label="Portfolio Occupancy" value="96.2%" delta="+1.1%" trend="up" />
              <SummaryCard label="Average AMI" value="63%" delta="Stable" />
              <SummaryCard label="Units Available" value="17" delta="5 ready · 7 notice" />
            </div>
          </Panel>

          <Panel
            title="Active properties"
            subtitle="Click a property to drill into linked units, households, and certifications."
            action={<button className="ghost-btn">Export list</button>}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Code</th>
                  <th>Address</th>
                  <th>AMI</th>
                  <th>Occupancy</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {propertyPortfolio.map((property) => (
                  <tr key={property.code}>
                    <td>{property.name}</td>
                    <td>{property.code}</td>
                    <td>{property.address}</td>
                    <td>{property.ami}</td>
                    <td>{property.occupancy}</td>
                    <td>
                      <StatusBadge tone={property.status === 'Leasing' ? 'info' : 'success'}>{property.status}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )
    case 'units':
      return (
        <>
          <Panel title="Unit readiness" subtitle="Keep unit status aligned with the turn board.">
            <div className="summary-grid unit-metrics">
              {unitMetrics.map((metric) => (
                <div key={metric.label} className="metric-tile">
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <StatusBadge tone={metric.tone}>units</StatusBadge>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Upcoming turns"
            subtitle="Coordinate maintenance and marketing from a single view."
            action={<button className="ghost-btn">View turn board</button>}
          >
            <div className="timeline">
              <TimelineItem
                title="Unit 304 · Harbor Point"
                description="Final clean scheduled · ready Mar 21"
                badge={<StatusBadge tone="success">Ready</StatusBadge>}
              />
              <TimelineItem
                title="Unit 512 · Cascade Heights"
                description="Resident notice · move-out Mar 29"
                badge={<StatusBadge tone="warning">Notice</StatusBadge>}
              />
              <TimelineItem
                title="Unit 118 · Riverwalk Flats"
                description="Cabinet install in progress"
                badge={<StatusBadge tone="info">Turn</StatusBadge>}
              />
            </div>
          </Panel>
        </>
      )
    case 'programs':
      return (
        <>
          <Panel
            title="Program catalogue"
            subtitle="Subsidy programs drive rent limits, income bands, and compliance checks."
            action={<button className="primary-btn">Add program</button>}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>AMI band</th>
                  <th>Rent limit</th>
                  <th>Households</th>
                </tr>
              </thead>
              <tbody>
                {programCatalog.map((program) => (
                  <tr key={program.name}>
                    <td>{program.name}</td>
                    <td>{program.ami}</td>
                    <td>{program.rentLimit}</td>
                    <td>{program.households}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Recent updates" subtitle="Stay ahead of HUD and state-level updates.">
            <div className="update-list">
              <UpdateItem
                title="HUD released FY24 income limits"
                description="Sync new limits before generating April certifications."
              />
              <UpdateItem
                title="LIHTC rent increase window"
                description="Review 5% max increase guidance and adjust schedule."
              />
              <UpdateItem
                title="Workforce program documentation refresh"
                description="Upload revised resident affidavit template."
              />
            </div>
          </Panel>
        </>
      )
    case 'households':
      return (
        <>
          <Panel
            title="Household engagement"
            subtitle="Track certifications and resident touchpoints from the household service."
            action={<button className="primary-btn">Add household</button>}
          >
            <div className="summary-grid">
              <SummaryCard label="Active households" value="281" delta="+6 new move-ins" />
              <SummaryCard label="Certifications in progress" value="14" delta="8 due within 30 days" />
              <SummaryCard label="Residents" value="734" delta="Including 128 minors" />
            </div>
          </Panel>

          <Panel title="Certification timeline" subtitle="Validate unit, program, and income details before submission.">
            <div className="timeline">
              {householdTimeline.map((item) => (
                <TimelineItem
                  key={item.household}
                  title={`${item.household} · ${item.certification}`}
                  description={`${item.property} · ${item.due}`}
                  badge={<StatusBadge tone="info">{item.status}</StatusBadge>}
                />
              ))}
            </div>
          </Panel>
        </>
      )
    case 'compliance':
      return (
        <>
          <Panel
            title="Alerts & findings"
            subtitle="Blend automated alerts with manual findings for a complete compliance view."
            action={<button className="ghost-btn">Bulk actions</button>}
          >
            <div className="alert-grid">
              {complianceAlerts.map((alert) => (
                <div key={alert.title} className="alert-card">
                  <header>
                    <StatusBadge tone={alert.severity}>{alert.title}</StatusBadge>
                    <span>{alert.household}</span>
                  </header>
                  <p>{alert.due}</p>
                  <button className="ghost-btn small">{alert.action}</button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Resolution queue" subtitle="Track steps to clear findings across agencies.">
            <div className="timeline">
              <TimelineItem
                title="Finding #542 · Income verification"
                description="Awaiting third-party verification · assigned to Compliance Team"
                badge={<StatusBadge tone="warning">Pending</StatusBadge>}
              />
              <TimelineItem
                title="Finding #537 · File completeness"
                description="Docs uploaded Mar 12 · pending QA review"
                badge={<StatusBadge tone="info">Review</StatusBadge>}
              />
              <TimelineItem
                title="Finding #533 · Missing signature"
                description="Resident re-signed addendum Mar 8"
                badge={<StatusBadge tone="success">Resolved</StatusBadge>}
              />
            </div>
          </Panel>
        </>
      )
    case 'reports':
      return (
        <>
          <Panel
            title="Executive dashboards"
            subtitle="Use portfolio filters and date ranges that map directly to the reporting API."
            action={<button className="ghost-btn">Adjust filters</button>}
          >
            <div className="summary-grid">
              {reportCards.map((card) => (
                <SummaryCard key={card.label} label={card.label} value={card.value} delta={card.delta} meta={card.meta} />
              ))}
            </div>
          </Panel>

          <Panel title="Insights" subtitle="Drill into trends using drill-through to the transaction ledger.">
            <div className="insights-grid">
              <InsightCard
                title="Occupancy trend"
                description="Occupancy has improved 1.1% MoM with Harbor Point leading gains."
              />
              <InsightCard
                title="Expense variance"
                description="Maintenance expenses are 3.4% below budget, driven by Riverwalk contract savings."
              />
              <InsightCard
                title="NOI outlook"
                description="Projected NOI remains on track to exceed quarterly targets by 5%."
              />
            </div>
          </Panel>
        </>
      )
    case 'transactions':
      return (
        <>
          <Panel
            title="Ledger activity"
            subtitle="Filter by property and date before syncing with the reporting API."
            action={<button className="ghost-btn">Download CSV</button>}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Property</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="numeric">Amount</th>
                </tr>
              </thead>
              <tbody>
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.date}</td>
                    <td>{entry.property}</td>
                    <td>{entry.category}</td>
                    <td>{entry.description}</td>
                    <td className={`numeric ${entry.amount.startsWith('-') ? 'negative' : 'positive'}`}>{entry.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Workflow guidance" subtitle="Link ledger entries back to reporting and compliance tasks.">
            <div className="update-list">
              <UpdateItem
                title="Reconcile March rent roll"
                description="Verify ledger entries with rent roll report before closing the period."
              />
              <UpdateItem
                title="Tag compliance-related expenses"
                description="Flag unit rehab costs that should flow into compliance remediation."
              />
            </div>
          </Panel>
        </>
      )
    default:
      return null
  }
}

function SummaryCard({
  label,
  value,
  delta,
  trend,
  meta,
}: {
  label: string
  value: string
  delta: string
  trend?: 'up' | 'down'
  meta?: string
}) {
  return (
    <article className="summary-card">
      <header>
        <span>{label}</span>
        {trend ? <span className={`trend ${trend}`}>{delta}</span> : <span className="trend neutral">{delta}</span>}
      </header>
      <strong>{value}</strong>
      {meta ? <small>{meta}</small> : null}
    </article>
  )
}

function TimelineItem({ title, description, badge }: { title: string; description: string; badge?: ReactNode }) {
  return (
    <div className="timeline-item">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {badge ? <div className="timeline-badge">{badge}</div> : null}
    </div>
  )
}

function UpdateItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="update-item">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function InsightCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="insight-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default App
