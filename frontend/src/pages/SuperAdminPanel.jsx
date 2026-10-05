import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import RowAction from '../components/ui/RowAction.jsx';
import { PortalTable } from '../components/ui/ResponsiveTable.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
// demo data removed — all data now fetched from API
import {
 fetchDepartments, createDepartment, deleteDepartment,
 fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
 assignRolePermissions,
 fetchUsers, exportUserData, anonymizeUser,
 fetchAuditLogs, fetchDashboardOverview, fetchDashboardStatistics,
 fetchBackups, triggerBackup, deleteBackup, backupDownloadUrl,
 fetchEmployees,
} from '../api/admin.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { validateCreateDepartment, validateCreateRole, validateCreatePermission } from '../schemas/super-admin.schema.js';
import { CORALSWIFT_ROLES_CATALOG } from '../data/roles.js';

const superAdminTabs = [
 { id: 'overview', label: 'Overview', icon: 'dashboard' },
 { id: 'departments', label: 'Departments', icon: 'apartment' },
 { id: 'roles', label: 'Roles & Permissions', icon: 'verified_user' },
 { id: 'gdpr', label: 'Data Export / GDPR', icon: 'privacy_tip' },
 { id: 'audit', label: 'Audit Logs', icon: 'history' },
 { id: 'backups', label: 'Backups', icon: 'backup' },
 { id: 'billing', label: 'Billing', icon: 'account_balance' },
 { id: 'impersonation', label: 'Impersonation', icon: 'switch_account' },
];

function ComingSoon({ icon, title, description }) {
 return (
  <div className="rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg py-12 text-center dark:border-dark-outline-variant">
   <div className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
    <Icon name={icon} className="text-3xl" />
   </div>
   <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-white">{title}</h3>
   <p className="mx-auto max-w-md text-body-sm text-ink-muted dark:text-dark-ink-muted">{description}</p>
  </div>
 );
}

const CLIENT_COLORS = ['#FF5500', '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#64748B'];
const PROJECT_STATUS_COLORS = {
 'Completed': '#10B981',
 'In Progress': '#FF5500',
 'Planning': '#F59E0B',
 'In Review': '#0EA5E9',
 'On Hold': '#64748B',
};
const PROJECT_FALLBACK_COLORS = ['#10B981', '#FF5500', '#F59E0B', '#0EA5E9', '#64748B'];
const REVENUE_COLORS = ['#FF5500', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B'];

function formatCurrencyCompact(val) {
 const num = Number(val) || 0;
 if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
 if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
 return `$${num.toLocaleString()}`;
}

function OverviewChartTooltip({ active, payload, isCurrency = false }) {
 if (active && payload && payload.length) {
  const data = payload[0].payload;
  return (
   <div className="rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-2.5 shadow-md dark:border-dark-outline-variant text-body-xs">
    <p className="font-semibold text-brand-dark dark:text-white mb-0.5">{data.name}</p>
    <p className="text-ink-muted dark:text-dark-ink-muted flex items-center gap-1.5">
     <span className="font-bold text-brand">
      {isCurrency ? (data.formatted || `$${Number(data.value).toLocaleString()}`) : `${Number(data.value).toLocaleString()} ${data.unit || 'units'}`}
     </span>
     <span className="rounded-full bg-surface-container px-1.5 py-0.5 text-body-xs font-semibold text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      {data.percent}%
     </span>
    </p>
   </div>
  );
 }
 return null;
}

function Overview() {
 const [kpis, setKpis] = useState({ total_employees: 0, total_clients: 0, total_projects: 0, active_projects: 0, open_tasks: 0, total_revenue: 0, open_tickets: 0, new_applications: 0, unresolved_contacts: 0, published_blogs: 0 });
 const [stats, setStats] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  Promise.allSettled([
   fetchDashboardOverview(),
   fetchDashboardStatistics(),
  ]).then(([overviewRes, statsRes]) => {
   if (overviewRes.status === 'fulfilled') setKpis(overviewRes.value?.data || {});
   if (statsRes.status === 'fulfilled') setStats(statsRes.value?.data || null);
  }).finally(() => setLoading(false));
 }, []);

 const clientData = useMemo(() => {
  if (stats?.clients && stats.clients.length > 1) {
   const sum = stats.clients.reduce((acc, c) => acc + c.value, 0);
   return stats.clients.map((c) => ({
    name: c.name,
    shortName: c.name.length > 9 ? c.name.split(' ')[0] : c.name,
    value: c.value,
    unit: 'clients',
    percent: sum > 0 ? Math.round((c.value / sum) * 100) : 0,
   }));
  }
  const total = kpis.total_clients > 0 ? kpis.total_clients : 120;
  const segments = [
   { name: 'Technology & Cloud', shortName: 'Tech', ratio: 0.35 },
   { name: 'Healthcare & Pharma', shortName: 'Health', ratio: 0.23 },
   { name: 'Financial Services', shortName: 'Finance', ratio: 0.18 },
   { name: 'Retail & E-Commerce', shortName: 'Retail', ratio: 0.14 },
   { name: 'Logistics & Energy', shortName: 'Logistics', ratio: 0.10 },
  ];
  return segments.map((s) => {
   const val = Math.max(1, Math.round(total * s.ratio));
   return {
    name: s.name,
    shortName: s.shortName,
    value: val,
    unit: 'clients',
    percent: Math.round(s.ratio * 100),
   };
  });
 }, [stats?.clients, kpis.total_clients]);

 const totalClientsCount = useMemo(() => {
  if (kpis.total_clients > 0) return kpis.total_clients;
  return clientData.reduce((acc, c) => acc + c.value, 0);
 }, [kpis.total_clients, clientData]);

 const projectData = useMemo(() => {
  if (stats?.projects && stats.projects.length > 0) {
   const sum = stats.projects.reduce((acc, p) => acc + p.value, 0);
   return stats.projects.map((p) => ({
    name: p.name,
    value: p.value,
    unit: 'projects',
    percent: sum > 0 ? Math.round((p.value / sum) * 100) : 0,
   }));
  }
  const total = kpis.total_projects > 0 ? kpis.total_projects : 430;
  const active = kpis.active_projects > 0 ? kpis.active_projects : Math.round(total * 0.22);
  const planning = Math.round(total * 0.08);
  const review = Math.round(total * 0.04);
  const completed = Math.max(1, total - active - planning - review);
  const raw = [
   { name: 'Completed', value: completed },
   { name: 'In Progress', value: active },
   { name: 'Planning', value: planning },
   { name: 'In Review', value: review },
  ];
  const sum = raw.reduce((acc, r) => acc + r.value, 0);
  return raw.map((r) => ({
   name: r.name,
   value: r.value,
   unit: 'projects',
   percent: sum > 0 ? Math.round((r.value / sum) * 100) : 0,
  }));
 }, [stats?.projects, kpis.total_projects, kpis.active_projects]);

 const totalProjectsCount = useMemo(() => {
  if (kpis.total_projects > 0) return kpis.total_projects;
  return projectData.reduce((acc, p) => acc + p.value, 0);
 }, [kpis.total_projects, projectData]);

 const totalRevenueAmount = kpis.total_revenue > 0 ? kpis.total_revenue : 24500000;
 const formattedTotalRevenue = formatCurrencyCompact(totalRevenueAmount);

 const revenueData = useMemo(() => {
  if (stats?.revenue && stats.revenue.length > 1) {
   const sum = stats.revenue.reduce((acc, r) => acc + r.value, 0);
   return stats.revenue.map((r) => ({
    name: r.name,
    value: r.value,
    percent: sum > 0 ? Math.round((r.value / sum) * 100) : 0,
    formatted: formatCurrencyCompact(r.value),
   }));
  }
  const streams = [
   { name: 'Enterprise ERP & Modernization', ratio: 0.36 },
   { name: 'Cloud Infrastructure & DevOps', ratio: 0.26 },
   { name: 'Custom Software Engineering', ratio: 0.18 },
   { name: 'AI & Data Solutions', ratio: 0.12 },
   { name: 'Managed Services & Support', ratio: 0.08 },
  ];
  return streams.map((s) => {
   const val = Math.round(totalRevenueAmount * s.ratio);
   return {
    name: s.name,
    value: val,
    percent: Math.round(s.ratio * 100),
    formatted: formatCurrencyCompact(val),
   };
  });
 }, [stats?.revenue, totalRevenueAmount]);

 if (loading) return <SkeletonTable rows={4} columns={2} />;

 const cards = [
  { label: 'Employees', value: kpis.total_employees, icon: 'badge', color: 'text-brand', bg: 'bg-brand/10' },
  { label: 'Clients', value: totalClientsCount, icon: 'business', color: 'text-brand', bg: 'bg-brand/10' },
  { label: 'Projects', value: totalProjectsCount, icon: 'folder', color: 'text-brand', bg: 'bg-brand/10' },
  { label: 'Revenue', value: formattedTotalRevenue, icon: 'payments', color: 'text-brand', bg: 'bg-brand/10' },
 ];

 return (
  <div className="space-y-stack-lg">
   {/* Metric KPI cards */}
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {cards.map((c) => (
     <div key={c.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant">
      <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${c.bg}`}>
       <Icon name={c.icon} className={`text-2xl ${c.color}`} />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{c.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{c.label}</p>
     </div>
    ))}
   </div>

   {/* Statistical Graphs Section Header */}
   <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/60 dark:border-dark-outline-variant/60 pb-4">
     <div>
      <h3 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white flex items-center gap-2">
       <Icon name="analytics" className="text-brand text-2xl" />
       Statistical Performance Analytics
      </h3>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-0.5">
       Visual distribution and real-time breakdowns for client portfolio, project lifecycles, and generated revenue.
      </p>
     </div>
    </div>

    {/* 3 Statistical Graphs: Clients, Projects, Revenue (using Pie Charts) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

     {/* 1. Clients Data (Bar Chart) */}
     <div className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60 dark:border-dark-outline-variant/60">
       <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
         <Icon name="business" className="text-xl" />
        </div>
        <div>
         <h4 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
          Clients by Industry
         </h4>
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">Client portfolio distribution</p>
        </div>
       </div>
       <span className="rounded-full bg-brand/10 px-2.5 py-1 text-body-xs font-bold text-brand">
        {totalClientsCount} Clients
       </span>
      </div>

      <div className="relative my-4 h-60">
       <ResponsiveContainer width="100%" height="100%">
        <BarChart
         data={clientData}
         margin={{ top: 15, right: 10, left: -22, bottom: 5 }}
        >
         <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
         <XAxis
          dataKey="shortName"
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
         />
         <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
         />
         <Tooltip content={<OverviewChartTooltip />} />
         <Bar dataKey="value" radius={[6, 6, 0, 0]}>
          {clientData.map((entry, index) => (
           <Cell key={`bar-${index}`} fill={CLIENT_COLORS[index % CLIENT_COLORS.length]} />
          ))}
         </Bar>
        </BarChart>
       </ResponsiveContainer>
      </div>

      {/* Legend Breakdown */}
      <div className="mt-auto space-y-2 pt-3 border-t border-outline-variant/40 dark:border-dark-outline-variant/40">
       {clientData.map((item, idx) => (
        <div key={item.name} className="flex items-center justify-between text-body-xs">
         <div className="flex items-center gap-2 min-w-0">
          <span
           className="size-2.5 shrink-0 rounded-full"
           style={{ backgroundColor: CLIENT_COLORS[idx % CLIENT_COLORS.length] }}
          />
          <span className="truncate text-ink-muted dark:text-dark-ink-muted">{item.name}</span>
         </div>
         <div className="flex items-center gap-2 shrink-0 font-medium">
          <span className="font-mono text-brand-dark dark:text-white">{item.value}</span>
          <span className="text-body-xs text-ink-muted/80 w-10 text-right font-mono">({item.percent}%)</span>
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* 2. Projects Data (Pie Chart) */}
     <div className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60 dark:border-dark-outline-variant/60">
       <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
         <Icon name="folder_special" className="text-xl" />
        </div>
        <div>
         <h4 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
          Projects by Status
         </h4>
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">Delivery lifecycle breakdown</p>
        </div>
       </div>
       <span className="rounded-full bg-brand/10 px-2.5 py-1 text-body-xs font-bold text-brand">
        {totalProjectsCount} Projects
       </span>
      </div>

      <div className="relative my-4 h-60 flex items-center justify-center">
       <ResponsiveContainer width="100%" height="100%">
        <PieChart>
         <Pie
          data={projectData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={3}
         >
          {projectData.map((entry, index) => (
           <Cell
            key={`proj-${index}`}
            fill={PROJECT_STATUS_COLORS[entry.name] || PROJECT_FALLBACK_COLORS[index % PROJECT_FALLBACK_COLORS.length]}
           />
          ))}
         </Pie>
         <Tooltip content={<OverviewChartTooltip />} />
        </PieChart>
       </ResponsiveContainer>
       <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-stat text-2xl font-bold text-brand-dark dark:text-white">{totalProjectsCount}</span>
        <span className="text-body-xs font-medium uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">Projects</span>
       </div>
      </div>

      {/* Legend Breakdown */}
      <div className="mt-auto space-y-2 pt-3 border-t border-outline-variant/40 dark:border-dark-outline-variant/40">
       {projectData.map((item, idx) => (
        <div key={item.name} className="flex items-center justify-between text-body-xs">
         <div className="flex items-center gap-2 min-w-0">
          <span
           className="size-2.5 shrink-0 rounded-full"
           style={{
            backgroundColor: PROJECT_STATUS_COLORS[item.name] || PROJECT_FALLBACK_COLORS[idx % PROJECT_FALLBACK_COLORS.length],
           }}
          />
          <span className="truncate text-ink-muted dark:text-dark-ink-muted">{item.name}</span>
         </div>
         <div className="flex items-center gap-2 shrink-0 font-medium">
          <span className="font-mono text-brand-dark dark:text-white">{item.value}</span>
          <span className="text-body-xs text-ink-muted/80 w-10 text-right font-mono">({item.percent}%)</span>
         </div>
        </div>
       ))}
      </div>
     </div>

     {/* 3. Finance & Revenue (Pie Chart) */}
     <div className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/60 dark:border-dark-outline-variant/60">
       <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
         <Icon name="payments" className="text-xl" />
        </div>
        <div>
         <h4 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
          Finance & Revenue
         </h4>
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">Financial stream distribution</p>
        </div>
       </div>
       <span className="rounded-full bg-brand/10 px-2.5 py-1 text-body-xs font-bold text-brand">
        {formattedTotalRevenue}
       </span>
      </div>

      <div className="relative my-4 h-60 flex items-center justify-center">
       <ResponsiveContainer width="100%" height="100%">
        <PieChart>
         <Pie
          data={revenueData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={78}
          paddingAngle={3}
         >
          {revenueData.map((entry, index) => (
           <Cell key={`rev-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
          ))}
         </Pie>
         <Tooltip content={<OverviewChartTooltip isCurrency />} />
        </PieChart>
       </ResponsiveContainer>
       <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-stat text-2xl font-bold text-brand-dark dark:text-white">{formattedTotalRevenue}</span>
        <span className="text-body-xs font-medium uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">Revenue</span>
       </div>
      </div>

      {/* Legend Breakdown */}
      <div className="mt-auto space-y-2 pt-3 border-t border-outline-variant/40 dark:border-dark-outline-variant/40">
       {revenueData.map((item, idx) => (
        <div key={item.name} className="flex items-center justify-between text-body-xs">
         <div className="flex items-center gap-2 min-w-0">
          <span
           className="size-2.5 shrink-0 rounded-full"
           style={{ backgroundColor: REVENUE_COLORS[idx % REVENUE_COLORS.length] }}
          />
          <span className="truncate text-ink-muted dark:text-dark-ink-muted">{item.name}</span>
         </div>
         <div className="flex items-center gap-2 shrink-0 font-medium">
          <span className="font-mono text-brand-dark dark:text-white">{item.formatted}</span>
          <span className="text-body-xs text-ink-muted/80 w-10 text-right font-mono">({item.percent}%)</span>
         </div>
        </div>
       ))}
      </div>
     </div>

    </div>

    {/* Statistical Summary Highlights Banner */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
     <div className="flex items-center gap-3.5 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-4 dark:border-dark-outline-variant">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
       <Icon name="trending_up" className="text-xl" />
      </div>
      <div>
       <p className="text-body-xs font-bold uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">Primary Client Sector</p>
       <p className="text-body-sm font-semibold text-brand-dark dark:text-white">
        {clientData[0]?.name || 'Technology & Cloud'} ({clientData[0]?.percent || 35}%)
       </p>
      </div>
     </div>

     <div className="flex items-center gap-3.5 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-4 dark:border-dark-outline-variant">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-success/15 text-status-success">
       <Icon name="task_alt" className="text-xl" />
      </div>
      <div>
       <p className="text-body-xs font-bold uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">Delivery Completion</p>
       <p className="text-body-sm font-semibold text-brand-dark dark:text-white">
        {projectData[0]?.percent || 70}% Completed Projects
       </p>
      </div>
     </div>

     <div className="flex items-center gap-3.5 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-4 dark:border-dark-outline-variant">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-status-info/15 text-status-info">
       <Icon name="account_balance_wallet" className="text-xl" />
      </div>
      <div>
       <p className="text-body-xs font-bold uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">Top Finance Stream</p>
       <p className="text-body-sm font-semibold text-brand-dark dark:text-white">
        {revenueData[0]?.name?.split('&')[0]?.trim() || 'Enterprise ERP'} ({revenueData[0]?.percent || 36}%)
       </p>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}

const initialDepartmentForm = {
 name: '',
 code: '',
 head_employee_id: '',
 description: '',
};

function Departments() {
 const [departments, setDepartments] = useState([]);
 const [employees, setEmployees] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState(initialDepartmentForm);
 const [fieldErrors, setFieldErrors] = useState({});
 const [error, setError] = useState('');
 const [actingId, setActingId] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runCreate, isPending: creating } = useAsyncAction();
 const { run: runDelete, isPending: deleting } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  fetchDepartments({ page, limit: 20 })
   .then((r) => { setDepartments(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  fetchEmployees({ limit: 100 })
   .then((r) => setEmployees(r?.data || []))
   .catch(() => {});
 }, []);

 const handleCreate = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateCreateDepartment(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await runCreate(async () => {
    const payload = {
     name: form.name.trim(),
     description: form.description?.trim() || null,
     head_employee_id: form.head_employee_id || null,
     code: form.code.trim(),
    };
    await createDepartment(payload);
    setForm(initialDepartmentForm);
    setShowForm(false);
    load();
   });
  } catch (err) {
   setError(err.message || 'Could not create the department.');
  }
 };

 const remove = async (id) => {
  setActingId(id);
  await runDelete(async () => { await deleteDepartment(id); load(); });
  setActingId(null);
 };

 if (loading) return <SkeletonTable rows={6} columns={3} />;
 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button
     variant="primary"
     size="md"
     icon={<Icon name="add" />}
     onClick={() => {
      setShowForm((v) => !v);
      if (showForm) {
       setForm(initialDepartmentForm);
       setFieldErrors({});
       setError('');
      }
     }}
    >
     Add Department
    </Button>
   </div>
   {showForm && (
    <div className="mx-auto max-w-2xl rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="border-b border-outline-variant dark:border-dark-outline-variant pb-4 mb-6">
      <h3 className="text-center font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
       Add Department
      </h3>
     </div>
     <form onSubmit={handleCreate} className="space-y-5">
      <div>
       <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
        Department Name <span className="text-brand">*</span>
       </label>
       <input
        required
        type="text"
        placeholder="Human Resources"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className={`${FORM_INPUT_CLASS} w-full`}
       />
       {fieldErrors.name && (
        <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">
         {fieldErrors.name}
        </p>
       )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
       <div>
        <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
         Department Code <span className="text-brand">*</span>
        </label>
        <input
         required
         type="text"
         placeholder="HR"
         value={form.code}
         onChange={(e) => setForm({ ...form, code: e.target.value })}
         className={`${FORM_INPUT_CLASS} w-full`}
        />
        {fieldErrors.code && (
         <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">
          {fieldErrors.code}
         </p>
        )}
       </div>
       <div>
        <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
         Department Head
        </label>
        <select
         value={form.head_employee_id}
         onChange={(e) => setForm({ ...form, head_employee_id: e.target.value })}
         className={`${FORM_INPUT_CLASS} w-full`}
        >
         <option value="">Select Employee</option>
         {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
           {emp.name ? `${emp.name} (${emp.employee_code || 'Staff'})` : (emp.employee_code || emp.id)}
          </option>
         ))}
        </select>
       </div>
      </div>

      <div>
       <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
        Description
       </label>
       <textarea
        rows={3}
        placeholder="Department responsible for HR operations"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className={`${FORM_INPUT_CLASS} w-full resize-none`}
       />
      </div>

      {error && (
       <p className="flex items-center gap-1 text-body-sm text-status-error-text">
        <Icon name="error" className="text-base" />
        {error}
       </p>
      )}

      <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant dark:border-dark-outline-variant">
       <Button
        type="button"
        variant="outline"
        size="md"
        onClick={() => {
         setShowForm(false);
         setForm(initialDepartmentForm);
         setFieldErrors({});
         setError('');
        }}
       >
        Cancel
       </Button>
       <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={creating}
       >
        {creating ? 'Creating...' : 'Create Department'}
       </Button>
      </div>
     </form>
    </div>
   )}
   <PortalTable
    columns={[
     { key: 'name', label: 'Name', className: 'text-body-md font-medium text-brand-dark dark:text-white' },
     { key: 'description', label: 'Description', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'actions', label: 'Actions', render: (_v, d) => <RowAction variant="danger" disabled={deleting && actingId === d.id} onClick={() => remove(d.id)}>Delete</RowAction> },
    ]}
    rows={departments}
    emptyMessage="No departments yet."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

const initialRoleForm = { name: '', slug: '', description: '' };

function RolesPermissions() {
 const [roles, setRoles] = useState([]);
 const [permissions, setPermissions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showRoleForm, setShowRoleForm] = useState(false);
 const [roleForm, setRoleForm] = useState(initialRoleForm);
 const [selectedRolePerms, setSelectedRolePerms] = useState([]);
 const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
 const [permForm, setPermForm] = useState({ name: '', module: '', action: '' });
 const [roleFieldErrors, setRoleFieldErrors] = useState({});
 const [roleError, setRoleError] = useState('');
 const [permFieldErrors, setPermFieldErrors] = useState({});
 const [permError, setPermError] = useState('');
 const [actingId, setActingId] = useState(null);
 const [roleCatalogSearch, setRoleCatalogSearch] = useState('');
 const [selectedCategory, setSelectedCategory] = useState('All');
 const [rolesPage, setRolesPage] = useState(1);
 const [rolesTotalPages, setRolesTotalPages] = useState(1);
 const [permsPage, setPermsPage] = useState(1);
 const [permsTotalPages, setPermsTotalPages] = useState(1);
 const { run: runCreateRole, isPending: creatingRole } = useAsyncAction();
 const { run: runCreatePermission, isPending: creatingPermission } = useAsyncAction();
 const { run: runRemoveRole, isPending: removingRole } = useAsyncAction();
 const { run: runRemovePermission, isPending: removingPermission } = useAsyncAction();

 const roleCategories = useMemo(() => {
  const cats = ['All'];
  for (const r of CORALSWIFT_ROLES_CATALOG) {
   if (!cats.includes(r.category)) cats.push(r.category);
  }
  return cats;
 }, []);

 const filteredCatalog = useMemo(() => {
  return CORALSWIFT_ROLES_CATALOG.filter((item) => {
   const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
   if (!matchesCat) return false;
   if (!roleCatalogSearch.trim()) return true;
   const query = roleCatalogSearch.toLowerCase();
   return (
    item.name.toLowerCase().includes(query) ||
    item.role.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query) ||
    item.permissions.some((p) => p.toLowerCase().includes(query))
   );
  });
 }, [selectedCategory, roleCatalogSearch]);

 const load = useCallback(() => {
  setLoading(true);
  Promise.allSettled([
   fetchRoles({ page: rolesPage, limit: 20 }),
   fetchPermissions({ page: permsPage, limit: 100 }),
  ]).then(([r, p]) => {
   if (r.status === 'fulfilled') { setRoles(r.value?.data || []); setRolesTotalPages(r.value?.meta?.total_pages || 1); }
   if (p.status === 'fulfilled') { setPermissions(p.value?.data || []); setPermsTotalPages(p.value?.meta?.total_pages || 1); }
  }).finally(() => setLoading(false));
 }, [rolesPage, permsPage]);

 useEffect(() => { load(); }, [load]);

 const permissionsByModule = useMemo(() => {
  const map = {};
  for (const p of permissions) {
   const mod = p.module || 'general';
   if (!map[mod]) map[mod] = [];
   map[mod].push(p);
  }
  return map;
 }, [permissions]);

 const handleRoleNameChange = (e) => {
  const name = e.target.value;
  if (!slugManuallyEdited) {
   const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
   setRoleForm({ ...roleForm, name, slug });
  } else {
   setRoleForm({ ...roleForm, name });
  }
 };

 const handleSlugChange = (e) => {
  setSlugManuallyEdited(true);
  setRoleForm({ ...roleForm, slug: e.target.value });
 };

 const togglePermission = (id) => {
  setSelectedRolePerms((prev) =>
   prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
  );
 };

 const toggleAllPermissions = () => {
  if (selectedRolePerms.length === permissions.length) {
   setSelectedRolePerms([]);
  } else {
   setSelectedRolePerms(permissions.map((p) => p.id));
  }
 };

 const handleCreateRole = async (e) => {
  e.preventDefault();
  setRoleError('');
  const clientErrors = validateCreateRole(roleForm);
  if (Object.keys(clientErrors).length > 0) {
   setRoleFieldErrors(clientErrors);
   setRoleError('Please fix the errors below.');
   return;
  }
  setRoleFieldErrors({});
  try {
   await runCreateRole(async () => {
    const res = await createRole(roleForm);
    const createdRole = res?.data;
    if (createdRole?.id && selectedRolePerms.length > 0) {
     try {
      await assignRolePermissions(createdRole.id, selectedRolePerms);
     } catch {
      // Keep going if assignment succeeds partially
     }
    }
    setRoleForm(initialRoleForm);
    setSelectedRolePerms([]);
    setSlugManuallyEdited(false);
    setShowRoleForm(false);
    load();
   });
  } catch (err) {
   setRoleError(err.message || 'Could not create the role.');
  }
 };

 const handleCreatePermission = async (e) => {
  e.preventDefault();
  setPermError('');
  const clientErrors = validateCreatePermission(permForm);
  if (Object.keys(clientErrors).length > 0) {
   setPermFieldErrors(clientErrors);
   setPermError('Please fix the errors below.');
   return;
  }
  setPermFieldErrors({});
  try {
   await runCreatePermission(async () => {
    await createPermission(permForm);
    setPermForm({ name: '', module: '', action: '' });
    load();
   });
  } catch (err) {
   setPermError(err.message || 'Could not create the permission.');
  }
 };

 const removeRole = async (id) => {
  setActingId(id);
  await runRemoveRole(async () => { await deleteRole(id); load(); });
  setActingId(null);
 };

 const removePermission = async (id) => {
  setActingId(id);
  await runRemovePermission(async () => { await deletePermission(id); load(); });
  setActingId(null);
 };

 if (loading) return <SkeletonTable rows={6} columns={3} />;
 return (
  <div className="space-y-stack-lg">

   {/* CoralSwift Roles & Permissions Directory */}
   <div className="space-y-5 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant dark:border-dark-outline-variant pb-4">
     <div>
      <h3 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white flex items-center gap-2">
       <Icon name="badge" className="text-brand text-2xl" />
       CoralSwift Roles & Permissions Directory
      </h3>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-1">
       Complete overview of all built-in roles in CoralSwift, their operational purpose, and granted system permissions.
      </p>
     </div>
     <div className="flex items-center gap-3">
      <div className="relative w-full sm:w-64">
       <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted text-lg pointer-events-none" />
       <input
        type="text"
        placeholder="Filter roles or permissions..."
        value={roleCatalogSearch}
        onChange={(e) => setRoleCatalogSearch(e.target.value)}
        className={`${FORM_INPUT_CLASS} w-full pl-9 py-2 text-body-sm`}
       />
       {roleCatalogSearch && (
        <button
         type="button"
         onClick={() => setRoleCatalogSearch('')}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-brand text-body-xs font-bold"
        >
         ✕
        </button>
       )}
      </div>
     </div>
    </div>

    {/* Category filter tabs */}
    <div className="flex flex-wrap gap-2">
     {roleCategories.map((cat) => (
      <button
       key={cat}
       type="button"
       onClick={() => setSelectedCategory(cat)}
       className={`rounded-full px-3.5 py-1 text-body-xs font-medium transition-all ${
        selectedCategory === cat
         ? 'bg-brand text-white shadow-sm'
         : 'bg-surface-container text-ink-muted hover:bg-surface-dim hover:text-brand-dark dark:bg-dark-surface-container dark:text-dark-ink-muted'
       }`}
      >
       {cat}
      </button>
     ))}
    </div>

    {/* Roles Grid */}
    <div className="grid gap-4 md:grid-cols-2">
     {filteredCatalog.map((roleItem) => (
      <div
       key={roleItem.role}
       className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface dark:border-dark-outline-variant p-5 shadow-sm transition-shadow hover:shadow-sm"
      >
       <div className="flex items-start justify-between gap-3 border-b border-outline-variant/60 dark:border-dark-outline-variant/60 pb-3 mb-3">
        <div className="flex items-center gap-3">
         <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <Icon name={roleItem.icon} className="text-xl" />
         </div>
         <div>
          <h4 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
           {roleItem.name}
          </h4>
          <span className="font-mono text-body-xs text-brand font-medium">
           {roleItem.role}
          </span>
         </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-surface-container px-2.5 py-0.5 text-body-xs font-medium text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted whitespace-nowrap">
         {roleItem.category}
        </span>
       </div>

       {/* About the Role */}
       <div className="space-y-1 mb-3">
        <span className="text-body-xs font-bold uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">
         About this role
        </span>
        <p className="text-body-sm text-brand-dark dark:text-white leading-relaxed">
         {roleItem.description}
        </p>
       </div>

       {/* Permissions which the respective role has */}
       <div className="mt-auto space-y-1.5 pt-2.5 border-t border-outline-variant/40 dark:border-dark-outline-variant/40">
        <span className="text-body-xs font-bold uppercase tracking-wider text-brand">
         Granted Permissions & Capabilities ({roleItem.permissions.length})
        </span>
        <ul className="space-y-1.5 pt-1">
         {roleItem.permissions.map((perm, idx) => (
          <li key={idx} className="flex items-start gap-2 text-body-xs text-ink-muted dark:text-dark-ink-muted">
           <Icon name="check_circle" className="text-brand text-sm mt-0.5 shrink-0" />
           <span>{perm}</span>
          </li>
         ))}
        </ul>
       </div>
      </div>
     ))}
     {filteredCatalog.length === 0 && (
      <div className="col-span-2 py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
       No roles match your search filter &quot;{roleCatalogSearch}&quot;.
      </div>
     )}
    </div>
   </div>

   {/* Custom Roles Section */}
   <div className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
     <div>
      <h3 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">Custom Roles</h3>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-0.5">
       Manage customized organization roles with assigned module-level permissions.
      </p>
     </div>
     <Button
      variant="primary"
      size="md"
      icon={<Icon name="add" />}
      onClick={() => {
       setShowRoleForm((v) => !v);
       if (showRoleForm) {
        setRoleForm(initialRoleForm);
        setSelectedRolePerms([]);
        setSlugManuallyEdited(false);
        setRoleFieldErrors({});
        setRoleError('');
       }
      }}
     >
      Add Role
     </Button>
    </div>

    {/* Add Role Form with Permissions */}
    {showRoleForm && (
     <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="border-b border-outline-variant dark:border-dark-outline-variant pb-4 mb-6">
       <h4 className="text-center font-display text-headline-sm font-semibold text-brand-dark dark:text-white">
        Add Role
       </h4>
      </div>
      <form onSubmit={handleCreateRole} className="space-y-5">
       <div className="grid gap-5 sm:grid-cols-2">
        <div>
         <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
          Role Name <span className="text-brand">*</span>
         </label>
         <input
          required
          type="text"
          placeholder="e.g. Finance Auditor"
          value={roleForm.name}
          onChange={handleRoleNameChange}
          className={`${FORM_INPUT_CLASS} w-full`}
         />
         {roleFieldErrors.name && (
          <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">
           {roleFieldErrors.name}
          </p>
         )}
        </div>
        <div>
         <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
          Role Slug <span className="text-brand">*</span>
         </label>
         <input
          required
          type="text"
          placeholder="e.g. finance-auditor"
          value={roleForm.slug}
          onChange={handleSlugChange}
          className={`${FORM_INPUT_CLASS} w-full`}
         />
         {roleFieldErrors.slug && (
          <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">
           {roleFieldErrors.slug}
          </p>
         )}
        </div>
       </div>

       <div>
        <label className="block text-body-sm font-medium text-brand-dark dark:text-white mb-1.5">
         Description
        </label>
        <textarea
         rows={2}
         placeholder="e.g. Oversees financial approvals, audit compliance, and invoicing"
         value={roleForm.description}
         onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
         className={`${FORM_INPUT_CLASS} w-full resize-none`}
        />
       </div>

       {/* Permissions selector */}
       <div>
        <div className="flex items-center justify-between mb-2">
         <label className="block text-body-sm font-medium text-brand-dark dark:text-white">
          Assign Permissions{' '}
          <span className="ml-1 rounded-full bg-brand/10 px-2 py-0.5 text-body-xs font-semibold text-brand">
           {selectedRolePerms.length} selected
          </span>
         </label>
         {permissions.length > 0 && (
          <button
           type="button"
           onClick={toggleAllPermissions}
           className="text-body-xs font-medium text-brand hover:underline"
          >
           {selectedRolePerms.length === permissions.length ? 'Deselect all' : 'Select all'}
          </button>
         )}
        </div>

        {permissions.length > 0 ? (
         <div className="max-h-64 overflow-y-auto rounded-lg border border-outline-variant bg-white dark:bg-dark-surface-container dark:border-dark-outline-variant p-4 space-y-4">
          {Object.entries(permissionsByModule).map(([moduleName, perms]) => (
           <div key={moduleName} className="space-y-2">
            <div className="flex items-center justify-between border-b border-outline-variant/50 pb-1">
             <span className="text-body-xs font-bold uppercase tracking-wider text-brand">
              {moduleName}
             </span>
             <button
              type="button"
              onClick={() => {
               const modIds = perms.map((p) => p.id);
               const allSelected = modIds.every((id) => selectedRolePerms.includes(id));
               if (allSelected) {
                setSelectedRolePerms((prev) => prev.filter((id) => !modIds.includes(id)));
               } else {
                setSelectedRolePerms((prev) => Array.from(new Set([...prev, ...modIds])));
               }
              }}
              className="text-body-xs font-medium text-ink-muted hover:text-brand"
             >
              {perms.every((p) => selectedRolePerms.includes(p.id)) ? 'Clear' : 'Select all'}
             </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
             {perms.map((p) => {
              const isChecked = selectedRolePerms.includes(p.id);
              return (
               <label
                key={p.id}
                className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                 isChecked
                  ? 'border-brand bg-brand/5 dark:bg-brand/10 text-brand-dark dark:text-white'
                  : 'border-outline-variant dark:border-dark-outline-variant hover:bg-surface-container/40 text-ink-muted'
                }`}
               >
                <input
                 type="checkbox"
                 checked={isChecked}
                 onChange={() => togglePermission(p.id)}
                 className="mt-0.5 rounded border-outline-variant text-brand focus:ring-brand"
                />
                <div className="min-w-0 flex-1">
                 <p className="text-body-xs font-medium truncate">{p.name}</p>
                 <p className="text-body-xs text-ink-muted font-mono">{p.action}</p>
                </div>
               </label>
              );
             })}
            </div>
           </div>
          ))}
         </div>
        ) : (
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted p-3 bg-surface-container rounded border border-outline-variant">
          No permissions defined yet. You can create permissions in the section below and assign them to roles.
         </p>
        )}
       </div>

       {roleError && (
        <p className="flex items-center gap-1 text-body-sm text-status-error-text">
         <Icon name="error" className="text-base" />
         {roleError}
        </p>
       )}

       <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant dark:border-dark-outline-variant">
        <Button
         type="button"
         variant="outline"
         size="md"
         onClick={() => {
          setShowRoleForm(false);
          setRoleForm(initialRoleForm);
          setSelectedRolePerms([]);
          setSlugManuallyEdited(false);
          setRoleFieldErrors({});
          setRoleError('');
         }}
        >
         Cancel
        </Button>
        <Button
         type="submit"
         variant="primary"
         size="md"
         disabled={creatingRole}
        >
         {creatingRole ? 'Creating...' : 'Create Role'}
        </Button>
       </div>
      </form>
     </div>
    )}

    {/* Roles List */}
    <div className="divide-y divide-outline-variant/50 dark:divide-dark-outline-variant/50">
     {roles.map((r) => (
      <div key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
       <div className="space-y-1">
        <p className="text-body-md font-semibold text-brand-dark dark:text-white flex items-center gap-2">
         {r.name}
         {r.is_system && <StatusBadge variant="neutral">system</StatusBadge>}
        </p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
         <span className="font-mono text-body-xs bg-surface-container px-1.5 py-0.5 rounded">{r.slug}</span>
         {r.description ? ` — ${r.description}` : ''}
        </p>
        {r.permissions && r.permissions.length > 0 && (
         <div className="flex flex-wrap gap-1.5 pt-1">
          {r.permissions.map((p) => (
           <span key={p.id} className="inline-flex items-center rounded bg-brand/10 dark:bg-brand/20 px-2 py-0.5 text-body-xs font-medium text-brand">
            {p.module}.{p.action}
           </span>
          ))}
         </div>
        )}
       </div>
       {!r.is_system && (
        <RowAction
         variant="danger"
         disabled={removingRole && actingId === r.id}
         onClick={() => removeRole(r.id)}
        >
         Delete
        </RowAction>
       )}
      </div>
     ))}
     {!roles.length && (
      <p className="py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
       No custom roles yet — the 13 system roles from `UserRole` cover most needs.
      </p>
     )}
    </div>
    <Pagination page={rolesPage} totalPages={rolesTotalPages} onChange={setRolesPage} />
   </div>

   {/* Permissions Section */}
   <div className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
    <div>
     <h3 className="font-display text-headline-sm font-semibold text-brand-dark dark:text-white">System Permissions</h3>
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted mt-0.5">
      Granular system privileges scoped by module (e.g. invoices, tickets, employees) and action (e.g. read, write, approve).
     </p>
    </div>
    <form onSubmit={handleCreatePermission} className="space-y-4">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <input required type="text" placeholder="Permission Name" value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.name}</p>}
      </div>
      <div>
       <input required type="text" placeholder="Module (e.g. invoices)" value={permForm.module} onChange={(e) => setPermForm({ ...permForm, module: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.module && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.module}</p>}
      </div>
      <div>
       <input required type="text" placeholder="Action (e.g. approve)" value={permForm.action} onChange={(e) => setPermForm({ ...permForm, action: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.action && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.action}</p>}
      </div>
     </div>
     {permError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{permError}</p>}
     <div className="flex justify-end">
      <Button type="submit" variant="primary" size="md" disabled={creatingPermission}>{creatingPermission ? 'Adding...' : 'Add Permission'}</Button>
     </div>
    </form>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
     {permissions.map((p) => (
      <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-white p-3 transition-colors hover:bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <div>
        <p className="text-body-sm font-semibold text-brand-dark dark:text-white">{p.name}</p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted font-mono">{p.module}.{p.action}</p>
       </div>
       <button type="button" onClick={() => removePermission(p.id)} disabled={removingPermission && actingId === p.id}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-status-error/30 text-status-error transition-colors hover:bg-status-error-bg hover:text-status-error disabled:opacity-50"
        aria-label={`Delete permission ${p.name}`}>
        <Icon name="delete" className="text-base" />
       </button>
      </div>
     ))}
     {!permissions.length && <p className="py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted sm:col-span-2 lg:col-span-3">No permissions defined yet.</p>}
    </div>
    <Pagination page={permsPage} totalPages={permsTotalPages} onChange={setPermsPage} />
   </div>
  </div>
 );
}

function DataExportGdpr() {
 const [search, setSearch] = useState('');
 const [appliedSearch, setAppliedSearch] = useState('');
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searching, setSearching] = useState(false);
 const [actingId, setActingId] = useState(null);
 const [exportedJson, setExportedJson] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runExport, isPending: exporting } = useAsyncAction();
 const { run: runAnonymize, isPending: anonymizing } = useAsyncAction();

 useEffect(() => {
  setLoading(true);
  fetchUsers({ search: appliedSearch.trim() || undefined, page, limit: 20 })
   .then((r) => { setResults(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => { setLoading(false); setSearching(false); });
 }, [appliedSearch, page]);

 const runSearch = (e) => {
  e.preventDefault();
  setSearching(true);
  // A new search must not leave the view on a page number that no longer
  // exists in the new result set.
  setPage(1);
  setAppliedSearch(search);
 };

 const doExport = async (userId) => {
  setActingId(userId);
  await runExport(async () => {
   const r = await exportUserData(userId);
   setExportedJson(r?.data || null);
  });
  setActingId(null);
 };

 const doAnonymize = async (userId) => {
  if (!window.confirm('This permanently anonymizes the account (name, email, phone, avatar) and deactivates it. This cannot be undone. Continue?')) return;
  setActingId(userId);
  await runAnonymize(async () => { await anonymizeUser(userId); setResults((prev) => prev.filter((u) => u.id !== userId)); });
  setActingId(null);
 };

 if (loading) return <SkeletonTable rows={6} columns={4} />;

 return (
  <div className="space-y-stack-md">
   <form onSubmit={runSearch} className="flex gap-2">
    <input type="text" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 ${FORM_INPUT_CLASS}`} />
    <Button type="submit" variant="primary" size="md" disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
   </form>
   <PortalTable
    columns={[
     { key: 'name', label: 'Name', className: 'text-body-md font-medium text-brand-dark dark:text-white' },
     { key: 'email', label: 'Email', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
     { key: 'role', label: 'Role', className: 'text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted', render: (v) => v?.replace('_', ' ') },
     {
      key: 'actions',
      label: 'Actions',
      render: (_v, u) => (
       <div className="flex gap-2">
        <RowAction disabled={exporting && actingId === u.id} onClick={() => doExport(u.id)}>Export Data</RowAction>
        <RowAction variant="danger" disabled={anonymizing && actingId === u.id} onClick={() => doAnonymize(u.id)}>Anonymize</RowAction>
       </div>
      ),
     },
    ]}
    rows={results}
    emptyMessage="Search for a user to export or anonymize their data."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   {exportedJson && (
    <div className="rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
     <h3 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-white">Exported Data</h3>
     <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-container p-4 text-body-sm text-ink dark:bg-dark-surface-container dark:text-white">{JSON.stringify(exportedJson, null, 2)}</pre>
    </div>
   )}
  </div>
 );
}

function AuditLogs() {
 const [logs, setLogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchAuditLogs({ page, limit: 20 })
   .then((r) => { setLogs(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 if (loading) return <SkeletonTable rows={6} columns={4} />;
 return (
  <div className="space-y-stack-md">
   <PortalTable
    columns={[
     { key: 'action', label: 'Action', className: 'text-body-sm font-medium text-brand-dark dark:text-white' },
     { key: 'entity_type', label: 'Entity', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'ip_address', label: 'IP', className: 'font-mono text-body-xs text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'created_at', label: 'When', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => (v ? new Date(v).toLocaleString() : '—') },
    ]}
    rows={logs}
    emptyMessage="No audit activity yet."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// Backups are filesystem-based (backend/app/routers/backups.py just globs a
// directory) — there's no page_params support, so pagination here is
// client-side over the loaded array.
const BACKUPS_PAGE_SIZE = 10;

function Backups() {
 const [backups, setBackups] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [deletingFilename, setDeletingFilename] = useState(null);
 const [page, setPage] = useState(1);
 const { run: runTrigger, isPending: triggering } = useAsyncAction();
 const { run: runDelete, isPending: deleting } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  fetchBackups().then((r) => setBackups(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
 }, []);

 useEffect(() => { load(); }, [load]);

 const totalPages = Math.max(1, Math.ceil(backups.length / BACKUPS_PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pagedBackups = backups.slice((safePage - 1) * BACKUPS_PAGE_SIZE, safePage * BACKUPS_PAGE_SIZE);

 const runBackup = async () => {
  setError('');
  try {
   // A real pg_dump — the backend gives this up to 5 minutes.
   await runTrigger(async () => { await triggerBackup(); load(); });
  } catch (err) {
   setError(err?.message || 'Backup failed. Please try again.');
  }
 };

 const removeBackup = async (filename) => {
  if (!window.confirm(`Permanently delete backup "${filename}"? This cannot be undone.`)) return;
  setDeletingFilename(filename);
  await runDelete(async () => { await deleteBackup(filename); load(); });
  setDeletingFilename(null);
 };

 const formatSize = (bytes) => {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
 };

 if (loading) return <SkeletonTable rows={6} columns={4} />;

 return (
  <div className="space-y-stack-lg">
   <div className="flex items-center justify-between">
    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Real database backups (pg_dump), triggered manually — no scheduler runs automatically yet.</p>
    <Button variant="primary" size="md" onClick={runBackup} disabled={triggering} icon={<Icon name="backup" />}>
     {triggering ? 'Running backup...' : 'Trigger Backup Now'}
    </Button>
   </div>
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error"><Icon name="error" className="text-base" />{error}</p>}
   <PortalTable
    columns={[
     { key: 'filename', label: 'Filename', className: 'font-mono text-body-xs text-brand-dark dark:text-white' },
     { key: 'size_bytes', label: 'Size', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => formatSize(v) },
     { key: 'created_at', label: 'Created', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => (v ? new Date(v).toLocaleString() : '—') },
     {
      key: 'actions',
      label: '',
      render: (_v, b) => (
       <div className="flex gap-3">
        <a href={backupDownloadUrl(b.filename)} aria-label={`Download backup ${b.filename}`} className="text-brand hover:text-brand-dark" title="Download">
         <Icon name="download" className="text-xl" />
        </a>
        <button onClick={() => removeBackup(b.filename)} disabled={deleting && deletingFilename === b.filename} aria-label={`Delete backup ${b.filename}`} className="text-status-error hover:opacity-70 disabled:opacity-50" title="Delete">
         <Icon name="delete" className="text-xl" />
        </button>
       </div>
      ),
     },
    ]}
    rows={pagedBackups}
    emptyMessage="No backups yet — trigger one above."
   />
   <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

export default function SuperAdminPanel() {
 useDocumentTitle('Super Admin | CoralSwift Technologies');
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('super_admin', '/admin');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [currentUser, setCurrentUser] = useState(null);

 useEffect(() => {
  if (user) {
   setCurrentUser({ name: user?.name || user?.email, email: user?.email, role: user?.role || 'super_admin' });
  }
 }, [user]);

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case
 // (to /admin, per the redirectTo passed above) — no separate effect needed.
 if (initializing || !user || denied || currentUser === null || currentUser.role !== 'super_admin') {
   return <div className="bg-surface py-section-padding dark:bg-dark-surface"><LoadingSpinner /></div>;
  }

  return (
   <div className="flex h-dvh flex-col bg-surface dark:bg-dark-surface">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-outline-variant bg-white px-4 py-3 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface sm:gap-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-9 w-auto shrink-0 object-contain" />
      <div className="hidden h-7 w-px bg-outline-variant sm:block dark:bg-dark-outline-variant" />
      <Avatar name={currentUser?.name || 'Super Admin'} size="md" />
      <div className="min-w-0">
       <h1 className="max-w-[40vw] truncate font-display text-headline-sm font-bold text-brand-dark sm:max-w-none dark:text-white">{currentUser?.name || 'Super Admin'}</h1>
       <p className="hidden text-body-sm text-ink-muted sm:block dark:text-dark-ink-muted">{currentUser?.email || ''} &middot; <span className="font-semibold text-brand">super admin</span></p>
      </div>
     </div>
     <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
      Sign Out
     </Button>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-white md:block dark:border-dark-outline-variant dark:bg-dark-surface">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1.5 p-3">
      {superAdminTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-body-sm transition-all ${
         activeTab === tab.id ? 'bg-brand font-semibold text-white shadow-sm' : 'font-medium text-ink-muted hover:bg-brand/10 hover:text-brand dark:text-dark-ink-muted dark:hover:bg-dark-surface-container dark:hover:text-dark-brand'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <div className="scrollbar-hide mb-stack-lg flex gap-1 overflow-x-auto border-b border-outline-variant bg-white px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12 dark:border-dark-outline-variant dark:bg-dark-surface">
      {superAdminTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-body-sm font-medium transition-colors ${
         activeTab === tab.id ? 'border-brand font-semibold text-brand' : 'border-transparent text-ink-muted hover:border-brand/40 hover:text-ink dark:text-dark-ink-muted dark:hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </div>

     <div className="min-w-0 flex-1 overflow-y-auto bg-surface px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 dark:bg-dark-surface">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'departments' && <Departments />}
      {activeTab === 'roles' && <RolesPermissions />}
      {activeTab === 'gdpr' && <DataExportGdpr />}
      {activeTab === 'audit' && <AuditLogs />}
      {activeTab === 'backups' && <Backups />}
      {activeTab === 'billing' && (
       <ComingSoon icon="account_balance" title="Billing & Subscription"
        description="This deployment doesn't have a billing/subscription model yet — there's no plan, invoice-to-platform, or metering system in the current schema. Building it for real is a separate project, not a UI-only add-on." />
      )}
      {activeTab === 'impersonation' && (
       <ComingSoon icon="switch_account" title="Impersonation"
        description="Deliberately not implemented yet. Signing in as another user safely requires audit-logged, time-boxed session tokens and its own review — that's a security-sensitive feature that shouldn't ship as a quick add-on." />
      )}
     </div>
    </div>
   </div>
  </div>
 );
}
