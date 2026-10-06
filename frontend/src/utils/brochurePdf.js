import { homeStats } from '../data/home.js';

export const brochureHighlights = [
  'Enterprise software engineering and platform modernization',
  'Cloud, AI, and data-driven transformation programs',
  'Security-first digital journeys and resilient architecture',
  'Global delivery partnerships and measurable outcomes',
];

export const brochureCapabilities = [
  { title: 'Digital Engineering', description: 'Custom products, automation platforms, and cloud-native solutions built for scale.' },
  { title: 'AI & Data', description: 'Advanced analytics, automation, and intelligent workflows that improve decision-making.' },
  { title: 'Cybersecurity', description: 'Zero-trust foundations, compliance frameworks, and proactive protection strategies.' },
];

// Single source of truth for marketing stats — kept consistent with `data/home.js`.
export const brochureStats = [
  { label: 'Projects Delivered', value: homeStats[0].value },
  { label: 'Global Clients', value: homeStats[1].value },
  { label: 'Countries', value: '18+' },
  { label: 'Engineers', value: '285+' },
];

export const brochureServices = [
  { title: 'Cloud Architecture', desc: 'AWS, Azure & GCP migrations, multi-cloud strategy, and FinOps optimisation.' },
  { title: 'AI & Machine Learning', desc: 'Predictive models, NLP pipelines, computer vision, and MLOps at scale.' },
  { title: 'ERP & CRM Systems', desc: 'SAP, Oracle, and custom ERP implementations with seamless data integration.' },
  { title: 'DevSecOps', desc: 'CI/CD pipelines, container orchestration, and shift-left security practices.' },
  { title: 'Data Engineering', desc: 'Real-time streaming, data lakes, warehousing, and BI dashboards.' },
  { title: 'Product Engineering', desc: 'End-to-end product design, development, and launch for digital ventures.' },
];

export async function buildBrochurePdf() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF('p', 'pt', 'a4');
  const W = 595, H = 842;
  const brand = [10, 37, 96];       // #0a2560
  const cyan  = [0, 212, 255];      // accent-cyan
  const white = [255, 255, 255];
  const muted = [100, 116, 139];
  const ink   = [15, 23, 42];

  // ── PAGE 1 ──────────────────────────────────────────────
  // Header band
  doc.setFillColor(...brand);
  doc.rect(0, 0, W, 180, 'F');

  // Cyan accent bar
  doc.setFillColor(...cyan);
  doc.rect(0, 180, W, 5, 'F');

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...white);
  doc.text('CoralSwift Technologies', 40, 70);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...cyan);
  doc.text('CORPORATE BROCHURE 2026', 40, 95);

  // Hero headline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...white);
  const headline = doc.splitTextToSize('Engineering resilient digital futures for ambitious enterprises.', 500);
  doc.text(headline, 40, 130);

  // Intro paragraph
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  const intro = doc.splitTextToSize(
    'CoralSwift partners with global organisations to design, build, and operate secure digital platforms that unlock efficiency, resilience, and growth. With over a decade of enterprise delivery experience, we bring together strategy, engineering, and operational excellence to create lasting value.',
    515
  );
  doc.text(intro, 40, 210);

  // Stats row
  const statY = 290;
  brochureStats.forEach((s, i) => {
    const x = 40 + i * 130;
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(x, statY, 115, 60, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...brand);
    doc.text(s.value, x + 57, statY + 28, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(s.label.toUpperCase(), x + 57, statY + 46, { align: 'center' });
  });

  // Section: What you'll find inside
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brand);
  doc.text("What You'll Find Inside", 40, 390);

  doc.setFillColor(...cyan);
  doc.rect(40, 397, 60, 2, 'F');

  brochureHighlights.forEach((item, i) => {
    const y = 420 + i * 28;
    doc.setFillColor(...cyan);
    doc.circle(47, y - 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...ink);
    doc.text(item, 58, y);
  });

  // Section: Why clients choose us
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...brand);
  doc.text('Why Clients Choose Us', 40, 550);

  doc.setFillColor(...cyan);
  doc.rect(40, 557, 60, 2, 'F');

  const whyText = doc.splitTextToSize(
    'We combine strategic consulting, product engineering, and operational excellence to deliver secure, scalable solutions. Our teams embed with yours — from discovery through to live operations — ensuring every decision is grounded in your business outcomes.',
    515
  );
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text(whyText, 40, 578);

  // Capabilities cards
  brochureCapabilities.forEach((cap, i) => {
    const x = 40 + i * 175;
    const y = 640;
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(x, y, 160, 90, 6, 6, 'F');
    doc.setFillColor(...cyan);
    doc.rect(x, y, 4, 90, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...brand);
    doc.text(cap.title, x + 12, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...muted);
    const desc = doc.splitTextToSize(cap.description, 140);
    doc.text(desc, x + 12, y + 38);
  });

  // Page 1 footer
  doc.setFillColor(...brand);
  doc.rect(0, H - 40, W, 40, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text('www.coralswifttech.com  |  hello@coralswifttech.com', 40, H - 16);
  doc.text('Page 1 of 2', W - 40, H - 16, { align: 'right' });

  // ── PAGE 2 ──────────────────────────────────────────────
  doc.addPage();

  // Header band
  doc.setFillColor(...brand);
  doc.rect(0, 0, W, 80, 'F');
  doc.setFillColor(...cyan);
  doc.rect(0, 80, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...white);
  doc.text('Our Services & Expertise', 40, 52);

  // Services grid (2 columns)
  brochureServices.forEach((svc, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 40 + col * 265;
    const y = 110 + row * 120;
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(x, y, 245, 100, 6, 6, 'F');
    doc.setFillColor(...cyan);
    doc.rect(x, y, 4, 100, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...brand);
    doc.text(svc.title, x + 14, y + 26);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    const d = doc.splitTextToSize(svc.desc, 220);
    doc.text(d, x + 14, y + 44);
  });

  // Case study highlight
  const csY = 490;
  doc.setFillColor(...brand);
  doc.roundedRect(40, csY, W - 80, 130, 8, 8, 'F');
  doc.setFillColor(...cyan);
  doc.rect(40, csY, 5, 130, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...cyan);
  doc.text('FEATURED CASE STUDY', 55, csY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...white);
  doc.text('Global Ledger: Rethinking Banking Infrastructure', 55, csY + 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(200, 220, 255);
  const csDesc = doc.splitTextToSize(
    'Implemented a scalable, cloud-native ERP solution for a Fortune 500 financial entity, reducing transaction latency by 45% across three continents while achieving ISO 27001 certification.',
    490
  );
  doc.text(csDesc, 55, csY + 64);

  // Case study stats
  const csStats = [['45% Faster', 'Transaction Latency'], ['ISO 27001', 'Security Standard'], ['99.98%', 'System Uptime'], ['1,800 / yr', 'Compliance Hours Saved']];
  csStats.forEach(([val, lbl], i) => {
    const x = 55 + i * 125;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...cyan);
    doc.text(val, x, csY + 104);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 200, 240);
    doc.text(lbl.toUpperCase(), x, csY + 118);
  });

  // CTA section
  const ctaY = 650;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...brand);
  doc.text("Ready to engineer what's next?", 40, ctaY);

  doc.setFillColor(...cyan);
  doc.rect(40, ctaY + 8, 60, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  doc.text('Talk to a Solution Architect about your next digital transformation initiative.', 40, ctaY + 28);

  // Contact details
  const contacts = [
    ['language', 'www.coralswifttech.com'],
    ['email', 'hello@coralswifttech.com'],
    ['location_on', 'Delhi, IN  |  Dubai, UAE  |  Seattle, US'],
  ];
  contacts.forEach(([, text], i) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...brand);
    doc.text(text, 40, ctaY + 60 + i * 22);
  });

  // Page 2 footer
  doc.setFillColor(...brand);
  doc.rect(0, H - 40, W, 40, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...white);
  doc.text('© 2026 CoralSwift Technologies. All rights reserved.', 40, H - 16);
  doc.text('Page 2 of 2', W - 40, H - 16, { align: 'right' });

  return doc;
}
