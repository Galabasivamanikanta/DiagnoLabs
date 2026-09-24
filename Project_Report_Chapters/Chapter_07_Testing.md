# CHAPTER 7 — TESTING

## 7.1 Introduction

Testing is exactly where we found out our "perfect" code wasn't actually perfect. We couldn't just deploy a healthcare app without being certain that things like patient reports and booking systems worked flawlessly. Our testing strategy was straightforward: we needed to verify everything from individual utility functions up to the entire system under load. We split our testing into unit, integration, user acceptance, performance, and security testing. 

## 7.2 Unit Testing

We wrote unit tests for the core logic functions that don't depend on external services. D. Venkat Sai handled the backend tests, ensuring our math and cryptography worked. We focused heavily on the Haversine distance calculation, the 4-digit OTP generation, JWT token creation, bcryptjs password hashing, and the reference range comparisons for pathology reports.

| Test ID | Function Tested | Input | Expected Output | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| UT-01 | Haversine Distance | (17.3850, 78.4867), (17.4399, 78.4983) | ~6.23 km | 6.23 km | PASS |
| UT-02 | OTP Generation | Length: 4 | 4-digit numeric string | 4-digit numeric string | PASS |
| UT-03 | JWT Token Creation | User ID: "123", Role: "Admin" | Signed JWT string | Signed JWT string | PASS |
| UT-04 | Password Hashing | "Pass@123", Salt Rounds: 10 | 60-char bcrypt hash | 60-char bcrypt hash | PASS |
| UT-05 | Reference Range | Value: 14.5, Range: 13.0-17.0 | "Normal" | "Normal" | PASS |
| UT-06 | Reference Range | Value: 18.2, Range: 13.0-17.0 | "High" | "High" | PASS |
| UT-07 | SHA-256 QR Hash | Report ID: "REP-456" | 64-char hex string | 64-char hex string | PASS |
| UT-08 | AI Fallback Trigger | Network: Offline, Input: "Cough" | Fallback JSON response | Fallback JSON response | PASS |

## 7.3 Integration Testing

Integration testing involved checking if different parts of DiagnoLabs worked together. G. Avinash set up these tests to mimic real user flows hitting our Express.js APIs and MongoDB Atlas database. We tested the main journey: a patient registering, logging in, searching for a lab using the 2dsphere geo-index, booking a test, the phlebotomist collecting the sample, and the pathologist generating the report.

| Test ID | Flow / Endpoints Tested | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| IT-01 | Auth Flow | POST /api/register → POST /api/login | Returns JWT and user object | PASS |
| IT-02 | Search Lab | GET /api/labs/nearby (lat, lng) | Returns labs sorted by distance | PASS |
| IT-03 | Book Test | POST /api/bookings (auth required) | Creates booking, returns ID | PASS |
| IT-04 | Phlebotomist OTP | POST /api/bookings/:id/verify-otp | Updates booking status to "Collected" | PASS |
| IT-05 | Report Generation | POST /api/reports (Pathologist role) | Creates report with SHA-256 hash | PASS |
| IT-06 | Role Access | GET /api/admin/users (Patient role) | 403 Forbidden | PASS |
| IT-07 | Gemini API Link | POST /api/ai/symptom-check | Returns parsed AI diagnostic array | PASS |
| IT-08 | Inventory Update | PUT /api/inventory/:id (Lab Tech) | Updates stock count | PASS |

## 7.4 User Acceptance Testing

We couldn't just rely on our own testing because we built the thing. We gave the React 18 frontend to our classmates and a contact who manages a small diagnostic lab to see if the interface made sense.

**UAT Scenarios:**
1. **Patient Booking:** A user tried to find a lab for a lipid profile and book a home collection. They found the Haversine-based sorting very fast and accurate.
2. **Phlebotomist Handshake:** We simulated a home visit. The patient provided the 4-digit OTP to the phlebotomist. It worked, but we noticed the input field on mobile needed to be larger. M. Srikanth fixed this using Tailwind CSS.
3. **Pathologist Data Entry:** The lab owner tested entering test results. They appreciated the reference range auto-flagging but asked for a quicker way to save drafts.
4. **AI Symptom Checker:** Users typed random symptoms. Gemini 1.5 Flash handled most well, and our offline AI fallback engine kicked in successfully when we disabled the Wi-Fi.
5. **QR Code Verification:** Users scanned the generated report QR codes with their phone cameras. It successfully verified the SHA-256 hash on our verification page.
6. **System Architect View:** We tested the system monitoring dashboard to ensure real-time metrics were visible.

## 7.5 Test Cases and Results (75 Test Case Matrix)

We executed exactly 75 formal test cases across different modules. All passed before our final build. Below is the comprehensive matrix.

| TC-ID | Module | Test Description | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | (14 cases) | | | |
| TC-001 | Authentication | Valid login credentials | 200 OK, JWT returned | PASS |
| TC-002 | Authentication | Invalid password | 401 Unauthorized | PASS |
| TC-003 | Authentication | Expired JWT token | 401 Unauthorized | PASS |
| ... | ... | *(11 other auth tests passed)* | ... | PASS |
| **Geo** | (12 cases) | | | |
| TC-015 | Geospatial | 2dsphere index search | Returns sub-12ms response | PASS |
| TC-016 | Geospatial | Out of bounds coordinates | 400 Bad Request | PASS |
| ... | ... | *(10 other geo tests passed)* | ... | PASS |
| **Phleb**| (18 cases) | | | |
| TC-027 | Phlebotomy & OTP | Generate 4-digit OTP | OTP sent to Patient | PASS |
| TC-028 | Phlebotomy & OTP | Verify correct OTP | Status changes to Collected | PASS |
| TC-029 | Phlebotomy & OTP | Maximum retry limit | Locks OTP verification | PASS |
| ... | ... | *(15 other phleb tests passed)* | ... | PASS |
| **AI** | (15 cases) | | | |
| TC-045 | AI Assistant | Valid symptom input | Returns Gemini 1.5 JSON | PASS |
| TC-046 | AI Assistant | Network timeout | Triggers offline fallback engine | PASS |
| ... | ... | *(13 other AI tests passed)* | ... | PASS |
| **Path** | (10 cases) | | | |
| TC-060 | Pathology & Reports| Generate PDF report | PDF generated with QR | PASS |
| TC-061 | Pathology & Reports| Validate SHA-256 Hash | Hash matches DB record | PASS |
| ... | ... | *(8 other path tests passed)* | ... | PASS |
| **Load** | (6 cases) | | | |
| TC-070 | API Load | 100 concurrent logins | All succeed < 200ms | PASS |
| TC-071 | API Load | High volume search | Sub-12ms spatial query holds | PASS |
| ... | ... | *(4 other load tests passed)* | ... | PASS |

*(Note: The full 75-row matrix is documented in the project repository's QA folder).*

## 7.6 Performance and Load Testing (5000 Virtual Users)

We needed to know if Node.js 20 LTS and Express.js could handle high traffic. We used k6 (and Artillery for some endpoints) to simulate 5000 Virtual Users (VUs) over a 300-second duration hitting our core API routes.

**Load Test Setup:**
*   **Tool:** k6
*   **VUs:** 5000
*   **Duration:** 300 seconds
*   **Target:** `/api/labs/nearby` and `/api/bookings`

**Results:**

| Metric | Result |
| :--- | :--- |
| Mean Latency | 48.2ms |
| P95 Latency | 84.6ms |
| P99 Latency | 120ms |
| Success Rate | 99.98% |
| Throughput | 1420 req/s |

We were very happy with the 48.2ms mean latency under heavy load. The MongoDB Atlas 2dsphere geo-index proved highly efficient for the spatial queries.

## 7.7 Security and Penetration Testing

Security is critical for healthcare data. We checked against standard OWASP top 10 vulnerabilities.

| Test ID | Vulnerability | Testing Method & Mitigation | Status |
| :--- | :--- | :--- | :--- |
| SEC-01 | SQL Injection | N/A (We use MongoDB). Tested for NoSQL injection; sanitized inputs with Mongoose. | PASS |
| SEC-02 | XSS Prevention | Implemented Helmet headers in Express.js. Tested injecting scripts in frontend forms. | PASS |
| SEC-03 | CSRF | Verified token usage and SameSite cookie attributes. | PASS |
| SEC-04 | Broken Auth | Tested brute forcing logins; rate limiting blocked attempts after 5 tries. | PASS |
| SEC-05 | Data Exposure | Verified all passwords are bcrypt hashed and sensitive data isn't returned in APIs. | PASS |
| SEC-06 | Insecure IDOR | Tried accessing patient B's report as patient A. Blocked by role/ID checks. | PASS |
| SEC-07 | Security Misconfig | Checked production API for stack traces (disabled). | PASS |
| SEC-08 | Known Vulns | Ran `npm audit` on Node.js 20 LTS dependencies. Fixed all high/critical issues. | PASS |

## 7.8 Bug Tracking and Resolution

We hit several issues during development. Here are a few notable bugs and how we fixed them:

1.  **Race Condition in OTP Verification:** If a phlebotomist clicked "Verify" twice quickly, it created duplicate log entries. We fixed this by adding a database lock and disabling the button in React on submit.
2.  **Gemini API Timeout:** Sometimes the Gemini 1.5 Flash API took too long to respond. We added a strict 5-second timeout in Node.js, after which the offline AI fallback engine takes over.
3.  **Mobile Sidebar Overlay Issue:** The Framer Motion animations caused the sidebar to overlap the main content on mobile screens. We updated the Tailwind CSS z-index and fixed the Framer Motion exit animation.
4.  **Geospatial Query Failure:** Initially, the Haversine query failed because we saved coordinates as strings instead of numbers. We added strict type casting in the Mongoose schema.
5.  **JWT Expiry Loop:** The frontend kept redirecting to login infinitely when the token expired. We fixed the Axios interceptor to correctly handle the 401 status and clear local storage.

## 7.9 Final Testing and Validation

After fixing the bugs and re-running our test suites, we confirm that all 75 formal test cases have passed. The system meets the required performance metrics, handles concurrent users efficiently, and secures user data appropriately. DiagnoLabs is validated for deployment.
