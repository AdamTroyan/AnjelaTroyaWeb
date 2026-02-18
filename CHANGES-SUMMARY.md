# שינויים שבוצעו להכנת הפרויקט ל-Hetzner

## 📦 קבצים חדשים שנוצרו

### תיקיית `deployment/` (חדשה)

1. **`setup-server.sh`** - סקריפט התקנה ראשונית
   - התקנת Node.js, PostgreSQL, Redis, Nginx, PM2
   - הגדרת firewall ואבטחה
   - יצירת בסיס נתונים מקומי
   - אופטימיזציות מערכת

2. **`deploy.sh`** - סקריפט פריסה/עדכון
   - git pull אוטומטי
   - התקנת dependencies
   - הרצת migrations
   - build האפליקציה
   - הפעלה מחדש עם PM2

3. **`nginx.conf`** - תצורת Nginx
   - Reverse proxy
   - SSL/HTTPS הגדרות
   - Rate limiting
   - Caching Headers
   - Security Headers
   - Gzip compression

4. **`backup.sh`** - סקריפט גיבוי אוטומטי
   - גיבוי בסיס נתונים
   - גיבוי uploads
   - גיבוי .env ותצורות
   - ניקוי גיבויים ישנים (7 ימים)

5. **`restore.sh`** - שחזור מגיבוי
   - שחזור בסיס נתונים
   - גיבוי בטיחות אוטומטי
   - אימות שחזור

6. **`health-check.sh`** - בדיקת תקינות מערכת
   - בדיקת שירותים (PostgreSQL, Redis, Nginx, PM2)
   - בדיקת משאבים (disk, memory, CPU)
   - בדיקת אפליקציה
   - בדיקת בסיס נתונים
   - בדיקות אבטחה

7. **`upload.ps1`** - העלאה מWindows
   - סקריפט PowerShell להעלאת קוד
   - מתאים למי שלא משתמש ב-git

8. **`README.md`** - מדריך מפורט (אנגלית)
9. **`FILES.md`** - רשימת קבצים (עברית)
10. **`QUICK-REFERENCE.md`** - כרטיס עזר מהיר

### שורש הפרויקט

11. **`.env.production.example`** - דוגמת environment variables
    - DATABASE_URL (PostgreSQL מקומי)
    - NEXTAUTH_SECRET & URL
    - Redis מקומי במקום Upstash
    - SMTP הגדרות
    - R2/S3 הגדרות (אופציונלי)
    - Turnstile keys (אופציונלי)

12. **`ecosystem.config.js`** - תצורת PM2
    - Cluster mode
    - הגדרות memory
    - Log files
    - Auto-restart
    - Environment variables

13. **`DEPLOYMENT-HE.md`** - מדריך מהיר (עברית)
    - הוראות צעד-אחר-צעד
    - פתרון בעיות
    - פקודות שימושיות

---

## ✏️ קבצים ששונו

### `.gitignore`
- **לפני:** `gitignore` כל קבצי `.env*`
- **אחרי:** שמירה על `.env.production.example`
- **הוספה:** התעלמות מקבצי backup ולוגים

### `package.json`
- **הוספת סקריפטים:**
  - `db:migrate` - הרצת migrations בproduction
  - `db:migrate:dev` - הרצת migrations בפיתוח
  - `db:studio` - פתיחת Prisma Studio
  - `db:push` - דחיפת schema ל-DB
  - `production:build` - build מלא לproduction

---

## 🔄 שינויים מרכזיים

### 1. Redis: Upstash → Local

**לפני:** הפרויקט השתמש ב-Upstash Redis (cloud service)

**אחרי:** תמיכה ב-Redis מקומי על השרת
- Redis מותקן אוטומטית על ידי `setup-server.sh`
- פועל על `localhost:6379`
- אין צורך ב-token או API keys
- חינמי לחלוטין

**הגדרה ב-.env:**
```env
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN=""
```

### 2. Database: Hosted on Hetzner

**לפני:** אולי תכננת DB חיצוני (Supabase, PlanetScale וכו')

**אחרי:** PostgreSQL מקומי על אותו שרת
- PostgreSQL 16 מותקן ומוגדר אוטומטית
- מאופטם ל-4GB RAM (CPX22)
- גיבויים מקומיים
- אין עלויות נוספות

**connection string:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/anjelaweb"
```

### 3. PM2 Process Management

**הוספה:** ניהול תהליך Next.js עם PM2
- Auto-restart על קריסה
- Cluster mode לביצועים
- Logging מתקדם
- Monitoring built-in
- הפעלה אוטומטית בהפעלה מחדש של שרת

### 4. Nginx Reverse Proxy

**הוספה:** Nginx מול Next.js
- SSL/HTTPS termination
- Rate limiting (הגנה מפני spam)
- Static files caching
- Gzip compression
- Security headers
- Load balancing (לעתיד)

### 5. Production Security

**הוספת שכבות אבטחה:**
- UFW Firewall (פורטים 22, 80, 443 בלבד)
- Fail2Ban (הגנה מפני brute-force)
- SSL certificates (Let's Encrypt)
- PostgreSQL: local connections only
- Redis: local connections only
- .env permissions: 600 (readable only by owner)

---

## 📊 השוואת עלויות

### לפני (אם השתמשת בשירותים חיצוניים):
- Upstash Redis: ~$10-50/חודש
- Managed Database: ~$15-100/חודש
- Hosting: ~$10-20/חודש
- **סה"כ: ~$35-170/חודש**

### אחרי (Hetzner הכל-באחד):
- CPX22 Server: €6.49/חודש (~$7)
  - ✅ VPS
  - ✅ PostgreSQL
  - ✅ Redis
  - ✅ Node.js
  - ✅ Nginx
- **סה"כ: €6.49/חודש** 💰

**חיסכון: ~$28-163/חודש** 🎉

---

## 🎯 מה הפרויקט תומך בו עכשיו

### Deployment Options:

1. ✅ **Hetzner Cloud** (חדש!)
   - PostgreSQL מקומי
   - Redis מקומי
   - Nginx + PM2
   - Full control

2. ✅ **Netlify** (קיים)
   - סקריפט `vercel-build`
   - תצורת netlify.toml

3. ✅ **Vercel** (תואם)
   - Next.js native support

4. ✅ **כל VPS אחר**
   - הסקריפטים עובדים על Ubuntu 24.04
   - ניתן להתאים לדיסטרות אחרות

---

## 🔧 טכנולוגיות בשרת

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | 20.x LTS |
| Framework | Next.js | 16.1.6 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7.x |
| Web Server | Nginx | 1.24+ |
| Process Manager | PM2 | Latest |
| SSL | Let's Encrypt | Auto-renew |
| OS | Ubuntu | 24.04 LTS |

---

## 📝 מה לא השתנה

- ✅ קוד האפליקציה (Next.js, React, TypeScript)
- ✅ Prisma Schema
- ✅ API Routes
- ✅ UI Components
- ✅ Business logic
- ✅ Migrations קיימות
- ✅ סקריפטים קיימים (create-admin, וכו')

---

## 🚀 מוכן לשימוש!

כל הקבצים והתצורות מוכנים. פשוט:

1. צור שרת ב-Hetzner (CPX22, Ubuntu 24.04)
2. הרץ `setup-server.sh`
3. העלה את הקוד
4. הרץ `deploy.sh`
5. הגדר דומיין ו-SSL

**זהו! האתר שלך live על Hetzner!** 🎊

---

## 📚 מסמכים למידע נוסף

- [DEPLOYMENT-HE.md](DEPLOYMENT-HE.md) - מדריך מהיר בעברית
- [deployment/README.md](deployment/README.md) - מדריך מפורט באנגלית
- [deployment/QUICK-REFERENCE.md](deployment/QUICK-REFERENCE.md) - כרטיס עזר
- [deployment/FILES.md](deployment/FILES.md) - רשימת קבצים

---

**כל השינויים נועדו למקסם ביצועים, אבטחה וחיסכון בעלויות! 💪**
