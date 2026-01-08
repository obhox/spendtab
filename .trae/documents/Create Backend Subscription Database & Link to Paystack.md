I have analyzed the current codebase and designed a solution to create a dedicated backend database for subscriptions, linked to users, with full Paystack integration.

### **Plan: Create Subscription Database & Integrate Paystack**

#### **1. Database Schema (SQL Migration)**
I will create a new table `subscriptions` in your Supabase database. This will serve as the source of truth for all subscription details.
- **Table**: `subscriptions`
- **Fields**:
  - `id` (Primary Key)
  - `user_id` (Linked to `auth.users`)
  - `status` (active, past_due, cancelled, etc.)
  - `plan_code`, `subscription_code`, `customer_code` (Paystack identifiers)
  - `amount`, `currency`
  - `current_period_start`, `next_payment_date`
  - `created_at`, `updated_at`

#### **2. Update TypeScript Definitions**
- **File**: `lib/supabase.ts`
- **Action**: Add the `subscriptions` table definition to the `Database` interface so TypeScript knows about the new structure.

#### **3. Update Paystack Webhook Handler**
- **File**: `app/api/payment/webhook/route.ts`
- **Action**: Modify the webhook to automatically insert or update records in the `subscriptions` table when Paystack sends events (like `charge.success` or `subscription.disable`).
- **Sync**: I will also ensure it updates `profiles.subscription_status` to keep your current frontend working seamlessly.

#### **4. Update Payment Success Handler**
- **File**: `app/api/payment/success/route.ts`
- **Action**: Ensure that when a user completes a payment on the frontend, the initial record is created in the `subscriptions` table immediately.

### **Outcome**
- You will have a dedicated **`subscriptions` table** in your database.
- New Paystack subscribers will be **automatically added** to this table.
- You can **manually edit** the `status` column in this table (e.g., set to 'active' or 'cancelled'), and your application can be updated to respect this change.
