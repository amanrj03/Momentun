# Database Migration Guide: NeonDB → Supabase

## Prerequisites
- Supabase account and new project created
- Current NeonDB connection working
- Backup of current data (we'll create this)

## Step-by-Step Migration

### 1. Export Current Data
```bash
cd backend
node scripts/export-data.js
```
This creates a timestamped backup file in `scripts/exports/`

### 2. Set Up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Settings → Database
3. Copy your connection string (it looks like):
   ```
   postgresql://postgres:[password]@[host]:5432/postgres
   ```

### 3. Update Environment Variables
Create a backup of your current `.env`:
```bash
cp .env .env.backup
```

Update your `.env` file with the new Supabase DATABASE_URL:
```env
DATABASE_URL="your-supabase-connection-string"
```

### 4. Run Migrations on Supabase
```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Import Your Data
```bash
node scripts/import-data.js database-export-[timestamp].json
```

### 6. Verify Migration
```bash
npx prisma studio
```
Check that all your data is present in the new database.

### 7. Test Your Application
Start your backend and test all functionality:
```bash
npm run dev
```

## Rollback Plan
If something goes wrong, you can quickly rollback:
1. Restore your `.env` from `.env.backup`
2. Restart your application
3. Your original NeonDB data will be intact

## Benefits of Supabase
- ✅ Built-in authentication (can replace your custom auth later)
- ✅ Real-time subscriptions
- ✅ Built-in file storage (can replace Cloudinary later)
- ✅ Auto-generated APIs
- ✅ Better dashboard and monitoring
- ✅ More generous free tier

## Post-Migration Optimizations (Optional)
After successful migration, you can:
1. Use Supabase Auth instead of custom JWT
2. Use Supabase Storage instead of Cloudinary
3. Add real-time features for live video updates
4. Use Supabase's built-in row-level security

## Troubleshooting
- If import fails, check the error message and ensure UUIDs don't conflict
- If connection fails, verify your Supabase connection string
- If migrations fail, ensure your Supabase project is properly set up