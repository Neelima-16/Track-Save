@echo off
set DATABASE_URL=postgresql://neondb_owner:npg_ckChPBN4XWL5@ep-billowing-band-ad640b5b-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require^&channel_binding=require
set NODE_ENV=development
set PORT=8080
npx tsx server/index.ts