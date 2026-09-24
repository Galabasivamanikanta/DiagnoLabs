# CHAPTER 4 — SYSTEM DESIGN

## 4.1 System Architecture

DiagnoLabs utilizes a standard Three-Tier Cloud Topology, explicitly chosen to separate concerns and allow independent scaling of the frontend UI and the backend data processing.

- **Presentation Tier (Frontend):** Built with React 18 and Vite 5, deployed on Vercel for fast global CDN delivery.
- **Application Tier (Backend):** Node.js 20 LTS running Express.js, hosted on Render. This layer handles business logic, JWT validation, and communicates with the Gemini 1.5 Flash API.
- **Data Tier (Database):** MongoDB Atlas. We chose this NoSQL database because its flexible document model handles the varied structures of different medical tests perfectly, and its native geospatial features are crucial for our location-based services.

## 4.2 User Interface Design

We designed the user interface specifically to break away from sterile, boring medical software. M. Srikanth led the UI/UX, implementing a glassmorphic dark navy and gold design system. This provides high contrast and a premium feel. 

- **Styling:** Tailwind CSS was used extensively for utility-first styling.
- **Icons & Animation:** Lucide React provides crisp, consistent iconography. Framer Motion handles complex state transitions, making the dashboard feel snappy and responsive.
- **Responsiveness:** We implemented strict breakpoints. The phlebotomist app view prioritizes large touch targets for mobile use in the field, while the Pathologist and System Architect views utilize dense data tables for desktop monitors.

## 4.3 Database Design

Our MongoDB Atlas schema is designed for speed and flexibility. A critical piece of our infrastructure is the `2dsphere` geo-index on the `Labs` collection, which allows us to perform sub-12ms spatial queries to match patients with the nearest diagnostic centers using the Haversine formula for geodesic distance under the hood.

| Collection | Key Fields | Data Types | Indexes | Purpose |
|---|---|---|---|---|
| **Users** | _id, name, email, passwordHash, role, phone | ObjectId, String, String, String, Enum(14 roles), String | email (Unique) | Stores all 14 user types. |
| **Labs** | _id, name, location(type, coordinates), address | ObjectId, String, GeoJSON, String | location (2dsphere) | Stores diagnostic centers. |
| **Bookings** | _id, patientId, labId, tests, status, appointmentDate, otp | ObjectId, ObjectId, ObjectId, Array, String, Date, String | patientId, labId | Tracks test appointments. |
| **Tests** | _id, testName, category, price, parameters | ObjectId, String, String, Number, Array | testName | Catalog of available tests. |
| **TestResults** | _id, bookingId, pathologistId, results, pdfUrl, qrHash | ObjectId, ObjectId, ObjectId, Object, String, String | bookingId | Stores finalized results. |
| **Inventory** | _id, labId, itemName, quantity, threshold | ObjectId, ObjectId, String, Number, Number | labId | Tracks lab supplies. |
| **SupportTickets**| _id, userId, issue, status, resolvedBy | ObjectId, ObjectId, String, String, ObjectId | userId, status | Manages user complaints. |

## 4.4 API Route Design and Endpoint Mapping

D. Venkat Sai structured our Express.js backend to cleanly separate resource operations. Here are 20 key endpoints from our system.

| Method | Route | Auth | Role(s) | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | All | Registers a new user. |
| POST | `/api/auth/login` | No | All | Authenticates and returns JWT. |
| GET | `/api/users/profile` | Yes | All | Retrieves logged-in user profile. |
| GET | `/api/labs/nearby` | Yes | Patient, Admin | Sub-12ms spatial query for nearby labs. |
| POST | `/api/bookings/create` | Yes | Patient, Nurse | Creates a new test booking. |
| GET | `/api/bookings/my-bookings` | Yes | Patient | Lists patient's history. |
| GET | `/api/bookings/pending` | Yes | Phlebotomist | Lists pending home collections. |
| POST | `/api/bookings/:id/verify-otp`| Yes | Phlebotomist | 4-digit OTP patient handshake. |
| PUT | `/api/bookings/:id/status` | Yes | Lab Tech, Phleb | Updates sample tracking status. |
| POST | `/api/results/upload` | Yes | Pathologist | Submits results and generates PDF. |
| GET | `/api/results/:id` | Yes | Patient, Doctor | Fetches test results and SHA-256 QR. |
| POST | `/api/ai/chat` | Yes | Patient | Interacts with Gemini 1.5 Flash. |
| GET | `/api/inventory/low-stock` | Yes | Inv. Manager | Alerts on supplies below threshold. |
| PUT | `/api/inventory/update` | Yes | Inv. Manager, Tech | Modifies inventory quantities. |
| POST | `/api/tickets/create` | Yes | All | Opens a new support ticket. |
| GET | `/api/tickets/active` | Yes | Support Staff | Lists unresolved tickets. |
| POST | `/api/marketing/campaign` | Yes | Marketing Head | Creates a new discount campaign. |
| GET | `/api/finance/revenue` | Yes | Finance Manager | Aggregates daily revenue metrics. |
| GET | `/api/admin/dashboard` | Yes | Super Admin | Global analytics and user metrics. |
| GET | `/api/system/health` | Yes | System Architect | Checks DB latency and AI engine status. |

## 4.5 System Modeling Diagrams (Descriptions)

Because we are working in text formats, we describe our UML and structural diagrams below.

### UML Use Case Diagram
The Use Case diagram features our 14 distinct actors. 
- The **Patient** connects to use cases like "Search Labs", "Book Test", and "View Report". 
- The **Phlebotomist** connects to "View Route", "Verify OTP", and "Collect Sample". 
- The **Pathologist** connects to "Review Data" and "Sign Report". 
- The **System Architect** sits at the top, connecting to "Monitor Latency" and "Configure Indexes".

### UML Sequence Diagram: Home Sample Collection
This diagram maps the flow over time:
1. Patient requests booking -> Server.
2. Server queries DB (2dsphere) -> Server assigns Phlebotomist.
3. Phlebotomist travels -> arrives at Patient.
4. Patient provides OTP -> Phlebotomist enters OTP -> Server validates.
5. Server confirms Handshake -> Sample marked 'Collected'.

### Data Flow Diagrams (DFD)
- **Level-0 (Context Diagram):** Shows the entire DiagnoLabs system as a single process node. Data flows in from Patients (booking info), Pathologists (results), and flows out as Reports and Notifications.
- **Level-1:** Breaks the main node into sub-processes: Authentication, Booking Management, Geolocation & Dispatch, Result Processing, and Inventory Tracking.

### Entity-Relationship (ER) Model
The ER model visualizes the relationships defined in our database schema. A `User` (Patient) has a 1-to-many relationship with `Bookings`. A `Booking` has a 1-to-1 relationship with `TestResults`. A `Lab` has a 1-to-many relationship with both `Inventory` items and assigned `Staff` (Users).

### Activity Diagram: Booking to Report
This flow starts at the start node: Patient Searches Lab -> Selects Test -> Pays -> Booking Confirmed. Fork occurs: Patient waits, while Phlebotomist is dispatched. Join occurs at Sample Collection (OTP verification). The flow continues to Lab Processing -> Pathologist Data Entry -> SHA-256 Signing -> Report Generated -> Email Notification -> End Node.
