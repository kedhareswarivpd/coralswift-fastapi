export const services = [
  {
    slug: 'custom-software',
    icon: 'code',
    category: 'Software Engineering',
    themeColor: 'orange',
    title: 'Custom Software Development',
    name: 'Custom Software Development',
    description:
      'Bespoke software built end-to-end around your business\'s exact requirements and workflows.',
    overview:
      'Bespoke software built end-to-end around a business\'s exact requirements, eliminating process compromises caused by off-the-shelf software.',
    business_problems:
      'Off-the-shelf tools that force process compromises, lack custom integration capabilities, and don\'t scale with your unique business workflows.',
    solutions:
      'Requirement-driven custom software development, from high-level cloud architecture through agile development, zero-downtime deployment, and long-term support.',
    features: ['Tailored Workflows', 'Custom API Integrations', 'Scalable Microservices Architecture', 'Full Codebase Ownership', 'CI/CD & DevOps Automation', 'Role-Based Access Control'],
    benefits: ['Perfect Process Fit', 'Competitive Differentiation', '100% Codebase Ownership', 'No Vendor Lock-In', 'Lower Maintenance Cost'],
    benefit: 'Perfect fit for your workflows with 100% codebase ownership and zero vendor lock-in.',
    technology_stack: ['React / Next.js', 'Node.js & Python FastAPI', 'PostgreSQL & Redis', 'Docker & Kubernetes', 'AWS & Cloud Infrastructure'],
    deliverables: ['Production-Ready Application', 'Complete Source Code Ownership', 'Technical Architecture Documentation', 'Automated CI/CD Pipeline'],
    process: [
      { step: '01', title: 'Discovery & Auditing', description: 'Deep-dive into requirements, workflow mapping, and technical specifications.' },
      { step: '02', title: 'Architecture & Design', description: 'System design, database schema modeling, and UX/UI wireframing.' },
      { step: '03', title: 'Agile Sprints', description: 'Bi-weekly development cycles with continuous integration and demo feedback.' },
      { step: '04', title: 'QA & Security Testing', description: 'Automated test suites, penetration testing, and performance optimization.' },
      { step: '05', title: 'Deployment & Support', description: 'Production rollout, team training, and 24/7 SLA-backed monitoring.' },
    ],
    faqs: [
      { question: 'How long does a custom software development project take?', answer: 'Typical custom software engagements take between 8 to 16 weeks depending on scope, starting with a 2-week discovery phase.' },
      { question: 'Do we get full source code ownership?', answer: 'Yes, 100% of the IP, source code, repositories, and documentation belong to your organization upon project completion.' },
    ],
  },
  {
    slug: 'cloud-infrastructure',
    icon: 'cloud',
    category: 'Cloud & Infrastructure',
    themeColor: 'orange',
    title: 'Cloud Architecture & Infrastructure',
    name: 'Cloud Architecture & Infrastructure',
    description:
      'Architect, migrate, and manage mission-critical systems onto highly resilient, cost-optimized multi-cloud environments.',
    overview:
      'Architect, migrate, and manage mission-critical systems onto highly resilient, cost-optimized multi-cloud environments with automated disaster recovery.',
    business_problems:
      'Aging on-premise infrastructure, over-provisioned cloud environments, and unexpected outages threatening SLA commitments.',
    solutions:
      'Infrastructure-as-code (IaC) architectures with autoscaling, multi-region failover, cost optimization, and 99.999% uptime guarantees.',
    features: ['Multi-Region Mesh', 'Zero-Downtime Canary Rollouts', 'Terraform & OpenTofu IaC', 'Autoscaling & Load Balancing', 'Cost Guardrails & FinOps'],
    benefits: ['99.999% SLA Uptime', 'Up to 40% Infrastructure TCO Reduction', 'Sub-second Failover', 'Automated Disaster Recovery'],
    benefit: 'Sub-second failover and up to 40% reduction in cloud infrastructure TCO.',
    technology_stack: ['AWS / Azure / GCP', 'Kubernetes & Docker', 'Terraform', 'Prometheus & Grafana'],
    deliverables: ['IaC Repository', 'Cloud Architecture Diagram', 'Monitoring Dashboards', 'Disaster Recovery Plan'],
    process: [
      { step: '01', title: 'Cloud Audit', description: 'Assessing current infrastructure, security posture, and cloud cost inefficiencies.' },
      { step: '02', title: 'IaC Design', description: 'Building reproducible Terraform blueprints and automated deployment pipelines.' },
      { step: '03', title: 'Migration & Cutover', description: 'Executing zero-downtime database and service migration.' },
      { step: '04', title: 'Optimization & SLA', description: 'Fine-tuning auto-scaler triggers, cost guardrails, and continuous telemetry.' },
    ],
    faqs: [
      { question: 'Can you migrate live production systems without downtime?', answer: 'Yes, we utilize zero-downtime migration strategies including database replication and canary traffic swapping.' },
    ],
  },
  {
    slug: 'ai-solutions',
    icon: 'memory',
    category: 'Artificial Intelligence',
    themeColor: 'rose',
    title: 'AI & Applied Machine Learning Solutions',
    name: 'AI & Applied Machine Learning Solutions',
    description:
      'Turn proprietary enterprise data into competitive advantage with custom LLMs, RAG pipelines, and high-throughput inference architectures.',
    overview:
      'Turn proprietary enterprise data into competitive advantage with custom LLMs, deterministic RAG pipelines, and high-throughput inference architectures.',
    business_problems:
      'Untapped enterprise data, manual decision bottlenecks, and generic AI tools that hallucinate or leak sensitive company data.',
    solutions:
      'Enterprise-grade AI systems with strict data privacy, custom vector databases, agentic workflows, and sub-50ms inference latency.',
    features: ['Deterministic RAG', 'Enterprise LLM Fine-Tuning', 'Agentic Workflows', 'Vector Database Search', 'Model Monitoring & Auditing'],
    benefits: ['Production-Ready Safety', 'Sub-50ms Inference Latency', 'Zero Data Leakage', 'Automated Document Processing'],
    benefit: 'Production-ready AI systems with auditable safety and sub-50ms inference latency.',
    technology_stack: ['Python', 'PyTorch / TensorFlow', 'LangChain & LlamaIndex', 'Qdrant / Pinecone', 'FastAPI'],
    deliverables: ['Custom AI Model API', 'Vector Search Pipeline', 'Evaluation Benchmarks', 'Safety & Governance Policy'],
    process: [
      { step: '01', title: 'Data Audit', description: 'Cleaning, structuring, and vectorizing enterprise data sources.' },
      { step: '02', title: 'Model Prototyping', description: 'Building RAG pipelines and evaluating model accuracy benchmarks.' },
      { step: '03', title: 'Production API Integration', description: 'Deploying high-throughput inference engines behind secure REST endpoints.' },
    ],
    faqs: [
      { question: 'Is our data used to train public LLM models?', answer: 'No, all data pipelines run within private, SOC2-compliant VPCs with zero data sharing to external model providers.' },
    ],
  },
  {
    slug: 'cyber-security',
    icon: 'lock',
    category: 'Security & Governance',
    themeColor: 'purple',
    title: 'Cybersecurity & Zero-Trust Architecture',
    name: 'Cybersecurity & Zero-Trust Architecture',
    description:
      'Comprehensive enterprise defense, identity-first access control, and continuous security compliance guardrails.',
    overview:
      'Comprehensive enterprise defense, identity-first access control, and continuous SOC2, ISO 27001, and HIPAA compliance guardrails.',
    business_problems:
      'Growing attack surface, compliance pressure, ransomware risk, and unmonitored API endpoints.',
    solutions:
      'Zero-Trust network architecture, continuous automated SAST/DAST scanning, SIEM event logging, and 24/7 SOC incident response.',
    features: ['Zero-Trust Architecture', 'SOC2 / HIPAA Guardrails', 'Automated SAST/DAST Scanning', 'SIEM & SOC Monitoring', 'Penetration Testing'],
    benefits: ['Reduced Breach Risk', 'Continuous Regulatory Compliance', 'Instant Threat Escalation', 'Enhanced Customer Trust'],
    benefit: 'Enterprise-grade defensibility with continuous compliance assurance.',
    technology_stack: ['AWS Security Hub', 'Vault', 'OWASP Tooling', 'Datadog SIEM', 'Cloudflare Enterprise'],
    deliverables: ['Security Audit Report', 'Zero-Trust Architecture Design', 'SOC2 Compliance Documentation', 'Incident Response Runbook'],
    process: [
      { step: '01', title: 'Security Audit', description: 'Penetration testing, vulnerability scanning, and IAM privilege review.' },
      { step: '02', title: 'Zero-Trust Implementation', description: 'Enforcing mTLS, identity verification, and secret rotation.' },
    ],
    faqs: [
      { question: 'Do you assist with SOC2 and ISO certifications?', answer: 'Yes, we prepare full technical compliance packages, IaC guardrails, and audit evidence artifacts for certifying bodies.' },
    ],
  },
  {
    slug: 'data-analytics',
    icon: 'storage',
    category: 'Data & Analytics',
    themeColor: 'amber',
    title: 'Enterprise Data Engineering & Real-time Analytics',
    name: 'Enterprise Data Engineering & Real-time Analytics',
    description:
      'Unified data lakes, real-time stream processing, and analytical warehouses for instantaneous business intelligence.',
    overview:
      'Unified data lakehouses, real-time stream processing, and analytical warehouses for instantaneous executive business intelligence.',
    business_problems:
      'Siloed operational databases, stale spreadsheet reports, and slow SQL queries over large datasets.',
    solutions:
      'Real-time streaming ETL pipelines feeding high-concurrency OLAP data warehouses and self-serve interactive BI dashboards.',
    features: ['Apache Iceberg Lakehouses', 'ClickHouse Real-Time OLAP', 'Automated ETL/ELT Pipelines', 'Governed BI Dashboards', 'Data Lineage Tracking'],
    benefits: ['Sub-Second Analytical Queries', 'Single Source of Truth', 'Automated Data Quality Checks', 'Lower Data Storage Costs'],
    benefit: 'Instant analytics queries on petabyte-scale streaming datasets.',
    technology_stack: ['Apache Iceberg', 'ClickHouse & Snowflake', 'Apache Kafka / Flink', 'dbt & Airflow', 'Python'],
    deliverables: ['Real-Time Data Pipeline', 'Analytical Data Warehouse', 'Executive BI Dashboards', 'Data Dictionary'],
    process: [
      { step: '01', title: 'Data Pipeline Design', description: 'Mapping source schemas, CDC replication, and warehouse data models.' },
      { step: '02', title: 'Streaming Ingestion', description: 'Deploying Kafka streams and automated dbt transformation models.' },
    ],
    faqs: [
      { question: 'Can you handle streaming data from IoT devices or transaction logs?', answer: 'Yes, our Kafka and Flink pipelines handle hundreds of thousands of events per second with sub-second ingestion latency.' },
    ],
  },
  {
    slug: 'cloud-architecture-modernization',
    icon: 'cloud',
    category: 'Cloud & Infrastructure',
    themeColor: 'orange',
    title: 'Cloud Architecture & Modernization',
    name: 'Cloud Architecture & Modernization',
    description:
      'Architect, migrate, and modernize mission-critical systems onto highly resilient, cost-optimized multi-cloud environments.',
    overview:
      'Architect, migrate, and modernize mission-critical systems onto highly resilient, cost-optimized multi-cloud environments.',
    business_problems: 'Monolithic legacy codebases that cannot scale and drive high cloud operational costs.',
    solutions: 'Strangler-fig migration patterns, microservice containerization, and automated Terraform infrastructure.',
    features: ['Multi-Region Mesh', 'Zero-Downtime Canary Rollouts', 'Terraform & OpenTofu IaC'],
    benefits: ['Sub-second failover and up to 40% reduction in cloud infrastructure TCO.'],
    benefit: 'Sub-second failover and up to 40% reduction in cloud infrastructure TCO.',
    technology_stack: ['AWS', 'Kubernetes', 'Terraform', 'Docker'],
    deliverables: ['Modernized Cloud Architecture', 'IaC Repository', 'Migration Documentation'],
  },
  {
    slug: 'ai-applied-ml',
    icon: 'memory',
    category: 'Artificial Intelligence',
    themeColor: 'rose',
    title: 'AI & Applied Machine Learning Solutions',
    name: 'AI & Applied Machine Learning Solutions',
    description:
      'Turn proprietary enterprise data into competitive advantage with custom LLMs, RAG pipelines, and high-throughput inference architectures.',
    overview:
      'Turn proprietary enterprise data into competitive advantage with custom LLMs, RAG pipelines, and high-throughput inference architectures.',
    features: ['Deterministic RAG', 'Enterprise LLM Fine-Tuning', 'Agentic Workflows'],
    benefit: 'Production-ready AI systems with auditable safety and sub-50ms inference latency.',
    technology_stack: ['Python', 'PyTorch', 'LangChain', 'FastAPI'],
    deliverables: ['Trained Model API', 'RAG Pipeline', 'Evaluation Suite'],
  },
  {
    slug: 'enterprise-devsecops',
    icon: 'verified_user',
    category: 'DevOps & Security',
    themeColor: 'emerald',
    title: 'Enterprise DevSecOps & Platform Engineering',
    name: 'Enterprise DevSecOps & Platform Engineering',
    description:
      'Accelerate engineering velocity and build internal developer platforms with automated compliance, security, and continuous delivery.',
    overview:
      'Accelerate engineering velocity and build internal developer platforms with automated compliance, security, and continuous delivery.',
    features: ['ArgoCD GitOps', 'OpenTelemetry Tracing', 'Automated Security Gating'],
    benefit: 'Eliminate deployment incidents and achieve 99.999% platform availability.',
    technology_stack: ['ArgoCD', 'Kubernetes', 'GitHub Actions', 'Prometheus'],
    deliverables: ['DevSecOps Pipeline', 'Internal Developer Platform', 'Security Runbooks'],
  },
  {
    slug: 'distributed-systems',
    icon: 'layers',
    category: 'Engineering',
    themeColor: 'blue',
    title: 'Distributed Systems & High-Throughput Microservices',
    name: 'Distributed Systems & High-Throughput Microservices',
    description:
      'High-concurrency, low-latency microservice architectures capable of processing millions of transactions per second.',
    overview:
      'High-concurrency, low-latency microservice architectures capable of processing millions of transactions per second.',
    features: ['Kafka Event Streams', 'gRPC & Protobuf', 'CQRS & Event Sourcing'],
    benefit: 'Handle 100k+ transactions per second with sub-10ms P99 latency profiles.',
    technology_stack: ['Go', 'gRPC', 'Apache Kafka', 'Redis'],
    deliverables: ['Distributed Microservices', 'Event Streaming Pipeline', 'Performance Benchmarks'],
  },
  {
    slug: 'enterprise-data-engineering',
    icon: 'storage',
    category: 'Data & Analytics',
    themeColor: 'amber',
    title: 'Enterprise Data Engineering & Real-time Analytics',
    name: 'Enterprise Data Engineering & Real-time Analytics',
    description:
      'Unified data lakes, real-time stream processing, and analytical warehouses for instantaneous business intelligence.',
    overview:
      'Unified data lakes, real-time stream processing, and analytical warehouses for instantaneous business intelligence.',
    features: ['Apache Iceberg Lakehouses', 'ClickHouse Real-Time OLAP', 'Automated ETL Pipelines'],
    benefit: 'Instant analytics queries on petabyte-scale streaming datasets.',
    technology_stack: ['Apache Iceberg', 'ClickHouse', 'Apache Airflow', 'Python'],
    deliverables: ['Data Lakehouse', 'ETL Pipelines', 'BI Dashboards'],
  },
  {
    slug: 'cybersecurity-zero-trust',
    icon: 'lock',
    category: 'Security & Governance',
    themeColor: 'purple',
    title: 'Cybersecurity & Zero-Trust Architecture',
    name: 'Cybersecurity & Zero-Trust Architecture',
    description:
      'Comprehensive enterprise defense, identity-first access control, and continuous security compliance guardrails.',
    overview:
      'Comprehensive enterprise defense, identity-first access control, and continuous security compliance guardrails.',
    features: ['Zero-Trust Architecture', 'SOC2 / HIPAA Guardrails', 'Automated SAST/DAST'],
    benefit: 'Enterprise-grade defensibility with continuous compliance assurance.',
    technology_stack: ['AWS Security Hub', 'Vault', 'Datadog SIEM'],
    deliverables: ['Zero-Trust Implementation', 'Compliance Package', 'Security Audit'],
  },
];

export const engagementProcess = [
  { step: '01', title: 'Consulting', icon: 'architecture', description: 'Strategic mapping of technical requirements to goals.' },
  { step: '02', title: 'Development', icon: 'code', description: 'Agile execution with bi-weekly sprints and automation.' },
  { step: '03', title: 'Testing', icon: 'fact_check', description: 'Rigorous QA, penetration testing, and stress-tests.' },
  { step: '04', title: 'Deployment', icon: 'rocket_launch', description: 'Zero-downtime releases and automated scaling.' },
  { step: '05', title: 'Maintenance', icon: 'support_agent', description: 'Continuous monitoring and security patching.' },
];

export const faqs = [
  {
    question: 'What is your standard engagement model?',
    answer:
      'We offer flexible engagement models including Dedicated Teams (Managed Services), Fixed-Price Project Delivery, and Time & Materials for elastic R&D needs. Most enterprise partners start with a 3-month pilot phase.',
  },
  {
    question: 'How do you handle data security during development?',
    answer:
      'We operate under strict SOC2 Type II and GDPR compliance. All developers work within secure, air-gapped virtual environments when handling sensitive IP, and we employ rigorous data masking for testing phases.',
  },
  {
    question: 'Can you modernize legacy COBOL or mainframe systems?',
    answer:
      'Yes. Our "Strangler Fig" modernization pattern allows us to wrap and gradually replace legacy components with modern microservices, ensuring business continuity throughout the transition.',
  },
  {
    question: 'Do you provide post-deployment support?',
    answer:
      'Absolutely. We offer 24/7 L1-L3 support tiers with guaranteed response times. Our DevOps teams also handle ongoing infrastructure management and security updates.',
  },
];
