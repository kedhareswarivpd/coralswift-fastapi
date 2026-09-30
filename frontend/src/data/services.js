export const services = [
  {
    slug: 'cloud-architecture-modernization',
    icon: 'cloud',
    category: 'Cloud & Infrastructure',
    themeColor: 'orange',
    title: 'Cloud Architecture & Modernization',
    description:
      'Architect, migrate, and modernize mission-critical systems onto highly resilient, cost-optimized multi-cloud environments.',
    features: ['Multi-Region Mesh', 'Zero-Downtime Canary Rollouts', 'Terraform & OpenTofu IaC'],
    benefit: 'Sub-second failover and up to 40% reduction in cloud infrastructure TCO.',
  },
  {
    slug: 'ai-applied-ml',
    icon: 'memory',
    category: 'Artificial Intelligence',
    themeColor: 'rose',
    title: 'AI & Applied Machine Learning Solutions',
    description:
      'Turn proprietary enterprise data into competitive advantage with custom LLMs, RAG pipelines, and high-throughput inference architectures.',
    features: ['Deterministic RAG', 'Enterprise LLM Fine-Tuning', 'Agentic Workflows'],
    benefit: 'Production-ready AI systems with auditable safety and sub-50ms inference latency.',
  },
  {
    slug: 'enterprise-devsecops',
    icon: 'verified_user',
    category: 'DevOps & Security',
    themeColor: 'emerald',
    title: 'Enterprise DevSecOps & Platform Engineering',
    description:
      'Accelerate engineering velocity and build internal developer platforms with automated compliance, security, and continuous delivery.',
    features: ['ArgoCD GitOps', 'OpenTelemetry Tracing', 'Automated Security Gating'],
    benefit: 'Eliminate deployment incidents and achieve 99.999% platform availability.',
  },
  {
    slug: 'distributed-systems',
    icon: 'layers',
    category: 'Engineering',
    themeColor: 'blue',
    title: 'Distributed Systems & High-Throughput Microservices',
    description:
      'High-concurrency, low-latency microservice architectures capable of processing millions of transactions per second.',
    features: ['Kafka Event Streams', 'gRPC & Protobuf', 'CQRS & Event Sourcing'],
    benefit: 'Handle 100k+ transactions per second with sub-10ms P99 latency profiles.',
  },
  {
    slug: 'enterprise-data-engineering',
    icon: 'storage',
    category: 'Data & Analytics',
    themeColor: 'amber',
    title: 'Enterprise Data Engineering & Real-time Analytics',
    description:
      'Unified data lakes, real-time stream processing, and analytical warehouses for instantaneous business intelligence.',
    features: ['Apache Iceberg Lakehouses', 'ClickHouse Real-Time OLAP', 'Automated ETL Pipelines'],
    benefit: 'Instant analytics queries on petabyte-scale streaming datasets.',
  },
  {
    slug: 'cybersecurity-zero-trust',
    icon: 'lock',
    category: 'Security & Governance',
    themeColor: 'purple',
    title: 'Cybersecurity & Zero-Trust Architecture',
    description:
      'Comprehensive enterprise defense, identity-first access control, and continuous security compliance guardrails.',
    features: ['Zero-Trust Architecture', 'SOC2 / HIPAA Guardrails', 'Automated SAST/DAST'],
    benefit: 'Enterprise-grade defensibility with continuous compliance assurance.',
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
