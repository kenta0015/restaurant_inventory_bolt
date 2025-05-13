## 🍽️ Restaurant Inventory Bolt

A mobile-first inventory management app designed for small restaurants, food trucks, and prep-heavy kitchens.Built for speed, simplicity, and smart, suggestion-based planning, this app helps staff track ingredients, manage recipes, log prep activities, and keep inventory in sync — with minimal manual input.

Built with React Native + Expo Router, styled for clarity, and designed for easy tracking of stock levels without worrying about expiry dates.

## 📦 Project Structure

restaurant_inventory_bolt-main/
├── app/                 # Screens and routing
├── assets/              # App icons and images
├── components/          # Reusable UI components (InventoryItem, PrepTaskItem, etc.)
├── data/                # Dummy data for inventory, recipes, and tasks
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
├── utils/               # Utility functions
├── .bolt/               # Bolt build system configs
├── package.json         # Project settings and dependencies
├── tsconfig.json        # TypeScript settings
└── README.md            # Project overview (you are here)

## 🗌 Key Features

📟 Track Ingredients: View, add, and update stock in real time

🍱 Prep-Based Inventory Logic: Materials are deducted automatically based on prep quantity

📊 Prep-Sheet Mode: Suggest daily prep quantity based on past trends (weekday-based average)

⚠️ Smart Alerts: Combined low stock and physical check warnings

🧠 Suggestion-Based System: Offers prep quantity estimates, but leaves control in staff hands

✍️ Manual Adjustments: Override prep suggestions as needed📌 Prep Sheet Interface: Shows required amounts per ingredient per day, allows toggling "completed" state and quantity edits, then updates inventory with one tap

📲 Fast & Simple Input: Dropdowns, quick-add chips, and smart defaults

📱 Designed for Real Kitchens

✅ Large buttons and color-coded warnings✅ Minimal, mobile-first UI with tab navigation✅ Fast interactions, minimal typing✅ Templates for common recipes and prep sets




##Inventory Logic

📄 [Detailed Inventory Logic](./docs/inventory_logic.md)

##Superbase Summary
[See Supabase summary ](./SUPABASE_SUMMARY.md)

📊 Prep-Sheet Mode

Automatically suggests what to prepare each day using:

Past weekday-based average meals

Prep targets (e.g., “5 miso mayo bottles”)

Ingredient requirements per recipe

Current inventory comparison

💡 Example:“⚠️ Not enough miso to prepare 3 more bottles of miso mayo”

⚠️ Smart Alerts System

System automation isn’t perfect — this feature helps avoid surprises.
⚠️ Alert.alert() in the meal may not display on web (Expo Web or browser), but it works correctly(?? suspicious) on native devices (iOS/Android). Use console.warn() or a toast library for web fallback if needed.

♻️ Combines: Low Stock + Unverified Manual Check

🕒 checkThreshold: Warn if stock < X or last checked over Y days ago

👁️ Visual cues only → never blocks flow

📋 Recipe and Inventory Data Management Plan

🔹 Current Approach (Phase 1)To efficiently input recipe and inventory data:

Manual Batch Import via Supabase CSV

Prepare recipes or ingredient data in Excel or Google Sheets.

Export the sheet as a .csv file.

Use Supabase's built-in "Import CSV" function to quickly upload data into tables like recipes, ingredients, or meal_logs.

✅ This method minimizes manual data entry during the initial setup.

Invoice Management (Now):

Supplier invoices (paper, PDF, CSV) are manually checked.

Stock updates from supplier deliveries require physical checking and manual entry into the app.

🔹 Future Improvements (Phase 2)To make data handling faster and less manual:

CSV Import Feature for Recipes and Ingredients

Implement an in-app file uploader.

Allow users to upload .csv files directly from mobile or desktop.

Parse and automatically populate Supabase tables without opening the Supabase dashboard.

Supplier Invoice Parsing (Long-Term Goal)

Develop tools to extract data automatically from CSV or PDF invoices.

Auto-fill stock updates based on delivery quantities.

Reduce manual stock entry during restocking operations.

Optional Enhancements:

Barcode scanning feature to quickly identify ingredients during stock checks.

Quick "Restock Last" shortcut to refill common items with one tap.

Mobile-optimized batch stock update screen for faster manual updates when needed.

🏁 Key PhilosophyAutomate what can be automated. Simplify what must stay manual. Always prioritize speed and accuracy for kitchen operations.

🛠️ Technologies Used

Expo (SDK 52)

React Native (0.76)

Expo Router (4.0)

TypeScript (5.3)

Lucide React Native Icons

date-fns for date formatting

🧹 Cleaned Up (Recently Updated)

Removed all expiry date alerts.

Focus is now only on quantity management and low stock alerts.

Fully cleaned merge conflicts and improved codebase stability.

Updated and modernized Expo + dependencies.

Removed all @/ aliases and replaced them with relative imports for compatibility with Expo Web bundler

Fixed white screen issues in Expo Web by aligning paths and bundler expectations

📌 Notes

This app currently runs entirely with dummy data stored in /data/dummyData.ts.

Future versions can easily connect to a real backend (Firebase, Supabase, etc.)

Designed to be minimal and easy for small kitchen teams.

🚧 Note (May 2025): The app is temporarily running in Web mode (npx expo start --web) for testing purposes due to Expo Go limitations on iOS 16.7 (iPhone 8). Once development is complete, the target will be switched back to iOS mobile testing.

📄 License
This project is private for now.Feel free to use it as a base for your own kitchen inventory system.

✨ Enjoy managing your kitchen inventory smarter and faster!
