# Project Routes & Components

## 1. Automatic Zoom

## 2. Route Component Description

### Public/Pages Site

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home | Landing page |
| `/about` | About | Company info + team |
| `/services` | Services | Service listing |
| `/services/:slug` | ServiceDetail | Individual service |
| `/portfolio` | Portfolio | Portfolio grid |
| `/portfolio/success/:slug` | SuccessStory | Individual success story |
| `/solutions` | Solutions | Solutions listing |
| `/products` | Products | Products listing |
| `/technologies` | Technologies | Tech stack |
| `/industries` | Industries | Industry verticals |
| `/case-studies` | CaseStudies | Case studies |
| `/careers` | Careers | Job listings |
| `/blog` | Blog | Blog listing |
| `/events` | Events | Events |
| `/gallery` | Gallery | Image gallery |
| `/awards` | Awards | Awards |
| `/downloads` | Downloads | Downloadable resources |
| `/resources` | Resources | Resources |
| `/faq` | Faq | FAQ page |
| `/contact` | Contact | Contact form |
| `/privacy` | Privacy | Privacy policy |
| `/terms` | Terms | Terms of service |
| `/cookies` | Cookies | Cookie policy |

### Portal Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/login` | LoginPage | General login |
| `/register` | Register | Client registration |
| `/client` | ClientPortal | Client self-service |
| `/employee` | EmployeePortal | Employee portal (base) |
| `/sales` | EmployeePortal | Sales role portal |
| `/marketing` | EmployeePortal | Marketing role portal |
| `/developer` | EmployeePortal | Developer role portal |
| `/project-manager` | EmployeePortal | PM role portal |
| `/qa` | EmployeePortal | QA role portal |
| `/support` | EmployeePortal | Support role portal |
| `/finance` | EmployeePortal | Finance role portal |
| `/hr` | EmployeePortal | HR role portal |
| `/admin` | AdminPanel | Admin dashboard |
| `/super-admin` | SuperAdminPanel | Super admin panel |
| `/super-admin/login` | SuperAdminLogin | Super admin login |

### Utility

| Route | Component |
|-------|-----------|
| `/brochure` | BrochurePage |
| `/download/:slug` | DownloadDetail |
| `*` | NotFound (404) |

## 9. Portal Tab Overview

### Admin Panel (11 tabs)

| Tab | Content |
|-----|---------|
| Dashboard | KPI cards, project summaries |
| Content | Blog, services, case studies CRUD |
| Projects | Project list + management |
| Users | User account management |
| Employees | Employee profiles |
| Clients | Client management |
| Roles | Role + permission management |
| Media | File uploads |