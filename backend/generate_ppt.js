const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Define Master Slide
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { color: '0A0E1A' }, // Dark background
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: '10%', fill: { color: '0A0E1A' } } },
    { line: { x: '5%', y: '10%', w: '90%', h: 0, line: { color: '1E293B', width: 1 } } }
  ]
});

// SLIDE 1: TITLE
let slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide1.addText('DiagnoLabs', { x: 0, y: 1.5, w: '100%', h: 1, fontSize: 56, bold: true, color: '3B82F6', align: 'center' });
slide1.addText('Enterprise Medical Diagnostics Platform', { x: 0, y: 2.6, w: '100%', h: 0.5, fontSize: 20, color: '94A3B8', align: 'center', letterSpacing: 3 });
slide1.addText('A Geospatial & Telemetry-Driven Self-Learning AI Platform\nfor Accredited Diagnostic Pathology Access', { x: 0, y: 3.2, w: '100%', h: 1, fontSize: 16, color: 'F1F5F9', align: 'center' });
slide1.addText('G. Siva Manikanta | D. Venkat Sai | M. Srikanth | G. Avinash\nGuide: Ms. Ritu Agrawal, CSE-AIML, Parul University', { x: 0, y: 5, w: '100%', h: 1, fontSize: 14, color: '06B6D4', align: 'center' });

// SLIDE 2: PROBLEM
let slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide2.addText('THE CHALLENGE', { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 12, color: '06B6D4', bold: true });
slide2.addText('The Diagnostic Healthcare Crisis', { x: 0.5, y: 0.7, w: '90%', h: 1, fontSize: 36, bold: true, color: 'F1F5F9' });
slide2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 2, w: 4.2, h: 2, fill: { color: '1E293B' } });
slide2.addText('80% Labs Unaccredited', { x: 0.6, y: 2.1, w: 4, h: 0.5, fontSize: 16, bold: true, color: 'FB7185' });
slide2.addText('Over 80% of diagnostic labs in India lack NABL accreditation.', { x: 0.6, y: 2.6, w: 4, h: 1, fontSize: 12, color: '94A3B8' });
slide2.addShape(pptx.ShapeType.rect, { x: 5, y: 2, w: 4.2, h: 2, fill: { color: '1E293B' } });
slide2.addText('Opaque Pricing', { x: 5.1, y: 2.1, w: 4, h: 0.5, fontSize: 16, bold: true, color: 'FBBF24' });
slide2.addText('No standardized pricing registries, leading to arbitrary fees.', { x: 5.1, y: 2.6, w: 4, h: 1, fontSize: 12, color: '94A3B8' });

// SLIDE 3: SOLUTION
let slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide3.addText('OUR SOLUTION', { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 12, color: '06B6D4', bold: true });
slide3.addText('DiagnoLabs — 5 Core Pillars', { x: 0.5, y: 0.7, w: '90%', h: 1, fontSize: 36, bold: true, color: 'F1F5F9' });
slide3.addText('1. Geospatial NABL Discovery Engine\n2. 14-Tier Role-Based Access Control (RBAC)\n3. Self-Learning AI Clinical Copilot\n4. End-to-End Field Sample Logistics\n5. Enterprise UI Design System', { x: 1, y: 2, w: 8, h: 3, fontSize: 20, color: '94A3B8', lineSpacing: 36, bullet: true });

// SLIDE 4: ARCHITECTURE
let slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide4.addText('SYSTEM DESIGN', { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 12, color: '06B6D4', bold: true });
slide4.addText('3-Tier Microservices Architecture', { x: 0.5, y: 0.7, w: '90%', h: 1, fontSize: 36, bold: true, color: 'F1F5F9' });
slide4.addShape(pptx.ShapeType.rect, { x: 1, y: 2, w: 8, h: 0.8, fill: { color: '1E3A8A' } });
slide4.addText('TIER 1 - Client Frontend (React 18 + Vite)', { x: 1, y: 2.1, w: 8, h: 0.6, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });
slide4.addShape(pptx.ShapeType.downArrow, { x: 4.8, y: 2.8, w: 0.4, h: 0.4, fill: { color: '94A3B8' } });
slide4.addShape(pptx.ShapeType.rect, { x: 1, y: 3.2, w: 8, h: 0.8, fill: { color: '4C1D95' } });
slide4.addText('TIER 2 - Express Security Gateway (JWT + RBAC)', { x: 1, y: 3.3, w: 8, h: 0.6, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });
slide4.addShape(pptx.ShapeType.downArrow, { x: 4.8, y: 4.0, w: 0.4, h: 0.4, fill: { color: '94A3B8' } });
slide4.addShape(pptx.ShapeType.rect, { x: 1, y: 4.4, w: 8, h: 0.8, fill: { color: '064E3B' } });
slide4.addText('TIER 3 - MongoDB Atlas + Gemini AI + Razorpay', { x: 1, y: 4.5, w: 8, h: 0.6, fontSize: 16, bold: true, color: 'FFFFFF', align: 'center' });

// SLIDE 5: ALGORITHM
let slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide5.addText('CORE ALGORITHM', { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 12, color: '06B6D4', bold: true });
slide5.addText('Geospatial NABL Discovery', { x: 0.5, y: 0.7, w: '90%', h: 1, fontSize: 36, bold: true, color: 'F1F5F9' });
slide5.addShape(pptx.ShapeType.rect, { x: 1, y: 2, w: 8, h: 1, fill: { color: '1E40AF' } });
slide5.addText('Si = d_haversine(p, l) / [ 1 + (w_nabl * alpha) + (w_rating * rho/5) ]', { x: 1, y: 2, w: 8, h: 1, fontSize: 18, color: 'FFFFFF', align: 'center' });
slide5.addText('Result: Accredited Labs rank higher despite being physically farther away.', { x: 1, y: 3.5, w: 8, h: 1, fontSize: 16, color: '34D399', align: 'center' });

// SLIDE 6: CONCLUSION
let slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
slide6.addText('CONCLUSION', { x: 0.5, y: 0.3, w: '90%', h: 0.5, fontSize: 12, color: '06B6D4', bold: true });
slide6.addText('Project Highlights', { x: 0.5, y: 0.7, w: '90%', h: 1, fontSize: 36, bold: true, color: 'F1F5F9' });
slide6.addText('• Diagnostic-First Paradigm: Verified data before consultation\n• Self-Learning AI: RLHF telemetry reduces errors to 3.1%\n• Enterprise Security: 14-Tier RBAC & HIPAA Compliant', { x: 1, y: 2, w: 8, h: 3, fontSize: 20, color: '94A3B8', lineSpacing: 36, bullet: true });
slide6.addText('THANK YOU', { x: 0.5, y: 4.5, w: 9, h: 1, fontSize: 40, bold: true, color: '3B82F6', align: 'center' });

// SAVE
pptx.writeFile({ fileName: '../DiagnoLabs_Presentation.pptx' })
  .then(fileName => {
    console.log('Created file: ' + fileName);
  })
  .catch(err => {
    console.error('Error: ', err);
  });
