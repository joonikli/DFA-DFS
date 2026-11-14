// Chart building blocks matching the Figma "Linear graph" (node 1113:5871), the survey
// donut ("Pie chart / Bar chart") and the percentage bars on "Survey specific".
// Colors come from the Figma frames (src/tokens); every chart has a hover tooltip
// and a text legend/labels so identity never relies on color alone.
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Sparkles } from 'lucide-react'
import './Charts.css'

// Survey answer palette, in the fixed order used by the Figma donut.
export const SERIES = ['#4b50e0', '#92beff', '#ff79bc', '#d22c7f', '#b2e083', '#2b7b64']
// Percentage-bar palette from "Survey specific" Q #1.
export const BAR_SERIES = ['#4b50e0', '#ff79bc', '#d22c7f', '#2b7b64', '#92beff', '#bb7a34']

const axisTick = { fill: 'var(--neutral-darker-gray)', fontSize: 12, fontFamily: 'Inter' }

function ChartTooltip({ active, payload, label, unit = '', labelFor }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="chart-tip">
      <p className="chart-tip__label">{labelFor ? labelFor(p.payload) : label}</p>
      <p className="chart-tip__value">
        <strong>{p.value}</strong> {unit}
      </p>
    </div>
  )
}

/** Single-series line with soft area fill + dots (dashboard "Average hours over time", survey response rate). */
export function LineTrend({ data, xKey, yKey, height = 220, unit = '', yDomain, yTicks }) {
  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id={`fill-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6078f1" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#6078f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--neutral-gray)" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={axisTick} dy={8} />
          <YAxis tickLine={false} axisLine={false} tick={axisTick} domain={yDomain} ticks={yTicks} width={44} />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: 'var(--neutral-dark-gray)', strokeDasharray: '3 3' }} />
          <Area
            type="linear"
            dataKey={yKey}
            stroke="#6078f1"
            strokeWidth={2}
            fill={`url(#fill-${yKey})`}
            dot={{ r: 5, fill: '#cdd2fd', stroke: '#6078f1', strokeWidth: 1.5 }}
            activeDot={{ r: 7, fill: '#6078f1', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * Survey choice results as horizontal percentage bars ("View: Bar graph").
 * The most-chosen option gets the "Most popular" badge.
 */
export function ChoiceBars({ options, counts }) {
  const total = counts.reduce((a, b) => a + b, 0) || 1
  const top = Math.max(...counts)
  return (
    <ul className="choice-bars">
      {options.map((opt, i) => {
        const pct = Math.round((counts[i] / total) * 100)
        return (
          <li key={opt} className="choice-bars__row" title={`${opt}: ${counts[i]} responses (${pct}%)`}>
            <div className="choice-bars__track">
              <div className="choice-bars__fill" style={{ width: `max(${pct}%, 88px)`, background: BAR_SERIES[i % BAR_SERIES.length] }}>
                {pct}%
              </div>
              <span className="choice-bars__label text-label-2">{opt}</span>
            </div>
            {counts[i] === top && top > 0 && (
              <span className="most-popular text-label-2">
                <Sparkles size={13} strokeWidth={2} aria-hidden="true" /> Most popular
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Donut + legend with a Pie chart / Bar chart toggle (Survey specific Q #3). */
export function DonutChart({ options, counts, unit = 'volunteers' }) {
  const [mode, setMode] = useState('pie')
  const data = options.map((name, i) => ({ name, value: counts[i], color: SERIES[i % SERIES.length] }))
  const total = counts.reduce((a, b) => a + b, 0)

  return (
    <div className="donut">
      <div className="donut__toggle" role="radiogroup" aria-label="Chart type">
        {[
          ['pie', 'Pie chart'],
          ['bar', 'Bar chart'],
        ].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} className={mode === v ? 'is-on' : ''} onClick={() => setMode(v)}>
            {l}
          </button>
        ))}
      </div>
      <div className="donut__body">
        <div className="donut__chart">
          <ResponsiveContainer width="100%" height="100%">
            {mode === 'pie' ? (
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="100%" stroke="#fff" strokeWidth={2} startAngle={90} endAngle={-270} isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit={unit} labelFor={(p) => p.name} />} />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke="var(--neutral-gray)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ ...axisTick, fontSize: 11 }} interval={0} />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} />
                <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ fill: 'var(--neutral-very-light-gray)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <ul className="donut__legend">
          {data.map((d) => (
            <li key={d.name} className="text-body">
              <span className="donut__swatch" style={{ background: d.color }} aria-hidden="true" />
              <span className="donut__name">{d.name}</span>
              <span className="donut__count">
                {d.value} · {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
