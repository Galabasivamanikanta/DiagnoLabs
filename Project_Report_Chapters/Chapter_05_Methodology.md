# CHAPTER 5 — METHODOLOGY

## 5.1 Technology Stack

We didn't want to overcomplicate our tech stack, so we stuck to the MERN stack but added a few modern tools to make development faster. Here is a breakdown of what we used.

| Component | Technology | Version | Why We Chose It |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18 | Industry standard, huge ecosystem, and we were already familiar with it from earlier mini-projects. |
| **Build Tool** | Vite | 5 | Way faster than Create React App for hot module replacement during development. |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS saved us from writing hundreds of separate CSS files. |
| **Icons & Animations** | Lucide React / Framer Motion | Latest | Clean SVG icons and simple physics-based animations for UI feedback without bloat. |
| **Backend Runtime** | Node.js | 20 LTS | Stable version, great performance for async I/O operations which our app is heavily based on. |
| **Web Framework** | Express.js | 4.x | Lightweight and unopinionated. Easy to set up our RBAC middleware chain. |
| **Database** | MongoDB Atlas / Mongoose | 8.x | Document database fits patient records perfectly. The 2dsphere geo-index was required for our location search. |
| **Security & Auth** | JWT / bcryptjs / Helmet | Latest | Standard JSON Web Tokens for stateless auth. Helmet for HTTP header security. |
| **AI Integration** | Google Generative AI SDK | Latest | Connects to Gemini 1.5 Flash for the health assistant feature. |
| **Network Requests** | Axios / CORS | Latest | Easy promise-based HTTP client for the frontend, CORS middleware for cross-origin requests. |

## 5.2 Development Process (Agile Scrum Sprints)

Our team consists of 4 students, and we had about 4 months to build this. We adopted an Agile Scrum approach, working in 2-week sprints. Ms. Ritu Agrawal guided us on keeping our sprint goals realistic.

Here is how we divided the work:
*   **G. Siva Manikanta (2403031467009):** Lead Dev & AI. Handled the core architecture, auth, and the Gemini AI integration.
*   **D. Venkat Sai (2403031467027):** Backend & Geospatial. Focused on the Express server, database schema, and the Haversine distance engine.
*   **M. Srikanth (2403031467016):** UI/UX & Frontend. Built all 14 dashboards, responsive designs, and React context logic.
*   **G. Avinash (2403031467011):** DevOps & QA. Managed GitHub repositories, wrote test cases, and did the load testing.

We didn't use any fancy project management software. We just used a GitHub Kanban board for tracking issues and had daily 10-minute standups on our WhatsApp group to discuss blockers. Code reviews were mandatory before merging into the `main` branch.

## 5.3 14-Tier Role Hierarchy and Workspace Flow

DiagnoLabs is not just for patients; it's a complete hospital management platform. We had to build 14 separate roles.

| Role Name | Dashboard Name | Key Features | Access Level | API Routes Used |
| :--- | :--- | :--- | :--- | :--- |
| Patient | Patient Hub | Book tests, view reports, chat with AI | User | `/api/patient/*` |
| Doctor | Doctor Panel | View patient history, prescribe tests | Staff | `/api/doctor/*` |
| Nurse | Nurse Station | Vital entry, patient triage | Staff | `/api/nurse/*` |
| Pathologist | Pathologist Desk | Verify test results, sign off reports | Specialist | `/api/pathology/*` |
| Phlebotomist | Field Agent | View sample collection route, OTP verify | Field | `/api/phlebotomy/*` |
| Lab Technician | Lab Tech View | Enter raw machine data, run calibrations | Staff | `/api/lab/*` |
| Inventory Manager | Stock Room | Track reagents, order supplies | Admin | `/api/inventory/*` |
| Delivery Partner | Logistics App | Deliver samples from collection to lab | Field | `/api/logistics/*` |
| Support Staff | Helpdesk | Resolve tickets, refund processing | Support | `/api/support/*` |
| Marketing Head | Campaign Mgr | View user acquisition, run promos | Management | `/api/marketing/*` |
| Finance Manager | Accounts Desk | View revenue, process payouts | Management | `/api/finance/*` |
| Admin | Admin Console | Manage staff, view platform metrics | High Admin | `/api/admin/*` |
| Super Admin | Master Control | Global settings, override powers | Highest | `/api/super/*` |
| System Architect | Dev Dashboard | Server logs, database stats | Root | `/api/system/*` |

Our RBAC (Role-Based Access Control) middleware checks the JWT payload on every request. If a Nurse tries to hit a `/api/finance/revenue` endpoint, the middleware returns a 403 Forbidden before it even reaches the controller.

## 5.4 Cold-Chain Phlebotomy and OTP Verification Methodology

One major problem we tried to solve was sample collection integrity. When a patient books a home collection, the sample needs to be tracked properly.

1.  **Booking Creation:** Patient books a test. System assigns the nearest available Phlebotomist.
2.  **OTP Generation:** A secure 4-digit OTP is generated on the server and sent to the Patient via SMS.
3.  **Arrival & Verification:** The Phlebotomist arrives at the location. They cannot start the collection process in the app until they enter the patient's 4-digit OTP. This acts as a handshake.
4.  **Sample Collection:** Phlebotomist draws blood and scans a barcode on the vial, linking it to the booking ID.
5.  **Temperature Logging:** The app forces the Phlebotomist to log the current temperature of the cold box before completing the job.
6.  **Handover:** Delivery Partner takes over and logs the final drop-off at the lab.

## 5.5 Testing and Evaluation Strategy

We couldn't just build this and hope it works. Avinash set up a testing pipeline.
*   **Unit Testing:** Tested individual utility functions, especially the OTP generator and Haversine formula.
*   **Integration Testing:** Made sure the Express routes correctly interacted with MongoDB.
*   **UAT (User Acceptance Testing):** We had 10 of our classmates try to book tests and break the UI.
*   **Load Testing:** We used load testing tools to simulate 5000 virtual users (VUs) hitting the search endpoint. We got a 48ms mean latency, which is acceptable.
*   **Security Testing:** Verified that JWT tokens couldn't be manipulated and that SQL/NoSQL injection didn't work. 75 test cases were written, and all passed.
