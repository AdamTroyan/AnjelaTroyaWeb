# Update Server Environment Variables

תריץ את הפקודות הבאות על השרת:

```bash
ssh root@46.225.183.47

# עדכן את DATABASE_URL (הסר channel_binding)
cd /root/anjelaweb
nano .env.production

# שנה את השורה:
# מ: DATABASE_URL="postgresql://neondb_owner:npg_0UiNSnO3JBKR@ep-misty-firefly-agro9q7q-pooler.c-2.eu-central-1.aws.neon.tech/AnjelaTroya?sslmode=require&channel_binding=require&connect_timeout=30&pool_timeout=30"
# ל: DATABASE_URL="postgresql://neondb_owner:npg_0UiNSnO3JBKR@ep-misty-firefly-agro9q7q-pooler.c-2.eu-central-1.aws.neon.tech/AnjelaTroya?sslmode=require&connect_timeout=30&pool_timeout=30"

# שנה גם SMTP:
# SMTP_PORT=587
# SMTP_SECURE=false

# שמור (Ctrl+X, Y, Enter)

# עכשיו deploy:
git pull
npm run build
pm2 restart all
pm2 logs --lines 20
```

**מה תוקן:**
1. ❌ הסרת `channel_binding=require` - גורם ל-timeout ב-Node.js
2. ✅ שינוי SMTP ל-port 587 עם STARTTLS במקום 465 SSL
