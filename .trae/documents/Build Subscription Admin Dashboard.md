I will build a secure Admin Dashboard for managing subscriptions directly within your app.

### **1. Database Updates**
*   **Add Admin Role**: I will create a migration to add an `is_admin` column to the `profiles` table.
*   **Authorization**: This flag will allow specific users to access the admin interface.

### **2. Admin Interface (`/admin/subscriptions`)**
*   **Table View**: A clean interface listing all users with their:
    *   Email (linked from `users` table)
    *   Name & Company
    *   Subscription Status (Active, Trial, Past Due, etc.)
    *   Plan Code
    *   Start & End Dates
*   **Management Actions**:
    *   **Toggle Status**: Buttons to manually "Activate" or "Cancel" a subscription.
    *   **Edit Dates**: Date pickers to adjust the `current_period_start` and `current_period_end`.

### **3. Secure Implementation**
*   **Server Actions**: I will use Next.js Server Actions with the Supabase Service Role key to securely fetch and update data, bypassing standard RLS policies but strictly enforcing the `is_admin` check.
*   **Protection**: The page will automatically deny access to non-admin users.

### **Pre-requisite**
After implementation, you will need to run a simple SQL command (which I will provide) to promote your own user account to an **admin** so you can access this dashboard.
