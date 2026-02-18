# 📦 קבצי Deployment - סיכום

תיקייה זו מכילה את כל הקבצים הדרושים לפריסת האפליקציה על שרת Hetzner.

## 📄 קבצים בתיקייה

### סקריפטים עיקריים:

1. **`setup-server.sh`** - התקנה ראשונית של השרת
   - מתקין Node.js, PostgreSQL, Redis, Nginx, PM2
   - מגדיר firewall ואבטחה
   - יוצר בסיס נתונים
   - רץ **פעם אחת** בלבד

2. **`deploy.sh`** - פריסה/עדכון של האפליקציה
   - מוריד שינויים מ-git (אם יש)
   - מתקין dependencies
   - מריץ migrations
   - בונה את האפליקציה
   - מפעיל מחדש עם PM2
   - רץ **בכל פעם שצריך לעדכן**

3. **`upload.ps1`** - העלאה מהמחשב המקומי (Windows)
   - סקריפט PowerShell להעלאת הקוד לשרת
   - שימושי אם אין git repository

### ניהול:

4. **`backup.sh`** - גיבוי אוטומטי
   - מגבה את בסיס הנתונים
   - מגבה את התמונות (uploads)
   - מגבה קבצי תצורה
   - מוחק גיבויים ישנים
   - רץ אוטומטית (cron) או ידנית

5. **`restore.sh`** - שחזור מגיבוי
   - משחזר את בסיס הנתונים מגיבוי
   - יוצר גיבוי בטיחות לפני השחזור

6. **`health-check.sh`** - בדיקת תקינות
   - בודק שכל השירותים פועלים
   - בודק משאבי מערכת
   - בודק בעיות ידועות

### תצורות:

7. **`nginx.conf`** - תצורת Nginx
   - Reverse proxy ל-Next.js
   - SSL/HTTPS configuration
   - Rate limiting
   - Caching

8. **`README.md`** - מדריך מפורט (באנגלית)
   - הוראות מפורטות לפריסה
   - פתרון בעיות נפוצות
   - טיפים לאבטחה וביצועים

---

## 🚀 שימוש מהיר

### התקנה ראשונית:

```bash
# 1. התחבר לשרת
ssh root@YOUR_SERVER_IP

# 2. העלה והרץ את סקריפט ההתקנה
# (העתק קודם עם scp או wget)
chmod +x setup-server.sh
./setup-server.sh
```

### פריסה:

```bash
# 3. העלה את הקוד או שכפל מ-git
cd /var/www
git clone YOUR_REPO anjelaweb

# 4. הרץ פריסה
cd anjelaweb
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

### בדיקה:

```bash
# בדוק שהכל עובד
chmod +x deployment/health-check.sh
./deployment/health-check.sh
```

---

## 📚 קרא עוד

- **[DEPLOYMENT-HE.md](../DEPLOYMENT-HE.md)** - מדריך מהיר בעברית
- **[README.md](README.md)** - מדריך מפורט באנגלית

---

## 🔄 עדכון האתר

בכל פעם שתרצה לעדכן את האתר:

```bash
cd /var/www/anjelaweb
./deployment/deploy.sh
```

---

**זהו! הכל מוכן לשימוש 🎉**
