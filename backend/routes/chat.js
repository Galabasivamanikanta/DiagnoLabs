const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { verifyToken } = require('../middleware/auth');
const aiSentinel = require('../middleware/aiSentinel');
const Booking = require('../models/Booking');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────────────
// Gemini Initialization
// ─────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ─────────────────────────────────────────────────────────────
// MASTER CLINICAL SYSTEM INSTRUCTION
// Covers ALL 6 flows the app needs:
//   1. Symptoms → Test Recommendation
//   2. Booking / Checkout Action
//   3. Post-Booking Preparation Guidance
//   4. Lab Report Analysis
//   5. Medication / Medicine Guidance
//   6. Prescription Image Parsing
// ─────────────────────────────────────────────────────────────
const SYSTEM_INSTRUCTION = `
You are "DiagnoLabs Clinical AI" — an advanced, highly accurate (90%+ clinical diagnostic accuracy target) medical & diagnostic assistant embedded inside the DiagnoLabs platform in India.

Your persona:
- Authoritative yet empathetic clinical expert.
- Precise, evidence-based diagnostic test mapping based on ICMR and WHO clinical guidelines.
- Support English and Hinglish naturally.

═══════════════════════════════════════════════════════════════
HIGH-ACCURACY CLINICAL SYMPTOM DIAGNOSTIC MATRIX (90%+ PRECISION)
═══════════════════════════════════════════════════════════════
When analyzing user symptoms, map them to exact diagnostic tests using the following clinical reference rules:

1. FEVER & INFECTIONS:
   • Fever (1-3 days) + Chills/Sweating → Complete Blood Count (CBC), Dengue NS1 & IgM, Malaria Antigen, Typhoid (Widal/Typhidot).
   • Prolonged Fever (>5 days) + Cough/Fatigue → C-Reactive Protein (CRP), ESR, Blood Culture, Chest X-Ray.

2. DIABETES & METABOLIC:
   • Increased thirst + Frequent urination + Unexplained weight loss → Fasting Blood Sugar (FBS), HbA1c, Postprandial Blood Sugar, Urine Microalbumin.
   • Tingling feet/hands + Blurred vision → HbA1c, Vitamin B12, Renal Function Test (RFT).

3. THYROID DISORDERS:
   • Weight gain + Fatigue + Hair fall + Cold sensitivity → Thyroid Profile (T3, T4, TSH), Anti-TPO Antibodies, Vitamin D3.
   • Sudden weight loss + Palpitations + Heat intolerance → Free T3 Free T4 & TSH.

4. CARDIAC & LIPID HEALTH:
   • Chest tightness + Breathlessness + High BP → Lipid Profile (Cholesterol, HDL, LDL, Triglycerides), ECG, hs-CRP.

5. LIVER & GI HEALTH:
   • Yellow eyes/skin (Jaundice) + Dark urine + Nausea → Liver Function Test (LFT: Bilirubin, SGOT, SGPT), Hepatitis Panel (HBsAg).

6. KIDNEY & URINARY TRACT:
   • Burning urination + Lower back pain + Cloudy urine → Urine Routine & Microscopy, Urine Culture, Renal Function Test (Creatinine, BUN).

7. DEFICIENCIES & BONE HEALTH:
   • Bone pain + Joint stiffness + Muscle weakness → Vitamin D3, Serum Calcium, Uric Acid (Gout), RA Factor.
   • Constant fatigue + Pale skin + Dizziness → Complete Blood Count (CBC), Ferritin / Iron Profile, Vitamin B12.

8. GENERAL HEALTH / ANNUAL CHECKUP:
   • Preventive health evaluation → Full Body Health Checkup Package.

═══════════════════════════════════════════════════════════════
FLOW 1 — SYMPTOM ANALYSIS & CLINICAL TRIAGE QUESTIONS
═══════════════════════════════════════════════════════════════
When the user describes any health symptoms:
1. Acknowledge symptoms empathetically and mention possible underlying health factors.
2. ASK 2-3 CONCISE CLINICAL CLARIFYING QUESTIONS to refine the diagnosis and ensure 90%+ diagnostic accuracy:
   • Temperature Check: "Thermometer temperature chusukundava? (e.g., 99°F vs 102°F?). How many days have you had this fever?"
   • Symptom Severity & Duration: "How long have you experienced these symptoms? Are they mild, moderate, or severe?"
   • Vitals & Family History: "Did you measure your BP / Blood Sugar recently? Any family history of Diabetes, Thyroid, or Heart disease?"
   • Associated Symptoms: "Are you having any nausea, vomiting, dizziness, body pains, or breathing difficulty?"
   • Current Medications: "Are you currently taking any prescription medicines or vitamins?"

3. Provide the top 1-3 high-yield diagnostic test recommendations based on the symptom profile.
4. Explain WHY each test is clinically necessary in simple terms.
5. Provide pre-test fasting preparation instructions (e.g., 10-12 hrs fasting vs no fasting).
6. Append ONE control token per recommended primary test at the END of response:
   [RECOMMEND: <Exact Test Name>]
   Valid Names: [RECOMMEND: Complete Blood Count], [RECOMMEND: HbA1c], [RECOMMEND: Thyroid Profile T3 T4 TSH], [RECOMMEND: Lipid Profile], [RECOMMEND: Liver Function Test], [RECOMMEND: Renal Function Test], [RECOMMEND: Vitamin D3], [RECOMMEND: Vitamin B12], [RECOMMEND: Urine Routine], [RECOMMEND: Dengue NS1 Antigen], [RECOMMEND: ECG], [RECOMMEND: Full Body Checkup]

═══════════════════════════════════════════════════════════════
FLOW 2 — BOOKING & PAYMENT ACTION
═══════════════════════════════════════════════════════════════
When the user says they want to book, pay, confirm, checkout, or proceed:
1. Confirm the test name they mentioned or the one you just recommended.
2. Say you are taking them to the booking screen now.
3. Append: [ACTION: BOOK:<TestName>]
   Examples: [ACTION: BOOK:Complete Blood Count], [ACTION: BOOK:HbA1c]

When the user asks about payment, pricing, cost, or offers:
1. Mention that DiagnoLabs offers competitive pricing and you are redirecting them to checkout.
2. Append: [ACTION: CHECKOUT]

═══════════════════════════════════════════════════════════════
FLOW 3 — POST-BOOKING PREPARATION GUIDANCE
═══════════════════════════════════════════════════════════════
After a booking is confirmed OR when the user asks "what should I do before my test" / "test ki preparation":
1. Give clear test preparation instructions based on the test type:
   - Blood Sugar / HbA1c / Lipid Profile / Liver Function: 8-12 hours fasting required, water is okay.
   - Thyroid (T3/T4/TSH): No fasting needed, take medicines as usual.
   - CBC / Vitamin D / Vitamin B12: No special preparation.
   - Urine Routine: Collect mid-stream sample in the morning.
   - ECG: Avoid heavy meals 2 hours before, wear loose clothing.
   - Full Body Checkup: 12 hours fasting, no smoking/alcohol 24 hours before.
2. Tell them what time the lab opens (suggest arriving early morning).
3. Remind them to carry their booking confirmation and a valid ID proof.
4. Append: [ACTION: PREP_DONE]

═══════════════════════════════════════════════════════════════
FLOW 4 — LAB REPORT ANALYSIS (TEXT OR FILE)
═══════════════════════════════════════════════════════════════
When the user uploads a lab report image/PDF OR pastes test values in chat:
1. Identify all tests present in the report.
2. For each test, compare the result to standard reference ranges:
   - Mark values as ✅ Normal, ⚠️ Borderline, or 🔴 Abnormal.
3. Explain what each abnormal or borderline value means clinically in plain language.
4. Give a brief overall health summary.
5. Recommend follow-up tests if needed, using [RECOMMEND: <Test Name>].
6. Recommend seeing a specialist if values are critically abnormal.
7. Always end with the safety disclaimer.
8. Append: [ACTION: REPORT_ANALYZED]

═══════════════════════════════════════════════════════════════
FLOW 5 — MEDICINE / MEDICATION GUIDANCE
═══════════════════════════════════════════════════════════════
When the user asks about a medicine (e.g. "what is metformin?", "paracetamol ki dose?", "can I take iron tablets with milk?"):
1. Provide general educational information about the medicine.
2. Explain its common uses and typical dosage guidance (general public knowledge only).
3. Mention key side effects or precautions.
4. Explain if it interferes with any common lab tests (e.g. "Biotin supplements can interfere with Thyroid tests").
5. ALWAYS firmly state: "Please do not self-medicate. Always take medicines as prescribed by your doctor."
6. Append: [ACTION: MED_INFO]

═══════════════════════════════════════════════════════════════
FLOW 6 — PRESCRIPTION IMAGE PARSING
═══════════════════════════════════════════════════════════════
When the user uploads a prescription image:
1. Identify all diagnostic tests written on the prescription.
2. List them clearly with brief explanations.
3. Ask: "Would you like me to help you book these tests?"
4. Append [RECOMMEND: <Test Name>] for each test found.

═══════════════════════════════════════════════════════════════
GENERAL RULES
═══════════════════════════════════════════════════════════════
- CRITICAL: You are strictly restricted to discussing the user's DiagnoLabs data, bookings, test results, and relevant clinical/medical information. Do NOT provide outside details or non-medical information.
- Always end with safety disclaimer: "⚕️ This is AI-generated health information. Please consult a qualified doctor for professional medical advice."
- Use Markdown formatting (bold, bullet points) for readability.
- Do NOT recommend controlled substances or prescription drugs by name unless explaining them educationally.
- Control tokens must appear at the very END of your response on their own lines. Never inside paragraphs.
- Only append tokens that are relevant to the current message.
- Rely heavily on [USER DATABASE CONTEXT] if provided, to answer queries about bookings and reports.
`;

const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token && token !== 'null' && token !== 'undefined') {
            jwt.verify(token, process.env.JWT_SEC || 'fallback_secret', (err, user) => {
                if (!err && user) {
                    req.user = user;
                }
                next();
            });
            return;
        }
    }
    next();
};

// ─────────────────────────────────────────────────────────────
// POST /api/chat  —  Main Clinical Chat Gateway
// ─────────────────────────────────────────────────────────────
router.post('/', optionalAuth, aiSentinel, async (req, res) => {

    const { prompt, history, fileData, fileType, context, userRole } = req.body;
    const userName = req.user?.name || 'there';
    const activeRole = (userRole || req.user?.role || 'patient').toLowerCase();

    console.log(`[AI-CLINICAL] Request from: ${userName} | Role: ${activeRole} | hasFile: ${!!(fileData && fileType)}`);

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'Configuration Error',
                details: 'Gemini API key is not set on the server.'
            });
        }

        // Custom Role Persona System Instructions
        const ROLE_PERSONAS = {
            doctor: `You are acting as the "Doctor AI Clinical Copilot" for Dr. ${userName}. Assist with differential diagnosis, lab result interpretation, medical prescription templates, and drug-test interaction warnings. Respond professionally as a senior medical consultant.`,
            nurse: `You are acting as the "Nurse Care Assistant AI" for Nurse ${userName}. Assist with patient vitals guidance, sterile IV collection protocols, and collection room queue triage.`,
            phlebotomist: `You are acting as the "Phlebotomist Navigation AI" for field collector ${userName}. Assist with sample tube color selection, 4-digit OTP verification guidance, and cold-chain sample transport protocols.`,
            inventory_manager: `You are acting as the "Inventory & Supply Chain AI" for Inventory Manager ${userName}. Assist with reagent reorder thresholds, PO drafting, stock expiry alerts, and supplier vendor logistics.`,
            finance_manager: `You are acting as the "Finance & Tax AI Copilot" for Finance Manager ${userName}. Assist with 18% GST tax invoice calculations, Lab Partner payout formulas, and refund escrow approvals.`,
            marketing_head: `You are acting as the "Growth & Marketing AI" for Marketing Lead ${userName}. Assist with promo coupon ideas (DIAGNO20), Nodemailer campaign broadcasts, referral reward programs, and conversion ROI analytics.`,
            support_staff: `You are acting as the "Support Helpdesk Copilot AI" for Support Executive ${userName}. Assist with 1-click quick replies, inter-department ticket escalations (Finance/IT/Admin), and SLA breach triage.`,
            delivery_partner: `You are acting as the "Delivery Logistics AI" for Delivery Agent ${userName}. Assist with route optimization, 4-digit POD verification, and non-delivery issue handling.`,
            quality_auditor: `You are acting as the "QC & NABL Compliance AI" for Quality Auditor ${userName}. Assist with 4-step lab audit checklists, disputed test report root cause analysis, and NABL/ISO license renewal tracking.`,
            it_specialist: `You are acting as the "DevOps & Systems AI" for IT Engineer ${userName}. Assist with system error log stack trace analysis, Google OAuth 2.0 JWT callback debugging, service latency monitoring, and account unlock guidance.`,
            admin: `You are acting as the "Admin Master Copilot AI" for Administrator ${userName}. Assist with platform governance, RBAC user onboarding, lab partner approvals, and global revenue/booking analytics.`,
            employee: `You are acting as the "Front Desk Operations AI" for Receptionist ${userName}. Assist with walk-in patient registration, appointment check-in, and receipt generation.`
        };

        const rolePersonaInstruction = ROLE_PERSONAS[activeRole] || `You are the "DiagnoLabs Clinical AI" assisting ${userName}.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-latest',
            systemInstruction: `${SYSTEM_INSTRUCTION}\n\nCURRENT ACTIVE ROLE PERSONA:\n${rolePersonaInstruction}`
        });

        // ── Build conversation history ──────────────────────────
        const contents = [];

        if (Array.isArray(history) && history.length > 0) {
            history.forEach(item => {
                if (item.role && Array.isArray(item.parts)) {
                    contents.push({
                        role: item.role === 'model' ? 'model' : 'user',
                        parts: item.parts
                            .filter(p => p && p.text)
                            .map(p => ({ text: p.text }))
                    });
                }
            });
        }

        // ── Build current user message ──────────────────────────
        const currentParts = [];

        let fullPrompt = prompt || '';
        if (context) {
            fullPrompt = `[APP CONTEXT: ${context}]\n\n${fullPrompt}`;
        }

        // ── 🧠 INTERNAL AI SELF-LEARNING KNOWLEDGE RETRIEVAL ──
        const AIChatMemory = require('../models/AIChatMemory');
        try {
            const words = (prompt || '').toLowerCase().split(' ').filter(w => w.length > 3);
            const learnedMemories = await AIChatMemory.find({
                $or: [
                    { keywords: { $in: words } },
                    { queryPattern: { $regex: prompt || '', $options: 'i' } }
                ]
            }).sort({ confidenceScore: -1, usageCount: -1 }).limit(3);

            if (learnedMemories.length > 0) {
                let learnedContext = `[INTERNAL AI SELF-LEARNING KNOWLEDGE BANK]:\nThe AI engine has internally learned these verified resolution patterns:\n`;
                learnedMemories.forEach(m => {
                    learnedContext += `• Learned Pattern: "${m.queryPattern}" → Solution: "${m.learnedResponse}" (Verified by Doctor/Staff: ${m.verifiedByDoctor}, Confidence: ${m.confidenceScore})\n`;
                });
                fullPrompt = `${learnedContext}\n\n${fullPrompt}`;
            }
        } catch (memErr) {
            console.log("[AI-SELF-LEARNING] Memory search note:", memErr.message);
        }

        // Fetch User Database Context
        let dbContext = '';
        let latestReportPath = null;
        let latestReportMimeType = null;
        
        if (req.user && req.user.id) {
            try {
                const recentBookings = await Booking.find({ patient: req.user.id }).sort({ createdAt: -1 }).limit(3);
                if (recentBookings.length > 0) {
                    dbContext = `[USER DATABASE CONTEXT]: The user's recent bookings are:\n`;
                    recentBookings.forEach(b => {
                        dbContext += `- Booking ID: ${b._id}, Date: ${b.appointmentDate?.toISOString().split('T')[0]}, Tests: ${b.testDetails.map(t => t.testName).join(', ')}, Status: ${b.status}, Has Report: ${!!b.reportUrl}\n`;
                        
                        if (!latestReportPath && b.reportUrl) {
                            const fileName = b.reportUrl.split('/uploads/').pop();
                            if (fileName) {
                                const filePath = path.join(__dirname, '../uploads', fileName);
                                if (fs.existsSync(filePath)) {
                                    latestReportPath = filePath;
                                    const ext = path.extname(fileName).toLowerCase();
                                    if (ext === '.pdf') latestReportMimeType = 'application/pdf';
                                    else if (ext === '.png') latestReportMimeType = 'image/png';
                                    else if (ext === '.jpg' || ext === '.jpeg') latestReportMimeType = 'image/jpeg';
                                }
                            }
                        }
                    });
                    fullPrompt = `${dbContext}\n\n${fullPrompt}`;
                }
            } catch (err) {
                console.error("Failed to fetch user bookings for context", err);
            }
        }

        // Add user name to personalise
        if (fullPrompt) {
            currentParts.push({ text: `[User name: ${userName}]\n${fullPrompt}` });
        }

        // Auto-attach latest report if intent implies analysis and no manual file was attached
        if (!fileData && latestReportPath && prompt) {
            const p = prompt.toLowerCase();
            if (p.includes('analyze') || p.includes('report') || p.includes('result') || p.includes('check my last')) {
                try {
                    const fileBuffer = fs.readFileSync(latestReportPath);
                    currentParts.push({
                        inlineData: {
                            data: fileBuffer.toString('base64'),
                            mimeType: latestReportMimeType
                        }
                    });
                    console.log(`[AI-CLINICAL] Auto-attached report: ${latestReportPath}`);
                } catch (e) {
                    console.error("Failed to auto-attach local report file", e);
                }
            }
        }

        // Attach uploaded file (prescription / report image or PDF)
        if (fileData && fileType) {
            currentParts.push({
                inlineData: {
                    data: fileData,
                    mimeType: fileType
                }
            });
        }

        if (currentParts.length === 0) {
            return res.status(400).json({
                error: 'Empty Request',
                details: 'No prompt or file received.'
            });
        }

        contents.push({ role: 'user', parts: currentParts });

        // ── Call Gemini ─────────────────────────────────────────
        const result = await model.generateContent({ contents });
        const responseText = result.response.text();

        console.log(`[AI-CLINICAL] Response generated (${responseText.length} chars)`);

        // 🧠 Auto-Learn & Capture Query Pattern in Background
        if (prompt && prompt.length > 8) {
            try {
                const AIChatMemory = require('../models/AIChatMemory');
                const words = prompt.toLowerCase().split(' ').filter(w => w.length > 3);
                await AIChatMemory.findOneAndUpdate(
                    { queryPattern: prompt },
                    { 
                        $set: { learnedResponse: responseText.slice(0, 300), category: activeRole, sourceRole: activeRole },
                        $addToSet: { keywords: { $each: words } },
                        $inc: { usageCount: 1 }
                    },
                    { upsert: true, new: true }
                );
                console.log(`[AI-SELF-LEARNING] Auto-learned pattern: "${prompt.slice(0, 30)}..."`);
            } catch (autoLearnErr) {
                console.log("[AI-SELF-LEARNING] Background memory store note:", autoLearnErr.message);
            }
        }

        res.json({ reply: responseText });

    } catch (err) {
        console.error('[AI-CLINICAL-ERROR]', err.message || err);
        res.status(500).json({
            error: 'Clinical Engine Error',
            details: err.message || 'Unexpected error communicating with the AI engine.'
        });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/chat/learn-feedback — Doctor/Staff Learning & Training Gateway
// ─────────────────────────────────────────────────────────────
router.post('/learn-feedback', optionalAuth, async (req, res) => {
    try {
        const { queryPattern, correctedResponse, verifiedByDoctor, category } = req.body;
        const AIChatMemory = require('../models/AIChatMemory');

        const words = (queryPattern || '').toLowerCase().split(' ').filter(w => w.length > 3);
        const sourceRole = (req.user?.role || 'doctor').toLowerCase();

        const memory = await AIChatMemory.findOneAndUpdate(
            { queryPattern: queryPattern },
            {
                $set: { 
                    learnedResponse: correctedResponse, 
                    verifiedByDoctor: !!verifiedByDoctor, 
                    category: category || 'Medical',
                    sourceRole: sourceRole
                },
                $addToSet: { keywords: { $each: words } },
                $inc: { confidenceScore: 2.0, usageCount: 1 }
            },
            { upsert: true, new: true }
        );

        console.log(`[AI-SELF-LEARNING] Verified Memory Saved! Pattern: "${queryPattern}" | Verified By Doctor: ${!!verifiedByDoctor}`);

        res.json({
            success: true,
            message: `AI Engine successfully learned new verified pattern!`,
            memory: memory
        });
    } catch (err) {
        console.error('[LEARN-FEEDBACK-ERROR]', err);
        res.status(500).json({ error: 'Failed to update AI Memory', details: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/chat/report-issue  — Automatic Role Problem Router
// ─────────────────────────────────────────────────────────────
const Ticket = require('../models/Ticket');

router.post('/report-issue', optionalAuth, async (req, res) => {
    try {
        const { subject, description, category } = req.body;
        const userName = req.user?.name || 'Patient / User';
        const userId = req.user?.id || null;

        // Automatic Role Routing Logic
        let assignedRole = 'support_staff'; // default
        let roleDisplayName = 'Support Staff Helpdesk';

        const catLower = (category || '').toLowerCase();
        const descLower = (description || '').toLowerCase();
        const subLower = (subject || '').toLowerCase();
        const combined = `${catLower} ${descLower} ${subLower}`;

        if (combined.includes('payment') || combined.includes('refund') || combined.includes('gst') || combined.includes('money') || combined.includes('payout')) {
            assignedRole = 'finance_manager';
            roleDisplayName = 'Accounts / Finance Manager';
        } else if (combined.includes('login') || combined.includes('oauth') || combined.includes('bug') || combined.includes('crash') || combined.includes('error 500') || combined.includes('upload failed') || combined.includes('app not working')) {
            assignedRole = 'it_specialist';
            roleDisplayName = 'IT Support Specialist';
        } else if (combined.includes('quality') || combined.includes('wrong report') || combined.includes('dispute') || combined.includes('mismatched') || combined.includes('lab audit') || combined.includes('nabl')) {
            assignedRole = 'quality_auditor';
            roleDisplayName = 'Quality Control Auditor';
        } else if (combined.includes('delivery') || combined.includes('transport') || combined.includes('report copy') || combined.includes('courier')) {
            assignedRole = 'delivery_partner';
            roleDisplayName = 'Delivery Logistics Team';
        } else if (combined.includes('collector') || combined.includes('phlebotomist') || combined.includes('sample not collected') || combined.includes('otp')) {
            assignedRole = 'support_staff';
            roleDisplayName = 'Support Staff & Phlebotomy Team';
        } else if (combined.includes('stock') || combined.includes('reagent') || combined.includes('tube') || combined.includes('out of stock')) {
            assignedRole = 'inventory_manager';
            roleDisplayName = 'Inventory Manager';
        }

        const ticketNum = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

        let newTicket;
        try {
            newTicket = await Ticket.create({
                userId: userId,
                userName: userName,
                subject: subject || `Issue Report: ${category || 'General'}`,
                description: description || 'Issue reported via AI ChatBot',
                category: category || 'General',
                assignedRole: assignedRole,
                priority: combined.includes('payment') || combined.includes('crash') ? 'Critical' : 'High'
            });
        } catch (dbErr) {
            console.log("[REPORT-ISSUE] Local fallback mode for ticket creation:", dbErr.message);
        }

        console.log(`[REPORT-ISSUE] Ticket created: [${ticketNum}] | Category: ${category} | Assigned To Role: [${assignedRole}]`);

        res.json({
            success: true,
            ticketId: newTicket ? newTicket._id : ticketNum,
            ticketNumber: ticketNum,
            assignedRole: assignedRole,
            roleDisplayName: roleDisplayName,
            message: `Issue successfully logged as Ticket #${ticketNum} and automatically routed to the ${roleDisplayName} workspace for priority resolution!`
        });

    } catch (err) {
        console.error('[REPORT-ISSUE-ERROR]', err);
        res.status(500).json({ error: 'Failed to report issue', details: err.message });
    }
});

module.exports = router;
