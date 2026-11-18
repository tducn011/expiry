# Expiry HCI Final Project Report

Nguyễn Tâm Đức — 24020005 · 13 November 2026 · DRAFT FOR REVIEW

Current native master: [Google Docs](https://docs.google.com/document/d/1PnXzvgJW66KB6qph_41MDvn_2Scb3UIwdoDVP3GD7X0/edit?usp=drivesdk). This local text and figure companion is regenerated from the content baseline; formatting and native TOC are maintained in the master.

# Part 1: Essay

Expiry is a personal food-inventory design for remembering available food, recognising recorded expiry information and keeping quantity changes understandable. This report presents the current design and its SE specification baseline. It separates design evidence from proposed evaluation: participant results, production operation and food-safety outcomes have not been established.

## I. Brief

The Brief defines the intended product. Interface examples use fictional demonstration records. A dated screenshot is evidence of a design state, not a statement about today's food stock.

### Background

Food can be bought with a clear intention and still be forgotten after it is put away. A changed schedule may delay the next meal, while using or discarding part of an item changes what remains. A list that is difficult to update can then drift away from the food that is actually available.

Expiry addresses these situations through a personal food inventory: recording food, showing items that need attention, and keeping quantity changes visible. The design question is: how might we help a person remember what they have and make the next update with less effort, while keeping uncertain dates and unconfirmed actions clear?

These problems are the product Brief's design premises, supported by the project's persona synthesis. Their prevalence and the effect of Expiry on household waste have not been established by participant research.

### A. Project

Expiry is a personal food inventory and expiry-management project with mobile and web interface designs. It brings food entry, inventory review, storage organisation, reminders, quantity updates, and Insights into one product scope. The central record is a food item with its name, quantity, and unit; production and expiry dates can be added when known.

The core promise is practical: know what food is recorded, see what needs attention, and update what remains. Expiry records the user's information and actions; a recorded date or reminder does not determine whether food is safe to eat.

### B. Brand

The brand name is Expiry. Its current Figma colour foundation identifies Forest (#015D67) as the primary brand colour, supported by Kelly (#00ACB1), Mint (#87E4DB), and Pistachio (#CAF0C1), with a light page colour (#FAFCFC). The brand figure in this report uses the existing Expiry design rather than the identity from the template.

The typography foundation specifies Be Vietnam Pro as a single family. It defines mobile body text at 14 px, web body text at 16 px, and inputs at 16 px, with a 4 px spacing grid. These are design specifications. Their application and readability must be assessed in the actual screen and output size.

Status colours are separate from brand identity and accompany words or other cues. Food names, dates, quantities, and action labels should carry the meaning of the task; a colour is not a food-safety judgement.

Selected current brand foundations

| Foundation | Current native declaration | Intended role |
| --- | --- | --- |
| Primary | Forest #015D67 | Core brand identity and primary emphasis. |
| Supporting colours | Kelly #00ACB1; Mint #87E4DB; Pistachio #CAF0C1 | Accent, highlight, and tint roles; the foundation warns against using Kelly or Mint as small text on light backgrounds. |
| Page | G2 #FAFCFC | Light page surface. |
| Typography | Be Vietnam Pro; Regular, Medium, SemiBold, Bold | Consistent type family with Vietnamese diacritics. |
| Scale | 14 px mobile body; 16 px web body and inputs; 4 px grid | Defined text and spacing roles, subject to screen-level verification. |

![Figure 1: palette](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/palette.png)

Figure 1. Current Figma colour foundation, node1057:3. Forest is the brand primary; date-status colours communicate recorded information, not food safety.

### C. Client

This report is prepared for the Human–Computer Interaction course project. The identified report author is Nguyễn Tâm Đức, student ID 24020005. No external commissioning client has been identified in the material supplied for this report.

The intended product users are individuals managing their own food records. Course assessment and product use are different contexts: the report documents design reasoning and evidence, while future user research must establish how well the design serves everyday food-management tasks.

### D. Project deliverables

The project deliverables connect the problem definition to the interface and its evaluation. Existing source artifacts are reused with their provenance; report preparation does not turn a draft specification or a proposed study into an accepted result.

Project deliverables and evidence boundaries

| Deliverable | Content | Evidence status |
| --- | --- | --- |
| Brand and product introduction | Expiry identity, personal-food scope, and six current feature groups. | Current Brief and UI Kit exist; report figures are derived from them. |
| User analysis | Three proto-personas, illustrative scenarios, and a sympathy-map synthesis. | Source-based design synthesis; no validated interview sample is claimed. |
| Requirements and use cases | SE registry of 29 use cases and semantic mapping to the 24 Design use cases. | Source specifications exist; namespace differences remain explicit. |
| Design diagrams | Use cases, goal flows, task analysis, sequence, state, journey, sitemap, and information architecture. | Design evidence is identified by source; diagram presence is distinct from execution. |
| Wireframes and prototypes | Low- and mid-fidelity App/Web designs, followed by high-fidelity mobile and web prototypes. | Native Figma artifacts exist; participant usability is not established. |
| Evaluation material | Functional test cases, recovery cases, a usability-study protocol, and heuristic review records. | Execution and inspection status must be stated per check. |
| Final report | An English report following the supplied template, with figures, captions, references, and source traceability. | The master report and its exports require content and layout verification. |

### E. Proposed Technology Stack

The repository contains a React and TypeScript web interface built with Vite, an Express API using the mysql2 client, and a Python scan service using FastAPI and pytesseract. The scan source also contains optional DateReg and vision-model adapters. This is the implementation context inspected for the report; an adapter's presence does not establish that it is configured, deployed, or accurate.

The interaction contract is more important to the HCI analysis than a specific recognition engine: scanning returns suggestions, the shared food form lets the user review and correct them, and the food is saved only after explicit confirmation. A complete manual route remains available when recognition is unsuitable.

Technology context declared in the inspected repository

| Layer | Inspected technology | Role and limit |
| --- | --- | --- |
| Interface | React ^19.0.0, TypeScript ^5.7.0, Vite ^8.0.5 | Declared package ranges for the browser interface; they are not a tested browser-support matrix. |
| API | Express ^4.21.2, mysql2 ^3.15.3 | Source dependencies for API and database access; runtime connectivity is a separate check. |
| Recognition service | FastAPI >=0.115.0 and pytesseract >=0.3.13 | Image-text extraction service dependencies; recognition accuracy has not been measured in this report. |
| Optional recognition paths | DateReg and vision-model adapters | Configuration-dependent source paths; availability and model performance are unverified here. |

### F. Supported platforms

The design deliverables cover a mobile interface and a web interface. They share the same personal-food rules and task goals. The Figma mobile prototype represents a phone-oriented interaction design; it does not establish an App Store or Google Play release.

The inspected implementation is a browser-based interface. Minimum operating-system versions, a supported-browser matrix, installability, push delivery, and offline behaviour have not been verified for this report. These capabilities must be checked in the relevant environment before they are listed as supported features.

Platform coverage and verification status

| Surface | Current evidence | Support statement |
| --- | --- | --- |
| Mobile design | High-fidelity App page 1496:177 in Figma. | A mobile prototype is available as a design artifact; native distribution is not established. |
| Web design | High-fidelity Web page 1515:9 in Figma. | A web prototype is available as a design artifact; real-device and browser acceptance are separate. |
| Browser implementation | React/Vite source in apps/web. | Repository source exists; this report does not supply a newly executed compatibility test. |
| Desktop-native or other platforms | No corresponding release evidence selected for this report. | No Windows, macOS, Linux, smartwatch, or television application support is claimed. |

### G. Brand background

Expiry's identity follows its product focus: making recorded food, dates, and remaining quantities easier to understand. The project is presented here as an HCI design study rather than a commercial brand with an invented founding story.

Three principles guide the report's design rationale: make available food visible, let users choose an action without unnecessary entry, and show uncertainty honestly. In practice, this means a readable inventory, one review form for manual and OCR entry, separate quantity actions, and an explicit unknown-expiry state.

### H. Target audience

Expiry targets individuals who buy, store, use, and update food for their own everyday decisions. The current Brief groups their needs by behaviour rather than by separate account roles. The same person may experience more than one of these situations.

Behavioural audience groups in the current Brief

| Group | Situation | Design need |
| --- | --- | --- |
| P01 — People who forget stored food | Food is bought for several days, put away, and sometimes forgotten. | Record food with manageable effort, find it again, and notice recorded expiry information. |
| P02 — People whose plans change | A changed schedule means food is not used as originally intended. | Recognise items that deserve attention and choose the next action or a later check. |
| P03 — People who want accurate records | Use, disposal, and missed updates make quantities difficult to track. | Record changes clearly and review quantities and history without unnecessary repeated entry. |

### I. Coverage

The current product scope is personal food management. It covers food entry and review, inventory and detail, category and storage location, recorded expiry attention and reminders, quantity changes, Insights, food history, and adding a new record from history.

A household may provide the context for an individual's food decisions, but the report does not add shared accounts, household permissions, restaurant stock control, or enterprise operations. The report is written in English; language choice does not establish geographical market coverage or a validated user population.

### J. Timing

The evidence baseline for this report was consolidated on 13 November 2026. Earlier artifacts are retained with their dates rather than presented as newer versions of the same source. The live product Brief determines current product scope; dated documents support the design history.

No confirmed submission deadline, committed development duration, or participant-study date has been supplied. The order of remaining report work is content reconciliation, diagram and figure preparation, document assembly, and content and layout verification. This order describes dependencies; it is not a claimed delivery commitment.

Dated evidence and scheduling limits

| Date or milestone | Meaning |
| --- | --- |
| 8–9 October 2026 | Dates attached to the local Canva persona transcriptions; the card content is historical proto-persona evidence. |
| 29 October 2026 | Dated SE Brief/package baseline; relevant where consistent with the current Brief. |
| 13 November 2026 | Report source consolidation and current-chat confirmations. |
| Final submission | Not established in the supplied evidence. |
| Participant evaluation | Proposed protocol; recruitment and study dates are not scheduled. |

### K. Description

A person starts an addition through Add. The design prioritises scanning a food label, while allowing manual entry. OCR places suggestions in the shared form; the person checks the name, dates, quantity, and unit, adds category and storage information when useful, and selects Save. Recognition alone never creates the food record.

After saving, the inventory helps the person find food and review what needs attention. Item detail provides actions such as editing, recording use or disposal, adjusting the remaining quantity, scheduling another check, or moving a record to Trash. These actions have different meanings and consequences.

Insights summarises recorded items and confirmed quantity events. Food History is inside Insights. Add again opens a new food form from a historical item; the person checks the new purchase and date information before saving a new record. A later check or a snoozed reminder does not extend the recorded expiry date.

The account functions support identity and access to personal data. The report separates entry into the form from permission to persist data; it does not infer offline guest storage or cross-account merging from the ability to open Add.

### L. Objective

The design aims to support four observable user outcomes: recording food accurately, finding what is available, choosing a relevant next action, and keeping quantities aligned with the user's updates. Evaluation should test these outcomes directly rather than count screens or assume that reminders reduce waste.

Design objectives and proposed evaluation evidence

| Objective | Observable evidence to collect |
| --- | --- |
| Record and retrieve food | Completion of manual and OCR-assisted entry, correctness after review, and successful retrieval of the saved record. |
| Understand recorded attention | The participant identifies an item that needs attention and explains the difference between known, overdue, and unknown expiry information. |
| Choose and understand an action | The participant distinguishes using, discarding, adjusting quantity, moving to Trash, and scheduling another check. |
| Maintain quantity accuracy | The recorded remainder matches the task's physical-food scenario; invalid subtraction is recognised and corrected. |
| Recover without losing intent | The participant reaches a manual route after scanning difficulty, corrects invalid input, or exits and returns with the relevant context understood. |
| Interpret Insights honestly | The participant understands that summaries come from recorded actions and that Add again creates a new record with date review. |

### M. Draft MVP

The draft minimum viable product preserves the current Brief's six feature groups. The priority table is a report proposal for sequencing within that scope; it does not remove OCR from the current design or classify an existing specification as implemented software.

Proposed MVP priorities using MoSCoW

| Priority | Features or scope | Reason |
| --- | --- | --- |
| Must | F01 manual entry and F02 OCR suggestions in a shared review form with explicit Save. | Both entry routes support the same core record and keep a usable path when recognition fails. |
| Must | F03 inventory, search/filter, detail, edit, notes, Trash/restore/permanent deletion, and item-level check scheduling. | The person must find, maintain, and recover records while understanding consequential actions. |
| Must | F04 category and optional storage location, including create, rename, and delete without deleting food. | Food organisation must remain understandable and preserve records when a location changes. |
| Must | F05 expiry states, reminders, and check scheduling; F06 used/discarded/adjusted quantity, Insights, History, and Add again. | These complete the attention and maintenance loops defined by the current Brief. |
| Must | Account/session handling appropriate to personal data, plus validation and recovery for core actions. | Access and confirmation must be clear without treating authentication as a separate main feature. |
| Should | Contextual explanations for uncertain dates, quantity intent, reminder effects, and recovery. | These explanations support comprehension; their wording should be refined through evaluation. |
| Could | Optional social sign-in if configured and verified. | It is an account-support option, not a replacement for the six core features. |
| Won't in the current scope | Shared-household permissions, restaurant operations, automatic food-safety decisions, or automatic savings claims. | These exceed the personal-food Brief or require evidence the project does not have. |

### N. Scope: what we build and what we do not

The report concentrates on the personal-food task cycle, including the errors and reversals needed to keep it understandable. Date attention, remaining quantity, and deletion are separate dimensions: an overdue item is not automatically deleted, zero quantity is not a Trash action, and a reminder change is not a date change.

Current scope boundaries

| Included in the current design scope | Outside the current reported scope |
| --- | --- |
| Manual entry and OCR-assisted entry with user review and Save. | Automatic record creation from unreviewed recognition, automatic expiry inference from production date, and an assumed universal OCR accuracy. |
| Personal inventory, detail, notes, search, filters, category, and storage location. | Shared workspaces, household role systems, restaurant stock control, and enterprise administration. |
| Recorded expiry states, in-product reminder interactions, and user-selected later checks. | Food-safety certification, automatic shelf-life extension, and verified push delivery on every device. |
| Separate used, discarded, and adjustment actions; history and unit-aware summaries. | Automatic conversion between units, inferred physical consumption, and estimated financial savings presented as facts. |
| Trash, restore, permanent-deletion confirmation, and Add again as a new record. | Automatic merging of purchases with different expiry dates or automatic reuse of an old expiry date. |
| Mobile and web design artifacts, documented source context, and proposed evaluation. | Native app-store releases, universal browser/OS compatibility, or production acceptance without the corresponding checks. |

### O. Overall estimate

A reliable total effort estimate cannot be reconstructed from the supplied artifacts: there is no approved work breakdown, time log, or agreed submission date. The report therefore separates the existing project artifacts from the remaining preparation and evaluation work. No historical hours are assigned to the author or other contributors.

The following work packages define what a future estimate must cover. Their order follows content dependencies. Hours should be added only after the figure set, document-assembly method, review scope, and participant-study arrangements are fixed.

Effort-estimation basis; total hours not established

| Work package | Estimation basis | Current estimate status |
| --- | --- | --- |
| Requirements reconciliation | Six current features, 29 SE use cases, Design crosswalk, and identified source conflicts. | No approved hours supplied. |
| Report narrative | Template-aligned English prose, tables, and references. | No approved hours supplied. |
| Design figures and diagrams | Selected native App/Web figures, legible diagrams, captions, and source identifiers. | Depends on final figure selection. |
| Document assembly and export | Native master, headings, contents, tables, figures, links, and PDF verification. | Depends on authoring and export method. |
| Evaluation | Heuristic inspection and, separately, participant recruitment, sessions, and analysis. | Participant work is proposed and unscheduled. |
| Total | Sum of scoped work-package hours after assumptions are agreed. | Not established; no numerical total is claimed. |

### P. Human resources

Nguyễn Tâm Đức — 24020005 is the named report author. This identifies responsibility for the submitted report; it does not establish a historical roster or claim sole authorship of every source artifact. The responsibilities below describe the work required to complete and evaluate the report.

Report responsibilities and assignment status

| Responsibility | Required work | Assignment or evidence status |
| --- | --- | --- |
| Report author | Maintain the report scope, attribution, source decisions, and final submission content. | Nguyễn Tâm Đức — 24020005, confirmed for the report cover. |
| Requirements and interaction analysis | Reconcile feature, rule, use-case, and recovery descriptions. | A required responsibility; no historical individual contribution is inferred. |
| Design documentation | Select and caption native figures; maintain task-to-design traceability. | A required responsibility; source ownership remains attributed where known. |
| Document quality review | Check English prose, references, tables, figures, and exported layout. | A required review responsibility; final acceptance belongs to the user or assessor. |
| Usability-study facilitator | Recruit with consent, run neutral task sessions, and preserve observations. | Proposed role; no facilitator assignment or completed session is claimed. |
| Independent evaluator | Review tasks and severity judgements to reduce self-evaluation bias. | Recommended review role; no evaluator is represented as already engaged. |

### Q. Budget

No approved budget, actual expenditure ledger, participant compensation, or production operating cost has been supplied for Expiry. The 100,000,000 VND shown in the example report is a template value and is excluded from this report's project facts.

A budget should separate report preparation, optional participant evaluation, and any later software operation. The current evidence does not justify a numerical total. Existing access to a tool also does not prove that its cost is zero or that a future deployment has been funded.

Budget basis in VND; amounts not established

| Cost category | Basis required for a cost | Current financial status |
| --- | --- | --- |
| Report and design preparation | Agreed labour assumption and any attributable authoring-tool fees. | No approved amount supplied. |
| Participant evaluation | Confirmed recruitment, session count, compensation, travel, or venue costs. | Study is proposed; no spend or commitment claimed. |
| Recognition or external services | Verified provider, usage estimate, and applicable pricing for the selected environment. | No operating-cost estimate established. |
| Hosting and data storage | Chosen deployment, capacity, period, and provider quotation. | No deployment budget established by this report. |
| Contingency | A stated assumption applied to approved costs. | Not calculated without a cost baseline. |
| Total | Sum of documented cost lines and explicit assumptions. | Not established; this is not a zero-cost claim. |

## II. Analyze

The analysis connects three behavioural situations to user needs, six feature groups and observable task outcomes. Personas and scenarios are design models grounded in the supplied artifacts, not results of interviews or a completed usability study.

### A. Scenarios

The following scenarios are illustrative design stories derived from the three behavioural groups. They make the intended task and its recovery visible; they are not reconstructions of observed participant sessions. Names come from the historical persona cards, while the food, time, and setting are examples chosen to explain the current design.

Illustrative scenarios and intended interaction outcomes

| Scenario | Context and trigger | Action and relevant screens | Recovery and intended outcome |
| --- | --- | --- | --- |
| SC-HCI-01 — Remember a new purchase (P01 / Phạm Hoàng An) | After shopping at home, An puts a carton of milk in the fridge. He wants to record it before he forgets it, then find it before planning his next meal. The milk and setting are illustrative. | Add → Scanner → shared food form. He reviews the suggested name and date, enters quantity and unit, selects a category and fridge location if useful, and selects Save. Later he uses Inventory or Search and opens Detail. Features: F01–F04, F05. | If camera access is unavailable or scanning returns no useful text, he can use the same form manually. An unknown date remains unknown. Before Save, cancellation does not create the food record. The task succeeds only when the confirmed record can be found and its date state is understood. |
| SC-HCI-02 — Reconsider food after a changed plan (P02 / Tôn Nữ Như Huyền) | In the evening, Huyền's dinner plan changes and ingredients remain unused. She checks what is recorded before deciding what to inspect or use next. The incident is illustrative. | Inventory attention/filter → item Detail. She checks the recorded expiry information and remaining quantity, then chooses an appropriate action or schedules a later check. She can review reminders and the overview in Insights. Features: F03, F05, F06. | A later check changes the reminder, not the expiry date. If the date is unknown, the interface preserves that uncertainty; it does not assert safety. If she only reads or snoozes a reminder, quantity remains unchanged. Success means explaining the recorded state and selecting an intentional next step. |
| SC-HCI-03 — Keep the remaining quantity accurate (P03 / Phạm Ngọc Thiên An) | After cooking, Thiên An has used part of an item and later notices that the actual remainder differs from the record. She wants a useful record without repeating the original entry. The quantity examples are illustrative. | Item Detail → Used action → review remainder → confirm. If food is discarded, she selects Discarded instead. If she corrects a mismatch, she uses Adjust. She then checks Insights → History; a later purchase can use Add again to open a new form. Features: F03, F06. | An amount greater than the recorded remainder is rejected without applying an invalid change. The unit stays explicit. A zero remainder is not automatically moved to Trash. Add again creates a new record after date review. Success means choosing the correct intent and understanding the resulting remainder and history. |

### B. Persona

The project uses three proto-personas: provisional user archetypes assembled from the existing persona cards and design synthesis. The current Brief's behavioural groups are the reporting baseline. Historical card profiles add context, but no interview recruitment, raw transcript, or independent validation was supplied. Card quotations are therefore not presented as verified participant quotations.

Source-based proto-personas

| Proto-persona | Source-card context | Goals and difficulty | Design implication to evaluate |
| --- | --- | --- | --- |
| P01 — Phạm Hoàng An; people who forget stored food | The dated card describes a 20-year-old student in Ho Chi Minh City who uses a phone and laptop, buys for several days, and sometimes delays food preparation. | Remember available food and see what should receive attention. Repetitive entry and updates can make tracking feel like another chore. | Keep capture and retrieval clear; support a visible manual fallback and readable date states. Measure entry/correction effort and later retrieval. |
| P02 — Tôn Nữ Như Huyền; people whose plans change | The dated card describes a 49-year-old married household shopper in Da Nang who uses Android and a laptop and adapts meals to her schedule. | Choose what to do with food when the original meal plan changes. An expiry alert alone may not resolve the next decision. | Show the relevant item state and actions together; distinguish a later check from a date change. Observe the person's explanation and decision. |
| P03 — Phạm Ngọc Thiên An; people who want accurate records | The dated card describes a 20-year-old student in Da Nang with a systematic, accuracy-focused approach and phone/laptop use. | Keep the record consistent with actual stock without repeated administrative effort. Missed updates can undermine trust in the quantity shown. | Separate Used, Discarded, and Adjust; show the remainder and history. Observe correct intent, correction effort, and record accuracy. |

![Figure 2: research](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/research.png)

Figure 2. Current native research synthesis, node1155:2. The board explicitly describes behavioural groups and the absence of supplied interview or observation data.

Historical persona-card source: https://www.canva.com/design/DAHXSrL9WU4 (local transcriptions dated 8–9 October 2026). Names, ages and cities above describe proto-persona cards. They are illustrative design inputs, not participants or verified population characteristics.

### C. Sympathy map

This section retains the template's label, Sympathy map, and uses an empathy-map structure. It summarises the source-card descriptions and the design team's interpretation of likely concerns. It is a hypothesis map, not an observational record: the Says/Thinks entries below are paraphrases rather than quotations, and emotional interpretations require participant confirmation.

Sympathy-map synthesis — hypotheses to validate

| Group | Says / thinks — paraphrased card synthesis | Does — card description | Feels / pain — interpretation | Need and design response |
| --- | --- | --- | --- | --- |
| P01 | I have already bought the food, but I may forget it after putting it away. | Plans purchases, stores food, delays preparation, and occasionally loses track of it. | The source suggests frustration with forgotten food and repeated manual administration; the strength and frequency of these feelings are unmeasured. | Make recorded food easy to retrieve; use OCR suggestions with review, manual entry, storage context, and clear attention states. |
| P02 | My plans change; I need to see what is still available before deciding what to do. | Shops for meals, stores ingredients, changes plans, and checks available food before cooking. | The source suggests difficulty turning date information into a convenient next decision; no emotional response has been observed in a study. | Keep item detail, current quantity, reminder actions, and a later-check option understandable without promising a safety judgement. |
| P03 | The record is useful only if I can keep it accurate without too much repeated work. | Organises food, reviews stock, updates after use, and checks before buying. | The source suggests frustration when maintenance becomes tedious and records become stale; this is an interpretation to test. | Provide clear Used, Discarded, and Adjust actions, explicit units and remainder, and a history that helps explain recorded changes. |

![Figure 3: derived-empathy](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/08-empathy-map.png)

Figure 3. Report synthesis of the three behavioural situations. The statements are hypotheses for research, not participant quotations.

### D. Feature list

The feature list follows the six groups in the current Brief. Detailed requirements and use cases provide coverage within those groups. Authentication supports personal access and remains separate from the main feature numbering. Functional scope below describes intended behaviour; quality targets and runtime verification are recorded separately.

Current feature groups and interaction constraints

| Feature | User-facing behaviour | Rules that preserve meaning |
| --- | --- | --- |
| F01 — Manual food entry | Enter a food name, quantity, unit, and dates when known in the shared form. | The user reviews and selects Save. Unknown expiry remains explicit; production date does not generate an expiry date. |
| F02 — OCR food-label capture | Scan a label to obtain suggestions, then check and edit them in the same form. | OCR never saves automatically. Manual entry remains available when recognition is empty or unavailable; a failed scan is distinct from a failed Save. |
| F03 — Food management | Browse, search, filter, inspect, edit, add notes, move to Trash, restore, permanently delete with confirmation, and schedule an item check. | Date attention, quantity, and deletion remain separate. Scheduling a check does not change expiry. Zero quantity does not mean deletion. |
| F04 — Category and storage location | Choose a category; choose, create, rename, or delete a personal storage location. | Category and storage are independent. Location is optional. Deleting a populated location requires a choice to move its food or leave locations empty, preserving food records. |
| F05 — Expiry tracking and reminders | Review soon-expiring, overdue, and unknown-expiry records; view, read, snooze, and configure reminders and later checks. | Reminder actions do not change expiry or stock quantity. Notification permission and delivery require environment-specific verification. |
| F06 — Quantity and Insights | Record Used, Discarded, or Adjust; review overview and Food History inside Insights; Add again through a new form. | Do not subtract more than available, create negative quantity, or silently convert units. Insights uses recorded actions and separates incompatible units. Add again creates a new record and does not silently reuse the old expiry date. |

Supporting requirements and quality evaluation

| Area | Report treatment | Evidence required |
| --- | --- | --- |
| Account and access | Email sign-up/sign-in and optional linked sign-in are supporting functions, with personal data access governed by the session. | Executed authentication and persistence checks for any runtime claim. |
| Understandability | Use familiar food terms, explicit quantity intent, visible units, and honest unknown states. | Participant explanations and correct task choices; no comprehension result is assumed. |
| Efficiency | Reduce unnecessary repeated entry while preserving review and confirmation. | Task time, action count, correction effort, and assistance, tied to a stated task and device. |
| Recovery | Support manual fallback, input correction, clear cancellation, and understandable Save outcomes. | Specific recovery checks with expected result, actual result, environment, and status. |
| Compatibility and accessibility | Treat browser, device, keyboard, and assistive-technology behaviour as explicit evaluation scopes. | The relevant executed checks; design existence alone is insufficient. |
| Recognition quality | Treat OCR output as a suggestion requiring user review. | A defined image set, field-level accuracy and correction cost before numerical quality claims. |

SE coverage is retained without presenting every historical proposal as a current native requirement. The full trace registry has 95 requirements:6 Business,15 User,58 Functional,11 Non-functional and5 Transition proposals. The captured current requirements tab contains the first 90; the five transition proposals are absent there. The SR28 variant contains 85, omitting SE-UR-13/14 and SE-FR-49/50/51. History and Add again remain in the current Brief and are retained in this report.

The following statements are report specifications, not executed acceptance results. IDs and source proposal status are preserved. Detailed provenance, original text and verification criteria remain in the SE baseline and linked source documents.

Business requirements

| ID | Requirement |
| --- | --- |
| SE-BREQ-01 | Provide one place where an individual can keep track of the food they currently have. |
| SE-BREQ-02 | Help people distinguish food nearing expiry, past its recorded expiry date or missing an expiry date, and choose their next action. |
| SE-BREQ-03 | Let people track the amount remaining and distinguish food used, food discarded and corrections to the recorded amount. |
| SE-BREQ-04 | Make user-confirmed information, missing dates and recorded changes clear, so decisions do not rely on guessed dates or unreviewed OCR output. |
| SE-BREQ-05 | Summarise available food, expiry information and recorded used or discarded quantities without requiring people to open every item. |
| SE-BREQ-06 | Keep the first version focused on the six feature groups for individual food management; restaurant operations, staff roles, batch stock movements and multiple warehouses remain future directions. |

User requirements

| ID | Requirement |
| --- | --- |
| SE-UR-01 | People need to register or sign in to access and manage their own food records. |
| SE-UR-02 | People need to enter a food name, quantity and unit in the shared form, add dates and storage information when known, and review the information before saving. |
| SE-UR-03 | People need OCR to suggest information in the shared form, let them correct it and allow manual entry when the label cannot be read. |
| SE-UR-04 | People need to browse the food list, open an item, search by name and filter by category, storage location or expiry status. |
| SE-UR-05 | People need to edit food information and notes when the information changes. |
| SE-UR-06 | People need to select categories and create, rename or delete storage locations while preserving the food records assigned to them. |
| SE-UR-07 | People need to recognise items nearing expiry, past the recorded expiry date or missing an expiry date, understand the reason and choose what to do. |
| SE-UR-08 | People need to choose reminder settings, read or snooze reminders and view in-app reminders when push notifications are unavailable or denied. |
| SE-UR-09 | People need to enter and review the amount used or discarded, then confirm the corresponding deduction from the amount remaining. |
| SE-UR-10 | People need to enter the entire amount actually remaining when the recorded amount is wrong, keeping this correction distinct from using or discarding food. |
| SE-UR-11 | People need to move records to Trash, inspect them, restore them or confirm permanent deletion without treating record deletion as food discarded. |
| SE-UR-12 | People need Insights to summarise available food, items needing attention and recorded used or discarded quantities with their units stated separately. |
| SE-UR-13 | People need History within Insights to show item creation and later changes, including Used, Discarded and Adjusted events when the remaining amount is zero. |
| SE-UR-14 | People need to reuse an old item's information as a draft, review quantity, unit and dates, and explicitly save a new record while preserving the old history. |
| SE-UR-15 | People need clear feedback for missing information, empty lists, OCR failures and saving problems, with a practical way to continue the task. |

Functional requirements

| ID | Requirement |
| --- | --- |
| SE-FR-01 | The system shall let a person create an account and accurately report the registration result. |
| SE-FR-02 | After successful registration, the system shall create the session described by the detailed specification and allow the person to view or skip onboarding before entering the food list. |
| SE-FR-03 | The system shall authenticate sign-in details and open the correct account's food list; invalid credentials shall not create a session. |
| SE-FR-04 | The system shall read and write only the current account's data and require sign-in before accessing private data when the session is absent or expired. |
| SE-FR-05 | The system shall let the person enter a food name, quantity and unit in the same reviewable form used after OCR, including a direct manual-entry route. |
| SE-FR-06 | The system shall provide separate manufacture-date and expiry-date fields, allow either or both to be omitted, and never infer the expiry date from the manufacture date. |
| SE-FR-07 | The system shall let the person add notes, a category and a storage location when adding food. |
| SE-FR-08 | The system shall validate the information, let the person review and correct it, and create one new record only after a valid Save succeeds. |
| SE-FR-09 | The system shall store the same food with different expiry dates as separate records rather than automatically combining their quantities. |
| SE-FR-10 | The system shall support capturing or selecting a label image for OCR; camera permission shall be required only by an acquisition route that uses the camera and requires permission. |
| SE-FR-11 | The system shall place readable name and date information from the image into a draft and leave uncertain or unreadable fields for the person to complete. |
| SE-FR-12 | The system shall let the person inspect, correct and confirm OCR suggestions in the shared form before Save; OCR shall not automatically create a record or overwrite confirmed data. |
| SE-FR-13 | When an image cannot be read or OCR fails, the system shall explain the state and allow another image, a suitable retry or manual entry in the shared form. |
| SE-FR-14 | The system shall display the account's food records with name, amount, unit and recorded expiry status. |
| SE-FR-15 | The system shall show the selected item's current information, including dates, quantity, notes, category and storage location where available. |
| SE-FR-16 | The system shall search within the account's food records by name and show when no records match. |
| SE-FR-17 | The system shall allow filtering by category, storage location and expiry status and allow the filters to be cleared. |
| SE-FR-18 | The system shall let the person edit an item's information, validate it and save confirmed changes; cancelling shall preserve the saved information. |
| SE-FR-19 | The system shall let the person add or edit an item's notes without creating a Used or Discarded event. |
| SE-FR-20 | The system shall let the person select or change an existing category when adding, editing or classifying food. |
| SE-FR-21 | The system shall allow valid food information to be saved without a category and show the item as Uncategorized. |
| SE-FR-22 | The system shall allow an existing storage location to be selected or left blank independently of category selection. |
| SE-FR-23 | The system shall let the person name a new storage location and select it in the add or edit form; cancelling shall not create the location. |
| SE-FR-24 | The system shall let the person rename a location they created while preserving the food records' links to that location. |
| SE-FR-25 | Before deleting a location that contains food, the system shall ask the person to confirm moving those items to another location or leaving their location blank. |
| SE-FR-26 | Deleting a storage location shall preserve every food record rather than deleting the food assigned to it. |
| SE-FR-27 | After an ordinary deletion is confirmed, the system shall move the record to Trash and record the deletion time without creating a Discarded event. |
| SE-FR-28 | The system shall display the account's trashed records or an empty state separately from the active food list. |
| SE-FR-29 | The system shall allow confirmation of restoring an existing trashed record to the food list; restoration shall retain the original record rather than create a copy. |
| SE-FR-30 | The system shall allow a trashed record to be permanently deleted only after confirmation; cancelling shall preserve it, and deletion shall not count as food discarded. |
| SE-FR-31 | The documented policy retains a trashed record for 30 days from its deletion time, rather than from the food's expiry date; automatic cleanup remains unverified. |
| SE-FR-32 | The system shall identify items nearing or past expiry from the stored expiry date and selected reminder interval without changing the stored date. |
| SE-FR-33 | The system shall keep items with no expiry date visible as Expiry unknown and exclude them from the nearing-expiry and expired groups. |
| SE-FR-34 | Within items needing attention, the system shall place overdue items before items nearing expiry and explain the ordering using recorded dates. |
| SE-FR-35 | The system shall let the person choose and confirm a time to check an item again; this changes the check schedule and leaves the food's expiry date unchanged. |
| SE-FR-36 | The system shall let the person choose and save the interval before expiry used for expiry display and reminders. |
| SE-FR-37 | The system shall display the account's in-app reminders even if push permission is denied or push is unsupported. |
| SE-FR-38 | The system shall let the person mark one reminder as read and change only that reminder's state. |
| SE-FR-39 | The system shall let the person select and save a later reminder time, changing only the reminder schedule or state and leaving the food's expiry date and quantity unchanged. |
| SE-FR-40 | The system shall request push permission when the person enables push; when permission is denied or push is unsupported, it shall show the state and a recovery action without repeatedly requesting permission. |
| SE-FR-41 | When the person selects a quantity action from a reminder, the system shall open the correct form with current data; merely opening, reading or cancelling shall not change the amount. |
| SE-FR-42 | The system shall let the person enter an amount used, preview the result and confirm a deduction no greater than the amount currently available. |
| SE-FR-43 | The system shall let the person enter the amount actually discarded, preview it and confirm the corresponding deduction without moving the record to Trash. |
| SE-FR-44 | The system shall let the person enter the entire amount actually remaining, preview and confirm the replacement, and record the event as Adjusted. |
| SE-FR-45 | The system shall reject negative or invalid amounts, deductions above the remaining amount and changes based on stale data, and allow correction or reload before confirmation. |
| SE-FR-46 | The system shall store the amount in the selected unit and allow decimals where suitable without silently converting units or adding quantities expressed in different units. |
| SE-FR-47 | Each successful quantity change shall store the new amount and one corresponding Used, Discarded or Adjusted event; cancelled or invalid actions shall not create an event. |
| SE-FR-48 | When the remaining amount reaches zero, the system shall preserve the record and history rather than automatically moving the record to Trash or equating zero with a Discarded event. |
| SE-FR-49 | The system shall show History within Insights with item creation and subsequent changes, distinguish Used, Discarded and Adjusted events, and retain access when the amount reaches zero. |
| SE-FR-50 | The system shall let the person select a past item in History within Insights to prepare a draft, review quantity, unit and dates, and avoid automatically reusing the old expiry date. |
| SE-FR-51 | The system shall create a new record from an Add again draft only after a valid Save; cancelling shall create nothing and preserve the old item's history. |
| SE-FR-52 | The system shall summarise available, nearing-expiry and overdue food records from the account's saved information without assigning an expiry date to items whose expiry is unknown. |
| SE-FR-53 | The system shall aggregate Used and Discarded amounts only from recorded events and separately for each unit; corrections and record deletions shall not be counted as Used or Discarded. |
| SE-FR-54 | Insights shall not present unsupported estimates of money saved or conclusions about whether food is safe to eat. |
| SE-FR-55 | When no food has been saved, the system shall explain the empty state and guide the person to Add; when search or filtering returns no matches, it shall allow the conditions to be changed. |
| SE-FR-56 | When saving fails, the system shall accurately report the result and offer a suitable correction or retry; when the outcome is unknown, it shall guide the person to check the result before resubmitting. |
| SE-FR-57 | The system shall preserve saved data when the person only views or cancels a task and write changes only after the task's valid confirmation. |
| SE-FR-58 | The system shall describe date information as recorded, ask the person to check unclear or conflicting dates, and leave the choice to use or discard food to the person. |

Non-functional requirements

| ID | Requirement |
| --- | --- |
| SE-NFR-01 | All access paths for private data shall preserve account isolation and prevent disclosure or changes when the session is absent or expired. |
| SE-NFR-02 | Manufacture dates, expiry dates and unknown-date states shall be consistent across the form, list, warnings, reminders and Insights; an inferred date shall not be presented as confirmed. |
| SE-NFR-03 | Remaining quantities shall not be negative, deductions shall not exceed the amount available, and units shall not be silently converted or combined. |
| SE-NFR-04 | A successful quantity update shall remain consistent across the item, History and Insights; cancellation or failure shall not create a false successful event. |
| SE-NFR-05 | When a save response is unclear, the task shall help the person check the outcome before resubmitting so that an unintended duplicate item or repeated deduction is avoided. |
| SE-NFR-06 | Invalid input, OCR failure, saving failure and stale data shall provide a clear state and an appropriate correction, reload, retry or manual-entry action. |
| SE-NFR-07 | Core food tasks and in-app reminders shall remain usable when push permission is denied or push is unsupported, without repeated permission prompts. |
| SE-NFR-08 | OCR shall remain a draft, task changes shall require the appropriate valid confirmation, and viewing or cancellation shall preserve saved data. |
| SE-NFR-09 | Missing dates, empty lists, errors, read or snoozed reminders and save outcomes shall be distinguishable and offer a clear next step; successful push submission shall not be described as receipt or reading. |
| SE-NFR-10 | Renaming or deleting storage shall preserve food, restoration shall retain the original record, and zero quantity shall preserve history while the different record and quantity lifecycles remain distinct. |
| SE-NFR-11 | Insights shall be traceable to saved records and recorded events by unit; it shall not interpret corrections or record deletion as discarded food or claim unmeasured savings or food safety. |

Historical transition proposals

| ID | Requirement |
| --- | --- |
| SE-TR-01 | Before a trial, the team should agree the available categories and suitable initial data; a new user should still be able to add the first item without choosing a category or location. [Historical proposal; not in captured native tab.] |
| SE-TR-02 | Before collecting evaluation data, the team should agree participant selection, tasks, data, context, measures, timing and consent or privacy arrangements, using P01, P02 and P03 tasks from the Brief. [Historical proposal; not in captured native tab.] |
| SE-TR-03 | Before using real data, the team should confirm a representative environment, configuration, data protection, backup and recovery approach; no cutover or application-data migration has been authorised by this report work. [Historical proposal; not in captured native tab.] |
| SE-TR-04 | Before a trial, the team should prepare a brief guide covering add, find, attention and reminders, Used or Discarded or Adjusted actions, and Insights, including OCR review, unknown dates and the limits of date information. [Historical proposal; not in captured native tab.] |
| SE-TR-05 | When consolidating older documents, the team should preserve historical snapshots, map namespaces by meaning and update references with clear current or archive labels; this is document transition work rather than application-data migration. [Historical proposal; not in captured native tab.] |

## III. Produce

The models below describe goals, decisions and information consequences. SE29 identifiers provide the report's complete use-case registry. Design UC-V4 and the renumbered SR28 variant remain distinct namespaces; same-numbered records are not automatically equivalent.

### A. Flow chart

One individual user is the primary actor. P01–P03 describe behaviours rather than account roles. Camera/OCR, persistence and validation are supporting mechanisms. The native UML overview is a source artifact; any historical approval text on it is limited to that diagram and is not lecturer approval, participant evidence or implementation acceptance.

Mandatory shared work and optional behaviour are kept distinct. Registration and sign-in share validation; optional social authentication is modelled as an extension in the native UML source. OCR and manual entry converge on a reviewed form and explicit Save. Used, Discarded and Adjust share quantity validation; reading Insights does not include a quantity mutation.

SE29 use-case registry and Design crosswalk

| SE ID | User goal | Design mapping |
| --- | --- | --- |
| UC-01 | Register an account | UC-V4-01 |
| UC-02 | Sign in | UC-V4-02 |
| UC-03 | Add food manually | UC-V4-03 |
| UC-04 | Add food with OCR assistance | UC-V4-04 |
| UC-05 | Create a storage location | UC-V4-05 |
| UC-06 | View the food inventory | UC-V4-06 |
| UC-07 | View food details | UC-V4-07 |
| UC-08 | Search food by name | UC-V4-08 |
| UC-09 | Edit food information | UC-V4-09 |
| UC-10 | Move a food record to Trash | UC-V4-10 |
| UC-11 | Record food as Used | UC-V4-11 |
| UC-12 | Record food as Discarded | UC-V4-12 |
| UC-13 | Adjust the actual remaining quantity | UC-V4-13 |
| UC-14 | View food needing attention | UC-V4-14 |
| UC-15 | Schedule a food recheck | UC-V4-15 |
| UC-16 | View notifications | UC-V4-16 |
| UC-17 | Mark a notification as read | UC-V4-17 |
| UC-18 | Snooze a notification | UC-V4-18 |
| UC-19 | Configure reminders | UC-V4-19 |
| UC-20 | View Trash | UC-V4-20 |
| UC-21 | Restore a trashed record | UC-V4-21 |
| UC-22 | Permanently delete a trashed record | UC-V4-22 |
| UC-23 | View Insights | No distinct ID in selected crosswalk |
| UC-24 | Filter food records | No distinct ID in selected crosswalk |
| UC-25 | Rename a storage location | No distinct ID in selected crosswalk |
| UC-26 | Delete a storage location | No distinct ID in selected crosswalk |
| UC-27 | Categorize a food record | No distinct ID in selected crosswalk |
| UC-28 | View food history | UC-V4-23 |
| UC-29 | Add food again from history | UC-V4-24 |

SE29 UC-23 is Insights and UC-24 is filtering. Design UC-V4-23/24 refer to History/Add again and map to SE29 UC-28/29. SR28 instead separates camera-permitted and camera-denied OCR, shifts manual entry to UC-05 and omits the separate History/Add again goals. Its numeric references are not used as SE29 references.

Business rules retained with source boundaries

| Rule ID | Rule and status |
| --- | --- |
| BR-V3-01 | Only the current account's food data may be read or changed. An absent or expired session or missing permission shall stop private access and writes. |
| BR-V3-02 | Manufacture and expiry dates are separate and may be missing. Do not infer expiry from manufacture date. Ask the person to correct unclear dates; missing expiry is shown as Expiry unknown and is excluded from nearing-expiry or expired groups. |
| BR-V3-03 | OCR is the preferred entry route and manual entry remains available. Both use the shared form and require review and valid Save. OCR fills suggestions only; failure allows another image or manual entry. An uncertain save must be checked before resubmission. |
| BR-V3-04 | A person may select an existing location, create one or leave it blank. Cancelling location creation shall create nothing and preserve the previous unconfirmed selection. Storage and category are separate attributes. |
| BR-V3-05 | Use the saved expiry date and reminder interval to list overdue items before items nearing expiry. Keep missing expiry visible as unknown. Displaying attention or reminders shall not delete the item, change expiry or establish food safety. |
| BR-V3-06 | Used and Discarded subtract a confirmed amount no greater than the remaining quantity; Adjusted replaces the recorded total with the actual total. Preview and valid confirmation are required. Invalid, stale or cancelled actions shall not write; a successful change records the new amount and one correctly typed event. Discarded differs from deleting a record. |
| BR-V3-07 | Zero quantity shall not automatically move the record to Trash, and history remains available. Add again from History within Insights prepares a draft that requires quantity, unit and date review; it shall not automatically reuse the old expiry date. Cancelling creates nothing; valid Save creates a new record and preserves the old history. |
| BR-V3-08 | Ordinary deletion moves a record to Trash. Restoration or permanent deletion requires confirmation. The documented retention period is 30 days from deletion rather than expiry; automatic cleanup is unverified. Deletion is not a Discarded event, and restoration retains the original record subject to data rules. |
| BR-V3-09 | Viewing, marking as read or snoozing shall change only the reminder state or schedule, leaving expiry and quantity unchanged. Successful push submission is not evidence of delivery or reading. |
| BR-V3-10 | A quantity action selected from a reminder shall open the appropriate Used, Discarded or Adjusted form using current data. Opening or cancelling changes nothing; stale information requires checking again. Only valid confirmation updates quantity and records the event. |
| BR-V3-11 | Ask for push permission when the person enables push. If permission is denied or push is unsupported, keep in-app reminders and core food tasks available, show the state and recovery action, and avoid repeatedly asking. |
| BR-V3-12 | Describe dates from confirmed information, request checking or correction of unclear dates and never invent a date or conclude that an item is safe or unsafe to eat. The decision to use or discard remains with the person. |
| BR-V3-13 | The person may choose or change an existing category for organisation and filtering; omission is shown as Uncategorized. Category differs from storage and does not infer expiry or imply automatic AI classification. The concrete category list is pending; the historical rule remains proposed although the current Brief specifies the category behaviour. [Source proposal status retained.] |
| SE-BR-01 | A food record has a name, quantity and unit, with manufacture and expiry dates added when known. The same food with a different expiry date shall create a separate record rather than being automatically merged. |
| SE-BR-02 | Remaining quantity shall not be negative and a deduction shall not exceed it. Decimals are allowed where appropriate to the unit. Do not silently convert units or add unlike units. Used, Discarded, Adjusted, zero quantity and record deletion have distinct meanings. |
| SE-BR-03 | Category and storage are separate. Deleting an occupied location requires confirmation of moving its food to another location or leaving the location blank while preserving every item. Renaming a location preserves its item links. |
| SE-BR-04 | Insights counts current, nearing-expiry and overdue records and derives Used or Discarded amounts only from recorded events, separately by unit. Corrections and record deletion shall not count as Used or Discarded. Do not infer money saved or food safety. |

The 30-day Trash duration is a detailed-source policy from deletion time; automatic cleanup was not tested for this report. A missing expiry date is a separate unknown state. Check-again changes a schedule and does not extend expiry. Quantity zero and deletion remain independent.

![Figure 4: derived-usecase-a](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/09-usecase-overview-a.png)

Figure 4. Use-case association overview, SE29 UC-01–15. Report synthesis with one individual actor; optional/include relationships are discussed in the text and native source.

![Figure 5: derived-usecase-b](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/10-usecase-overview-b.png)

Figure 5. Use-case association overview, SE29 UC-16–29. Separate goals remain separate; complete identifiers and Design mappings are in the registry.

![Figure 6: derived-capture](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/02-capture-flow.png)

Figure 6. Goal-based capture flow: recognition assists a draft; unavailable or empty recognition retains manual completion; only explicit Save can create a record.

![Figure 7: derived-quantity](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/03-quantity-flow.png)

Figure 7. Quantity reconciliation: Used/Discarded deduct an amount, while Adjust sets the remaining total. Preview and confirmation protect the distinction.

![Figure 8: derived-ia](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/01-information-architecture.png)

Figure 8. Sitemap and information architecture. Add is an action, Food History belongs inside Insights, and Trash is a separate record-management route.

![Figure 9: derived-capture-sequence](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/11-capture-sequence.png)

Figure 9. Capture interaction sequence. Recognition, form validation and persistence have separate responsibilities; an uncertain response is not a confirmed failure.

![Figure 10: derived-sequence](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/07-quantity-sequence.png)

Figure 10. Quantity interaction sequence: Used, Discarded and Adjust are distinct intents; validation and confirmation precede a recorded update. Report synthesis, not runtime evidence.

![Figure 11: derived-hta](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/05-capture-hta.png)

Figure 11. Hierarchical task analysis for capture and reconciliation. Plans state the order and optional branches.

![Figure 12: derived-journey](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/06-persona-journeys.png)

Figure 12. Illustrative journey across capture, a changed plan and quantity reconciliation. Expected outcomes are study questions, not observed results.

![Figure 13: derived-states](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/04-state-dimensions.png)

Figure 13. Independent state dimensions: date attention, quantity and record lifecycle. No automatic expired-to-Trash transition is inferred.

Detailed interaction example — UC-03: Add food manually

UC-03 task contract

| Field | Specification |
| --- | --- |
| Goal | Create a separate food record from details entered and checked by the user. |
| Preconditions | The user can access Add and its shared food form. A valid session and ownership checks are required when saving personal data; this is not a claim that navigation must pass an authentication gate before Add. |
| Trigger | Choose Enter manually from Add. |
| Confirmed success | After an explicit, valid Save is confirmed, exactly one new record belongs to the account. An absent expiry date is displayed as Unknown expiry. |
| Other outcomes | Editing, OCR suggestions or cancellation before submitting Save create no food record. A confirmed rejected or failed create is shown as failed and preserves information for correction. A missing response after Save leaves the outcome unconfirmed; inspect the inventory before another create request. |

UC-03 basic flow

| Step | Actor | Action |
| --- | --- | --- |
| BF-1 | User | Choose Enter manually from Add. |
| BF-2 | Interface | Open the shared food form with available categories and optional storage choices; do not create a food record. |
| BF-3 | User | Enter the name, quantity and unit. Review production and expiry dates when known, and optionally select a category, storage and note. |
| BF-4 | User | Review the draft and explicitly choose Save food. |
| BF-5 | Interface | Submit the form data to the system; submission alone is not confirmation that persistence succeeded. |
| BF-6 | System | Validate account access, name, non-negative quantity, unit and any supplied dates. Category and storage are optional; do not infer expiry. |
| BF-7 | System | Create exactly one new account-owned food record from the checked data; do not automatically merge records with matching names. |
| BF-8 | Interface | After confirmed success, display the new record, quantity and unit, using Unknown expiry when no expiry date was supplied. |

UC-03 alternative and exception coverage

| Branch | Condition | Outcome |
| --- | --- | --- |
| AF-B | The user needs a new storage location while completing the draft. | Return to BF-3; creating storage does not save the food. |
| AF-C | Validation identifies invalid or missing form data. | Correct the affected fields, review the draft, explicitly choose Save again, then resume BF-5. Invalid input creates no record. |
| EF-A | The user cancels or closes the draft before Save. | No food record is created. |
| EF-B | The create request fails or its result is unknown after Save. | Do not display success without confirmation or automatically resend create; an unknown result is not proof of no write. |

Detailed interaction example — UC-04: Add food with OCR assistance

UC-04 task contract

| Field | Specification |
| --- | --- |
| Goal | Use label recognition to prepare a draft, then review and explicitly save one food record. |
| Preconditions | The user can open Add and the shared food form. Camera permission is required only for the camera capture branch. Manual completion remains available if camera capture cannot be used. Personal-data Save requires a valid session and account authorization. |
| Trigger | Choose Scan label from Add. |
| Confirmed success | After the user reviews the form and a valid Save is confirmed, exactly one new record is created from the final checked values. |
| Other outcomes | Recognition and manual corrections create only a draft; abandoning it before Save creates no food record. Missing or uncertain expiry remains blank and is displayed as Unknown expiry after Save. If the response to Save is lost, the record outcome remains unconfirmed until checked; do not automatically create again. |

UC-04 basic flow

| Step | Actor | Action |
| --- | --- | --- |
| BF-1 | User | Choose Scan label in Add. |
| BF-2 | System | Open the current label-capture interface and request camera permission only if the user chooses camera capture and permission is needed. |
| BF-3 | User | Capture a label image using the available capture control. |
| BF-4 | System | Attempt recognition and open the shared confirmation form. Fill only recognized candidates; leave unrecognized fields blank, including when no fields are recognized. |
| BF-5 | User | Review, correct and complete the name, quantity, unit and any known production or expiry date, category, storage and note in this same form. |
| BF-6 | User | Explicitly choose Save after reviewing the draft. |
| BF-7 | System | Validate the final values and account access as in UC-03, then create exactly one new food record after valid confirmation. |
| BF-8 | System | After confirmed success, display the new record, using Unknown expiry when appropriate. |

UC-04 alternative and exception coverage

| Branch | Condition | Outcome |
| --- | --- | --- |
| AF-A | Recognition completes but yields no usable fields. | Continue at BF-5; another scan is optional and no separate mandatory UC-03 transition is imposed. |
| AF-B | The type or value of a recognized date is uncertain. | Continue to BF-6; never derive expiry from production date. |
| AF-C | Recognition provides only some fields. | Continue to BF-6; partially or fully typing values does not force a separate UC-03 invocation. |
| AF-D | Camera access is denied, unsupported or unavailable. | Continue at BF-5; camera failure does not block adding food. |
| AF-E | The final draft is invalid when Save is chosen. | Return to BF-5; validation rejection does not create a record. |
| AF-F | The OCR request cannot be processed because the connection or recognition service is unavailable. | Continue at BF-5 for manual completion, or end without a food write if the user cancels. |
| EF-A | The user abandons capture or the draft before Save. | No food record is created by that unsent draft. |
| EF-B | Saving fails or its outcome cannot be confirmed after Save. | Do not claim success, assume no write after a lost response, or automatically resend create. |

Detailed interaction example — UC-13: Adjust the actual remaining quantity

UC-13 task contract

| Field | Specification |
| --- | --- |
| Goal | Make the saved quantity match the entire amount that actually remains. |
| Preconditions | A valid session permits editing the existing account-owned record. |
| Trigger | Choose Adjust quantity. |
| Confirmed success | The saved quantity is replaced by the confirmed non-negative actual quantity; a changed value creates one Adjustment event. |
| Other outcomes | An equal value is acknowledged without an update or event. Adjustment is neither Used nor Discarded. It does not change expiry or automatically delete a zero-quantity record. |

UC-13 basic flow

| Step | Actor | Action |
| --- | --- | --- |
| BF-1 | User | Choose Adjust quantity for the food record. |
| BF-2 | System | Display the current quantity and its unit. |
| BF-3 | User | Enter the entire actual remaining quantity, rather than an amount to subtract. |
| BF-4 | System | Validate the non-negative quantity, current unit and latest state; preview the saved value and its replacement. |
| BF-5 | User | Confirm the new actual quantity. |
| BF-6 | System | Replace the saved quantity with the confirmed value and record one Adjustment event only if the value changes. |
| BF-7 | System | Display the confirmed actual quantity, keeping expiry unchanged and preserving the record at zero quantity. |

UC-13 alternative and exception coverage

| Branch | Condition | Outcome |
| --- | --- | --- |
| AF-A | The entered actual quantity equals the current quantity. | The goal is achieved without a mutation. |
| AF-B | The actual quantity is negative or not a valid number. | Return to BF-3 without replacing the saved quantity. |
| EF-A | The user cancels before confirmation. | No adjustment is submitted. |
| EF-B | A conflict or save error prevents confirmation. | No successful adjustment is claimed; an uncertain server outcome must be checked. |

### B. UX wireframe

Low fidelity isolates the task structure; medium fidelity introduces clearer hierarchy and control behaviour; high fidelity applies the current shared components. The examples below follow the same Inventory task across App and Web. They are separate native artifacts, not labels applied to one screenshot.

Wireframe decisions and HCI rationale

| Task area | Principle | Design decision |
| --- | --- | --- |
| Inventory | Recognition and prioritisation | Expose food identity, recorded date state, remaining quantity and storage; separate an attention summary from the full list. |
| Capture | Error prevention and control | Keep OCR values editable in the same form and retain a manual route; preserve draft information when recovering. |
| Quantity | Match intent to consequence | Separate Used, Discarded and Adjust, preview before/after amounts and retain the record when quantity becomes zero. |
| Recovery | Status feedback | Distinguish empty, invalid, unavailable and unconfirmed outcomes; offer a relevant next step without claiming unverified persistence. |

![Figure 14: low-app](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/low-app.png)

Figure 14. Low-fi App inventory, node1865:411.

![Figure 15: mid-app](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/mid-app.png)

Figure 15. Mid-fi App inventory, node1879:2505.

![Figure 16: low-web](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/low-web.png)

Figure 16. Low-fi Web inventory, node1867:19.

![Figure 17: mid-web](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/mid-web.png)

Figure 17. Mid-fi Web inventory, node1879:10220.

## IV. Test cases

These are functional design test specifications. None was executed as part of report authoring. Expected outcomes are separate from actual results, which remain unrecorded. A prototype simulation, browser test and authenticated API/database test require different evidence and must not be reported as interchangeable.

Goal and recovery test specifications; all NOT EXECUTED

| ID / goal | Precondition and actions | Expected result |
| --- | --- | --- |
| TC-SE-01 — Register with valid email details | Precondition: Proposed fixture: an unregistered test email and valid registration details; no active session. Steps: 1. Open Register from the welcome screen. 2. Enter the display name, test email and valid password, then choose Create account. 3. Inspect the confirmed account result and choose Skip on optional onboarding. | A successful registration confirms one new account and a valid session. Skipping onboarding preserves the account and session and allows entry to the personal inventory. No private data from another account is exposed. |
| TC-SE-02 — Sign in to the correct personal inventory | Precondition: Proposed fixture: a registered test account with identifiable personal records; no valid session. Steps: 1. Open Sign in and enter the fixture credentials. 2. Choose Sign in and inspect the resulting account context. 3. Open Food and inspect the fixture records. | A valid session opens Food for the authenticated account. Only that account records are visible. Sign-in does not require repeating onboarding. |
| TC-SE-03 — Save a manually entered food record | Precondition: Proposed fixture: authorized personal-data Save is available; choose a valid category and optional existing storage. Steps: 1. From Add, choose Enter manually. 2. Enter a food name, quantity 5 and unit pieces; review the independent known dates and optional fields. 3. Choose Save once and inspect the confirmed record in Food. | No food record exists from this draft before Save. Confirmed valid Save creates exactly one new account-owned record with the checked values. The result is displayed accurately; matching names are not automatically merged. |
| TC-SE-04 — Review OCR suggestions before saving | Precondition: Proposed scenario: camera capture is available and an image with known label content can be supplied. Personal-data Save is authorized. Steps: 1. From Add, choose Scan label and capture the prepared label. 2. Inspect the editable suggestions in the shared form; correct at least one value and complete any missing required field. 3. Review the final name, quantity, unit and dates, then choose Save once. 4. Inspect the confirmed new record. | Recognition creates an editable draft rather than an inventory write. The saved record uses the final user-checked values, including the correction. A confirmed valid Save creates one record; the case does not assert an OCR accuracy rate. |
| TC-SE-05 — Create storage without saving the food draft | Precondition: Proposed fixture: an unsaved food form is open with draft text and an existing storage selection. Steps: 1. Open the storage selector and choose Create new storage. 2. Enter a valid new location name and confirm creation. 3. Return to the food form and inspect its draft and storage selection. | The new storage choice is confirmed and available for selection. The food draft is preserved and can select the new location. Creating the location does not save a food record; food still requires its own Save. |
| TC-SE-06 — View the personal food inventory | Precondition: Proposed fixture: a valid session and at least one accessible active food record. Steps: 1. Open Food. 2. Observe the loading-to-result transition. 3. Inspect the displayed name, quantity, unit and expiry information of the fixture record. | The current account inventory is displayed after a successful load. Record values match the confirmed fixture data and viewing does not mutate them. Loading and result states remain distinguishable. |
| TC-SE-07 — Read the current details of a food record | Precondition: Proposed fixture: an accessible saved food record with known values for its displayed attributes. Steps: 1. Open Food and select the fixture record. 2. Inspect the detail screen and compare name, quantity, unit, independent dates, category, storage and note. 3. Return to Food without choosing an update action. | Current accessible details are shown for the selected record. Production date and expiry are represented independently. Viewing and returning do not change the record. |
| TC-SE-08 — Search for a food by name | Precondition: Proposed fixture: the personal inventory contains a uniquely identifiable food-name keyword. Steps: 1. Open Search from Food and enter the fixture keyword. 2. Inspect the active keyword and returned records. 3. Select the matching record to open its details. | Results are restricted to matching accessible records from the current account. The active search keyword is visible. Selecting a result opens the correct detail task without changing food data. |
| TC-SE-09 — Edit attributes on the same record | Precondition: Proposed fixture: an editable record with a saved note and known record identity. Steps: 1. Open the fixture details and choose Edit. 2. Change the note and another permitted descriptive field, then review the form. 3. Choose Save once and inspect the confirmed details. | Confirmed changes update the same record identity. Untouched attributes remain unchanged. An information edit does not fabricate Used or Discarded events. |
| TC-SE-10 — Move a record to Trash after confirmation | Precondition: Proposed fixture: an accessible active record with a known positive quantity. Steps: 1. Open the record and choose Delete record. 2. Read the Move to Trash confirmation and confirm. 3. Inspect the active inventory and Trash after the confirmed result. | The selected record is removed from the active list and appears in Trash with a deletion timestamp. The action records a lifecycle change rather than physically discarded food. No Discarded event is created by deleting the record. |
| TC-SE-11 — Record a valid amount as Used | Precondition: Proposed fixture: an accessible record has quantity 5 pieces and a known history baseline. Steps: 1. Open the record quantity actions and choose Used. 2. Enter 2 pieces and inspect the preview from 5 to 3. 3. Confirm once and inspect the confirmed quantity and event history. | The remaining quantity becomes 3 pieces after successful confirmation. One Used event records the valid subtraction in the same unit. No implicit unit conversion or Trash transition occurs. |
| TC-SE-12 — Record a valid amount as Discarded | Precondition: Proposed fixture: an accessible record has quantity 5 pieces and a known history baseline. Steps: 1. Choose Discarded for the fixture record. 2. Enter 2 pieces and inspect the preview from 5 to 3. 3. Confirm once and inspect quantity, history and record lifecycle. | The remaining quantity becomes 3 pieces after confirmed success. One Discarded event records the physical-discard intent. The food record remains separate from the Trash lifecycle. |
| TC-SE-13 — Replace the saved quantity with the actual remainder | Precondition: Proposed fixture: an accessible record has quantity 5 pieces and a known history baseline. Steps: 1. Choose Adjust quantity. 2. Enter the full actual remaining quantity 4 pieces and inspect the replacement preview. 3. Confirm once and inspect the new quantity and history. | The saved quantity becomes 4 pieces; it is not calculated as 5 minus 4. One Adjustment event records the change. No Used or Discarded event or expiry-date change is inferred. |
| TC-SE-14 — View date-based attention and its reasons | Precondition: Proposed fixtures: an accessible overdue record, a soon-to-expire record under the selected reminder interval, and a record without confirmed expiry. Steps: 1. Open Needs attention. 2. Inspect grouping, order and the stated reason for each fixture. 3. Open one dated record to inspect its details. | Overdue records are shown ahead of soon-to-expire records among those with known dates. Unknown expiry is explicit and is not invented or treated as a confirmed soon/overdue date. Reasons derive from saved date information; no claim that food is safe or unsafe is shown. |
| TC-SE-15 — Save a recheck appointment without extending expiry | Precondition: Proposed fixture: an accessible food record has a known saved expiry and quantity. Steps: 1. From food details, choose Schedule recheck. 2. Select a valid recheck date and time and confirm. 3. Inspect the confirmed schedule alongside the saved expiry and quantity. | The selected recheck appointment is saved and clearly confirmed. The recheck time remains distinct from the original expiry. Expiry and quantity are unchanged. |
| TC-SE-16 — View in-app notifications without automatic updates | Precondition: Proposed fixture: an accessible unread in-app reminder exists; Push permission may be unavailable. Steps: 1. Open Notifications. 2. Inspect the reminder reason and available actions. 3. Leave the list without selecting Mark as read, Snooze or a quantity action. | The personal in-app inbox is available without requiring Push permission. Viewing the list does not automatically mark the reminder read. Food dates, quantity and lifecycle remain unchanged. |
| TC-SE-17 — Explicitly mark a notification as read | Precondition: Proposed fixture: an accessible unread reminder and its associated food values are known. Steps: 1. Open the fixture notification. 2. Choose Mark as read. 3. Inspect the confirmed read state and the associated food information. | The reminder becomes Read after a confirmed update. The result is shown without requiring an invented additional confirmation dialog. The associated food dates and quantity remain unchanged. |
| TC-SE-18 — Snooze a reminder without changing food data | Precondition: Proposed fixture: an accessible snoozable reminder has a known current schedule and associated food values. Steps: 1. Choose Snooze on the fixture notification. 2. Select a valid next-reminder time and confirm. 3. Inspect the confirmed reminder schedule and food details. | The new reminder time is saved after valid confirmation. Snoozing does not extend expiry or change quantity or food lifecycle. Feedback reports the confirmed schedule rather than guaranteed Push receipt. |
| TC-SE-19 — Save reminder preferences with in-app fallback | Precondition: Proposed fixture: valid access to personal reminder settings; Push is denied or unsupported for the scenario. Steps: 1. Open notification settings. 2. Choose a valid reminder interval and inspect the displayed Push state. 3. Save the preferences and inspect the confirmed active channel. | The valid interval is saved and confirmed. In-app reminders remain available when Push is unavailable. The permission state is explained without repeated prompting; no Push receipt or read claim is inferred. |
| TC-SE-20 — View existing records in Trash | Precondition: Proposed fixture: an accessible record was previously moved to Trash with a known deletion timestamp. Steps: 1. Open Trash. 2. Inspect the fixture record, deletion timestamp and available actions. 3. Return to Food without selecting Restore or Permanently delete. | Trash shows the current account trashed records and their relevant lifecycle information. Restore/permanent-delete availability follows the specified record state. Viewing does not restore or permanently delete the record. |
| TC-SE-21 — Restore the original eligible record | Precondition: Proposed fixture: an accessible trashed record is eligible under the specified 30-day-from-deletion recovery policy; its record identity is known. Steps: 1. In Trash, choose Restore for the fixture. 2. Review the selected record and confirm Restore. 3. Inspect the confirmed record in Food and compare its identity. | The original record returns to the active inventory. No duplicate record or Used/Discarded event is created. This case specifies the recovery policy; it does not itself establish automated cleanup or deployed enforcement. |
| TC-SE-22 — Permanently delete a selected trashed record | Precondition: Proposed fixture: an accessible trashed record is available for a permitted permanent-delete action. Steps: 1. Choose Permanently delete for the fixture. 2. Read the loss-of-recovery warning and explicitly confirm. 3. Inspect the confirmed result in Trash. | The selected record is permanently removed after valid confirmation. Success is reported only after a confirmed result. The deletion does not create a physical Discarded event. |
| TC-SE-23 — View traceable Insights totals by unit | Precondition: Proposed fixtures: saved food records and recorded Used/Discarded events include at least two different units; expected counts and per-unit totals are known. Steps: 1. Open Insights. 2. Compare the displayed food/attention summary with the fixture records. 3. Compare Used and Discarded totals with the recorded events for each unit. | The summary derives from accessible saved records and recorded events. Used and Discarded remain separate and totals are separated by unit without implicit conversion. Adjustment/deletion are not reclassified as consumption/waste, and no money-saved or food-safety outcome is invented. |
| TC-SE-24 — Filter records by separate category and storage conditions | Precondition: Proposed fixtures: the inventory includes known matching and non-matching category/storage combinations. Steps: 1. Open Filters from Food. 2. Select a category and storage condition, then choose Apply. 3. Inspect the visible filter conditions and returned records. 4. Choose Clear filters and inspect the refreshed list. | Only accessible records matching the selected conditions are returned. Category and storage remain distinct filter dimensions. Clearing filters removes those conditions without changing food records. |
| TC-SE-25 — Rename storage while preserving food links | Precondition: Proposed fixture: a user-created accessible storage location has at least one linked food record; location identity is known. Steps: 1. Open the location actions and choose Rename. 2. Enter a valid new name and confirm. 3. Inspect the location and the linked food record. | The new location name is saved and confirmed. The same storage identity retains its existing food links. No food record, expiry or quantity is removed or altered. |
| TC-SE-26 — Delete storage after choosing a destination | Precondition: Proposed fixtures: a user-created accessible location contains food records and another accessible location is available. Steps: 1. Choose Delete for the occupied location. 2. Review the linked-food count and choose the replacement location. 3. Inspect the expected effect and explicitly confirm Delete storage. 4. Inspect the confirmed location list and affected food records. | The selected storage location is removed after link handling is confirmed. All affected food records remain and point to the selected replacement location. Their categories, dates and quantities remain unchanged. |
| TC-SE-27 — Save a food category independently of storage | Precondition: Proposed fixture: an accessible food record and an available valid category; saved storage, quantity and expiry are known. Steps: 1. Open the record and choose Edit category. 2. Select an available category, review it and choose Save. 3. Inspect the confirmed category and the other saved attributes. | The category is updated on the same food record. Storage, expiry and quantity remain unchanged. No automatic AI classification or expiry inference is assumed. |
| TC-SE-28 — Read recorded history inside Insights | Precondition: Proposed fixture: the account has recorded quantity events and a record whose remaining quantity is zero. Steps: 1. Open Insights and then Food history. 2. Select the fixture record or one of its events. 3. Inspect the recorded event types, quantities and units, then return without an update action. | History remains accessible for the zero-quantity record. Events retain their actual Used, Discarded or Adjustment meaning and unit. Viewing does not change quantities or dates or automatically move the record to Trash. |
| TC-SE-29 — Save Add again as a new food record | Precondition: Proposed fixture: an accessible historical food entry is available and its source identity is known. Steps: 1. From History inside Insights, choose Add again. 2. Review the new draft and enter the new quantity, unit and independently checked dates. 3. Choose Save once. 4. Inspect the confirmed new record and the source history. | Save creates one new record with a new identity and the newly checked values. The old record and its history are preserved. The action is not Restore and does not automatically reuse the historical expiry date. |
| TC-REC-01 — Continue manually after camera access is denied | Precondition: Proposed scenario: camera permission is not granted; personal-data Save is authorized. Steps: 1. Choose Scan label from Add. 2. Deny the camera request or follow the unavailable-camera design branch. 3. Complete the same shared form manually with valid food values and review them. 4. Choose Save once and inspect the confirmed result. | The capture limitation is explained and the same editable form remains available. No OCR values are fabricated and no food record is created before Save. A valid manually completed draft can produce one confirmed record without requiring another scan. |
| TC-REC-02 — Complete the shared form when OCR recognizes no fields | Precondition: Proposed scenario: OCR processing completes successfully but provides no usable recognized fields. Personal-data Save is authorized. Steps: 1. Start Scan label and submit the prepared no-recognition scenario. 2. Inspect the feedback and resulting form. 3. Enter the required food values directly in that form and review them. 4. Choose Save once and inspect the confirmed record. | Feedback states that label information was not read, rather than mislabelling the result as a service outage. A blank shared form allows direct completion; rescanning or a mandatory separate UC-03 invocation is not required. Only valid explicit Save creates the record. |
| TC-REC-03 — Recover manually when OCR processing is unavailable | Precondition: Proposed scenario: the recognition request cannot be processed because the connection or OCR service is unavailable. Personal-data Save is authorized. Steps: 1. Start Scan label and arrange the processing-unavailable scenario. 2. Inspect the processing-error feedback. 3. Choose direct completion in the shared form and enter valid checked food values. 4. Save once and inspect the confirmed result. | The error is identified as unavailable processing, distinct from successful processing with zero recognized fields. Manual completion remains available under editorial recovery AF-F and the current Brief. No image-derived food record exists before Save; a valid subsequent Save can create one confirmed record. |
| TC-REC-04 — Enforce quantity bounds and allow an actual remainder of zero | Precondition: Proposed fixture: an accessible record starts at 5 pieces and its history baseline is known. Steps: 1. Open Used and try -1, 0 and 6 pieces separately, inspecting each validation result. 2. Open Discarded and try the same invalid amounts against the unchanged 5-piece record. 3. Open Adjust quantity and enter -1; inspect rejection without confirming a change. 4. Replace that value with the full actual remainder 0 and inspect the preview. 5. Confirm the valid zero adjustment once, then inspect quantity, history and lifecycle. | Negative, zero or excessive subtraction amounts do not create Used/Discarded changes or events. A negative actual quantity is rejected; adjustment to zero is valid and replaces the full remainder. Confirmed adjustment to zero records one Adjustment event, without a Used/Discarded event or automatic Trash transition. |
| TC-REC-05 — Keep unknown expiry explicit and independent of production date | Precondition: Proposed scenario: a food draft has a known production date but no confirmed expiry date. Personal-data Save is authorized. Steps: 1. Open the shared food form and enter valid name, quantity, unit and the known production date. 2. Leave expiry blank and choose Save after review. 3. Inspect the confirmed record in Food and details. 4. Inspect its expiry representation in attention information and Insights. | The record may be saved without expiry and displays Unknown expiry. Expiry is not calculated from the production date. The unknown date is not silently classified as a confirmed soon/overdue date or a food-safety judgment. |
| TC-REC-06 — Check an unknown Save outcome before another create attempt | Precondition: Proposed scenario: a valid food draft is ready and the response after its create request will be unavailable. The scenario leaves server outcome unknown rather than declaring a confirmed rejected request. Steps: 1. Review the draft and choose Save once. 2. Arrange or inspect the scenario in which no confirmation response reaches the interface. 3. Inspect the draft, feedback and any automatic retry behavior. 4. Check the inventory or resulting record before deciding whether a new create attempt is needed. | Feedback states that the outcome is unconfirmed and preserves information needed for checking. The interface does not claim success, assume that no write occurred, or automatically resend create. A record may already exist after the lost response; checking it prevents a duplicate create. The unsent-draft no-write rule is not applied to this post-Save scenario. |
| TC-REC-07 — Preserve food when occupied storage is deleted or cancelled | Precondition: Proposed fixture: a user-created storage location contains two accessible food records with known identities and saved values. Steps: 1. Choose Delete storage and inspect the linked-food count. 2. Choose blank storage for the linked records, then cancel before final deletion confirmation. 3. Reopen Delete storage, choose blank storage again and explicitly confirm. 4. Inspect the confirmed storage list and both food records. | Cancellation preserves the location and all original links. After confirmed deletion, both food records still exist with blank storage. Food identities, quantities, categories and dates remain unchanged; deleting storage never cascades into deleting food. |
| TC-REC-08 — Create a fresh draft without reusing the historical expiry | Precondition: Proposed fixture: accessible History contains a source food entry with a past expiry date and a known source identity. Personal-data Save is authorized. Steps: 1. From History inside Insights, choose Add again for the source entry. 2. Inspect the new draft and leave the new expiry unknown rather than accepting the old date. 3. Enter the new quantity and unit, review the form and choose Save once. 4. Inspect the new record and the preserved source history. | The old expiry is not automatically treated as the expiry of the new food. The new record uses Unknown expiry when the new date remains unconfirmed and has a new identity. The historical source and its events are preserved; Add again is not Restore. |

### Usability test plan

No participant usability study has been supplied or conducted as part of this report preparation. The following protocol is proposed to test whether people understand and complete the core food-management tasks. It complements functional test cases: a working action does not by itself show that a person can find it or interpret its consequence.

A proposed exploratory sample is six adults, with two recruited for each behavioural situation in the Brief. Recruitment should ask about recent food-management behaviour rather than require a matching age or device profile. Participants may fit more than one group. The number is a planning assumption for a small formative study, not a representative sample or a basis for population claims.

Use a moderated session with informed consent and fictional food records. A proposed session duration is 40–60 minutes, including introduction and follow-up; feasibility should be checked in a pilot. Record the exact prototype or software version, device, input method, and network condition. Use one primary surface per participant and record mobile and web findings separately.

Begin with a brief account of a recent real food-management incident, then give neutral goal-based tasks without naming the interface control to use. Observe the manual route before the OCR-assisted task to establish a baseline; record the resulting learning effect and avoid treating their time difference as an unbiased OCR advantage. A prototype simulation of recognition, persistence, or notification delivery must be identified in the session record.

Proposed usability tasks and success evidence

| Task | Neutral task goal | Completion and comprehension evidence |
| --- | --- | --- |
| UT-01 — Capture and retrieve | Record a supplied food manually, place it in a useful storage context, and find the saved record again. | One confirmed record with task-correct name, quantity, unit, and date state; participant can retrieve it and explain the information shown. F01, F03, F04. |
| UT-02 — Review recognition | Use the supplied label image to record another purchase; correct any unsuitable suggestion. | Participant reviews suggestions before Save. An empty or failed recognition variant can be completed through manual entry. Unknown date is not invented. F01, F02. |
| UT-03 — Changed meal plan | Your meal plan has changed. Review the recorded food and decide what needs attention; arrange to check one item later if useful. | Participant gives a reason tied to recorded information and explains that a later check changes a reminder rather than expiry or food safety. F03, F05. |
| UT-04 — Quantity intent | Record a partial use, then distinguish a separate disposal from a correction of the remaining amount. | The correct action is chosen for each intent and the resulting remainder matches the scenario. An excessive amount is recognised and corrected. F06. |
| UT-05 — Organise without losing food | Change a storage location that contains food and preserve the food records. | Participant understands move-or-clear behaviour and can still find the food after the location change. F03, F04. |
| UT-06 — Recover a deletion | Move the specified record out of the active list, then recover it. | Participant distinguishes Trash from Discarded, finds the recovery route, and understands the confirmation. F03. |
| UT-07 — History and a new purchase | Explain a food's recorded changes, then record a new purchase of the same food from its history. | Participant finds Food History in Insights, understands its recorded events, reviews the new date, and creates a new record rather than overwriting the old one. F06. |

Measurements and reporting rules

| Measure | Definition and recording rule |
| --- | --- |
| Task outcome | Record completed without help, completed with help, incomplete, or blocked by a prototype limitation. State the criterion and denominator for each task. |
| Time on task | Measure from the end of the task instruction to completion or the stated stopping point. Report assistance, interruptions, and incomplete tasks alongside times. |
| Action and correction effort | Count relevant taps/clicks, invalid submissions, backtracks, and field corrections; distinguish OCR suggestion corrections from unrelated edits. |
| Intent and state comprehension | Ask what changed after the action. Record whether the participant correctly distinguishes date, reminder, quantity, Trash, and a new record. |
| Data accuracy | Compare the final recorded fields and remainder with the task sheet. A correct-looking screen without the expected record state does not meet this criterion. |
| Assistance and recovery | Log the point of difficulty, facilitator intervention, recovery chosen, and whether context or entered information was lost. |
| Post-task feedback | Ask a consistent brief ease question and an open question about difficulty; report the wording and responses, without inventing a score. |
| Study limitations | State sample, recruitment, surface, prototype simulations, task order, learning, and missing real-world or longitudinal evidence. |

Pilot the task set before recruitment is finalised and distribute difficult recovery variants across sessions if the full set exceeds the session window. Use the same seeded records and expected outcomes for equivalent tasks. Avoid sensitive personal food data and record only consented material.

No pass percentage or time threshold is retrospectively assigned. Task correctness criteria can be specified now; numerical acceptance targets require agreement before data collection. Report the observations, failed attempts, and assistance as well as successful tasks. Short sessions cannot establish sustained inventory maintenance, food-waste reduction, financial savings, production reliability, or real notification delivery.

### Heuristic self-evaluation

The proposed self-evaluation uses Jakob Nielsen's ten usability heuristics as an inspection framework. A heuristic is a broad design principle used to identify possible interaction problems; it does not replace observation of users. The official framework is described in [10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/).

Inspect a complete task path on the identified mobile or web revision, including its empty, loading, validation, cancellation, and recovery states. For each potential issue, record the exact frame or runtime state, task, observation, likely consequence, relevant heuristic, proposed action, and inspection status. A source inconsistency is recorded as a source finding; it becomes a UI finding only when the cited interface evidence supports it.

Heuristic inspection coverage for Expiry; no scores assigned by this method description

| Heuristic area | Expiry inspection question | Evidence required |
| --- | --- | --- |
| H1 — Status feedback | Can the person distinguish scanning, form review, saving, confirmed success, failure, and an unconfirmed result? | Specific state/frame and feedback after the action. |
| H2 — Familiar concepts | Do food terms, dates, units, and Used/Discarded/Adjust match the intended everyday meaning? | Labels, examples, and before/after consequences. |
| H3 — Exit and reversal | Can the person cancel an addition, return from a nested action, and recover a trashed record? | Cancel/back/restore path and draft behaviour. |
| H4 — Consistent language | Do the same actions and states have consistent meaning in mobile, web, detail, and history? | Comparable frames and source identifiers. |
| H5 — Prevent mistakes | Are invalid quantity changes, unreviewed OCR values, and consequential deletion handled before commitment? | Validation, confirmation, and unchanged state after rejection. |
| H6 — Visible choices | Can the person see the relevant unit, quantity, location, date state, and actions without remembering them from another screen? | Task context and available information. |
| H7 — Efficient repeat tasks | Do manual fallback and Add again reduce repeat entry without hiding review or consequence? | Complete task path, including necessary checks. |
| H8 — Relevant content | Do primary food information and actions remain clear when secondary metadata is present? | Hierarchy in the actual task state. |
| H9 — Explain and recover | Do errors identify the problem and a usable next step while preserving the relevant draft or context? | Error wording, recovery action, and resulting state. |
| H10 — Contextual help | Is guidance available where a person must interpret unknown expiry, quantity intent, or reminder behaviour? | Help content and its location in the task. |

Severity scale for evidenced usability findings

| Rating | Interpretation for this review |
| --- | --- |
| Not assessed | Inspection or evidence is missing; this is not a score of zero. |
| 0 | The evaluator rejects the reported issue as a usability problem, with a stated reason. |
| 1 | A cosmetic issue with limited task effect. |
| 2 | A smaller usability obstacle that merits correction. |
| 3 | A substantial obstacle deserving high correction priority. |
| 4 | A critical usability problem that prevents a tolerable task outcome. |

Rate findings after they have been described, using expected occurrence, effect on the task, and whether the difficulty recurs. This follows Nielsen's [Severity Ratings for Usability Problems](https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/). Keep the rationale beside the score so that priority can be reviewed.

This subsection specifies the inspection method and coverage questions; it does not claim that all ten areas have been inspected or that the interface has zero problems. A completed evaluation requires a separate finding record with the reviewed revision and evidence. Self-review is vulnerable to familiarity and confirmation bias, so independent inspection and participant work remain useful even after source or layout checks pass.

A limited static inspection of the captured report figures was performed on 13 November 2026. It confirms visible design treatments only; it does not follow interactive tasks, test a keyboard or screen reader, or estimate participant difficulty. The observations below are scoped checks, not all-zero severity findings.

Static figure inspection and remaining interaction checks

| Area | Visible evidence | Limit / follow-up |
| --- | --- | --- |
| Status and error recovery | app-save-error shows an unsaved-change message and a retry action; app-form identifies that suggestions need review. | Response-loss and retry behaviour still require execution. |
| Real-world terms and intent | app-detail separates Đã dùng, Đã bỏ and Chỉnh lại lượng; app-quantity shows before and after amounts. | User understanding of these distinctions remains unmeasured. |
| Control and reversal | Quantity confirmation includes Sửa lại and Xác nhận; record-recovery tasks are specified separately. | Cancel/back/draft preservation were not played through. |
| Consistency and visible information | The App/Web inventory figures both expose food, date status and quantity/storage context; colour is accompanied by text. | Responsive reflow, focus order and assistive technology are not established by screenshots. |
| Efficiency and relevant content | OCR values are in an editable form; Food History is visible as an Insights subview. | Measure correction effort, scrolling and Add-again accuracy in task sessions. |
| Help | Food detail contains guidance and the foundations distinguish date status from a food-safety conclusion. | Check whether people find and correctly interpret the guidance. |

# Part 2: Prototype

The Mobile and Web sections show two layouts of the same product rules. Figma contains five prototype starting points on each hi-fi page. Screenshots below are native design captures with illustrative data; this report does not claim that those prototype paths or a deployed service have been executed.

## I. Mobile

Mobile design entry: https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1496-177. Use the HI-FI page's starting points for Inventory, Sign in, Capture, Insights and Onboarding. The 126 frame states include success, validation and recovery states; they are not 126 independent tested tasks.

### Visual design

Mobile uses the current Expiry shared foundations: Forest #015D67 as the brand primary, supporting accents and neutral surfaces, Be Vietnam Pro and a 4 px spacing rhythm. Colour carries an information role alongside text/icons, and a successful operation is distinct from food being safe.

The design makes food identity, date state, remaining quantity and action intent visible before secondary metadata. Example records show a fixed demonstration date; their expiry labels are illustrative and are not evidence about physical food.

Mobile visual and interaction hierarchy

| Element | Rationale |
| --- | --- |
| Food identity and state | Let the person identify the item and understand why it needs attention. |
| Quantity and unit | Keep the amount interpretable before selecting an update intent. |
| Storage and category | Support finding and organising without treating location deletion as food deletion. |
| Primary and supporting actions | Keep capture/review/Save and consequential quantity/deletion actions distinct. |

### App map

The mobile navigation groups Inventory, Storage, the Add action, Insights and Settings. Notifications and Trash are supporting routes. Add opens Scanner; OCR/manual completion continues in the shared food form. Food History sits inside Insights, and Add again opens a new draft that must be reviewed and saved.

![Figure 18: derived-ia](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/01-information-architecture.png)

Figure 18. Mobile navigation and subview map, synthesised from current Brief and wiring.

Returning or cancelling should preserve the relevant task context and draft according to the specification. Screenshot presence and native prototype starting points do not verify those runtime behaviours.

### Key screens

The key mobile screens are selected by task coverage rather than frame count. Captures retain their Vietnamese interface language; the English explanation names the user goal and data consequence.

![Figure 19: app-inventory](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-inventory.png)

Figure 19. Mobile Inventory, node1755:5064: attention summary, search/filter controls and recorded food information. Demo data.

![Figure 20: app-detail](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-detail.png)

Figure 20. Mobile Detail, node1755:6934: date and quantity context with separate actions. Demo data.

![Figure 21: app-form](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-form.png)

Figure 21. Mobile shared OCR form, node1765:6248: suggestions remain editable before Save.

![Figure 22: app-quantity](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-quantity.png)

Figure 22. Mobile quantity confirmation, node1766:6003: before/after amounts and explicit confirmation.

![Figure 23: app-save-error](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-save-error.png)

Figure 23. Mobile save-failure design, node1766:6125: guidance and recovery action. Runtime retry was not tested.

![Figure 24: app-history](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/app-history.png)

Figure 24. Mobile Food History inside Insights, node1771:7699: recorded activity and access to Add again.

![Figure 25: support-scanner](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/supporting/support-scanner.png)

Figure 25. Scanner and camera-permission denial states from the current App design. These screens illustrate capture entry and a recovery condition; they do not establish camera behaviour on a device. Source nodes 1765:4845, 1765:4895.

![Figure 26: support-notifications](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/supporting/support-notifications.png)

Figure 26. Current App notification and settings screens. Their controls illustrate reminder and configuration scope; no notification delivery, permission behaviour or settings persistence is claimed. Source nodes 1769:7093, 1769:6045.

![Figure 27: support-recovery-account](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/supporting/support-recovery-account.png)

Figure 27. Current App restore-confirmation and sign-in designs. Recovery requires explicit confirmation, while the account screen supports personal access. These are design states rather than executed restoration or authentication results. Source nodes 1766:6095, 1765:4201.

![Figure 28: support-storage](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/supporting/support-storage.png)

Figure 28. Current App storage and location-management designs. The supplied snapshot does not contain an occupied-location delete-confirmation frame; this panel does not claim to show that state. Preserving food during location deletion remains a specified requirement requiring separate design/runtime verification. Source nodes 1755:6255, 1766:6161.

### Changes after lecturer review

No documented lecturer feedback has been supplied for this report. Consequently, no design change is attributed to lecturer review, and no lecturer approval is claimed.

The report's current reconciliation follows the project Brief and the supplied design and requirements sources: six feature groups, a shared form with explicit Save for both manual and OCR entry, Food History inside Insights, and separate meanings for quantity changes, reminders, and deletion. These are source-based editorial decisions, not evidence of a lecturer-directed iteration.

If lecturer feedback is later available, record its date and source, the specific issue, the resulting change, and the before/after figure or frame. Keeping that record separate will make the response to feedback reviewable without rewriting the design history.

## II. Web

Web design entry: https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1515-9. Use the HI-FI page's starting points for Inventory, Sign in, Capture, Insights and Onboarding. The 126 frame states include success, validation and recovery states; they are not 126 independent tested tasks.

### Visual design

Web uses the current Expiry shared foundations: Forest #015D67 as the brand primary, supporting accents and neutral surfaces, Be Vietnam Pro and a 4 px spacing rhythm. Colour carries an information role alongside text/icons, and a successful operation is distinct from food being safe.

The design makes food identity, date state, remaining quantity and action intent visible before secondary metadata. Example records show a fixed demonstration date; their expiry labels are illustrative and are not evidence about physical food.

Web visual and interaction hierarchy

| Element | Rationale |
| --- | --- |
| Food identity and state | Let the person identify the item and understand why it needs attention. |
| Quantity and unit | Keep the amount interpretable before selecting an update intent. |
| Storage and category | Support finding and organising without treating location deletion as food deletion. |
| Primary and supporting actions | Keep capture/review/Save and consequential quantity/deletion actions distinct. |

### App map

The web navigation groups Inventory, Storage, the Add action, Insights and Settings. Notifications and Trash are supporting routes. Add opens Scanner; OCR/manual completion continues in the shared food form. Food History sits inside Insights, and Add again opens a new draft that must be reviewed and saved.

![Figure 29: derived-ia](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/derived/01-information-architecture.png)

Figure 29. Web navigation and subview map, synthesised from current Brief and wiring.

Returning or cancelling should preserve the relevant task context and draft according to the specification. Screenshot presence and native prototype starting points do not verify those runtime behaviours.

### Key screens

Web presents the same tasks in a persistent sidebar and a wider content area. These figures show a concrete desktop design; they do not establish support for all browsers, operating systems, keyboard shortcuts or offline operation.

![Figure 30: web-inventory](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/web-inventory.png)

Figure 30. Web Inventory, node1760:6228: the same recorded-state distinctions in a wider list.

![Figure 31: web-form](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/web-form.png)

Figure 31. Web shared form, node1765:15181: editable recognition suggestions and metadata in a larger workspace.

![Figure 32: web-history](/home/pro/Downloads/expiry/.tmb/tasks/HCI-REPORT-WRITE-20261113/figures/web-history.png)

Figure 32. Web Food History inside Insights, node1772:9838: the same recorded-event and Add-again semantics.

### Differences from the mobile app

Mobile and Web comparison

| Aspect | Mobile design | Web design |
| --- | --- | --- |
| Navigation | Bottom navigation and prominent Add action. | Persistent sidebar with the same task groupings. |
| Information density | Vertical progression with concise rows and stacked item information. | Wider rows and more simultaneous context. |
| Form | Shared reviewable fields in a narrow scrolling surface. | Same fields and Save boundary in a wider content region. |
| Quantity and deletion | Explicit intent and confirmation with relevant before/after information. | Same business meaning; presentation adapted to desktop space. |
| History | An Insights subview with recorded activity and Add again. | The same relationship with more horizontal space. |
| Evidence boundary | Touch-oriented design; real-device/keyboard/assistive behaviour unverified here. | Desktop layout; browser/keyboard/accessibility behaviour unverified here. |

The shared requirement is semantic consistency, not identical geometry. Responsive layouts and native design states are documented, while task success, notification delivery, performance, food-waste reduction and long-term maintenance require separate studies or runtime evidence.

References and source notes

Source register

| Source | Role and link |
| --- | --- |
| Current Figma Brief and UI | Product/design authority; https://www.figma.com/design/6IiKgkvUTzw2pCqRapbNK3/Expiry?node-id=1121-7 |
| System Engineering Gr2 | Current requirements variants and detailed rules; https://docs.google.com/document/d/1RmwotnFoc0_vkIHhMJgvIo8LCQcErP6wYVPVYspn8SE |
| SE29 Use Case Specifications | DRAFT / NOT EXECUTED registry and detailed flows; https://docs.google.com/document/d/1p2hYcmkg8FTVLQ1sq4_dUSzZdiZYx87ZZKjzLrg5wJI |
| Opportunities report template | Structure and presentation reference only; https://docs.google.com/document/d/1ocL8y__X-PFdTV-AkE01A1yXNLklaGJ6Fip-x3LzYaY |
| Nielsen1994, updated2024 | Ten usability heuristics; https://www.nngroup.com/articles/ten-usability-heuristics/ |
| Moran and Gordon2023 | Heuristic evaluation method; https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/ |
| Nielsen1994 severity guidance | Inspection priorities; https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/ |
| Local implementation snapshot | codex/fix-ocr-nav-and-contrast, df5f36d2a8042d0effda48f90ba7bd49c4327447; source reading only in this authoring task. |
| Evidence limits | No lecturer feedback or participant results supplied. Report/design/source verification is distinct from browser, database, device, production and user acceptance. |
