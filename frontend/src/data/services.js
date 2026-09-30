export const services = [
  {
    slug: 'cloud-architecture-modernization',
    icon: 'cloud_sync',
    title: 'Cloud Architecture & Modernization',
    description:
      'Multi-region AWS, GCP, and Azure deployments, Kubernetes orchestrations, automated zero-downtime canary rollouts, and infrastructure-as-code with Terraform and OpenTofu.',
    features: ['Multi-Region Mesh', 'Zero-Downtime Canary Rollouts', 'Terraform & OpenTofu IaC'],
    benefit: 'Sub-second failover and up to 40% reduction in cloud infrastructure TCO.',
  },
  {
    slug: 'ai-applied-ml',
    icon: 'psychology',
    title: 'AI & Applied Machine Learning',
    description:
      'Custom LLM fine-tuning, deterministic RAG pipelines, distributed ML training architectures, and production-grade agentic workflow automation.',
    features: ['Deterministic RAG', 'Enterprise LLM Fine-Tuning', 'Agentic Workflows'],
    benefit: 'Production-ready AI systems with auditable safety and sub-50ms inference latency.',
  },
  {
    slug: 'enterprise-devsecops',
    icon: 'verified_user',
    title: 'Enterprise DevSecOps & SRE',
    description:
      '99.999% availability engineering, automated CI/CD security gating, GitOps workflows with ArgoCD, and comprehensive OpenTelemetry distributed tracing.',
    features: ['ArgoCD GitOps', 'OpenTelemetry Tracing', 'Automated Security Gating'],
    benefit: 'Eliminate deployment incidents and achieve 99.999% platform availability.',
  },
  {
    slug: 'distributed-systems',
    icon: 'hub',
    title: 'Distributed Systems & Microservices',
    description:
      'Low-latency event-driven architectures with Apache Kafka, gRPC microservices, CQRS data patterns, and distributed consensus mechanisms.',
    features: ['Kafka Event Streams', 'gRPC & Protobuf', 'CQRS & Event Sourcing'],
    benefit: 'Handle 100k+ transactions per second with sub-10ms P99 latency profiles.',
  },
  {
    slug: 'enterprise-data-engineering',
    icon: 'analytics',
    title: 'Enterprise Data Engineering',
    description:
      'Real-time data lakehouses using Apache Iceberg, Snowflake, and ClickHouse; automated streaming ETL pipelines; governance and lineage frameworks.',
    features: ['Apache Iceberg Lakehouses', 'ClickHouse Real-Time OLAP', 'Automated ETL Pipelines'],
    benefit: 'Instant analytics queries on petabyte-scale streaming datasets.',
  },
  {
    slug: 'cybersecurity-zero-trust',
    icon: 'shield_lock',
    title: 'Cybersecurity & Zero-Trust',
    description:
      'Zero-trust network access (ZTNA), automated SOC2/HIPAA compliance guardrails, cryptographic key management, and rigorous penetration testing.',
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
