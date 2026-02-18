# מדריך מהיר - העלאה לשרת Hetzner

## 📦 מה הוכן עבורך

הפרויקט מוכן לפריסה על שרת Hetzner עם כל הקבצים הנדרשים:

### קבצי תצורה שנוצרו:

1. **`deployment/setup-server.sh`** - סקריפט התקנה ראשונית של השרת
2. **`deployment/deploy.sh`** - סקריפט פריסה/עדכון של האפליקציה
3. **`deployment/nginx.conf`** - תצורת Nginx (reverse proxy + SSL)
4. **`deployment/upload.ps1`** - סקריפט העלאה מהמחשב שלך
5. **`ecosystem.config.js`** - תצורת PM2 (ניהול תהליכים)
6. **`.env.production.example`** - דוגמת משתני סביבה

---

## 🚀 התחלה מהירה (3 שלבים)

### שלב 1: הכנת השרת

התחבר לשרת והרץ את סקריפט ההתקנה:

```bash
# התחברות לשרת
ssh root@YOUR_SERVER_IP

# העלאת סקריפט ההתקנה (מהמחשב שלך)
# במחשב Windows (PowerShell):
scp deployment/setup-server.sh root@YOUR_SERVER_IP:/root/

# בשרת - הרצת סקריפט ההתקנה
chmod +x setup-server.sh
sudo ./setup-server.sh
```

הסקריפט יתקין:
- ✅ Node.js 20
- ✅ PostgreSQL 16 (בסיס נתונים מקומי)
- ✅ Redis (מקומי)
- ✅ Nginx
- ✅ PM2
- ✅ Firewall + אבטחה

---

### שלב 2: העלאת הקוד

**אפשרות א' - דרך Git (מומלץ):**

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/anjelaweb.git
cd anjelaweb
```

**אפשרות ב' - העלאה ידנית מהמחשב:**

```powershell
# במחשב שלך (PowerShell):
.\deployment\upload.ps1 -ServerIP YOUR_SERVER_IP
```

---

### שלב 3: הגדרה ופריסה

```bash
# בשרת
cd /var/www/anjelaweb

# עריכת קובץ הגדרות
nano .env

# עדכן את הערכים הבאים:
# NEXTAUTH_URL="https://yourdomain.com"
# (השאר את DATABASE_URL כפי שנוצר אוטומטית)

# הרצת פריסה
sudo deployment/deploy.sh
```

---

## 🌐 הגדרת דומיין ו-SSL

### 1. עריכת תצורת Nginx

```bash
# ערוך את הקובץ
nano /etc/nginx/sites-available/anjelaweb

# החלף 'yourdomain.com' בדומיין שלך
# שמור והצא (Ctrl+O, Enter, Ctrl+X)

# יצירת symlink
ln -s /etc/nginx/sites-available/anjelaweb /etc/nginx/sites-enabled/

# בדיקה
nginx -t

# אם הבדיקה עברה בהצלחה
systemctl reload nginx
```

### 2. התקנת SSL (Let's Encrypt)

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## ✅ סיימת!

האתר אמור להיות חי בכתובת: `https://yourdomain.com`

---

## 🔄 עדכון האתר בעתיד

כשתרצה לעדכן את האתר:

```bash
cd /var/www/anjelaweb
sudo deployment/deploy.sh
```

או ידנית:

```bash
git pull
npm ci
npx prisma migrate deploy
npm run build
pm2 restart anjelaweb
```

---

## 📊 בדיקות שימושיות

```bash
# סטטוס האפליקציה
pm2 status

# צפייה בלוגים
pm2 logs anjelaweb

# מעקב משאבים
pm2 monit

# בדיקת בסיס נתונים
sudo -u postgres psql -d anjelaweb -c "SELECT COUNT(*) FROM \"User\";"

# בדיקת שהאתר עובד
curl http://localhost:3000
```

---

## 🔧 פתרון בעיות נפוצות

### האפליקציה לא עולה

```bash
# בדוק לוגים
pm2 logs anjelaweb --lines 50

# אתחל מחדש
pm2 restart anjelaweb

# אם לא עובד - בדוק את ה-.env
cat .env
```

### בעיית חיבור לבסיס הנתונים

```bash
# בדוק שPostgreSQL פועל
systemctl status postgresql

# נסה להתחבר ידנית
sudo -u postgres psql -d anjelaweb
```

### Nginx מחזיר שגיאה

```bash
# בדוק לוג שגיאות
tail -f /var/log/nginx/error.log

# בדוק שהאפליקציה פועלת
curl http://localhost:3000

# אתחל Nginx
systemctl restart nginx
```

---

## 📝 הערות חשובות

### 1. בסיס נתונים מקומי
- PostgreSQL רץ על אותו שרת (localhost:5432)
- הסיסמה והמשתמש נוצרים אוטומטית בזמן ההתקנה
- מחרוזת החיבור נוספת אוטומטית ל-.env

### 2. Redis מקומי
- Redis רץ על אותו שרת (localhost:6379)
- אין צורך ב-Upstash Redis
- הגדר: `UPSTASH_REDIS_REST_URL="http://localhost:6379"`

### 3. אחסון תמונות
- תמונות מאוחסנות ב-`/var/www/anjelaweb/public/uploads`
- אם תרצה - תוכל לעבור ל-R2/S3 בעתיד

### 4. ביצועים
- השרת CPX22 מספיק למאות נכסים ואלפי צפיות ביום
- PM2 מנהל את התהליך ומפעיל מחדש אם יש קריסה
- Nginx מטפל ב-static files ו-caching

---

## 📚 מסמכים נוספים

קרא את [deployment/README.md](deployment/README.md) למידע מפורט יותר על:
- תצורות מתקדמות
- גיבויים אוטומטיים
- אבטחה מתקדמת
- ניטור ומעקב

---

## 🆘 צריך עזרה?

1. בדוק את הלוגים: `pm2 logs anjelaweb`
2. קרא את המדריך המפורט: `deployment/README.md`
3. בדוק את סטטוס המערכת: `pm2 monit`

---

**בהצלחה! 🚀**

הפרויקט שלך מוכן לפריסה על Hetzner עם בסיס נתונים מקומי!
