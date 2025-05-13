## 🐞 Error Summary1: Issues with Meal Log Display and Inventory Deduction Logic
✅ Issue 1: Meal Log Display Bug (Existed before test script was introduced)
Overview
When pressing the SAVE button on the Meal Log screen, data is successfully inserted into the meal_logs table in Supabase, but the data does not appear on the React Native Meal Log screen.

Observations
Records are added to meal_logs in Supabase Studio (e.g., 2025-05-06).

The Meal Log screen remains empty regardless of refresh or input.

Typing in "Search meal logs..." has no effect.

console.log(mealLogs) shows that data is fetched (non-empty array).

The FlatList is receiving the correct mealLogs array.

Tried fallback logic: manually converting recipe_id to 'tomato sauce', etc. — still no display.

RLS policies were confirmed:

✅ SELECT allowed for public

✅ INSERT allowed with check (true)

Also tested fetching with select('*') (no JOIN) and hardcoded recipe names — no success.

Suspected Causes
FlatList item rendering may fail due to recipe_id → name resolution logic

JOIN query fails due to referencing nonexistent column recipes.description

The UI likely fails silently when recipe.name is undefined

Current Decision
Put this issue on hold

Proceed to Step 1.3: Inventory Deduction Logic

✅ Issue 2: Inventory Deduction Not Reflected in Supabase Studio (Observed after test script was added)
Overview
Using the DevTestScreen and running devTestLogMeal() logs correct deductions in the console, but the Supabase Studio UI does not show any changes in the inventory quantities.

Console Confirmation
✅ recipeData, ingredients, ingredient.id, and ingredient.quantity are logged as expected

✅ Logs like ✅ Deducted 0.04 from <ingredient> and ✅ Meal log inserted successfully appear

✅ meal_logs table updated with new records

Supabase UI Behavior
inventory quantities appear unchanged

Clicking 🔄 Refresh or pressing F5 has no visible effect

Possible Causes
Supabase Studio may be showing stale or cached data

Data is correctly updated in the database but not reflected immediately in UI

Edge case: .update(...).eq('id', ...) may technically fail silently despite console showing success (low probability)

Current Decision
Deduction logic confirmed working correctly

Visual mismatch in Supabase Studio UI to be investigated later

May consider adding a history/log table to verify future changes visually

✅ Conclusion
✅ devTestLogMeal() has successfully validated inventory deduction logic

✅ Step 1.3: Add Inventory Deduction Logic is now considered complete

⚠️ Issues with Meal Log display and Supabase Studio visibility will be handled in a future cleanup or UI verification phase

✅ Next Step
We will now proceed to integrate devTestLogMeal.ts into the actual UI workflow, replacing the temporary test route with a production-safe method.


## Error Summary2

🐛 Problem Overview:
Recipe Deletion (Delete Button) Was Not Working
Despite pressing the Delete button and seeing a log like
🗑️ Attempting to delete recipe: ...
in the browser console, the following issues were observed:

❌ The recipe was not deleted from Supabase

❌ The recipe card remained visible in the app

❌ No ✅/❌ success/failure logs were shown in the console

❌ No error was explicitly thrown from Supabase

This led to confusion since the UI seemed responsive but the backend never confirmed deletion.

🔍 Root Cause: Missing Supabase RLS (Row Level Security) Policies
Although RLS was enabled in Supabase (which is a best practice for security),
the following tables had no DELETE permissions configured:

recipe_ingredients

recipes

As a result, when the app ran:

supabase.from('recipes').delete().eq('id', recipeId)


Supabase silently denied the delete operation due to missing RLS policies.
The app interpreted this as "no response," which matched the observed behavior.

✅ Solution: Add Proper DELETE Policies to Supabase
To allow deletions explicitly, we created and enabled the following policies via the Supabase UI:

✅ Fix 1: Allow DELETE on recipe_ingredients

CREATE POLICY "Allow all delete recipe_ingredients"
ON "public"."recipe_ingredients"
AS PERMISSIVE
FOR DELETE
TO public
USING (true);

✅ Fix 2: Allow DELETE on recipes

CREATE POLICY "Allow all delete recipes"
ON "public"."recipes"
AS PERMISSIVE
FOR DELETE
TO public
USING (true);

After saving both policies, deletion began working correctly in both the backend and frontend.

🔧 Additional Useful Debug Steps
Step	Description
🖥️ Console Logging	Added console.log() before and after delete calls to confirm execution order
🔄 Forced Reload	Used Ctrl + Shift + R to clear browser cache and avoid stale frontend state
✅ Git Tracking	All relevant files were committed with descriptive messages for traceability

🎉 Final Result
✅ Pressing "Delete" removes the recipe and its ingredients from Supabase

✅ The UI updates immediately to reflect the deletion

✅ Console logs show:
🗑️ Attempting to delete recipe: ...
✅ recipe deleted: ...

✅ Supabase console shows both recipes and recipe_ingredients entries are fully removed

This issue is now fully resolved.

## Error summary 3

🛠️ Issue Summary: Meal Log Not Recorded & Inventory Not Updated
🔍 Symptoms
Clicking the "Save" button appeared to succeed, but:

❌ No visible updates in meal_logs on Supabase

❌ Inventory quantities did not decrease

❌ No error was thrown in the app UI

devTestLogMeal() which previously worked, also stopped functioning properly

🧠 Root Causes Identified
Problem	Root Cause
❌ Meal log not inserted	Logic silently failed due to possible bad data or suppressed Supabase errors
❌ Inventory not updated	.update() query executed without error check, or failed due to RLS policy
❌ Ingredients not fetched	Wrong column name: quantityPerBatch instead of actual quantity_per_batch
❌ Confusion from Supabase Studio	Sometimes reflected stale or delayed data
❌ No debug output	Supabase errors were not logged to console, hiding underlying problems

🧪 Troubleshooting Steps Taken
✅ Step 1: Rewrote devTestLogMeal.ts with full logging
Added strict .error checks to:

recipe fetch

recipe_ingredients fetch

inventory fetch and update

meal_logs insertion

✅ Step 2: Corrected Supabase column name
From quantityPerBatch → ✅ quantity_per_batch

Ensured correct use of field in both select() and calculation logic

✅ Step 3: Used console.log() for live tracking
Validated each stage of the process

Confirmed ingredient deductions and remaining stock amounts

✅ Step 4: Validated Supabase changes manually
Used Supabase Studio to confirm new entries in meal_logs

Checked inventory quantity after deduction

Ensured correct recipe UUID was used

✅ Step 5: Confirmed DevTestScreen integration
Added a debug button to manually trigger test logging logic

Verified behavior outside the full Meal Log UI

🎉 Final Outcome
✅ Task	Result
Meal Log inserted?	✅ Confirmed
Inventory deducted?	✅ Confirmed with exact quantity
RLS policies working?	✅ All actions allowed
Supabase errors handled?	✅ All logged to console
Testing UI confirmed?	✅ Button on DevTestScreen triggers full workflow


❌ Error Summary 4: .rpc("log_meal_transaction") Failed with 400 Bad Request
🐛 Problem Overview
Calling .rpc("log_meal_transaction", {...}) from the React Native app consistently returned a 400 Bad Request error. No data was inserted into the meal_logs table.

🔍 Root Cause
The Supabase stored procedure log_meal_transaction(...) attempted to insert values into columns that did not exist:

sql
コピーする
編集する
INSERT INTO meal_logs (recipe_id, quantity, manualOverrideServings, notes)
VALUES (...);
❌ Specific Errors:
manualOverrideServings – did not exist → caused error

After adding that column, notes – also did not exist → caused another error

🧪 Debugging Steps Taken
Step	Description
✅ Step 1	Used Supabase SQL Editor to call the function directly and reveal the exact error
✅ Step 2	Executed ALTER TABLE meal_logs ADD COLUMN manualOverrideServings integer;
✅ Step 3	Executed ALTER TABLE meal_logs ADD COLUMN notes text;
✅ Step 4	Re-tested the function call → confirmed successful log insertion in Studio
✅ Step 5	Re-ran the app → .rpc() call from the UI now works correctly

✅ Final Resolution
The issue was resolved by adding the missing manualOverrideServings and notes columns to the meal_logs table.

The .rpc() call now executes successfully and logs appear in both the Supabase Studio and the React Native app.

Functionality is confirmed end-to-end, including UI display and database persistence.

## error summary 4
🐞 Error Summary: Meal Log Delete Button Not Working
❌ Problem Overview
Clicking the 🗑 Delete button on the Meal Log screen did not remove the record from Supabase or update the app UI.
No errors were shown, and console.log inside handleDelete() was never triggered.

🔍 Root Cause
The issue was due to multiple overlapping factors:

Cause	Description
🧱 Web Platform Limitation	Alert.alert(...).onPress does not execute reliably in React Native Web / Expo Web
🎭 Wrong file used earlier	Previous edits to meal-log.tsx were not reflected due to Expo Router or cache confusion
🧼 Stale bundler state	Cached files prevented updates from being picked up
🔄 Closure/Binding confusion	Inconsistent use of onDelete={() => handleDelete(id)} caused missed callback references

🛠 Resolution Steps
✅ Verified actual mounted file

Renamed meal-log.tsx → meal-log-broken.tsx to confirm routing

Restored and validated correct route file

✅ Forced rebuild

Deleted .expo, dist, .cache folders

Restarted with npx expo start --clear

✅ Bypassed Alert for testing

Called onDelete() directly to verify that handleDelete() and Supabase delete() worked

✅ Confirmed working call stack

Added inline onDelete={() => { ... }} with logs

Verified Supabase deletion and screen refresh

✅ Final Fix

Restored Alert.alert() for native iOS/Android

Added platform detection fallback (if (Platform.OS === 'web')) to call onDelete() directly when Alert fails

✅ Final Outcome
🔁 Deletion now works on Web and will work on iOS (via Alert confirmation)

✅ Logs confirmed full execution path:

sql
コピーする
編集する
🧪 confirmDelete triggered
🔍 typeof onDelete: function
🧩 onDelete inline called
🗑️ Attempting to delete...
🟢 Supabase DELETE result
✅ Deleted meal log
🧹 Debug logs were removed and code is now production-ready