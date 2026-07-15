# Technology Transfer Cell - Web Application Pages & Sections Overview

This document provides a simple, structured overview of all the pages, key sections, and functional modules of the **Technology Transfer Cell (TTC)** platform.

---

## Table of Contents
1. [User Authentication & Onboarding](#1-user-authentication--onboarding)
2. [Core Portfolios & Tracking](#2-core-portfolios--tracking)
3. [Contracts, Agreements & Legal Documentation](#3-contracts-agreements--legal-documentation)
4. [Innovation Club & Public Submissions](#4-innovation-club--public-submissions)
5. [Analytics, Audit & Administration](#5-analytics-audit--administration)

---

## 1. User Authentication & Onboarding

### Login Page (`/login`)
* **Purpose:** The entry point for registered members (Super Admins, TTC Staff, and Faculty) to securely log into the system.
* **Key Features:**
  * Secure email and password fields.
  * Links to registration and public application forms.

### Register Page (`/register`)
* **Purpose:** Allows new users to create accounts on the platform.
* **Key Features:**
  * Captures user details (Full Name, Email, Department).
  * Prompts role selection (e.g., Faculty, TTC Staff) to determine access privileges.

---

## 2. Core Portfolios & Tracking

### Dashboard Page (`/`)
* **Purpose:** Serves as the central command center for users, customizing its interface based on their roles.
* **Key Sections:**
  * **System Clock:** A real-time, dynamic watch displaying the local time.
  * **Admin/Staff View:** Displays aggregated operational metrics such as total filed patents, granted patents, pending disclosures, pending renewals, and Year-To-Date (YTD) royalty revenues.
  * **Faculty/Inventor View:** Offers quick access to submit invention disclosures, report IPR violations, apply to the Innovation Club, and lists personal project deadlines.

### Invention Disclosures Page (`/disclosures`)
* **Purpose:** Allows researchers and faculty members to log new inventions and submit them to the TTC for formal review.
* **Key Sections:**
  * **Intake Form:** A step-by-step wizard (3 steps) to capture:
    1. Title & Department.
    2. Primary Inventor & Assigned Reviewer.
    3. Brief Description / Abstract of the invention.
  * **Review Board (Admins/Staff):** A table listing all submitted disclosures. Authorized users can review details and approve disclosures (which auto-generates a new patent case case-number) or update review statuses.

### Patent Portfolio Page (`/patents`)
* **Purpose:** Provides a centralized, detailed registry of all the university's patent cases and active applications.
* **Key Sections:**
  * **Patent Registry Table:** Displays case number, title, jurisdiction (e.g., US / PCT), attorney, status, and upcoming due dates.
  * **Patent Timeline:** A chronologically logged event system tracking filing dates, office actions, or custom legal markers.
  * **Details Drawer:** Allows administrators to update statuses, configure legal budgets, view/add timeline events, and upload reference documents (e.g., Abstract Drafts, Claims Comparison Reports).

### Filing & Prosecution Page (`/prosecution`)
* **Purpose:** Helps attorneys and staff manage ongoing correspondence with patent offices (known as "prosecution").
* **Key Sections:**
  * **Prosecution Database:** Tracks patent applications currently facing office actions, legal responses, and filing deadlines.
  * **Search & Filters:** Real-time search console to filter cases by patent number, jurisdiction, status, lead attorney, or department.

### Deadlines & Renewals Page (`/deadlines`)
* **Purpose:** Prevents loss of intellectual property by tracking statutory deadlines, responses, and maintenance fees.
* **Key Sections:**
  * **Deadlines Timeline:** Visual status list of upcoming critical dates with color-coded severity tags (Critical, High, Moderate, Low).
  * **Interactive Escalation Panel:** Allows administrators to configure logic rules for reminder intervals and automatic notification pathways (e.g., Assignee → Reviewer → Admin).

---

## 3. Contracts, Agreements & Legal Documentation

### Licensing & Agreements Page (`/licenses`)
* **Purpose:** Monitors commercialized technologies and active royalty-bearing contracts with industry partners.
* **Key Sections:**
  * **Licensing Directory:** Tracks licensee partner names, signing dates, contract statuses, and royalty rates.
  * **YTD Revenue tracker:** Sums up licensing royalties generated to monitor commercialization success.

### Document Vault (`/documents`)
* **Purpose:** Serves as a digital archive for all documents uploaded or generated across the system.
* **Key Sections:**
  * **Vault Table:** Aggregates and displays documents by category (e.g., Agreement/NDA, MOU, Patent Specification).
  * **Categorized Upload Modal:** Simulates cataloging new document metadata with signing lead details.

### Legal Agreements Registry (`/agreements`)
* **Purpose:** Formally tracks legal documentation related to collaborative research, non-disclosure agreements (NDAs), and joint consultancies.
* **Key Sections:**
  * **Agreements Registry:** Displays contract type, external party names, starting/ending dates, and links documents directly to specific ongoing industry projects.

### Memorandums of Understanding - MOUs Page (`/mous`)
* **Purpose:** Tracks high-level strategic partnerships and collaborations signed with external universities or corporate entities.
* **Key Sections:**
  * **MOU Register:** Lists partner organizations, signing dates, and both internal and external signatories.
  * **Expiry Alerts:** Features warning triggers that highlight signed MOUs expiring within 30 days.

### Virtual Noticeboard (`/noticeboard`)
* **Purpose:** A bulletin board for public announcements, policy guidelines, proposals, and events.
* **Key Sections:**
  * **Announcement Grid:** Displays posts grouped under color-coded category badges (General, Policy, Events, Call for Proposals).
  * **Publishing Console:** Enables administrators, staff, and faculty to publish new formatted notices with optional expiration dates.

---

## 4. Innovation Club & Public Submissions

### Innovation Club Apply Page (`/apply`)
* **Purpose:** A public landing page where students and university members submit innovative projects or ideas to join the Innovation Club.
* **Key Sections:**
  * **Application Form:** Captures applicant names, contact emails, roles (Student or Faculty), idea titles, and a detailed project description.

### Innovation Club Applications Admin (`/innovation-club/applications`)
* **Purpose:** A restricted admin panel for staff to manage the entry of new ideas and applicants.
* **Key Sections:**
  * **Pending Reviews Table:** Displays all public submissions, enabling administrators to review descriptions and approve or reject applications.

### IPR Violations Page (`/ipr-violations`)
* **Purpose:** Provides a channel for users to report suspected intellectual property rights infringements or violations.
* **Key Sections:**
  * **Intake Form:** Captures details of the infringement, related patent or project names, and severity levels.
  * **Violations Database (Admins/Staff):** Restricts detailed reports to staff review, enabling them to evaluate reports and change resolution statuses.

---

## 5. Analytics, Audit & Administration

### Reports & Export Engine (`/reports`)
* **Purpose:** Provides custom intelligence gathering, reporting, and data exportation capabilities for university management.
* **Key Sections:**
  * **Report Type Selector:** Toggle between Financial Reports, Prosecution metrics, and administrative Audit Logs.
  * **Custom Column Picker:** Allows users to choose which columns should be generated in the data grid.
  * **Interactive KPIs & Filters:** Filters records by dates or academic departments.
  * **Export Console:** Enables instant exports of customized records as clean CSV files or JSON data blocks.

### Administration Console (`/admin`)
* **Purpose:** The master control panel restricted to system administrators to manage platform settings.
* **Key Sections:**
  * **Users Tab:** Lists all registered users, allowing admins to toggle active accounts and promote/demote platform roles (Super Admin, TTC Staff, Faculty).
  * **Workflow Tab:** Customizes default reminder days, intake checklists, escalation pathways, and offers one-click database cache optimization.
  * **Logs Tab:** Displays chronological audit records tracking user actions (e.g., status changes, user approvals, new license creations) to guarantee security compliance.
