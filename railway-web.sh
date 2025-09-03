#!/bin/bash
# Railway deployment script for web service
cd apps/web
npm run build
npm run start
