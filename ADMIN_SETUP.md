# Admin Panel Setup Guide

## Creating an HQ Administrator Account

The admin panel requires a user with the `hq_administrator` role. For security reasons, credentials are not hardcoded in the application. Follow these steps to create an admin account:

### Step 1: Sign Up a New User

1. Navigate to the `/auth` page of your application
2. Sign up with your desired admin email (e.g., admin@example.com)
3. Complete the signup process

### Step 2: Assign the HQ Administrator Role

After signing up, you need to assign the `hq_administrator` role to your user account via the backend:

1. Access your backend database
2. Get your user ID from the `profiles` table
3. Run the following SQL command:

```sql
-- Replace 'YOUR_USER_ID' with the actual user ID from step 1
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'hq_administrator');
```

Alternatively, you can use this query to find and assign the role based on email:

```sql
-- Replace 'admin@example.com' with your admin email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'hq_administrator'::app_role
FROM public.profiles
WHERE email = 'admin@example.com';
```

### Step 3: Access the Admin Panel

1. Log out and log back in with your admin account
2. You should now see the "Admin Panel" option in the navigation menu
3. Click on it to access the admin panel at `/admin`

## Admin Panel Features

The admin panel includes the following sections:

### 1. Store Management
- Add new stores with all required details:
  - Store code and name
  - Region assignment
  - Store manager
  - Store format (Maxi, Super, Small)
  - Size in square meters
  - Number of employees
  - Address and GPS coordinates
- Edit existing stores
- Delete stores
- Search and filter stores

### 2. User Management
- View all users in the system
- Edit user profiles:
  - Full name
  - Email
  - Store assignment
  - Area manager designation
  - Managed region (for area managers)
- Activate/deactivate users
- Search users by name or email

### 3. Role Management
- Assign roles to users:
  - `store_manager` - Can manage tasks for their assigned store
  - `regional_supervisor` - Can view and manage stores in their region
  - `hq_administrator` - Full system access
- Remove roles from users
- View all user roles at a glance

### 4. Database Synchronization
- View synchronization status
- Manually trigger data sync from store databases
- View last sync timestamp
- Monitor sync operations

### 5. System Logs
- View all API integration logs
- Monitor system health
- Track sync operations
- View error messages and latency metrics

## Available Roles

- **store_manager**: Can manage daily tasks and view store-specific data
- **regional_supervisor**: Can oversee multiple stores in a region and create tasks
- **hq_administrator**: Full access to all features including the admin panel

## Security Notes

- **Never** hardcode admin credentials in the application
- **Always** use the database to assign roles
- The admin panel is only accessible to users with the `hq_administrator` role
- User passwords are securely hashed and stored by the authentication system
- All admin actions are logged for audit purposes

## Troubleshooting

### I can't see the Admin Panel menu item
- Ensure you have the `hq_administrator` role assigned in the `user_roles` table
- Log out and log back in after assigning the role
- Clear your browser cache

### I get "Access Denied" when trying to access /admin
- Verify your role assignment in the database
- Ensure your user account is active (`active = true` in profiles table)
- Check that you're logged in with the correct account
