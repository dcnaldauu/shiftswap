# How to Make Yourself Admin

Follow these steps to grant yourself admin privileges:

## Step 1: Run the Database Setup

1. Open your Supabase dashboard at [supabase.com](https://supabase.com)
2. Go to your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `admin-setup.sql` from this project
6. Copy ALL the SQL code
7. Paste it into the Supabase SQL Editor
8. Click **Run** (or press Ctrl+Enter)

You should see: "Success. No rows returned"

## Step 2: Make Yourself Admin

In the same SQL Editor, run this command (replace with your actual email):

```sql
SELECT make_user_admin('your@email.com');
```

**Example:**
```sql
SELECT make_user_admin('donald@example.com');
```

You should see a success message: "User your@email.com is now an admin!"

## Step 3: Verify Admin Status

Run this query to confirm:

```sql
SELECT email, full_name, is_admin FROM profiles WHERE is_admin = true;
```

You should see your account with `is_admin` set to `true`.

## Step 4: Refresh Your App

1. Go back to your browser at http://localhost:3000
2. **Refresh the page** (F5 or Ctrl+R)
3. You should now see a **gold admin banner** at the top: "🛡️ ADMIN MODE"

## What You Can Do as Admin

Click the admin banner or navigate to `/admin` to access:

### Users Tab
- View all users
- Make other users admin
- Delete users (except yourself)
- See registration dates and signatures

### All Shifts Tab
- View every shift in the system
- Change shift status (Open/Claimed/Completed/Uncompleted)
- Delete any shift

### All Requests Tab
- View all swap requests
- See request details
- Delete any request

## Admin Features

As an admin, you have:
- ✅ Full database access
- ✅ Can modify/delete anything
- ✅ Can promote other users to admin
- ✅ Gold banner always visible
- ✅ Special `/admin` dashboard route

## Remove Admin (Optional)

To remove admin privileges from someone:

```sql
SELECT remove_admin('their@email.com');
```

## Troubleshooting

### "No user found with email"
- Make sure you're using the exact email you signed up with
- Check for typos
- Email is case-sensitive

### Admin banner not showing
- Refresh the page (hard refresh: Ctrl+Shift+R)
- Check browser console for errors
- Verify `is_admin` is `true` in database

### Can't access /admin page
- Make sure you refreshed after granting admin
- Check that the SQL query succeeded
- Clear browser cache if needed

---

**Security Note:** Only give admin access to trusted users. Admins can delete anything!
