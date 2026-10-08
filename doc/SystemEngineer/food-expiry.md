[S0] Context confidence: **High for a food-expiry / household food-management app. Medium if you actually mean a generic expiry tracker for medicine, cosmetics, documents, warranties, etc.** Those domains should not be mixed casually because “expired” means very different things for food quality, food safety, medicine efficacy, and administrative deadlines.

I read the **entire 11-page Canva presentation**. I have not modified it.

## [S1] Problem

The current Canva is not yet a user-persona study. It is a **marketing-persona template**.

The deck currently contains:

|Slide|Current content|Assessment|
|---|---|---|
|1|“User Persona Insight”, generic communication subtitle|Template|
|2|Pragmatic Professional / Curious Explorer / Family Planner|Generic segmentation|
|3|Pragmatic Professional: 28–40, career-focused, efficiency-driven|Generic|
|4|“Too many options”, “distrust marketing”|Not related to expiry management|
|5|Curious Explorer: 18–25, adventurous/social/tech-driven|Generic|
|6|Short attention span, authenticity + Lorem ipsum|Incomplete|
|7|Family Planner: 30–45, safety/value + Lorem ipsum|Partially relevant, incomplete|
|8|Tone & Messaging Strategy|Marketing-oriented rather than product UX|
|9|Strategic Takeaway + Lorem ipsum|Placeholder|
|10|Brand connection/conversion + Lorem ipsum|Marketing objective|
|11|Generic thank-you|Template|

So the first change should **not** be “fill three persona cards with nicer text.”

The first change is to define the product problem correctly.

### Weak problem definition

> Users forget expiration dates, so we need an app that reminds them.

That immediately assumes that reminders are the solution.

### Better problem definition

> People managing food at home often lose visibility of what they own, when it should be used, what the printed date actually means, and what action to take before the item becomes waste. Existing memory-based routines break down because physical inventory changes continuously while the information is distributed across packaging, fridge/freezer/pantry locations, and household members.

The app therefore has four jobs:

**capture → understand → prioritise → act**

Not merely “notify”.

The evidence supports this distinction. FDA states that confusion over food date labels accounts for an estimated **20% of consumer food waste** in the US. USDA also warns that many printed dates concern quality rather than safety, with important exceptions. [U.S. Food and Drug Administration](https://www.fda.gov/food/consumers/how-cut-food-waste-and-maintain-food-safety?utm_source=chatgpt.com)

A survey of 1,029 US adults found that **84% reported discarding food near the package date at least occasionally**, with younger adults reporting this behaviour more frequently. [PubMed](https://pubmed.ncbi.nlm.nih.gov/30770169/?utm_source=chatgpt.com)

More importantly for your persona work, a 2025 European Commission study using responses from **over 25,000 consumers across all 27 EU member states** independently found **three distinct behavioural segments**, and all three showed poor understanding of date marking. [food.ec.europa.eu](https://food.ec.europa.eu/food-safety/food-waste/eu-actions-against-food-waste/date-marking-and-food-waste-prevention_en?utm_source=chatgpt.com)

That gives us a much stronger foundation for your “3 people”.

---

## [S2] Definitions

**User Persona**  
= a research-based representation of a meaningful user behaviour pattern.

Its job is not to describe “a 22-year-old who likes TikTok.” Its job is to answer:

> Why does this kind of person behave differently inside our system?

**Behavioural segmentation**  
= separating people according to behaviours, motivation, ability and context rather than merely demographics.

For this product, that distinction matters because a 22-year-old and a 42-year-old can have the same expiry-management behaviour.

**JTBD, Job To Be Done**  
= the progress the person is trying to make in a situation.

Example:

> “When I unpack groceries, help me know what needs attention first without making me manually maintain another database.”

**POV statement**  
= User + Need + Insight.

Example:

> A busy shopper needs a nearly effortless way to know what food must be used first because maintaining an accurate inventory is itself work, and once the inventory becomes stale the reminders become useless.

That is substantially more useful than “values efficiency.”

---

# [S3] Current system flow

This is the actual system your app is entering:

![[mermaid-diagram.png]]

The critical state problem is here:

```
REAL PHYSICAL INVENTORY
        ↓
purchase / consume / open / freeze / move / discard
        ↓
changes continuously

while

DIGITAL APP INVENTORY
        ↓
only changes when somebody updates it
```

So the fundamental system question is:

> How do we keep the digital state close enough to physical reality without asking the user to become a warehouse employee every time they buy yogurt?

That is one of the main product risks.

### Single source of truth

There isn't naturally one.

The physical kitchen is the true state.

Your app contains only a **representation** of that state.

Therefore:

```
Capture friction ↑
       ↓
Missed updates ↑
       ↓
Digital inventory accuracy ↓
       ↓
Reminder relevance ↓
       ↓
Trust ↓
       ↓
App usage ↓
       ↓
Inventory accuracy ↓ again
```

That is a nasty feedback loop.

---

# [S4] Root cause

The problem is deeper than “forgetfulness”.

```
SYMPTOM
Food expires unnoticed / edible food gets discarded
        ↓
IMMEDIATE CAUSE
People don't see or remember the right item at the right time
        ↓
SYSTEM CAUSE
Inventory information is fragmented and expiry semantics are unclear
        ↓
DEEPER CAUSE
Tracking physical inventory creates cognitive + data-entry cost
        ↓
ROOT CAUSE
The value of expiry tracking is delayed,
while the effort of maintaining the tracker is immediate
```

There are actually four root mechanisms.

### 4.1 Visibility problem

Food can physically exist but be mentally absent.

FDA itself recommends checking the fridge regularly and creating a designated area for food that needs to be used soon, essentially a physical visibility intervention. [U.S. Food and Drug Administration](https://www.fda.gov/food/consumers/tips-reduce-food-waste?utm_source=chatgpt.com)

The European Commission report also cites interventions that make at-risk food more visible, such as a designated basket or tracking board. [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)

So:

> Expiry is partly an information problem, but also an attention problem.

### 4.2 Semantic problem

People do not consistently understand:

```
best before
use by
sell by
expiry
```

And the semantics differ by jurisdiction.

USDA says many common food dates primarily indicate quality, not safety, with exceptions such as infant formula. [Food Safety and Inspection Service](https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/food-product-dating?utm_source=chatgpt.com)

EU research likewise identifies misunderstanding of “use by” versus “best before” as a contributor to household food waste. [Food Safety](https://food.ec.europa.eu/food-safety/food-waste/eu-actions-against-food-waste/date-marking-and-food-waste-prevention_en?utm_source=chatgpt.com)

Therefore your app should not reduce everything to:

> “Expired = bad.”

That UX would actually reinforce part of the problem.

### 4.3 State-capture problem

Scanning a normal barcode does **not** magically solve expiry capture.

GS1 states that UPC-A/EAN-13 can only encode a GTIN/product identifier. More advanced GS1 formats such as GS1 DataMatrix, GS1 DataBar, GS1-128 and GS1 QR can encode additional information including expiry dates. AI `(17)` represents an expiry/use-by date and AI `(15)` represents best-before. [GS1 GO Customer Service Portal](https://support.gs1.org/support/solutions/articles/43000734173-why-should-i-use-the-gs1-application-identifiers-in-a-barcode-?utm_source=chatgpt.com)

So your input architecture may eventually need:

```
EAN/UPC barcode
→ identify product
→ expiry still needs OCR / user entry / estimation

GS1 2D barcode with AI 17
→ product + actual expiry can potentially be extracted

Printed date
→ OCR + human confirmation

Fresh produce
→ no printed expiry
→ estimated shelf life + storage context
```

That changes the UX quite a lot.

### 4.4 Intention-behaviour gap

This is especially interesting.

A 2026 study of **642 households in Ho Chi Minh City** found that intention to reduce food waste did not significantly translate into lower actual waste. Cooking ability and understanding household food preferences were stronger predictors. [Springer](https://link.springer.com/article/10.1007/s10163-026-02516-4)

In other words:

```
"I don't want to waste food"
≠
"I successfully avoid wasting food"
```

So your app cannot merely make people care.

It must make the desired action easier at the relevant moment.

---

# [S5] Evidence / docs

This is the evidence hierarchy I would use for the project.

|Finding|Classification|Evidence|
|---|---|---|
|Current Canva personas are generic marketing archetypes|**[A] Source evidence**|Your Canva slides 1–11|
|All three researched consumer segments showed poor date-label understanding|**[B] Research / official EC study**|>25k EU consumers [food.ec.europa.eu](https://food.ec.europa.eu/food-safety/food-waste/eu-actions-against-food-waste/date-marking-and-food-waste-prevention_en?utm_source=chatgpt.com)|
|FDA estimates date-label confusion contributes ~20% of consumer food waste|**[B] Official**|FDA [U.S. Food and Drug Administration](https://www.fda.gov/food/consumers/how-cut-food-waste-and-maintain-food-safety?utm_source=chatgpt.com)|
|84% of surveyed US consumers reported discarding near date at least sometimes|**[B] Research**|n=1,029 [PubMed](https://pubmed.ncbi.nlm.nih.gov/30770169/?utm_source=chatgpt.com)|
|Younger people appear disproportionately in the EU “unconcerned” segment|**[B] Research**|EU segmentation [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)|
|Motivation alone is insufficient|**[B] Research**|HCMC n=642 [Springer](https://link.springer.com/article/10.1007/s10163-026-02516-4)|
|A low-friction capture mechanism is likely central to retention|**[C] Inference**|Derived from state-maintenance problem + competitor designs|
|Barcode-only automatic expiry detection cannot universally work|**[B] Standard**|GS1 [ref.gs1.org](https://ref.gs1.org/guidelines/2d-in-retail/?utm_source=chatgpt.com)|
|App should focus on “what should I do now?” rather than only “what expires?”|**[D] Recommendation**|Synthesised from evidence above|

Current products also converge around inventory, expiry alerts and quick capture. NoWaste offers fridge/freezer/pantry inventory plus barcode/photo recognition; KitchenPal combines inventory, expiry alerts and household sharing. These product pages demonstrate the current solution space, not proof that those features actually reduce waste. [NoWaste](https://www.nowasteapp.com/?utm_source=chatgpt.com)

That distinction matters.

---

# [S6] Three personas

I would **replace your current three Canva archetypes**.

Do not use:

```
Pragmatic Professional
Curious Explorer
Family Planner
```

Use behavioural categories first:

||Persona 1|Persona 2|Persona 3|
|---|---|---|---|
|Archetype|**Cost-Driven Pragmatist**|**Convenience-First Forgetter**|**Safety-Conscious Household Manager**|
|Research analogue|Pragmatic|Unconcerned|Aware|
|Primary driver|Money + practicality|Convenience|Safety + responsibility|
|Waste behaviour|Occasional|Highest risk|Low/moderate|
|Date behaviour|Checks irregularly, trusts senses|Low engagement, often reacts after date passes|Frequently checks labels|
|Main barrier|Effort|Low motivation + attention|Uncertainty|
|App value|Save money/time|Remove thinking|Confidence/control|

Now turn those into actual people.

---

## Persona 1: Minh, The Cost-Driven Pragmatist

**Age is secondary**, but for the presentation you can make him around 28–35.

Situation:

> Works full-time, shops a few times per week, cooks when convenient, wants to save money but has no desire to maintain an elaborate pantry database.

The EU pragmatic segment represented **44% of its sample**. This group reported relatively low/moderate food waste, was strongly influenced by costs and taste, checked date labels less than the aware group and relied strongly on sensory judgement. [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)

### Goal

```
Spend less
+
avoid accidentally throwing away food
+
do not spend extra time managing food
```

### Pain

The real pain is not:

> “Too many options.”

Your Canva currently says that, but it has nothing to do with this product.

His real pain is:

> “I already bought this. I just forgot I had it until it was too late.”

And:

> “I don't want to type product name, quantity, category, location and date every time I shop.”

### Behaviour

```
buys food
→ puts it away
→ remembers the obvious items
→ loses visibility of older items
→ discovers them while searching for something else
```

### POV

> Minh needs a low-effort way to know which food should be used next because the money-saving benefit of tracking disappears if maintaining the tracker itself takes too much time.

### Job story

> When I am deciding what to eat or buy, I want to immediately see what I already have and what needs using first, so I do not spend money twice and throw the older item away later.

### Product implications

The important things are:

```
fast capture
expiry-first sorting
money saved / waste avoided
simple "use soon" list
few interactions
```

Not gamification. Not environmental lectures. Not 19 graphs about his carrot lifecycle.

---

## Persona 2: An, The Convenience-First Forgetter

Around 18–25 works well as a presentation example, but age is again not the defining feature.

The EU “unconcerned” segment represented about **40% of respondents**, had the highest reported waste frequency, and was disproportionately younger and more often single. [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)

This maps surprisingly well to your current “Curious Explorer” slide, except almost everything currently written on that slide is irrelevant to the product.

### Situation

> Student or early-career worker. Eats irregularly, sometimes orders food, shares a fridge or has limited storage, buys based on immediate plans rather than inventory.

### Goal

She does **not** wake up thinking:

> “Today I shall reduce food waste.”

Her goal is closer to:

```
Give me food when I need it
+
don't make me organise my life
```

That matters enormously.

### Pain

> “I didn't even remember that was in the back of the fridge.”

> “If the app makes me enter every grocery manually, I'm not doing that.”

> “If it sends five notifications every day, I'm turning notifications off.”

### POV

> An needs expiry management to require almost no deliberate planning because food management is not important enough to compete successfully for her attention.

That is your insight.

Not:

> “Short attention span.”

That phrase in the existing Canva describes the person as defective.

A user-centric framing describes the **contextual competition for attention**.

Very different.

### Job story

> When food is genuinely at risk of being forgotten, I want one clear reminder that tells me what I can do now, so I can deal with it without planning ahead.

### Product implications

For her:

```
capture in seconds
        ↓
"Use today / Soon / Later"
        ↓
one grouped reminder
        ↓
Eat / Freeze / Dismiss / Used
```

Notice the notification contains an **action**, not merely information.

That is a better behavioural design.

Also, the EC report specifically warns about information overload and recommends keeping information lightweight for less-engaged users. [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)

---

## Persona 3: Lan, The Safety-Conscious Household Manager

Around 35–45 works for a fictional presentation character.

But again:

```
parent
≠
persona

responsibility for shared household food state
=
persona-relevant behaviour
```

The EU “aware” group checked labels significantly more frequently and showed strong concern for food safety, shelf life, health, ethics and environmental impact. Yet they could still waste food, illustrating the intention-behaviour gap. [Food Safety](https://food.ec.europa.eu/document/download/a2fbf718-3e45-4948-84eb-7ca7e55d27e5_en?filename=fw_eu_actions_dm_sante_waste-data-segmentation_report.pdf)

### Situation

> Manages food for several people. Different family members buy, open, move and consume items. Safety errors have higher perceived consequences because the decision affects others.

This is a different system from Minh's.

Minh has roughly:

```
1 user
→ 1 fridge
```

Lan has:

```
Person A buys milk
Person B opens it
Person C moves it
Child consumes half
Nobody updates anything
```

Lovely distributed systems engineering, except the nodes are relatives.

### Goal

```
keep family safe
+
reduce waste
+
know what the household already has
```

### Pain

Her main pain is uncertainty:

> “Is this actually unsafe, or just past best-before?”

> “When was this opened?”

> “Did somebody already use this?”

> “Why did we buy another one?”

### POV

> Lan needs a trustworthy shared view of food status and clear safety-versus-quality guidance because when information is uncertain she will rationally prioritise family safety over reducing waste.

That is a much stronger insight than:

> “Values safety, quality and peace of mind.”

### Job story

> When I am deciding whether to serve, keep, freeze or discard an item, I want to understand both its date and its actual storage/opening context so I can make a safe decision without automatically wasting it.

### Product implications

```
household sharing
opened-on state
location
quantity
expiry/date type
clear safety/quality explanation
action history
```

Potentially:

```
Best before
Quality may decline

Use by
Safety-sensitive date

Opened 3 days ago
Follow opened-storage guidance
```

But food-safety recommendations must use authoritative sources rather than AI guessing.

---

# [S7] Recommendation

Your three personas should therefore be:

```
1. Cost-Driven Pragmatist
   "Help me save without creating work."

2. Convenience-First Forgetter
   "Make remembering almost automatic."

3. Safety-Conscious Household Manager
   "Help me make a trustworthy decision for my household."
```

These personas describe three fundamentally different reasons for using the same system.

Their common need is:

```
KNOW WHAT NEEDS ATTENTION
```

But their value propositions differ:

```
Pragmatist
→ MONEY / TIME

Forgetter
→ CONVENIENCE / ATTENTION

Household Manager
→ SAFETY / CONTROL
```

That gives you actual product segmentation.

---

# [S8] Implementation order for your Canva

I would keep the 11-slide visual template but completely change the information architecture:

```
Slide 1
Expiry Date App
User Research & Personas

Slide 2
Problem Definition
Why expiry management fails

Slide 3
Current User Journey
Purchase → Storage → Forget → Discover → Decide

Slide 4
Research Evidence
date confusion + intention/behaviour + 3 segments

Slide 5
Persona 1
Cost-Driven Pragmatist

Slide 6
Persona 2
Convenience-First Forgetter

Slide 7
Persona 3
Safety-Conscious Household Manager

Slide 8
Persona Comparison
Motivation / behaviour / barrier / need

Slide 9
Core User Needs
Visibility / low-friction capture / understanding / action

Slide 10
Product Opportunities
Capture → Prioritise → Explain → Act → Learn

Slide 11
Research Validation
What still has to be tested with real users
```

I would remove the current **Tone & Messaging Strategy**, “increase conversions”, “brand connection” sections from the persona research deck.

Those belong downstream.

Your current sequence is basically:

```
invent persona
→ choose messaging
→ sell product
```

For a user-centric product, it should be:

```
observe problem
→ identify behaviour
→ understand need
→ form persona
→ design intervention
→ test intervention
```

Much less glamorous, unfortunately. Much more useful.

---

# [S9] Risks / what still must be verified

The personas above are **research-backed proto-personas**, not yet validated personas for your exact product.

That distinction should appear in your assignment.

The biggest unanswered questions are:

```
How do your target users currently notice expiring food?

Which food categories are actually forgotten most often?

Do they read expiry dates when buying, storing, or only when eating?

How much manual input will they tolerate?

Would they scan:
barcode,
printed date,
receipt,
whole fridge,
or nothing?

When should a reminder happen?

What action do they actually take after a warning?

What makes them stop maintaining the inventory?

Do multiple people modify the same household inventory?
```

And one particularly important research question:

> **Is “expiry tracking” actually the user's problem, or is it merely one mechanism inside the larger problem of food visibility and household food management?**

The HCMC evidence is especially useful here because it shows that intention, planning and storage alone do not necessarily explain actual waste; capabilities such as cooking and understanding household preferences can matter more. [Springer](https://link.springer.com/article/10.1007/s10163-026-02516-4)

So I would define the project for now as:

> **A user-centred household food management app that helps people maintain visibility of food, understand date information, and take timely action before food becomes unnecessary waste, while minimising the effort required to keep digital inventory aligned with the real kitchen.**

That gives you a defensible problem statement first, three research-backed behavioural personas second, and only then a basis for deciding whether the MVP should be an “expiry tracker” at all.