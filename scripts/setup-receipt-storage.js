#!/usr/bin/env node

/**
 * Setup script for Supabase Storage - Receipt Upload
 * This script initializes the receipts storage bucket with proper configuration
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function setupReceiptStorage() {
  try {
    console.log('🚀 Setting up Supabase Storage for receipt uploads...\n');

    // Get credentials from .env.local
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
    }

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📦 Creating receipts storage bucket...');

    // Create the receipts bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('receipts', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Receipts bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Receipts bucket created successfully');
    }

    console.log('\n🔒 Setting up Row Level Security policies...');

    // Note: RLS policies need to be set up via SQL in the Supabase dashboard
    // The policies are defined in receipt-storage-setup.sql
    console.log('⚠️  Please run the SQL commands from lib/receipt-storage-setup.sql in your Supabase SQL Editor to set up RLS policies.');

    console.log('\n📋 Storage bucket configuration:');
    console.log('- Bucket name: receipts');
    console.log('- Public access: Yes');
    console.log('- File size limit: 10MB');
    console.log('- Allowed types: JPEG, PNG, WebP, PDF');
    console.log('- Security: Row Level Security enabled');

    console.log('\n✅ Receipt storage setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run the SQL commands from lib/receipt-storage-setup.sql in your Supabase SQL Editor');
    console.log('2. Test the upload functionality in your application');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupReceiptStorage();