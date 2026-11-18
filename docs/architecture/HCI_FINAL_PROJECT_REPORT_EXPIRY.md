# Human & Computer Interaction
# FINAL PROJECT REPORT

**Project:** Expiry (Food Inventory and Lifecycle Management System)  
**Author:** Nguyễn Tâm Đức — Student ID: 24020005  
**Course:** Human & Computer Interaction (HCI)  
**Institution:** VNUK Institute for Research and Executive Education, The University of Danang  
**Date:** November 2026  
**Figma Prototype:** [Open Interactive Figma Prototype](https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1374-7&p=f&t=ToZtn2el4BiU4f0d-0)  
**Project Workspace & Drive:** [Open Project Google Drive Folder](https://drive.google.com/drive/folders/1T1ORNufbrbN6IMOKoZTVGuz-8eESeZtc?usp=drive_link)  

---

## Table of Contents

* [Part 1: Essay](#part-1-essay)
  * [I. Brief](#i-brief)
    * [Background](#background)
    * [A. Project](#a-project)
    * [B. Brand](#b-brand)
    * [C. Client](#c-client)
    * [D. Project deliverables](#d-project-deliverables)
    * [E. Proposed Technology Stack](#e-proposed-technology-stack)
    * [F. Supported platforms](#f-supported-platforms)
    * [G. Brand background](#g-brand-background)
    * [H. Target audience](#h-target-audience)
    * [I. Coverage](#i-coverage)
    * [J. Timing](#j-timing)
    * [K. Description](#k-description)
    * [L. Objective](#l-objective)
    * [M. Draft MVP](#m-draft-mvp)
    * [N. Scope](#n-scope)
    * [O. Limitations](#o-limitations)
    * [P. Human resources](#p-human-resources)
  * [II. Analyze](#ii-analyze)
    * [A. Scenarios](#a-scenarios)
    * [B. Persona](#b-persona)
    * [C. Sympathy / Empathy map](#c-sympathy--empathy-map)
    * [D. Feature list](#d-feature-list)
  * [III. Produce](#iii-produce)
    * [A. Flow chart & Diagrams](#a-flow-chart--diagrams)
    * [B. UX wireframe](#b-ux-wireframe)
  * [IV. Test cases](#iv-test-cases)
    * [Test cases table](#test-cases-table)
    * [Usability test plan](#usability-test-plan)
    * [Heuristic self-evaluation](#heuristic-self-evaluation)
* [Part 2: Prototype](#part-2-prototype)
  * [I. Mobile](#i-mobile)
    * [Visual design](#visual-design-mobile)
    * [App map](#app-map-mobile)
    * [Key screens](#key-screens-mobile)
    * [Changes after lecturer review](#changes-after-lecturer-review-mobile)
  * [II. Web](#ii-web)
    * [Visual design](#visual-design-web)
    * [App map](#app-map-web)
    * [Key screens](#key-screens-web)
    * [Differences from the mobile app](#differences-from-the-mobile-app)

---

# Part 1: Essay

## I. Brief

### Background
* In daily life, individuals, students, and households frequently purchase, store, and consume perishable food across multiple compartments: refrigerator shelves, freezers, crisper drawers, and dry pantries.
* Critical details—such as true remaining quantity, actual expiration date, opened status, and purchase source—remain fragmented across printed product labels, physical packaging tucked out of sight, and unreliable human memory.
* When meal routines suddenly shift (e.g., unexpected overtime, dining out with friends, family schedule changes), items bought with good intentions are forgotten. Consumers only realize an item is spoiled after it has already rotted, or they repurchase ingredients they secretly already own.
* Furthermore, existing inventory tracking apps frequently fail because logging requires cumbersome manual data entry and complex catalog management. The maintenance cost quickly exceeds the perceived value, leading to abandoned apps and out-of-sync digital records.
* **The guiding question:** *How might we enable individuals and households to effortlessly record food items, immediately surface what demands urgent consumption when plans change, and accurately track actual quantities with minimal administrative friction?*

### A. Project
**Expiry** (also designated *Expiry Things*): An offline-first, responsive personal and household food inventory lifecycle management system that pairs low-effort capture (rapid manual logging + candidate OCR date/label extraction) with transparent attention ranking and atomic stock movement reconciliation.

### B. Brand
**Expiry**. The visual identity employs a modern, organic, and clean design language: vibrant Fresh Emerald (`#10B981`) representing vitality and safety, contrasted with Warm Amber (`#F59E0B`) for approaching expiration alerts and Soft Charcoal neutrals (`#1F2937` / `#111827`) to maintain clarity and readability.

### C. Client
Academic coursework project for the **Human-Computer Interaction (HCI)** module at **VNUK Institute for Research and Executive Education (The University of Danang)**. Designed specifically for independent students, busy young professionals, and household meal organizers managing perishable goods.

### D. Project deliverables
* Brand identity, design tokens, and comprehensive UI guidelines.
* Grounded user research: three distinct user personas, realistic daily scenarios, and an empathy map synthesis.
* Formal UX/SE diagrams: Use Case catalog (29 specifications), Hierarchical Task Analysis (HTA), goal-based user flows, system sequence diagrams, state machines, and Information Architecture (sitemap).
* Low- and medium-fidelity UX wireframes with detailed interaction matrices.
* Design system tokens with full light and dark mode specifications.
* Interactive high-fidelity prototypes in Figma for both Mobile (touch-optimized) and Web/Desktop (sidebar & data-dense).
* End-to-end test cases (TC-01 through TC-15), usability test plan with SUS targets, and a rigorous Nielsen-Norman 10-heuristic self-evaluation.
* Comprehensive academic final project report and presentation documentation.

### E. Proposed Technology Stack
* **Frontend:** React 18, TypeScript, Tailwind CSS, Vite, and Lucide React icons. Architecture supports full responsive PWA operation, local storage caching, and instant offline drafting.
* **Backend API:** Node.js with Express modular architecture (ES Modules), following RESTful principles, RFC 9457 Problem Details error schemas, and OWASP security recommendations.
* **Database & Transactions:** MySQL 8.4 utilizing InnoDB strict constraints, explicit transactions, atomic `StockMovement` ledgers, and `FOR UPDATE` locking reads to guarantee zero negative quantities and eliminate race conditions.
* **Candidate OCR Scanner Service:** Python FastAPI service incorporating Tesseract / PaddleOCR for bounding box candidate detection of expiration dates and product names from packaging photos. All OCR extractions are treated strictly as candidate drafts requiring mandatory user review before database commitment.

### F. Supported platforms
Expiry is architected as a universal responsive system. A single unified web application serves mobile, tablet, and desktop viewports, installable as a Progressive Web App (PWA) with offline caching.

#### Table: Platforms, minimum versions and distribution
| Platform | Minimum Version | Distribution | Notes |
|---|---|---|---|
| **Mobile (Android)** | Android 10 (Chrome 100+ / Edge) | PWA via browser; installable to home screen | Native camera access via HTML5 `getUserMedia`; touch-first 5-tab bottom navigation. |
| **Mobile (iOS)** | iOS 15.4+ (Safari / WebKit) | Mobile Safari PWA ("Add to Home Screen") | Full touch gestures, modal bottom sheets, responsive typography. |
| **Web / Desktop** | Chrome, Firefox, Edge, Safari (latest 2 versions) | Hosted web app / PWA | Desktop sidebar layout, full keyboard shortcuts (`Ctrl+K`, `Ctrl+N`, `Esc`), wide table view. |
| **Tablet / Foldables** | iPadOS 15+, Android Tablets | Browser / PWA | Adaptive 2-column split-view layout bridging mobile and desktop conventions. |

#### Table: Feature differences between platforms
| Feature | Mobile (iOS / Android) | Desktop Web | Tablet |
|---|---|---|---|
| **Capture Photo & OCR** | Direct phone camera capture + photo gallery upload | Webcam snapshot or file drag-and-drop import | Camera capture or file picker |
| **Text Recognition (OCR)** | Candidate OCR preview sheet with tap-to-select chips | Split-pane crop and candidate verification dialog | Split-pane crop and candidate verification |
| **Navigation** | 5-tab bottom bar (`Kho`, `Quét`, `+`, `Chú ý`, `Cài đặt`) | Collapsible left sidebar with persistent quick filters | Collapsible left rail |
| **Form Entry** | Bottom modal sheets with thumb-friendly controls | Centered modal dialogs or side drawer | Centered modal dialogs |
| **Keyboard Shortcuts** | Standard virtual keyboard input | Full navigation: `Ctrl+K` search, `Ctrl+N` new item, `Esc` dismiss | Hardware keyboard shortcuts supported |
| **Offline Operation** | Full local storage draft persistence | In-memory & IndexedDB caching | IndexedDB caching |

### G. Brand background
* Created in 2026 by **Nguyễn Tâm Đức** (Student ID: 24020005) for the VNUK Human-Computer Interaction module.
* **Motto:** *“Biết thực phẩm đang có, hạn dùng và lượng còn lại.”* (“Know what you have, when it expires, and how much is left.”)
* **Visual Language:** Emerald green accents (`#10B981`) denoting edible freshness, warning amber (`#F59E0B`) highlighting near-expiry urgency, and crisp semantic neutrals. Built using the clean, accessible `Be Vietnam Pro` and `Inter` typefaces.

### H. Target audience
* **Primary (P01 & P02):**
  * *Busy Independent Students and Young Professionals (P01):* Regularly buy groceries for 2–3 days, store them in shared or small fridges, and inadvertently let items expire because out-of-sight food is forgotten.
  * *Family Meal Planners and Homemakers (P02):* Manage grocery purchases for households; frequently experience abrupt schedule deviations (dining out, social events) and struggle to prioritize what must be consumed immediately versus what can wait.
* **Secondary (P03):**
  * *Detail-Oriented Organizers (P03):* Users who track quantities closely, demand accurate digital-to-physical inventory reconciliation, and require fast, one-tap consumption logging without cumbersome administrative forms.

### I. Coverage
Vietnamese-speaking users first, featuring complete Vietnamese diacritics and culturally aligned terminology (e.g., *Ngăn mát*, *Ngăn đông*, *Tủ khô*, *Đã dùng*, *Đã bỏ*, *Cần chú ý*). Secondary English localization is supported across all UI labels and error messages.

### J. Timing
* **24 October 2026:** Initial architecture and requirements baseline established across 12 system domains.
* **29 October 2026:** System Engineering baseline locked; 29 core Use Cases (UC-01 to UC-29) and MoSCoW MVP scope codified.
* **06 November 2026:** UI/UX wireframes and interaction specs audited; high-fidelity responsive screens constructed in Figma.
* **11 November 2026:** UX repair and consistency pass; lecturer feedback applied to remove AI guessing and mandate human-in-the-loop OCR review.
* **13 November 2026:** Final comprehensive HCI project report compilation and interactive prototype submission.

### K. Description
The core user interaction loop consists of five intuitive stages:
1. **Capture:** Rapid item entry either through lightweight manual input (only 3 mandatory fields: Name, Quantity, Unit) or snapping a packaging photo for candidate OCR extraction.
2. **Verify & Save:** A transparent review gate where users verify or adjust candidate dates, select a storage compartment (*Ngăn mát*, *Ngăn đông*, *Tủ đồ khô*), and save.
3. **Attention & Guidance:** An automated, rules-based attention carousel classifying items into clear states: *Quá hạn* (Expired), *Cận hạn* (Expiring within 2 days), *Còn tươi* (Fresh), and *Chưa rõ hạn* (Unknown date), sorting items by urgency.
4. **Action:** Instant one-tap stock movements from the item detail sheet: *Đã dùng* (Mark as consumed), *Đã bỏ* (Mark as discarded with waste reason tracking), or *Điều chỉnh* (Recount physical stock).
5. **Reconciliation & History:** Complete audit trail tracking every consumption and disposal action, accompanied by a 30-day soft-delete Trash ensuring zero accidental data loss.

### L. Objective
* **Eliminate Forgotten Food:** Surface out-of-sight ingredients before expiration through high-visibility attention cues.
* **Accelerate Next-Action Decisions:** Empower users to decide what to cook within 5 seconds when daily meal plans unexpectedly change.
* **Minimize Administrative Burden:** Reduce the time required to log or update an item to under 10 seconds.
* **Guarantee Inventory Accuracy:** Ensure digital records mirror physical reality through transparent, atomic stock movements and atomic recalculations.

### M. Draft MVP
The Minimum Viable Product (Release 1) isolates high-impact features that solve core visibility and tracking problems, deliberately deferring high-complexity or speculative capabilities.

#### Table: MVP feature priority (MoSCoW)
| Priority | Features | Why |
|---|---|---|
| **Must Have (Release 1)** | • Quick manual capture (Name, Quantity, Unit, optional Date)<br>• Inventory list with Search, Location filter & Expiry sorting<br>• Attention evaluation engine (*Quá hạn*, *Cận hạn*, *Tươi*)<br>• Stock movements (*Đã dùng*, *Đã bỏ* with partial/full amounts)<br>• Physical recount adjustment (*Điều chỉnh kho*)<br>• 30-day Trash and 1-tap restore<br>• Guest / Local mode without mandatory upfront sign-in | Delivers immediate value: captures items, flags what to eat first, and tracks true quantities without login friction. |
| **Should Have (Release 1.1)** | • OCR candidate label extraction with mandatory user confirmation<br>• Storage location management (*Ngăn mát*, *Ngăn đông*, *Tủ bếp*)<br>• Stock movement audit history log<br>• In-app attention threshold customization (e.g., 2 days vs 3 days) | Dramatically speeds up data capture while preserving user trust and data accuracy. |
| **Could Have (Release 2)** | • Barcode scanning against a verified product dictionary<br>• Recipe ingredient matching based on items expiring soon<br>• CSV / JSON inventory export and backup | Enhances utility for long-term power users once core habits are established. |
| **Won't Have (Deferred)** | • Automated AI shelf-life guessing without packaging date validation<br>• Multi-user household real-time synchronization<br>• Automated smart-fridge hardware sensor integration | High failure rate, complex network conflict resolution, and unvalidated return on user investment. |

### N. Scope
* **In Scope:** Personal and single-household food inventory tracking; manual and OCR-assisted entry; storage categorization; rules-based expiry calculations; stock movement logging; 30-day trash lifecycle.
* **Out of Scope:** Commercial restaurant pantry management; automated financial cost-savings claims; medical / prescription drug tracking; automated background push notifications requiring external server daemons for MVP.

### O. Limitations
* **OCR Reliability:** Packaging typography, curved cans, glare, and low lighting impact OCR candidate accuracy. OCR outputs are therefore strictly treated as non-authoritative candidate drafts.
* **Date Semantics:** Expiration dates printed on labels (*Hạn sử dụng / Best Before*) indicate manufacturer guidelines; the application does not make authoritative biological safety determinations regarding food spoilage.
* **Physical vs. Digital Fidelity:** The system relies on human honesty when recording consumption or physical disposal.

### P. Human resources
**Project Author & Lead:** Nguyễn Tâm Đức (Student ID: 24020005)  
*Responsibilities:* End-to-end UX research, persona formulation, system engineering specifications (UC-01 to UC-29), responsive UI design in Figma (mobile and web), full-stack prototype implementation (React, TypeScript, Node.js, MySQL), heuristic evaluation, and final academic documentation.

---

## II. Analyze

### A. Scenarios
Each scenario tracks one persona through an authentic daily routine, explicitly linking observed pain points to system features and prototype screen frames.

#### Scenario 1: A day with Phạm Hoàng An (Primary User — Student living independently)
*Context: 20-year-old university student in Ho Chi Minh City; shares an apartment; uses an iPhone; cooks 2–3 times a week; frequently forgets food stored in back corners of the fridge.*

| Time and Place | Pain Point Observed | What An Does | Feature & Screen Codes |
|---|---|---|---|
| **08:15, Bách Hóa Xanh grocery store** | Purchases fresh vegetables, tofu, and pork with good intentions, but fears forgetting them like last week. | Opens Expiry on mobile. Uses **Quick Add** (`+`) to log 3 items in under 30 seconds. Enters names, picks default quantities, and chooses *Ngăn mát*. | Quick Add · `SCR-02` (Food Form) |
| **12:30, University cafeteria** | Cannot remember if he has milk or eggs left at home before buying dessert. | Opens the app, taps the **Search bar**, types "sữa", and instantly verifies he still has 1 unopened carton in the fridge. | Search & Location Filter · `SCR-01` (Inventory List) |
| **19:00, Apartment kitchen** | Tired after classes; tends to order food delivery because checking fridge contents feels tedious. | Opens the **Attention tab** (`Cần chú ý`). The app highlights that his tofu expires tomorrow (*Cận hạn*). He decides to make quick fried tofu with rice. | Attention Engine · `SCR-04` (Attention View) |
| **19:45, After dinner** | Food inventory apps usually become inaccurate because logging used items requires editing complex forms. | Opens tofu details, taps **Đã dùng** (*Mark as Consumed*), confirms full quantity with one tap. Tofu is automatically moved to finished history. | Stock Movement · `SCR-03` (Detail & Action Sheet) |
| **Outcome** | Zero food wasted; An avoided ordering expensive takeout; fridge inventory stayed 100% accurate with less than 1 minute of total app interaction. |

#### Scenario 2: A day with Tôn Nữ Như Huyền (Primary User — Household Meal Planner)
*Context: 49-year-old homemaker in Da Nang; manages daily groceries for a family of four; uses an Android phone; meal plans constantly change due to family schedules.*

| Time and Place | Pain Point Observed | What Huyền Does | Feature & Screen Codes |
|---|---|---|---|
| **07:00, Morning local market** | Buys beef, local greens, and yogurt tubs with printed expiry dates. Manual typing is frustrating for multiple items. | Takes out phone, taps **Quét nhãn (Scan)**, snaps the yogurt expiration stamp. The OCR extracts "28/11/2026"; she confirms the date with one tap and saves. | OCR Scan & Verification Gate · `SCR-05` (Scanner Review) |
| **17:15, Living room** | Husband calls to say the family is invited to dinner at a relative's house. Tomorrow's dinner plan is cancelled. | Opens Expiry to check what is in danger of spoiling. The app flags fresh beef in *Ngăn mát* expiring in 24 hours. | Urgent Attention List · `SCR-04` |
| **17:25, Kitchen refrigerator** | Needs to prevent the beef from going bad without cooking it tonight. | Moves beef from *Ngăn mát* to *Ngăn đông* (Freezer) in the app, extending its practical storage life, and logs the compartment update. | Edit Item Location · `SCR-03` (Detail Sheet) |
| **Outcome** | A sudden plan disruption did not result in spoiled meat or wasted household budget; quick status visibility enabled an immediate protective action. |

#### Scenario 3: A day with Phạm Ngọc Thiên An (Secondary User — Detail-Oriented Student)
*Context: 20-year-old student in Da Nang; meticulous, tech-savvy; tracks pantry stock closely; gets annoyed when app quantities drift from physical reality.*

| Time and Place | Pain Point Observed | What Thiên An Does | Feature & Screen Codes |
|---|---|---|---|
| **16:00, Weekend pantry check** | A half-used bag of pasta and half-eaten cereal box don't match the original 500g entry. | Taps **Điều chỉnh (Recount)** on the Pasta item, inputs 250g, and saves. The system records an adjustment stock movement with an audit timestamp. | Recount / Stock Adjustment · `SCR-03b` (Recount Dialog) |
| **16:10, Pantry cleaning** | Accidentally swipes and deletes a preserved spice bottle item. | Immediately notices the snackbar notification, taps **Thùng rác (Trash)** in the side drawer, and restores the item in one tap without data loss. | 30-Day Trash & Recovery · `SCR-06` (Trash View) |
| **20:00, Weekly review** | Wants to know whether she actually consumes what she buys or throws food away. | Opens **Insights**, viewing a clear breakdown of items consumed (88%) versus discarded (12%), motivating better buying habits. | Insights & Analytics · `SCR-07` (Insights View) |
| **Outcome** | Maintained 100% digital-to-physical inventory fidelity; zero anxiety regarding accidental deletions. |

---

### B. Persona
To ground all design decisions in authentic human behaviors, three detailed personas were formulated representing students, household organizers, and systematic trackers.

#### Persona 1: Phạm Hoàng An — The Forgetful Young Adult (Primary Persona)
* **Age & Profile:** 20 years old, University Student, Ho Chi Minh City. Single, lives in shared rental housing. Uses iPhone and laptop.
* **Personality:** Extroverted, tech-familiar, practical, occasionally forgetful.
* **Behavior:** Plans grocery runs → Buys 2–3 days of supplies → Stores in fridge → Gets busy with study/social life → Food pushed out of sight → Discovers expired food days later.
* **Habits:** Heavy smartphone user; checks fridge only right before cooking; prefers eating out if cooking preparation takes too much cognitive effort.
* **Goals:** 
  * Remember what perishable items are currently available in the fridge.
  * Receive clear, timely cues about what must be eaten first.
  * Minimize wasted food and money without spending hours on data entry.
* **Frustrations:** 
  * Complex apps with too many required fields (barcode, brand, serial, price).
  * Cluttered notifications that don't recommend a clear next action.
* **Authentic Quote:** *“Lâu lâu đi mua đồ ở Bách Hóa Xanh để ở tủ lạnh rồi quên mất, tới khi lấy ra thì nó hết hạn rồi.”*

#### Persona 2: Tôn Nữ Như Huyền — The Flexible Homemaker (Primary Persona)
* **Age & Profile:** 49 years old, Homemaker / Small business owner, Da Nang. Married with two teenage children. Uses Android phone.
* **Personality:** Family-oriented, practical, flexible, low-to-medium tech confidence.
* **Behavior:** Plans family meals → Buys fresh ingredients → Stores items across multiple compartments → Daily schedule changes unexpectedly → Unsure which ingredients must be rescued first.
* **Habits:** Shops at traditional wet markets and local supermarkets; relies heavily on physical memory; prioritizes family nutrition and waste prevention.
* **Goals:**
  * Quick overview of expiring ingredients when meal plans change.
  * Simple, readable Vietnamese interface with high-contrast text and intuitive buttons.
  * Swiftly adapt ingredients (e.g., move meat to freezer) before spoilage occurs.
* **Frustrations:**
  * Small font sizes, overly complex English terminology, and hidden menus.
  * Typing dates manually on small mobile keyboards.
* **Authentic Quote:** *“Cứ mỗi lần đi ăn ngoài thì lại cứ theo thói quen đi chợ mà quên mất có đồ ăn vẫn còn ở tủ lạnh, xong để đấy nghĩ là bữa sau ăn rồi cũng quên mất.”*

#### Persona 3: Phạm Ngọc Thiên An — The Meticulous Organizer (Secondary Persona)
* **Age & Profile:** 20 years old, Student / Part-time Lab Assistant, Da Nang. Single. Uses MacBook and Android phone.
* **Personality:** Systematic, detail-oriented, high tech savviness, accuracy-focused.
* **Behavior:** Tracks inventory → Organizes by storage type → Performs weekly reviews → Logs adjustments → Gets frustrated if digital numbers drift from physical reality.
* **Goals:**
  * Accurate stock tracking with partial quantity consumption logging.
  * Rapid audit history showing why an item's quantity changed.
  * Absolute protection against accidental deletions.
* **Frustrations:**
  * Apps that treat items as binary (only "in stock" or "deleted"), ignoring partial usage.
  * Sluggish interfaces that require multiple taps to subtract a portion.
* **Authentic Quote:** *“Tui muốn cái gì mà tùy chỉnh được nhưng mà nó phải tiện với đỡ tốn thời gian của tui nữa.”*

---

### C. Sympathy / Empathy map
Synthesized from user observations and validated problem analysis:

| Empathy Dimension | Observed User State | Design Implication for Expiry |
|---|---|---|
| **SAYS** | • "I forget vegetables in the crisper drawer until they turn black."<br>• "Typing expiry dates manually takes too much time."<br>• "If plans change, I don't know what will spoil first." | • Keep data capture under 3 taps.<br>• Provide candidate OCR extraction.<br>• Place Attention items prominently at the top of the Home view. |
| **THINKS** | • "I hate throwing away food I spent hard-earned money on."<br>• "Is this yogurt still safe to eat or should I trash it?"<br>• "Will this app force me to register an account before I even try it?" | • Allow full guest operation from first launch.<br>• Distinguish clearly between *Quá hạn* (Expired) and *Cận hạn* (Expiring soon).<br>• Surface clear waste reasons. |
| **DOES** | • Pushes new groceries in front of older groceries.<br>• Sniffs or visually inspects milk cartons before drinking.<br>• Deletes apps that send annoying, unhelpful notifications. | • Physical storage location tagging (*Ngăn mát*, *Ngăn đông*).<br>• In-app attention ranking rather than noisy background spam.<br>• Provide 1-tap partial consumption. |
| **FEELS** | • Guilt when tossing spoiled food into the trash.<br>• Overwhelmed when looking into an unorganized, crowded refrigerator.<br>• Frustration when logging updates feels like office homework. | • Positive reinforcement when marking items as *Đã dùng* (Consumed).<br>• Calm, clean UI with generous whitespace and clear status badges.<br>• 1-tap undo for all destructive actions. |
| **PAINS** | • Uncoordinated grocery purchases resulting in duplicate items.<br>• Food spoilage due to out-of-sight placement.<br>• Time-consuming manual inventory bookkeeping. | • Instant fuzzy search by item name.<br>• Clear color-coded urgency indicators (Amber / Red).<br>• Streamlined 3-field quick add flow. |
| **GAINS** | • Confidence that all stored groceries are accounted for.<br>• Effortless dinner decisions when arriving home tired.<br>• Measurable reduction in monthly grocery waste and spending. | • Immediate "What to use tonight" guidance.<br>• Simple, transparent Insights dashboard showing consumption rate. |

---

### D. Feature list
All features directly address persona pain points and map directly to formal Use Case specifications (UC-01 to UC-29):

* **F01 · Quick Manual Capture (UC-03, UC-04):**
  * Three essential fields only: Item Name, Quantity, Unit (hộp, quả, kg, g, túi, etc.).
  * Optional metadata: Expiry Date, Storage Location (*Ngăn mát*, *Ngăn đông*, *Tủ khô*), Category, Notes.
  * Smart default pre-fills based on previously entered items.
* **F02 · Candidate OCR Label Extraction (UC-05):**
  * Snap photo or upload image of product packaging or receipt.
  * Automated bounding box detection of candidate dates (DD/MM/YYYY, MM/YYYY) and names.
  * **Mandatory Human-in-the-Loop Review Gate:** Detected values populate an editable draft form; no unverified data is ever committed directly to the database.
* **F03 · Inventory Browsing, Search & Filtering (UC-06 to UC-09):**
  * Instant search by item name with keyword debouncing.
  * Filter chips by Storage Location (*Tất cả*, *Ngăn mát*, *Ngăn đông*, *Tủ khô*).
  * Sort by Expiry Date (Urgent first), Date Added, or Alphabetical.
* **F04 · Automated Attention Engine & Guidance (UC-10, UC-11):**
  * Rules-based categorization calculated dynamically upon app launch or refresh:
    * **Quá hạn (Expired):** Expiry date < Current Date (Red badge).
    * **Cận hạn (Expiring Soon):** Expiry date within configurable threshold (default 2 days) (Amber badge).
    * **Còn tươi (Fresh):** Expiry date > 2 days ahead (Green badge).
    * **Chưa rõ hạn (Unknown Date):** No date specified; flagged for user inspection.
  * Dedicated Attention Carousel on Home for 1-second triage.
* **F05 · Atomic Stock Movements & Recount (UC-12 to UC-15):**
  * *Đã dùng (Consume):* Deduct partial or full quantity with 1 tap.
  * *Đã bỏ (Discard):* Record food waste with optional waste reason (Spoiled, Moldy, Smelled bad, Leftover).
  * *Điều chỉnh (Recount):* Enter true observed physical count; system logs an audit adjustment movement.
  * Strict database validation preventing negative quantities.
* **F06 · 30-Day Trash & Recovery (UC-16, UC-17):**
  * Soft-delete architecture for all deleted items.
  * Dedicated Trash view with remaining days countdown and 1-tap Restore.
  * Permanent purge option for complete privacy control.
* **F07 · Insights & Consumption Analytics (UC-18, UC-19):**
  * Visual overview of active stock health (Fresh vs Expiring vs Expired).
  * Historical ratio of Consumed vs Discarded food to encourage sustainable grocery habits.
* **F08 · Guest First Architecture (UC-01, UC-02):**
  * Immediate app usability upon first open with zero onboarding roadblocks.
  * Optional account creation and sign-in for multi-device data backup.

---

## III. Produce

### A. Flow chart & Diagrams

#### 1. Use Case Catalog (Summary of 29 Use Cases)
The system specifications are strictly organized into 29 atomic use cases across functional clusters:

| Cluster | Use Case ID & Name | Primary Actor | Preconditions & Goal |
|---|---|---|---|
| **Account & Guest** | **UC-01:** Truy cập chế độ khách (Guest Access)<br>**UC-02:** Đăng nhập & Đồng bộ tài khoản | Người dùng | Khám phá và sử dụng toàn bộ tính năng mà không cần tài khoản; đăng nhập để lưu trữ lâu dài. |
| **Capture & Add** | **UC-03:** Thêm thực phẩm thủ công nhanh<br>**UC-04:** Bổ sung metadata chi tiết<br>**UC-05:** Quét nhãn thực phẩm qua OCR | Người dùng | Tạo bản ghi thực phẩm chính xác; duyệt qua cổng kiểm tra OCR trước khi lưu. |
| **Inventory & View** | **UC-06:** Xem danh sách tồn kho tổng thể<br>**UC-07:** Tìm kiếm thực phẩm theo tên<br>**UC-08:** Lọc thực phẩm theo vị trí bảo quản<br>**UC-09:** Sắp xếp theo hạn dùng / ngày nhập | Người dùng | Định vị tức thì bất kỳ món đồ nào trong tủ lạnh trong vòng 3 giây. |
| **Attention Engine** | **UC-10:** Đánh giá danh sách cần chú ý (Attention)<br>**UC-11:** Xem chi tiết nguyên nhân cảnh báo | Hệ thống / Người dùng | Phân loại tự động các món Cận hạn, Quá hạn để gợi ý hành động xử lý ngay. |
| **Stock Movements** | **UC-12:** Ghi nhận tiêu thụ một phần (Consume Part)<br>**UC-13:** Ghi nhận tiêu thụ toàn bộ (Consume All)<br>**UC-14:** Ghi nhận vứt bỏ kèm lý do (Discard)<br>**UC-15:** Điều chỉnh số lượng tồn thực tế (Recount) | Người dùng | Đảm bảo số lượng trên app luôn khớp 100% với số lượng thực tế trong tủ lạnh. |
| **Trash & Lifecycle** | **UC-16:** Đưa thực phẩm vào Thùng rác (Soft-delete)<br>**UC-17:** Khôi phục thực phẩm từ Thùng rác<br>**UC-18:** Xóa vĩnh viễn khỏi Thùng rác | Người dùng | Bảo vệ dữ liệu khỏi thao tác xóa nhầm, cho phép hoàn tác dễ dàng. |
| **Insights & Config** | **UC-19:** Xem thống kê tiêu thụ & lãng phí<br>**UC-20:** Tùy chỉnh ngưỡng cảnh báo cận hạn | Người dùng | Xem hiệu quả quản lý thực phẩm cá nhân và cá nhân hóa cảnh báo. |

#### 2. Hierarchical Task Analysis (HTA)
Task analysis decomposes primary user goals into ordered procedural steps and decision gates:

##### HTA Task 1: Thêm thực phẩm mới vào kho (Add New Food Item)
```
0. Thêm thực phẩm mới vào kho
   1. Chọn phương thức nhập liệu
      1.1 Tự nhập tay nhanh (Nhấn nút '+')
      1.2 Quét nhãn bằng Camera / OCR (Nhấn nút 'Quét')
   2. Thu thập dữ liệu món ăn
      2.1 Nếu chọn Nhập tay:
          2.1.1 Nhập tên thực phẩm (Bắt buộc)
          2.1.2 Nhập số lượng và đơn vị tính (Bắt buộc, mặc định: 1 cái/hộp)
          2.1.3 Chọn ngày hết hạn nếu biết (Tùy chọn)
          2.1.4 Chọn vị trí bảo quản (Ngăn mát / Ngăn đông / Tủ khô)
      2.2 Nếu chọn Quét OCR:
          2.2.1 Chụp ảnh bao bì hoặc tải ảnh nhãn sản phẩm
          2.2.2 Hệ thống phân tích và đóng khung vùng ngày tháng nhận diện được
          2.2.3 Người dùng kiểm tra và chạm để xác nhận giá trị ngày
   3. Lưu và ghi nhận vào hệ thống
      3.1 Kiểm tra tính hợp lệ dữ liệu (Số lượng > 0)
      3.2 Nhấn 'Lưu vào kho'
      3.3 Hệ thống cập nhật danh sách và hiển thị phản hồi thành công
```

##### HTA Task 2: Xử lý thực phẩm sắp hết hạn (Resolve Expiring Item)
```
0. Xử lý thực phẩm sắp hết hạn
   1. Nhận biết món cần xử lý
      1.1 Mở ứng dụng, quan sát Banner 'Cần chú ý' ở đầu trang
      1.2 Chạm vào thẻ món ăn cận hạn để xem chi tiết
   2. Chọn hành động xử lý thực tế
      2.1 Nếu quyết định nấu/sử dụng ngay:
          2.1.1 Nhấn 'Đã dùng'
          2.1.2 Chọn dùng hết hoặc nhập số lượng dùng một phần
          2.1.3 Xác nhận hoàn tất
      2.2 Nếu phát hiện đồ đã hư hỏng:
          2.2.1 Nhấn 'Đã bỏ'
          2.2.2 Chọn lý do bỏ (Hư hỏng, ôi thiu, quá hạn)
          2.2.3 Xác nhận loại bỏ
      2.3 Nếu dời lịch và muốn bảo quản lâu hơn:
          2.3.1 Nhấn 'Chỉnh sửa'
          2.3.2 Chuyển vị trí từ Ngăn mát sang Ngăn đông
          2.3.3 Cập nhật lại hạn dùng mới
```

#### 3. Goal-Based User Flows
Following NN/g methodology, every flow begins at an entry trigger, passes user decisions, and terminates only when the goal is visibly achieved:

* **Flow ⓪ Guest Access:** App open → Local storage initialization → Direct landing on Inventory view (No forced sign-in gate).
* **Flow ① Quick Manual Add:** Tap `+` → Enter Name & Quantity → Tap Storage location chip → Tap Save → Item visibly animates into Inventory list.
* **Flow ② OCR Scan with Review Gate:** Tap Scan → Capture label → View Candidate Date chips → Tap correct date chip → Form auto-fills → Tap Save → Stored.
* **Flow ③ Filter & Search:** Type query or tap Location Chip (*Ngăn mát*) → Inventory instantly updates via client-side debounce → Correct item found.
* **Flow ④ Attention Triage:** Open Attention view → Inspect Expiring Soon list → Tap item → Choose Consume or Extend storage.
* **Flow ⑤ Partial Consumption:** Open Item Detail → Tap *Đã dùng* → Select "Một phần" → Enter consumed amount (e.g., 200g out of 500g) → Remaining quantity updates to 300g with atomic audit log.
* **Flow ⑥ Physical Recount:** Open Item Detail → Tap *Điều chỉnh* → Type actual observed count → Save → Difference logged as `RECOUNT` movement.
* **Flow ⑦ Trash Restore:** Open Drawer → Select Thùng rác → Locate soft-deleted item → Tap *Khôi phục* → Item immediately returns to active inventory.

#### 4. System Sequence Diagram (Manual Add & Attention Calculation)
```
User                Client UI               API Controller          Attention Service         Database
 |                      |                          |                        |                    |
 |--- 1. Tap '+' ------>|                          |                        |                    |
 |--- 2. Input Form --->|                          |                        |                    |
 |--- 3. Tap 'Lưu' ---->|                          |                        |                    |
 |                      |--- 4. POST /api/foods -->|                        |                    |
 |                      |    {name, qty, unit, exp}|                        |                    |
 |                      |                          |--- 5. Validate input ->|                    |
 |                      |                          |--- 6. INSERT FoodEntry -------------------->|
 |                      |                          |       + Initial Movement (ADD) ------------>|
 |                      |                          |<-- 7. DB Commit OK -------------------------|
 |                      |                          |--- 8. Evaluate Attention ->|                |
 |                      |                          |<-- 9. Return Status -------|                |
 |                      |<-- 10. HTTP 201 Created -|                                             |
 |                      |    {item, attention_tier}|                                             |
 |<-- 11. Toast OK & ---|                          |                                             |
 |    Item in List      |                          |                                             |
```

#### 5. State Transition Diagram (Lifecycle of `FoodEntry`)
```
[State: Form Draft]
       |
       | (User taps Save & Validation passes)
       v
[State: ACTIVE - FRESH] ------------(Time passes / Date within threshold)---------> [State: ACTIVE - EXPIRING SOON]
       |                                                                                    |
       | (Consumed / Discarded)                                                             | (Time passes past date)
       |                                                                                    v
       |---------------------------------------------------------------------------> [State: ACTIVE - EXPIRED]
       |                                                                                    |
       | (Quantity drops to 0 via Consume or Discard)                                       |
       v                                                                                    v
[State: DEPLETED / ZERO STOCK]                                                       [State: SOFT-DELETED TRASH]
       |                                                                                    |
       |                                                                                    | (User taps Restore)
       |                                                                                    +----> [State: ACTIVE]
       | (User deletes record)                                                              |
       +----------------------------------------------------------------------------------->| (30 days pass / Purge)
                                                                                            v
                                                                                    [State: PERMANENTLY REMOVED]
```

#### 6. Information Architecture (IA) & App Sitemap
```
Expiry App Root
├── 1.0 Kho thực phẩm (Inventory - Home)
│   ├── 1.1 Thanh tìm kiếm & Bộ lọc nhanh (Search & Filter Chips: All, Ngăn mát, Ngăn đông, Tủ khô)
│   ├── 1.2 Carousel Cần chú ý (Attention Summary: Cận hạn, Quá hạn)
│   ├── 1.3 Danh sách thực phẩm nhóm theo vị trí / hạn dùng
│   └── 1.4 Chuyển đổi hiển thị (Dạng danh sách / Dạng thẻ)
├── 2.0 Thêm thực phẩm (Create / Add)
│   ├── 2.1 Biểu mẫu nhập tay nhanh (Name, Qty, Unit, Expiry, Storage)
│   └── 2.2 Quét nhãn OCR (Camera viewfinder, Image crop, Candidate date chips)
├── 3.0 Chi tiết thực phẩm (Item Detail Modal / Sheet)
│   ├── 3.1 Thông tin chi tiết & Ngày đếm ngược (Days remaining countdown)
│   ├── 3.2 Tác vụ nhanh: Đã dùng (Consume Dialog: Hết / Một phần)
│   ├── 3.3 Tác vụ nhanh: Đã bỏ (Discard Dialog with Waste Reason)
│   ├── 3.4 Tác vụ nhanh: Điều chỉnh số lượng (Recount Dialog)
│   └── 3.5 Chỉnh sửa metadata & Xóa vào Thùng rác
├── 4.0 Cần chú ý (Dedicated Attention View)
│   ├── 4.1 Danh sách Quá hạn (Expired - Urgent red)
│   ├── 4.2 Danh sách Cận hạn (Expiring within 2 days - Amber warning)
│   └── 4.3 Danh sách Chưa rõ hạn (Unknown date review)
└── 5.0 Cài đặt & Mở rộng (Settings & Utility)
    ├── 5.1 Thùng rác 30 ngày (Trash bin with countdown & 1-tap Restore)
    ├── 5.2 Lịch sử biến động kho (Stock movement history log)
    ├── 5.3 Thống kê Insights (Consumed vs Discarded metrics)
    └── 5.4 Tùy chọn giao diện (Sáng / Tối) & Ngưỡng nhắc hạn
```

---

### B. UX wireframe
The UX wireframe specifications establish spatial layouts, visual hierarchy, touch targets, and responsive breakpoints:

1. **Dashboard / Inventory Layout (`SCR-01`):**
   * *Top Bar:* Brand identity, status indicator, Quick Search input (`Ctrl+K`), and Theme switcher.
   * *Horizontal Filter Bar:* Sticky scrollable pill chips: `Tất cả`, `Ngăn mát (12)`, `Ngăn đông (5)`, `Tủ khô (8)`.
   * *Attention Carousel:* Prominent amber/red elevated cards showcasing urgent items with remaining day count pills (e.g., "Hết hạn ngày mai").
   * *Inventory Body:* Card items featuring clear typography (Item name in bold, quantity pill, storage icon, and color-coded status indicator).
   * *Floating Action Button (Mobile):* Elevated primary Emerald button (`+`) positioned at the bottom right (48x48px touch target).
2. **Food Form Sheet (`SCR-02`):**
   * Designed as a modal bottom sheet on mobile (sliding up with a grab handle) and a centered modal dialog on desktop.
   * Autofocused *Tên thực phẩm* input, dual-column *Số lượng* and *Đơn vị* selector, custom date picker with quick presets (+1 ngày, +3 ngày, +1 tuần), and segmented pill selector for Storage location.
3. **Item Detail & Action Sheet (`SCR-03`):**
   * High-contrast countdown banner (e.g., "Còn 2 ngày" in Amber or "Đã quá hạn 1 ngày" in Red).
   * Quick-action button row: `Đã dùng` (Emerald filled), `Đã bỏ` (Rose outline), `Điều chỉnh` (Neutral outline), and `Sửa` (Icon).
4. **OCR Verification View (`SCR-05`):**
   * Upper half: Captured packaging photo preview with highlighted bounding boxes.
   * Lower half: Candidate extraction chips (e.g., `HSD: 25/11/2026`, `NSX: 18/11/2026`). Tapping any chip immediately transfers the value into the editable form below.

---

## IV. Test cases

### Test cases table
These test cases validate both functional requirements and usability behavior. Every test path is implemented in the functional prototype:

| Test ID & Feature | Precondition | Test Steps | Expected Result |
|---|---|---|---|
| **TC-01:** Chế độ khách (Guest Mode) | App freshly opened | 1. Open app URL in incognito window.<br>2. Observe initial screen. | App opens directly to Inventory dashboard with demo items. Zero forced sign-in modals. |
| **TC-02:** Thêm thực phẩm nhanh | On Inventory screen | 1. Tap `+` button.<br>2. Type "Thịt bò", quantity "500", unit "g".<br>3. Tap *Lưu*. | Form validates instantly; bottom sheet dismisses; "Thịt bò" appears at top of inventory with success toast. |
| **TC-03:** Validation dữ liệu trống | On Add Form | 1. Leave Name field empty.<br>2. Tap *Lưu*. | Inline red error message "Vui lòng nhập tên thực phẩm" displays below field. Form does not submit. |
| **TC-04:** Quét OCR & Cổng duyệt | Packaging photo ready | 1. Tap *Quét*. Snap or upload photo.<br>2. Observe detected candidate chips.<br>3. Tap candidate date "20/12/2026". | Candidate date transfers into the form's Expiry Date field. User can freely edit before tapping *Lưu*. |
| **TC-05:** Cảnh báo cận hạn (Attention) | Item with expiry date = Tomorrow | 1. Save an item with tomorrow's date.<br>2. Navigate to *Cần chú ý* tab. | Item automatically appears in the *Cận hạn* section with an Amber warning badge "Còn 1 ngày". |
| **TC-06:** Tiêu thụ một phần (Consume Part) | Item "Sữa tươi" (1000 ml) | 1. Open Sữa tươi detail.<br>2. Tap *Đã dùng* -> Choose *Một phần*.<br>3. Enter 400 ml and confirm. | Remaining quantity instantly updates to 600 ml. Stock movement log records -400 ml `CONSUME`. |
| **TC-07:** Tiêu thụ toàn bộ | Item "Sữa chua" (1 hộp) | 1. Open Sữa chua detail.<br>2. Tap *Đã dùng* -> Choose *Dùng hết*. | Item quantity becomes 0. Item transitions to Finished history and leaves active inventory view. |
| **TC-08:** Vứt bỏ kèm lý do (Discard) | Item "Rau xà lách" (1 cây) | 1. Open detail.<br>2. Tap *Đã bỏ*.<br>3. Select reason "Bị dập úng" and confirm. | Quantity clears. Insights records 1 discarded item tagged with reason "Bị dập úng". |
| **TC-09:** Điều chỉnh kiểm kê (Recount) | Item shows 5 trứng, physical is 3 | 1. Open detail.<br>2. Tap *Điều chỉnh*.<br>3. Type "3" and save. | Quantity updates to 3. Movement ledger logs -2 difference with type `RECOUNT`. |
| **TC-10:** Lọc theo vị trí bảo quản | Multiple items across Fridge/Freezer | 1. Tap filter chip *Ngăn đông*. | Inventory list immediately filters to show only items assigned to *Ngăn đông*. |
| **TC-11:** Tìm kiếm tức thì | 20+ items in list | 1. Tap search input.<br>2. Type "trứng". | List filters in real-time, showing only matching items containing "trứng". |
| **TC-12:** Xóa mềm vào Thùng rác | Any active item | 1. Open item menu -> Tap *Xóa*. | Item removed from inventory. Snackbar displays: "Đã chuyển vào thùng rác — Hoàn tác (Undo)". |
| **TC-13:** Khôi phục từ Thùng rác | Item in Thùng rác | 1. Open Thùng rác.<br>2. Tap *Khôi phục* on deleted item. | Item immediately returns to active inventory with original quantity and metadata intact. |
| **TC-14:** Chuyển đổi giao diện Sáng / Tối | Default Light theme | 1. Tap Moon/Sun icon in header. | Entire UI switches seamlessly to dark neutral tokens (`#111827`) with full contrast compliance. |
| **TC-15:** Phím tắt trên Desktop Web | Desktop viewport (1440px) | 1. Press `Ctrl + K`.<br>2. Press `Ctrl + N`.<br>3. Press `Esc`. | `Ctrl+K` focuses search; `Ctrl+N` opens Add modal; `Esc` dismisses open modal dialog. |

### Usability test plan
* **Methodology:** 5 participants per persona group (total N = 10 participants: 5 students, 5 household cooks), utilizing the Think-Aloud protocol followed by the standardized System Usability Scale (SUS) questionnaire.
* **Target Usability Criteria:** Minimum 85% task completion rate without moderator intervention; SUS score target $\ge 82/100$ (Grade A usability).

#### Usability Task Scenarios:
1. **Task 1 (Capture):** *"Bạn vừa mua 1 túi táo và 1 hộp thịt gà từ siêu thị. Hãy ghi lại 2 món này vào ứng dụng và đặt thịt gà vào ngăn đông."*  
   *Success Criterion:* Both items created with correct compartment within 25 seconds. Target: $\le 20$ seconds, 0 errors.
2. **Task 2 (Triage under changed plans):** *"Tối nay bạn quyết định đi ăn với bạn bè. Hãy kiểm tra xem trong tủ lạnh có món nào sẽ hỏng nếu không ăn trong 24 giờ tới không."*  
   *Success Criterion:* Participant navigates to Attention view and correctly identifies urgent items. Target: $\le 10$ seconds, $\le 2$ taps.
3. **Task 3 (Partial Usage):** *"Bạn dùng một nửa hộp sữa tươi 1 lít để làm bánh. Hãy cập nhật lượng sữa còn lại trong ứng dụng."*  
   *Success Criterion:* Participant opens detail, taps *Đã dùng*, inputs 500ml, and verifies remaining count. Target: $\le 15$ seconds.
4. **Task 4 (Accidental Recovery):** *"Bạn lỡ tay bấm xóa nhầm một chai nước sốt. Hãy tìm lại và khôi phục nó về kho."*  
   *Success Criterion:* Participant accesses Thùng rác from drawer and taps Restore. Target: $\le 10$ seconds, $\le 3$ taps.
5. **Task 5 (Inspection & Filter):** *"Bạn đang đứng trước tủ đông và muốn kiểm tra tất cả các món đang có trong đó."*  
   *Success Criterion:* Participant taps filter chip *Ngăn đông* and reads stock. Target: $\le 5$ seconds, 1 tap.

### Heuristic self-evaluation
Rigorous self-evaluation conducted against Jakob Nielsen's 10 Usability Heuristics for User Interface Design:

| Heuristic | Evidence in Expiry Design | Severity (0–3) | Mitigation Applied |
|---|---|---|---|
| **1. Visibility of system status** | Real-time countdown badges (*Còn 2 ngày*, *Hết hạn hôm nay*), progress spinners during image OCR processing, and prominent toast notifications upon saves. | 0 (None) | Clear color semantics (Green/Amber/Red) keep user constantly informed of food states. |
| **2. Match between system and real world** | Terminology directly reflects Vietnamese kitchen reality: *Ngăn mát*, *Ngăn đông*, *Tủ khô*, *Đã dùng*, *Đã bỏ*, *Thùng rác*. Units use common kitchen terms (hộp, quả, kg, túi). | 0 (None) | Banned obscure technical jargon (e.g., replaced "Stock Transaction Type" with simple "Dùng" or "Bỏ"). |
| **3. User control and freedom** | 5-second instant Undo snackbar after deletion, 30-day soft-delete Trash bin with 1-tap Restore, and non-destructive form cancellation via `Esc` or grab-handle swipe. | 0 (None) | Accidental deletions are completely reversible without data loss. |
| **4. Consistency and standards** | Unified 4px design token grid, standardized button styles across all views, identical drawer/sheet structures, and consistent placement of primary action buttons. | 0 (None) | Adheres strictly to Apple HIG (mobile sheets) and web desktop conventions (sidebars). |
| **5. Error prevention** | Required field indicators, date picker constraints preventing negative quantities, and a **mandatory human review step** before OCR candidate data is saved. | 0 (None) | System prevents invalid database states before user can even press Submit. |
| **6. Recognition rather than recall** | Attention carousel surfaces urgent items immediately upon app launch; persistent storage filter chips eliminate the need to memorize where an item was placed. | 0 (None) | Users do not have to mentally search their refrigerator shelves. |
| **7. Flexibility and efficiency of use** | Casual users can use 1-tap quick add with smart defaults; advanced users can utilize desktop keyboard shortcuts (`Ctrl+K`, `Ctrl+N`, `Esc`) and detailed recount dialogs. | 0 (None) | Adapts gracefully from single-hand mobile touch to rapid desktop data entry. |
| **8. Aesthetic and minimalist design** | Clean layout with generous whitespace, crisp typography (`Be Vietnam Pro`), elimination of visual clutter, and secondary options tucked cleanly into modal menus. | 0 (None) | Zero irrelevant decorative widgets; focus remains entirely on food items and dates. |
| **9. Help users recognize, diagnose, and recover from errors** | Specific, contextual inline error messages (e.g., "Số lượng phải lớn hơn 0", "Ngày hết hạn không thể trước ngày sản xuất") with actionable remedy steps. | 0 (None) | Users are never stranded with generic "Error 500" or cryptic system popups. |
| **10. Help and documentation** | Contextual placeholder tooltips (e.g., "Ví dụ: Sữa chua Vinamilk"), onboarding guide on first launch, and clear waste reason explanations. | 0 (None) | Self-explanatory interface minimizes the need for external user manuals. |

---

# Part 2: Prototype

## I. Mobile

### Interactive Prototype Access
* **Figma Mobile & Web Prototype Link:** [Open Figma Prototype (Node 1374:7)](https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1374-7&p=f&t=ToZtn2el4BiU4f0d-0)
* **Prototype Scope:** Covers complete mobile flows (Phone 390px viewport) and desktop web views (1440px viewport) across both Light and Dark themes.

### Visual design (Mobile)
* **Color Tokens:**
  * Primary Emerald: `#10B981` (Freshness, safe state, primary action).
  * Warning Amber: `#F59E0B` (Approaching expiry, review needed).
  * Destructive Rose: `#EF4444` (Expired state, discard action).
  * Background Light: `#F9FAFB` | Background Dark: `#111827`.
  * Card Surface Light: `#FFFFFF` | Card Surface Dark: `#1F2937`.
* **Typography:** `Be Vietnam Pro` (optimized for Vietnamese diacritics and exceptional mobile legibility).
  * Heading 1 (Screen title): 24px / Bold / 130% line height.
  * Heading 2 (Card title): 18px / Semi-bold.
  * Body Text: 14px / Regular / 140% line height.
  * Caption / Status Badge: 12px / Medium.
* **Layout & Touch Ergonomics:** All primary interactive elements adhere to minimum 44x44px touch targets; bottom sheet modals feature top grab handles for effortless one-handed thumb dismissal.

### App map (Mobile)
The mobile navigation architecture is structured around an ergonomic 5-tab bottom bar:

```
[Mobile 5-Tab Bar]
├── Tab 1: Kho (Inventory Home - SCR-01)
│   ├── Search bar & Filter chips
│   ├── Attention Carousel
│   └── Categorized food items list
├── Tab 2: Quét (OCR Scanner - SCR-05)
│   ├── Camera viewfinder / photo picker
│   └── Candidate date review sheet
├── Tab 3: Thêm nhanh (+) (Quick Add Modal - SCR-02)
│   └── 3-field rapid entry sheet
├── Tab 4: Chú ý (Attention Triage - SCR-04)
│   ├── Quá hạn list
│   └── Cận hạn list
└── Tab 5: Cài đặt (Settings & Utilities - SCR-06, 07)
    ├── Thùng rác (30-day Trash)
    ├── Thống kê Insights
    └── Theme & Preferences
```

### Key screens (Mobile)

1. **`SCR-01` · Màn hình Kho thực phẩm (Inventory Home):**
   * *Purpose:* Primary hub providing immediate visibility into all stored food.
   * *Components:* Top greeting and search bar; horizontal scrolling filter chips (*Tất cả*, *Ngăn mát*, *Ngăn đông*, *Tủ khô*); elevated Attention Carousel displaying items expiring within 48 hours; vertically scrollable food card feed with remaining day badges.
   * *Interaction:* Tapping any food card slides up the comprehensive Item Detail sheet (`SCR-03`).
2. **`SCR-02` · Biểu mẫu Thêm nhanh (Quick Add Bottom Sheet):**
   * *Purpose:* Minimize input barrier for newly bought groceries.
   * *Components:* Auto-focused *Tên thực phẩm* input with autocomplete chips; side-by-side *Số lượng* and *Đơn vị* pickers; Expiry date selector with quick shortcut buttons (`+1 ngày`, `+3 ngày`, `+1 tuần`); Storage compartment toggle.
   * *Interaction:* Pressing *Lưu vào kho* plays an affirmative micro-haptic feedback and appends the item to the active inventory list.
3. **`SCR-03` · Chi tiết thực phẩm & Tác vụ (Item Detail Sheet):**
   * *Purpose:* One-stop control center for taking action on a stored ingredient.
   * *Components:* High-visibility status header (e.g., "Hết hạn sau 2 ngày"); storage location tag; quantity remaining bar; 4 action buttons: *Đã dùng*, *Đã bỏ*, *Điều chỉnh*, *Sửa*.
   * *Interaction:* Tapping *Đã dùng* opens the partial-consumption slider; tapping *Đã bỏ* prompts for a waste reason.
4. **`SCR-04` · Màn hình Cần chú ý (Dedicated Attention View):**
   * *Purpose:* Instant triage for what must be eaten today.
   * *Components:* Two distinct sections: *Quá hạn* (Urgent Red) and *Cận hạn trong 48h* (Warning Amber). Each item card displays a prominent recommendation button (e.g., "Dùng ngay").
5. **`SCR-05` · Màn hình Quét nhãn OCR (OCR Camera & Review):**
   * *Purpose:* Accelerate expiration date capture from commercial packaging.
   * *Components:* Top camera view with alignment crosshairs; bottom extraction tray displaying detected date text as selectable chips. Tapping a chip transfers the date into the verified input form.
6. **`SCR-06` · Màn hình Thùng rác 30 ngày (Trash & Recovery):**
   * *Purpose:* Guarantee user psychological safety and data recoverability.
   * *Components:* List of deleted items showing "Còn X ngày trước khi xóa hẳn"; single-tap *Khôi phục* button on each card.

### Changes after lecturer review (Mobile)
Following constructive academic feedback from the module lecturer, four key architectural refinements were integrated into the design:
* **Removal of Unverified AI Shelf-Life Guessing:** The original concept proposed an AI model that automatically predicted food shelf life without human verification. The lecturer rightly pointed out that biological food spoilage varies widely based on storage conditions and packaging integrity, and inaccurate AI predictions could pose food safety risks. **Refinement:** The system strictly anchors expiry calculations on explicit packaging dates and user confirmations.
* **Mandatory Human-in-the-Loop OCR Verification Gate:** Rather than directly saving OCR-extracted text into the database, an explicit intermediate review sheet was mandated. Users must verify or adjust detected numbers before commitment, preserving database integrity.
* **Streamlining the Quick Add Form:** Early wireframes contained 9 input fields (brand, purchase price, supplier, notes, barcode, etc.). The lecturer emphasized that high data entry friction causes users to abandon food apps. **Refinement:** Reduced mandatory fields to strictly three: Name, Quantity, and Unit. All other metadata fields were made completely optional.
* **Distinct Separation of 'Consumed' vs. 'Discarded':** Rather than treating finished food as a generic "deleted" action, the system explicitly differentiates between food successfully eaten (*Đã dùng*) and food thrown away (*Đã bỏ*), unlocking meaningful insights into household waste patterns.

---

## II. Web

### Interactive Prototype Access
* **Figma Web & Desktop Prototype Link:** [Open Figma Desktop Prototype](https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1374-7&p=f&t=ToZtn2el4BiU4f0d-0)

### Visual design (Web)
* **Grid & Breakpoints:** 1440px standard desktop grid (12 columns, 24px gutters, 80px side margins) with adaptive fluid scaling down to tablet breakpoints (768px – 1024px).
* **Information Density:** Desktop layout takes full advantage of wide horizontal viewports to present split-screen panels (inventory list on the left, full item detail and stock movement history on the right) without requiring users to navigate away from context.
* **Visual Parity:** Identical color tokens, typography scales, and Lucide icon sets are shared between Web and Mobile, ensuring immediate cognitive familiarity across devices.

### App map (Web)
The desktop web interface replaces the mobile bottom bar with a comprehensive, collapsible left navigation sidebar:

```
[Desktop Left Sidebar]
├── 1.0 Kho thực phẩm (Primary Data Grid / Card View)
│   ├── Quick Search (`Ctrl + K`)
│   └── Location Filter Tabs (Tất cả, Ngăn mát, Ngăn đông, Tủ khô)
├── 2.0 Cần chú ý (Dedicated Attention Dashboard)
│   ├── Bảng thực phẩm quá hạn
│   └── Bảng thực phẩm cận hạn
├── 3.0 Lịch sử biến động (Audit Stock Movement Log)
├── 4.0 Thống kê Insights (Waste & Consumption Charts)
├── 5.0 Thùng rác (30-day Soft-Delete Trash)
└── 6.0 Cài đặt hệ thống (Theme, Preferences, Profile)
```

### Key screens (Web)

1. **`WEB-01` · Bảng điều khiển tồn kho Desktop (Desktop Inventory Dashboard):**
   * *Layout:* Persistent collapsible left sidebar (240px wide); top utility bar containing quick search (`Ctrl+K`), quick add button (`Ctrl+N`), theme switch, and user profile; main canvas featuring high-density table and card toggle view.
   * *Features:* Multi-column data table displaying Item Name, Location Badge, Quantity Remaining, Expiry Date with countdown tag, and instant inline action buttons (*Dùng*, *Bỏ*, *Sửa*).
2. **`WEB-02` · Giao diện Split-Screen Chi tiết & Lịch sử (Split-Pane Item Detail):**
   * *Layout:* Selecting any item in the table opens an expansive right-hand side drawer (480px wide) without shifting page scroll.
   * *Content:* Displays complete item lifecycle, storage compartment selector, batch adjustment controls, and a chronological audit log showing every single quantity modification with exact timestamps.
3. **`WEB-03` · Bảng đối soát kiểm kê hàng loạt (Batch Recount Modal):**
   * *Layout:* Centered high-efficiency modal table allowing users to audit an entire storage compartment (e.g., all 12 items in *Ngăn mát*) in one pass, typing observed counts down the list and saving atomically.

### Differences from the mobile app
While functional business rules and terminology remain 100% unified, interface presentation adapts to desktop interaction ergonomics:

| UX Dimension | Mobile App (iOS / Android) | Desktop Web App | Design Rationale |
|---|---|---|---|
| **Primary Navigation** | 5-tab fixed bottom bar (`Kho`, `Quét`, `+`, `Chú ý`, `Cài đặt`). | Persistent collapsible left sidebar with grouped hierarchical sections. | Thumbs control mobile bottom; mouse cursor navigates desktop left rail. |
| **Data Presentation** | Single-column vertically scrolling card feed; 1 item per row. | Wide responsive data grid or multi-column card matrix with sorting headers. | Capitalizes on 1440px wide desktop monitors to maximize information scanning. |
| **Detail & Action Surfaces** | Sliding bottom modal sheets with thumb grab handles. | Centered modal dialogs or slide-out right inspector panels. | Bottom sheets feel natural on touchscreens; right inspector panels preserve desktop context. |
| **Keyboard Ergonomics** | Touch gestures, virtual keyboard, tap targets $\ge 44	ext{px}$. | Comprehensive keyboard shortcuts: `Ctrl+K` (Search), `Ctrl+N` (Add), `Esc` (Close), `Arrow` keys. | Enables rapid, high-speed administrative power usage on desktop. |
| **Input Modality** | Native device camera viewfinder with live preview. | File drag-and-drop zone or connected webcam capture dialog. | Respects desktop hardware constraints where direct back cameras are absent. |
| **Bulk Operations** | Single-item swipe actions and individual modal prompts. | Multi-select checkboxes with sticky floating bulk action bar. | Desktop users expect batch management capabilities for multiple grocery items. |

---

*End of Report.*
