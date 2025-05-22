✅ PHASE 1 (UPDATED): Inventory Logic Foundation
🎯 GOAL: Build, test, and confirm that inventory is correctly updated based on recipe batches and meal logs (not per serving).
🔹 Step 1.1: Confirm Supabase Schema & Data
Ensure the following Supabase tables are correctly set up:

Table	Purpose
inventory	Tracks current stock of ingredients
recipes	Stores recipes and their total batch ingredient usage
meal_logs	Records each meal batch logged, with recipe ID & quantity

🛠️ Key Change:
Recipes now store ingredient quantities per total batch, not per serving.

🔹 Step 1.2: Seed Initial Test Data
To validate logic before full feature build:

1. Add Inventory Items:
Tomato: 2.0 kg

Onion: 1.0 kg

2. Create a Sample Recipe:
Recipe: Tomato Sauce

Quantity per 1 batch:

Tomato → 0.5 kg

Onion → 0.3 kg

3. Simulate Logging a Prep Event:
Prep 2 batches of Tomato Sauce

4. Expected Ingredient Deduction:
Tomato: 2 × 0.5 = 1.0 kg used → 1.0 kg remaining

Onion: 2 × 0.3 = 0.6 kg used → 0.4 kg remaining

✅ Use this to confirm correct deduction before building full UI.

🔹 Step 1.3: Add Inventory Deduction Logic (Core Function)
When logging a meal batch:

for (ingredient of recipe.ingredients) {
  const totalUsed = ingredient.quantityPerBatch * batchQuantity;
  deductFromInventory(ingredient.id, totalUsed);
}
addToMealLog(recipe.id, batchQuantity);

Optional: Wrap this in a Supabase transaction for consistency and rollback safety.

🔹 Step 1.4: Create Dev/Test Mode or Hidden Entry Point
Add a temporary dev-only function or button that:

Selects a recipe

Inputs a batch quantity (e.g., 2)

Runs the logMeal() logic above

✅ Add simple success/fail output like:
✅ Logged 2 batches of Tomato Sauce. Inventory updated.
❌ Not enough Tomato in stock.
This allows isolated testing before full UI is wired up.

⚠️ Remaining Known Issues (For Later)

Meal Log UI: Items don’t render despite correct data. Likely a rendering or lookup logic issue (e.g., recipe_id → name).

Supabase Studio caching: Delayed visual reflection of inventory changes.

These aren’t blockers for the current dev milestone and can be deferred.

🔹 Step 1.5: Visual Validation in Supabase
After test entry:

View inventory table → confirm correct deduction

View meal_logs table → confirm log entry added

If any errors (e.g., insufficient stock), handle them gracefully

🟡 Final Verdict for Step 1.5:
Functionally completed — all logic, deduction, and logging work as expected.

Visually partially incomplete — due to Supabase Studio not showing updated inventory in real-time. This seems to be a display issue, not a logic error.

🧪 Completion Criteria (Batch-Based)
✅	Task
✅	Can log a meal using number of batches
✅	Inventory deducts correctly (batch × ingredient amount)
✅	Recipe ingredients are tied by total batch, not per serving
✅	All updates are reflected in Supabase tables


✅ Phase 2: Recipe Creation & Batch Model Integration (Completed Tasks + Future Enhancements)
🔹 Step 2.1: Create/Add Recipe UI (recipes.tsx)
Functionality: Add a ＋ button to open a modal (RecipeFormModal) for recipe creation.

Fields:

[ Recipe Name: _________ ]

[ Category: ▼ Sauce ] + Create New

[ Ingredient: ▼ Tomato ] ← pulled from inventory

[ Quantity per Batch: _______ kg ]

[ + Add Another Ingredient ]

[ Save Recipe ]

✅ Quantities represent total used per batch, not per serving.

🔹 Step 2.2: Store in Supabase on Save
Recipes stored in recipes table:

id, name, category, created_at

Ingredient links stored in recipe_ingredients table:

recipe_id, ingredient_id, quantity_per_batch, unit

✅ Works as foundation for prep tracking & inventory deduction logic.

🔹 Step 2.3: Implement "Create New Category"
✅ User can tap + Create New Category

✅ Input shown, new category saved to recipe_categories

✅ Smooth UI; no screen transitions

🔹 Step 2.4: Edit & Delete Recipes
✅ [Edit] opens modal with pre-filled values

✅ [Delete] removes recipe + ingredients after confirmation

✅ Supabase policies allow all necessary operations

📌 Upcoming:

 In Edit mode: allow users to remove ingredients from a recipe

 Allow editing ingredient quantities and updating batch definitions

🔹 Step 2.5: Validate Data and Links
✅ All created recipes fetch linked ingredients correctly

✅ Ingredient references resolve against inventory

✅ Quantities follow batch-model deduction structure

🧪 Test Case:

Create "Tomato Sauce" → Confirm ingredient link

Edit: Change Tomato quantity → Save → Confirm update

Delete → Confirm full removal from Supabase and UI

🔹 Step 2.6: Visual Ingredient Preview (Recommended)
✅ Each recipe card already shows:

name, category

Ingredients: list with name + quantity/unit

📌 Enhancement idea:

Add icon indicators, color labels, or badges for clarity

Consider collapsing long ingredient lists with "Show more"

✅ Completion Criteria for Phase 2
Requirement	Status
Create recipes with batch-based quantities	✅
Edit/delete recipes including ingredient links	✅
Store total batch ingredient quantities	✅
Recipes link to inventory ingredients	✅
UI is responsive, clean, and consistent	✅



✅ PHASE 3 (UPDATED): Meal Log UI & Logging System Finalization
🎯 GOAL: Complete the process of logging recipe batches, which deduct ingredients from inventory and store the result in meal_logs.
This completes the full inventory-prep-tracking loop.

🔹 Step 3.1: Build or Enhance the Meal Log Input UI
In meal-log.tsx, connect AddMealLogModal to the new batch-based logic.

🆕 Updated Modal Input Fields:

[ Recipe ▼ ]               ← Select from recipes
[ Number of Batches ]      ← Quantity to log (e.g., 2)
[ Optional Comment ]       ← Notes, e.g., “Used smaller tomatoes today.”
[ Log Meal ]               ← Executes inventory deduction

🛠️ Terminology should now reflect “batches” throughout the UI.

🔹 Step 3.2: Write logMeal() Function (Batch-Based Core Logic)
When the user taps "Log Meal":

Fetch recipe’s ingredients and batch-level quantities

Multiply by the number of batches

Deduct each ingredient from inventory

Create a meal_logs record

🧪 Updated Pseudocode:
for (ingredient of recipe.ingredients) {
  const used = ingredient.quantityPerBatch * batchCount;
  deductFromInventory(ingredient.id, used);
}
addToMealLog(recipe.id, batchCount, comment);

✅ Optional: Wrap this logic in a Supabase transaction for atomic updates.

🔹 Step 3.3: Handle Edge Cases
❌ Not enough inventory: show error/snackbar like
“Not enough Tomato in stock for 2 batches.”

⚠️ Missing recipe: block submission with alert

✅ Success:
“✅ Logged 2 batches of Tomato Sauce. Inventory updated.”

🔹 Step 3.4: Display Past Logs in FlatList
Already implemented in meal-log.tsx. Just ensure it refreshes after new log.

Date         | Recipe         | Batches
------------ |----------------|---------
2024-05-01   | Tomato Sauce   | 2
2024-04-30   | Fried Rice     | 3

✅ Allow filtering/search by recipe or date if needed.

Step 3.5: Manual Override Field (Updated)
Allow the user to optionally override the batch count, in case actual prep output differs from the planned quantity:

[ Manual Override: ____ batches ]

✅ This field allows flexibility when:

The kitchen prepares more or fewer batches than planned

Staff wants to record actual prep for traceability

🧠 You can log both:

planned_batches

actual_batches (from override, if provided)

This helps improve future batch prediction logic over time.

✅ PHASE 4 (UPDATED): Prep Sheet Modification
🎯 GOAL: Convert Prep Sheet from ingredient-based to recipe-based batch tasks, support batch-based logging, and allow real-time inventory deduction using [Done] buttons.
This phase transforms your app into a usable daily kitchen operations tool.

🔹 Step 4.1: Switch to Recipe-Based Tasks
Replace each ingredient line with a recipe-based task, where each task represents 1 or more prep batches of a recipe.

Updated Task Fields:

[ Recipe Name ]      → e.g., Tomato Sauce  
[ Batch Quantity ]   → e.g., 2  
[ Total Ingredient Amount Required ] → e.g., 6 kg  
[ Estimated Time ]   → e.g., 20 min

✅ This makes the task intuitive and matches how real kitchens work — by prepping in batches.

🔹 Step 4.2: Add [Done] and [Not Done] Buttons
✅ If "Done" is pressed:

Deduct ingredient quantities per batch × prep quantity

Log a new entry in meal_logs (e.g., 2 batches of Tomato Sauce)

❌ If "Not Done" is pressed:

No deduction

No meal log entry

Task remains and rolls over to the next day

✅ This supports partial completion and flexible prep workflows.

🔹  [⚠️⚠️⚠️Remaining task] Merge Meal Logs on Same Date (Optional)
Instead of saving every log as a new row:

Check if there is an existing meal_logs entry for the same recipe + date

✅ If it exists → Update the quantity by adding the new batch count

❌ If it does not exist → Insert a new log as usual

✅ This keeps the database clean and avoids cluttering meal_logs with redundant entries for the same day.

You may keep Supabase logs separate and group in the UI (current implementation) until you're ready to enable this.


🔹 Step 4.3: Add Comment Box at the Top
One shared comment box across the entire day’s prep sheet:

📝 Comment: [ Tomatoes arrived late. Use older batch first. ]


✅ Comment is:

Editable by kitchen staff

Auto-copied from the previous day unless changed

Stored in a prep_notes table keyed by date

🔹 Step 4.4: Implement Tap-to-Open Detail Screen
When tapping a recipe task, open a detailed view with:

[ Tomato Sauce – Detail ]
Description: Italian base for pasta

✅ Stock Sufficient

Ingredients Required per Batch:
- Tomato: 0.5 kg
- Onion: 0.3 kg

[ Prep Quantity: [ 2 ▼ ]  ]  ← Number of batches

[ Confirm ]

✅ You’ll reuse logic from the Prep Guide (Prep Suggestion) section to:

Pre-fill prep quantity using weekday-based 3-week average

Check if inventory is sufficient or low

🧠 No need to rebuild logic — just plug it into this UI flow.

🧪 Completion Criteria for Phase 4 (Batch Model)
✅	Requirement
✅	Tasks are recipe-based, not ingredient-based
✅	Tasks show batch count + estimated time + total quantity required
✅	“Done” deducts inventory and logs the batch to meal_logs
✅	“Not Done” defers task to next day
✅	Comment field syncs with previous day’s entry
✅	Tapping a task opens a recipe detail view with batch logic
✅	Prep quantity is editable and defaults to smart batch prediction


✅ PHASE 5 (REVISED): Unified Prep Sheet with Smart Suggestions Based on Meal Logs
🎯 GOAL: Fully integrate Prep Suggestion logic into the Prep Sheet using 3-week weekday-based averages minus currently available prep stock (from meal_logs).

🔹 Step 5.1: Modify Smart Batch Suggestion Logic
Update the batch suggestion function to calculate:

🧠 Suggested Prep Quantity =
ts
コピーする
編集する
averageOfLast3WeekdayLogs(recipe_id, weekday)
- totalRecentAvailableBatches(recipe_id)
Where:

averageOfLast3WeekdayLogs = Average of the last 3 logs on the same weekday from meal_logs

totalRecentAvailableBatches = Sum of recent (e.g., last 3 days) quantity or actual_batches in meal_logs

Clamp to 0 if result is negative.

✅ Use actual_batches if provided, otherwise fallback to quantity.

🔹 Step 5.2: Implement getSmartSuggestedBatch() Utility
In prepSuggestionUtils.ts, implement a helper like:

ts
コピーする
編集する
export async function getSmartSuggestedBatch(recipeId: string, weekday: number) {
  const avg = await getWeekdayAverage(recipeId, weekday);
  const remaining = await getRecentAvailableStock(recipeId);
  return Math.max(0, Math.floor(avg - remaining));
}
Also implement:

getWeekdayAverage(recipeId, weekday)

getRecentAvailableStock(recipeId)

✅ Query meal_logs directly using Supabase client.

🔹 Step 5.3: Inject Suggestions into Prep Sheet Modal
In RecipePrepDetailModal.tsx:

On open, fetch smart batch suggestion via getSmartSuggestedBatch()

Autofill the Prep Quantity field with this value

Add note like:

“Suggested: 3 (based on recent usage minus 1 in stock)”

✅ Still allow user to override the value manually

🔹 Step 5.4: Cleanup the Prep Sheet UI
✅ Remove old inline quantity fields and ingredient expanders

✅ Each task = 1 recipe card with:

Recipe name

Batch quantity (smart-filled)

Estimated time

Buttons: [Done] / [Not Done]

🔹 Step 5.5: Wire Up Action Buttons
[Done]:

Deduct ingredients based on recipe × batch count

Add a new meal_logs record with actual_batches

Show confirmation snackbar

[Not Done]:

Do not log or deduct

Keep task for tomorrow

🔹 Step 5.6: Shared Daily Comment Field
One text field at top of Prep Sheet

Auto-filled from yesterday’s prep_notes

Editable and saved on change

✅ Store to prep_notes using today’s date

🔹 Step 5.7: Retire Prep Guide Tab
✅ Delete prep-suggestions.tsx from app/(tabs)/

✅ Remove its route in _layout.tsx

✅ Keep prepSuggestionUtils.ts and reuse internally

✅ Completion Checklist
Feature	Status
Prep Sheet uses recipe-based tasks	🔄 To do
Smart batch suggestion based on weekday avg – stock aware	🔄 To do
Quantity field is auto-filled but editable	🔄 To do
[Done] deducts ingredients and logs to meal_logs	🔄 To do
[Not Done] skips deduction and defers task	🔄 To do
Comment box synced from previous day	🔄 To do
Prep Guide tab removed	🔄 To do

## Test Plan: Smart Prep Suggestion + Threshold Alert
✅ 1. Test: Past Weekday-Based Average Prep Calculation
📍 Goal:
Make sure the app:

Calculates the average quantity for the same recipe

Uses only the same weekday (e.g., past 3 Tuesdays)

Ignores logs outside of the 3-week window

Subtracts any recent batches from the last 3 days

🧪 Option A: Manual Test via Supabase Studio
Go to meal_logs

Manually add rows like this:

date	recipe_id	quantity
2025-05-06	tomato_id	2
2025-04-29	tomato_id	3
2025-04-22	tomato_id	2
2025-05-19	tomato_id	1
2025-05-19	tomato_id	1

Then open your app on a Tuesday, and confirm:

Suggested = average of 2, 3, 2 = 2.33 → 2
Remaining = 1 batch still in stock → Final suggestion = 1

🧪 Option B: App-Driven Test
Go to Prep Sheet

Press ✅ [Done] for the same recipe on 3 different Tuesdays

On the 4th Tuesday:

Clear completed tasks

Check if suggestion equals average of the 3 Tuesdays

Log 1 batch manually the day before

Recheck → suggestion should be average − 1

✅ 2. Test: Low Stock Threshold Alert
📍 Goal:
Show warning if stock is too low to prepare the suggested batch quantity

How to trigger:
Reduce ingredient quantity in inventory manually (e.g., Tomato = 0.5 kg)

Reload Prep Sheet

Tap into the detail modal

✅ You should see:

A shortage alert

Ingredient rows showing missing amount in ShortageAlert or necessaryPrepInfo

📦 Do You Need to Add Anything?
No — your logic already supports:

Same weekday filtering via getWeekday()

3-week window logic via date comparison

Stock check via calculateNecessaryPrepAmount()

You do not need to add any new functions.

✅ Confirmation Checklist
Feature	Status
Average from 3 past weekdays	✅ Already implemented in calculateSuggestedPrepQuantity()
3-day recent prep deduction	✅ Included in your delta logic
Ingredient shortage detection	✅ via checkIngredientShortages()
Threshold alert rendering in modal	✅ Already working in ShortageAlert


## ✅ Updated Phase 6 & 7 Plan: Inventory Intelligence via CSV + OCR
### ✅ PHASE 6: Smart Inventory Setup & Recipe Upload
🎯 GOAL:
Set up your kitchen system quickly with a mix of:

📄 CSV recipe upload for structured data

📷 Invoice image OCR for initial stock listing

✍️ Manual review only when needed

🔹 Step 6.1: CSV Import for Recipes & Ingredients
🧠 Purpose: Quickly upload dozens of recipes and ingredients from spreadsheets.

✅ Features:

📤 “Upload CSV” button on Recipe screen

📁 In-app file picker (web & mobile)

🔎 Parse fields like:

pgsql
コピーする
編集する
Recipe Name,Ingredient Name,Quantity,Unit,Category
Tomato Sauce,Tomato,1.0,kg,Sauce
Tomato Sauce,Onion,0.5,kg,Sauce
Fried Rice,Rice,2.0,kg,Main
🧪 Show preview before upload

📦 Insert into:

recipes

recipe_ingredients

inventory (only if new)

🔹 Step 6.2: Invoice OCR for Initial Ingredient Detection (Manual Mode)
🧠 Purpose: Use OCR to scan printed invoices and auto-fill ingredient names and quantities for manual confirmation.

✅ Flow:

📷 1. User uploads or takes photo of invoice

🧠 OCR extracts lines like:

nginx
コピーする
編集する
Tomato 2.0 kg
Onion 1.5 kg
Garlic 0.5 kg



📝 2. App displays editable review table:

Ingredient	Quantity	Unit	Status
Tomato	2.0	kg	✅ Tracked
Onion	1.5	kg	✅ Tracked
Garlic	0.5	kg	🆕 New Item

Quantity/unit auto-filled from OCR

Manual adjustment allowed


🧾 3. User confirms → inventory is updated

🔀 Existing items: quantity added or replaced (toggle optional)
🆕 New items: created in inventory

🔹 Step 6.3 (Optional): CSV Inventory Upload for Seed Data
Low priority unless supplier provides spreadsheets.

✅ Example:

kotlin
コピーする
編集する
Ingredient Name,Quantity,Unit
Tomato,10,kg
Onion,5,kg
Garlic,2,kg
✅ Phase 6 Completion Criteria
Requirement	Success When...
CSV of recipes and ingredients parsed	Data shows in Supabase and app UI
Invoice OCR extracts ingredient rows	UI displays parsed item list
Tracked vs. new detection	Items are labeled accordingly
Manual editing enabled	User can adjust quantities/units
Confirmed inventory updates DB	Supabase inventory reflects the change

## 🔧 🔑 DEPENDENCY (Before Phase 7):
✅ Implement Tesseract OCR (Starter Setup)
→ Image → Raw text → List of items with quantity/unit
→ Build parser to structure output

## 🔷 PHASE 7: Fully Automated Restocking via Invoice OCR
🎯 GOAL:
Eliminate manual entry by scanning invoices and immediately updating stock — no confirmations.

🔹 Step 7.1: Invoice Image Upload + OCR (Auto Mode)
✅ Features:

📷 “Scan Invoice” button on Inventory or Restock screen

Accept JPG, PNG, or PDF

OCR reads rows like:

nginx
コピーする
編集する
Tomato 3.0 kg  
Onion 1.5 kg  
Garlic 0.8 kg
🔹 Step 7.2: Inventory Auto-Match & Instant Update
✅ Logic:

🔍 Check if ingredient exists in inventory

✅ If yes → add quantity

🆕 If not → auto-create item or flag for review

❌ No confirmation screen

📦 Example:

Before Scan:

nginx
コピーする
編集する
Tomato → 2.0 kg
Onion  → 1.0 kg
Invoice OCR:

nginx
コピーする
編集する
Tomato 3.0 kg
Onion  1.5 kg
After Update:

nginx
コピーする
編集する
Tomato → 5.0 kg
Onion  → 2.5 kg
🔹 Step 7.3: Show Feedback + Optional Audit Log
✅ After update:

Show toast: ✅ “3 ingredients updated”

Optional: log to restock_logs:

Ingredient

Amount added

Timestamp

OCR source (image name or upload ID)

✅ Phase 7 Completion Criteria
Requirement	Success When...
Scan button available	Image input works in mobile app
OCR reads structured invoice rows	Item list generated with quantities
Inventory updated instantly	No user action needed post-scan
Confirmation message shown	Toast/snackbar says what changed
Restock event optionally logged	Stored in restock_logs (optional)

✅ 📌 Outcome After Phase 6 & 7
Benefit	Result
🚀 Speed	No more manual entry after delivery
🔄 Automation	System understands & syncs physical stock
📷 Mobile Workflow	Scan and stock from iPhone on delivery day
🔒 Traceability	Optional logs ensure audit + 


## some necessary modifications

-csv reader is for web at this moment but need to change for ios and mobile




-prep sheet/estimated time will be modified in a modal screen.


-visual improvement


-web 対応→IOS対応に変更


🔁 過去入力からの自動サジェスト機能
　例: “Garie” のような新語に対し、「Garlicですか？」と自動で候補を表示(inventory section)



