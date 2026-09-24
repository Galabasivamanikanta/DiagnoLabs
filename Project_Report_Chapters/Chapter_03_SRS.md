# CHAPTER 3 — ANALYSIS / SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

## 3.1 Introduction

### 3.1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to detail the technical requirements for DiagnoLabs, a comprehensive MERN stack diagnostic pathology platform. We wrote this document to guide our development team through the entire build phase, ensuring that front-end UI components, backend APIs, and database structures align perfectly with our goal of managing the complete pathology lifecycle.

### 3.1.2 Terms and Definitions
- **MERN:** MongoDB, Express.js, React.js, Node.js.
- **Phlebotomist:** A medical professional trained to draw blood from patients, often at their homes in our system.
- **Geospatial Indexing:** MongoDB feature allowing rapid searches based on geographic coordinates (using `2dsphere`).
- **OTP:** One-Time Password, specifically a 4-digit code used here for phlebotomist-patient handshake.

### 3.1.3 Intended Audience and Readers
This document is intended for our development team (G. Siva Manikanta, D. Venkat Sai, M. Srikanth, G. Avinash), our project guide Ms. Ritu Agrawal, system evaluators, and future maintainers of the DiagnoLabs codebase.

### 3.1.4 Product Scope
DiagnoLabs replaces fragmented lab management systems with a single unified platform. It covers patient bookings, real-time phlebotomist tracking, secure test result uploads by pathologists, and AI-driven preliminary report summaries. We built it to solve the logistical nightmare of home sample collection by integrating geospatial lab searches directly into the patient workflow.

### 3.1.5 References
- Node.js v20 LTS Documentation
- React 18 / Vite 5 Official Guides
- MongoDB Atlas and Mongoose documentation for geospatial queries
- Express.js API Reference
- Google Gemini 1.5 Flash API docs for the offline AI fallback engine

## 3.2 General Description

### 3.2.1 Product Overview
DiagnoLabs is a cloud-hosted diagnostic portal. It connects patients needing tests with nearby labs, manages the physical logistics of sample collection via delivery partners and phlebotomists, and provides a secure dashboard for medical staff to input and manage results.

### 3.2.2 Product Features
- Sub-12ms spatial querying for nearby diagnostic centers using Haversine formula logic and MongoDB 2dsphere indexes.
- 4-digit OTP handshake to verify phlebotomist arrival at the patient's home.
- SHA-256 signed QR codes on final pathology reports to prevent tampering.
- Offline-capable AI fallback engine for answering patient queries when network latency spikes.
- Role-based access control protecting sensitive health data across 14 distinct user profiles.

### 3.2.3 User Groups and Characteristics
We defined 14 specific roles in the workspace to cover every aspect of a real-world pathology business.

| Role | Description |
|---|---|
| **Patient** | Books tests, views reports, interacts with AI chatbot. |
| **Doctor** | Reviews patient reports, suggests follow-up tests. |
| **Nurse** | Assists in clinic sample collection and initial triage. |
| **Pathologist** | Enters test results, digitally signs reports. |
| **Phlebotomist** | Travels to patient homes for sample collection, uses OTP handshake. |
| **Lab Technician** | Processes physical samples, updates inventory usage. |
| **Inventory Manager** | Tracks reagents, vials, and alerts on low stock. |
| **Delivery Partner** | Transports bulk samples from collection centers to main labs. |
| **Support Staff** | Handles patient queries, manages tickets. |
| **Marketing Head** | Manages discount campaigns, analyzes user acquisition metrics. |
| **Finance Manager** | Oversees revenue, refunds, and payroll data. |
| **Admin** | Manages a single lab branch's staff and operations. |
| **Super Admin** | Oversees all branches, system-wide settings, global analytics. |
| **System Architect** | Monitors server health, database index performance, API latencies. |

### 3.2.4 Operating Environment
- **Frontend:** Modern web browsers (Chrome, Firefox, Safari) running on desktops or mobile devices. Built with React 18, Vite 5, Tailwind CSS.
- **Backend:** Node.js 20 LTS environment, Express.js server hosted on cloud platforms.
- **Database:** MongoDB Atlas (Cloud-hosted NoSQL database).

### 3.2.5 Design and Functionality Constraints
We faced several constraints during development:
- **Security:** Handling medical data required implementing JWT authentication and bcryptjs for password hashing immediately.
- **Performance:** We needed to support high concurrency. We achieved 5000 VU (Virtual Users) load test at 48ms mean latency.
- **Location Accuracy:** Relying on browser geolocation APIs occasionally caused inaccuracies, requiring manual map-pin adjustments for patients.

### 3.2.6 User Documentation
System usage is documented through inline tooltips built with Framer Motion and Lucide React icons, plus a dedicated help center module managed by the Support Staff.

### 3.2.7 Assumptions and Dependencies
- We assume patients have smartphones with internet access for the OTP handshake.
- The system depends heavily on Google Gemini 1.5 Flash for the chatbot and report summarization features.
- Geolocation features depend on the user granting location permissions.

## 3.3 External Interface Requirements

### 3.3.1 User Interface
The UI uses a glassmorphic dark navy and gold design system. We utilized Tailwind CSS for rapid styling and Framer Motion for smooth transitions between views. It is fully responsive, ensuring phlebotomists can easily tap buttons on their mobile devices while on the road.

### 3.3.2 Hardware Interface
No custom hardware is required, but the system interacts with standard mobile GPS sensors for location tracking and mobile cameras for scanning QR codes on sample vials and reports.

### 3.3.3 Software Interface
- **Database:** MongoDB Atlas.
- **AI Service:** Gemini 1.5 Flash API for natural language processing.
- **Hosting:** Vercel (Frontend), Render (Backend).

### 3.3.4 Communication Interface
The system relies on HTTPS for secure API communication. WebSockets are used for real-time tracking of delivery partners and phlebotomists.

## 3.4 Functional and Non-Functional Requirements

### 3.4.1 Functional Requirements

| Req ID | Feature | Description |
|---|---|---|
| FR-01 | User Registration | System shall allow creation of accounts across all 14 roles. |
| FR-02 | Authentication | System shall use JWT and bcryptjs for secure login sessions. |
| FR-03 | Geospatial Search | System shall find labs within a specific radius using MongoDB `2dsphere`. |
| FR-04 | Test Booking | Patients shall be able to schedule tests and select home collection. |
| FR-05 | Phlebotomist Dispatch | System shall assign the nearest available phlebotomist to home bookings. |
| FR-06 | OTP Handshake | System shall generate a 4-digit OTP for patients to provide to phlebotomists upon arrival. |
| FR-07 | Sample Tracking | System shall track the state of a sample from collection to processing. |
| FR-08 | Result Entry | Pathologists shall be able to enter structured test results. |
| FR-09 | Report Generation | System shall generate PDF reports with SHA-256 signed QR codes. |
| FR-10 | AI Chatbot | System shall integrate Gemini 1.5 Flash to answer patient queries. |
| FR-11 | Inventory Management | Inventory Managers shall track lab supplies and receive low-stock alerts. |
| FR-12 | Ticket Management | Support Staff shall view and resolve user submitted tickets. |
| FR-13 | Role Dashboard | Each of the 14 roles shall see a customized dashboard upon login. |
| FR-14 | Admin Controls | Super Admins shall have CRUD capabilities over all system entities. |
| FR-15 | Offline Fallback | System shall queue requests and use an offline AI fallback engine during network drops. |

### 3.4.2 Non-Functional Requirements

| Req ID | Category | Description |
|---|---|---|
| NFR-01 | Performance | APIs must respond with a mean latency of <50ms (achieved 48ms in testing). |
| NFR-02 | Scalability | System must handle 5000 concurrent Virtual Users without crashing. |
| NFR-03 | Security | All sensitive user data and passwords must be encrypted (bcryptjs). |
| NFR-04 | Availability | System should aim for 99.9% uptime via cloud deployment. |
| NFR-05 | Usability | Phlebotomist UI must be usable with one hand on mobile devices. |
| NFR-06 | Reliability | 75 core test cases must pass before any production deployment. |
| NFR-07 | Spatial Query Speed | Geospatial queries for labs must resolve in sub-12ms. |
| NFR-08 | Responsiveness | UI must adapt fluidly from 320px mobile screens to 4K desktop monitors. |
