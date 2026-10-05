// Internal role values match backend/app/models/enums.py::UserRole exactly —
// keep these two files in sync if roles ever change.

export const EMPLOYEE_ROLES = [
  { label: 'Developer', value: 'developer' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Project Manager', value: 'project_manager' },
  { label: 'QA', value: 'qa' },
  { label: 'Support', value: 'support' },
  { label: 'Finance', value: 'finance' },
  { label: 'HR', value: 'hr' },
];

export const ADMIN_ROLES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin', value: 'admin' },
];

// Portals that grant an internal role and therefore require an authenticated
// Admin/HR to provision (see AdminPanel's Add User form) rather than public
// self-registration. Each entry's `roles` list drives which dropdown renders.
export const PORTAL_ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee Portal', roleLabel: 'Employee Role', roles: EMPLOYEE_ROLES },
  { value: 'admin', label: 'Admin Portal', roleLabel: 'Admin Role', roles: ADMIN_ROLES },
];

export const CORALSWIFT_ROLES_CATALOG = [
  {
    role: 'super_admin',
    name: 'Super Admin',
    category: 'Executive & Governance',
    badgeVariant: 'primary',
    icon: 'shield_person',
    description:
      'The highest-level authority with unrestricted universal access across every tenant, workspace, configuration, and security setting.',
    permissions: [
      'Universal bypass on all protected API endpoints and system barriers',
      'Manage corporate structure, company settings, and organizational departments',
      'Configure global Role-Based Access Control (RBAC) roles and permissions',
      'Execute GDPR compliance tools, customer data export, and user anonymization',
      'Trigger, download, and manage database snapshots and system backups',
      'Access complete system audit trail logs and user activity timelines',
      'Emergency user impersonation and elevated account recovery',
    ],
  },
  {
    role: 'admin',
    name: 'Administrator',
    category: 'Executive & Governance',
    badgeVariant: 'brand',
    icon: 'admin_panel_settings',
    description:
      'Organization-level administrator managing everyday staff provisioning, Content Management (CMS), and operational settings.',
    permissions: [
      'Full user lifecycle management: create staff users, edit profiles, toggle account deactivation',
      'Manage website CMS content (blogs, case studies, solutions, testimonials, gallery, events, FAQs, downloads)',
      'Department assignments and employee directory administration',
      'Triage, assign, prioritize, and update customer support tickets',
      'Manage and issue customer invoices, review billing statuses, and record offline payments',
      'Manage custom role definitions and permission mappings',
    ],
  },
  {
    role: 'hr',
    name: 'Human Resources (HR)',
    category: 'People & Operations',
    badgeVariant: 'secondary',
    icon: 'badge',
    description:
      'Manages talent acquisition, onboarding, attendance oversight, leave governance, and employee performance reviews.',
    permissions: [
      'Provision new employee records, manage employee personal and employment profiles',
      'Review, approve, or reject employee leave applications',
      'Inspect and verify employee timesheet submissions across teams',
      'Monitor company-wide daily attendance logs, check-ins, check-outs, and overtime',
      'Manage recruitment pipeline: view job listings, review job applications, and update candidate hiring status',
      'Conduct and document performance appraisal cycles and employee reviews',
      'Manage leadership profiles and organizational offices',
    ],
  },
  {
    role: 'project_manager',
    name: 'Project Manager (PM)',
    category: 'Project Delivery',
    badgeVariant: 'brand',
    icon: 'engineering',
    description:
      'Oversees delivery teams, project planning, resource allocations, milestone trackings, and deliverable sign-offs.',
    permissions: [
      'Create and update project plans, milestones, deliverables, and budgets',
      'Assign cross-functional engineers, developers, and QA personnel to project teams',
      'Create and assign tasks, manage sprints, and track task activities',
      'Review and approve timesheets and leave requests for assigned project team members',
      'Submit completed milestone deliverables for formal client review and acceptance',
      'Coordinate and schedule project meetings with clients and upload meeting recordings and minutes',
    ],
  },
  {
    role: 'developer',
    name: 'Developer / Engineer',
    category: 'Project Delivery',
    badgeVariant: 'neutral',
    icon: 'code',
    description:
      'Technical engineering staff responsible for building software features, completing sprint tasks, and logging work.',
    permissions: [
      'View assigned projects, architecture documents, and technical milestone requirements',
      'Pick up development tasks, transition task status (In Progress, Done), and log activity updates',
      'Log billable and non-billable project hours and submit weekly timesheets',
      'Punch in daily attendance (check-in / check-out)',
      'Submit vacation and sick leave requests to managers',
      'Employee self-service: download monthly payslips, access employment files, and manage tasks',
    ],
  },
  {
    role: 'qa',
    name: 'Quality Assurance (QA)',
    category: 'Project Delivery',
    badgeVariant: 'neutral',
    icon: 'bug_report',
    description:
      'Ensures product quality, test automation, bug tracking, and milestone deliverable verification.',
    permissions: [
      'Create defect tasks, test cases, and bug logs for project components',
      'Execute test plans, log testing activities, and verify bug fixes',
      'Perform milestone acceptance testing before client deliverable submission',
      'Transition task states (Ready for Testing, Tested, Verified)',
      'Track daily work hours, submit timesheets, and log attendance',
      'Employee self-service access to documents, payslips, and timesheets',
    ],
  },
  {
    role: 'sales',
    name: 'Sales & Business Development',
    category: 'Business & Revenue',
    badgeVariant: 'brand',
    icon: 'trending_up',
    description:
      'Drives business growth, manages CRM sales pipelines, captures qualified leads, and prepares client contracts.',
    permissions: [
      'Manage CRM leads: capture leads, update pipeline stages (New, Contacted, Qualified, Closed-Won)',
      'Log sales activities, client meetings, phone calls, and discovery notes',
      'Draft, configure, and send project proposals and pricing quotes',
      'Generate client service contracts and monitor electronic signing status',
      'Convert won leads into new active client accounts and kickstart onboarding',
      'Track revenue pipeline analytics and sales conversion metrics',
    ],
  },
  {
    role: 'marketing',
    name: 'Marketing Specialist',
    category: 'Business & Revenue',
    badgeVariant: 'secondary',
    icon: 'campaign',
    description:
      'Leads inbound marketing, brand awareness, public content publication, and customer testimonial moderation.',
    permissions: [
      'Author, edit, and publish blogs, industry articles, and success stories on the public website',
      'Review and moderate client testimonials before approving them for website display',
      'Manage media assets, gallery images, brochures, and downloadable product resources',
      'Schedule and publish corporate events, webinars, and conferences',
      'Monitor newsletter subscriber counts and audience engagement trends',
    ],
  },
  {
    role: 'finance',
    name: 'Finance & Accounting',
    category: 'Business & Revenue',
    badgeVariant: 'brand',
    icon: 'account_balance',
    description:
      'Controls corporate finances, client invoice generation, payment processing, tax accounting, and revenue tracking.',
    permissions: [
      'Create and issue client invoices with custom line items, tax rates, and payment due dates',
      'Record incoming card, bank transfer, and cheque payments',
      'Monitor overdue invoices, issue payment reminders, and reconcile balances',
      'View employee compensation data and generate monthly payslips',
      'Access financial reporting: gross revenue, outstanding balances, and project margin analytics',
      'Ensure transaction idempotency and payment audit compliance',
    ],
  },
  {
    role: 'support',
    name: 'Customer Support',
    category: 'Customer Operations',
    badgeVariant: 'secondary',
    icon: 'support_agent',
    description:
      'Handles client technical inquiries, service tickets, issue triage, and service level agreement (SLA) fulfillment.',
    permissions: [
      'Access customer support ticket queue across all client accounts',
      'Update ticket priority (Low, Medium, High, Urgent) and status (Open, In Progress, Resolved, Closed)',
      'Post official staff replies and troubleshooting instructions to clients',
      'Monitor SLA resolution timers and customer satisfaction metrics',
      'Escalate technical software defects to assigned project developers and PMs',
    ],
  },
  {
    role: 'client',
    name: 'Client Representative',
    category: 'External Portals',
    badgeVariant: 'primary',
    icon: 'business',
    description:
      'External client user accessing the dedicated Client Portal for project transparency, deliverable review, and billing.',
    permissions: [
      'View commissioned projects, milestone progress, and planned delivery schedules',
      'Review submitted deliverables: approve completed milestones or request revision with comments',
      'Raise, track, and reply to customer support tickets',
      'View billing invoices, download PDF statements, and process online payments',
      'Access shared project file repository and contract documents',
      'Join scheduled client review meetings and access meeting minutes and recordings',
    ],
  },
  {
    role: 'partner',
    name: 'Strategic Partner',
    category: 'External Portals',
    badgeVariant: 'primary',
    icon: 'handshake',
    description:
      'External business or affiliate partner accessing the dedicated Partner Portal for deal registration and collaboration.',
    permissions: [
      'Manage partner corporate profile and partnership tier credentials',
      'Register new deals and client referrals, and track lead conversion progress',
      'View commission payouts, earned rewards, and affiliate earnings statements',
      'Access partner enablement documents, co-marketing materials, and sales playbooks',
      'Collaborate on joint partner initiatives with CoralSwift account managers',
    ],
  },
  {
    role: 'employee',
    name: 'General Employee',
    category: 'People & Operations',
    badgeVariant: 'neutral',
    icon: 'person',
    description:
      'Base internal employee role providing standard staff self-service capabilities across CoralSwift.',
    permissions: [
      'Personal profile access: update contact info, view employee ID and department',
      'Daily attendance tracking: digital punch in (check-in) and punch out (check-out)',
      'Leave balance inquiry and formal leave application submission',
      'Daily/weekly project timesheet logging and submission',
      'Download monthly salary payslips and tax documents',
      'Track project tasks, milestone contributions, and performance reviews',
    ],
  },
  {
    role: 'guest',
    name: 'Guest / Public User',
    category: 'External Portals',
    badgeVariant: 'neutral',
    icon: 'public',
    description:
      'Anonymous or unverified public visitor with read-only access to published marketing and corporate information.',
    permissions: [
      'Browse public pages: Home, Services, Portfolio, Technologies, Case Studies, Blogs, Awards, About, FAQs',
      'Submit general contact inquiry forms and request custom proposals',
      'Apply for open job vacancies via the public Careers portal',
      'Subscribe to the CoralSwift email newsletter',
      'Strictly restricted from accessing any internal portals, employee records, or client databases',
    ],
  },
];
