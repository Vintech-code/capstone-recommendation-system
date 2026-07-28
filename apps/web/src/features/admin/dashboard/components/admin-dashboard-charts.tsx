import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  activityByRange,
  assessmentStates,
  recommendationStates,
} from '@/features/admin/dashboard/data/mock-admin-dashboard'

type ActivityRange = keyof typeof activityByRange

const series = [
  { key: 'results', label: 'Official results', color: 'var(--primary)' },
  { key: 'assessments', label: 'Assessments', color: 'var(--chart-blue)' },
  {
    key: 'recommendations',
    label: 'Recommendations',
    color: 'var(--chart-teal)',
  },
] as const

const tooltipStyle = {
  background: 'var(--background)',
  border: 'none',
  borderRadius: '0.75rem',
  boxShadow: '0 1px 3px var(--shadow-brand-soft)',
  color: 'var(--foreground)',
  fontSize: '0.75rem',
}

function MetricSparkline({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  const points = data.map((value, index) => ({ index, value }))

  return (
    <div className="mt-2 h-8 min-w-0" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fill="transparent"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function OperationalActivityChart({ range }: { range: ActivityRange }) {
  return (
    <section
      aria-labelledby="operational-activity-title"
      className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Workflow activity
          </p>
          <h2
            id="operational-activity-title"
            className="mt-1 text-lg font-extrabold"
          >
            Operational activity
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Records handled across the main guidance workflows.
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-bold">
          {series.map((item) => (
            <li key={item.key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mt-6 h-64 min-w-0"
        aria-label="Operational activity chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={activityByRange[range]}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="results-fill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.22}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            />
            <Tooltip cursor={{ stroke: 'var(--border)' }} contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="results"
              name="Official results"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#results-fill)"
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="assessments"
              name="Assessments"
              stroke="var(--chart-blue)"
              strokeWidth={2}
              fill="transparent"
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="recommendations"
              name="Recommendations"
              stroke="var(--chart-teal)"
              strokeWidth={2}
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function AssessmentQueueChart() {
  const total = assessmentStates.reduce((sum, state) => sum + state.value, 0)

  return (
    <section
      aria-labelledby="assessment-queue-title"
      className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Session overview
      </p>
      <h2 id="assessment-queue-title" className="mt-1 text-lg font-extrabold">
        Assessment queue
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Current session states for Admin review.
      </p>

      <div className="relative mx-auto mt-5 h-48 max-w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={assessmentStates}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {assessmentStates.map((state) => (
                <Cell key={state.name} fill={state.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <strong className="text-3xl font-extrabold tracking-[-0.05em]">
            {total}
          </strong>
          <span className="text-[11px] text-muted-foreground">Sessions</span>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
        {assessmentStates.map((state) => (
          <li
            key={state.name}
            className="flex items-center justify-between gap-4 rounded-xl bg-secondary/60 px-3 py-2.5 text-xs"
          >
            <span className="flex items-center gap-2 font-bold">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: state.color }}
              />
              {state.name}
            </span>
            <strong>{state.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

function RecommendationReviewChart() {
  const total = recommendationStates.reduce(
    (sum, state) => sum + state.value,
    0,
  )
  const reviewed = recommendationStates[0].value

  return (
    <section
      aria-labelledby="recommendation-review-title"
      className="rounded-2xl bg-background p-5 shadow-sm sm:p-6"
    >
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        Guidance overview
      </p>
      <h2
        id="recommendation-review-title"
        className="mt-1 text-lg font-extrabold"
      >
        Recommendation review
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Distribution of the current review set.
      </p>

      <div className="relative mx-auto mt-5 h-48 max-w-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={recommendationStates}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="58%"
              innerRadius={62}
              outerRadius={78}
              startAngle={180}
              endAngle={0}
              paddingAngle={3}
              stroke="none"
            >
              {recommendationStates.map((state) => (
                <Cell key={state.name} fill={state.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center">
          <strong className="text-2xl font-extrabold tracking-[-0.05em]">
            {reviewed}/{total}
          </strong>
          <span className="text-[11px] text-muted-foreground">Reviewed</span>
        </div>
      </div>

      <ul className="space-y-2">
        {recommendationStates.map((state) => (
          <li
            key={state.name}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex items-center gap-2 font-bold">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: state.color }}
              />
              {state.name}
            </span>
            <strong>{state.value}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AdminDashboardCharts({ range }: { range: ActivityRange }) {
  return (
    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(17rem,.7fr)_minmax(17rem,.7fr)]">
      <OperationalActivityChart range={range} />
      <AssessmentQueueChart />
      <RecommendationReviewChart />
    </div>
  )
}

export {
  AdminDashboardCharts,
  AssessmentQueueChart,
  MetricSparkline,
  OperationalActivityChart,
  RecommendationReviewChart,
}
export type { ActivityRange }
