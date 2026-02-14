import { cookies } from "next/headers";

export type Locale = "he" | "ru";

export const LOCALE_COOKIE = "lang";
export const DEFAULT_LOCALE: Locale = "he";

const localeMap = new Map<string, Locale>([
  ["he", "he"],
  ["iw", "he"],
  ["ru", "ru"],
]);

export function normalizeLocale(value?: string | null): Locale {
  if (!value) {
    return DEFAULT_LOCALE;
  }
  return localeMap.get(value.toLowerCase()) ?? DEFAULT_LOCALE;
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value ?? null);
}

export function getDirection(locale: Locale) {
  return locale === "he" ? "rtl" : "ltr";
}

export function getDateLocale(locale: Locale) {
  return locale === "he" ? "he-IL" : "ru-RU";
}

type TranslationParams = Record<string, string | number | undefined>;
type TranslationValue = string | ((params?: TranslationParams) => string) | TranslationObject;

interface TranslationObject {
  [key: string]: TranslationValue | TranslationValue[];
}

const translations: Record<Locale, TranslationObject> = {
  he: {
    site: {
      title: "ANJELA TROYA | נדל\"ן ושמאות",
      description: "שירותי תיווך ושמאות נדל\"ן מקצועיים בישראל.",
      tagline: "תיווך נדל\"ן | שמאות | ייעוץ אישי",
      footer: "ANJELA TROYA - נדל\"ן ושמאות",
      rights: "© 2026 כל הזכויות שמורות.",
    },
    nav: {
      home: "בית",
      about: "אודות",
      sale: "דירות למכירה",
      rent: "דירות להשכרה",
      favorites: "שמורים",
      alerts: "התראות",
      valuation: "הערכת שווי",
      testimonials: "המלצות",
      contact: "צור קשר",
      dashboard: "דשבורד",
      login: "התחברות",
      logout: "התנתקות",
    },
    language: {
      label: "שפה",
      he: "עברית",
      ru: "Русский",
    },
    home: {
      heroKicker: "תיווך ושמאות נדל\"ן",
      heroTitle: "מי אני ומה החזון שלי",
      heroBody:
        "אני אנג׳לה טרויה, מתווכת ושמאית נדל\"ן עם ניסיון מוכח בליווי עסקאות מגורים ונכסים מסחריים. החזון שלי הוא להוביל לקוחות בעסקה בטוחה, שקופה ומדויקת, מתוך הקשבה מלאה לצרכים האישיים.",
      heroContact: "צור קשר",
      heroProperties: "צפייה בנכסים",
      aboutTitle: "אודות",
      aboutBody:
        "שילוב בין ידע שמאי רחב לשירות אישי מאפשר לי לדייק הערכות שווי, לבנות אסטרטגיית מכירה חכמה ולסגור עסקאות עם שקט נפשי.",
      cardPrecisionTitle: "דיוק מקצועי",
      cardPrecisionBody: "הערכות שווי מפורטות ותכנון מסלול פעולה לפי מטרות הלקוח.",
      cardSupportTitle: "ליווי אישי",
      cardSupportBody: "זמינות גבוהה, תקשורת רציפה ותיאום מלא עד החתימה.",
      saleTitle: "דירות למכירה",
      rentTitle: "דירות להשכרה",
      allProperties: "לכל הנכסים",
      noProperties: "אין נכסים זמינים כרגע.",
      propertyPrefix: "דירה:",
      propertyDescription: "תיאור הנכס:",
      hotTitle: "נכסים חמים במפה",
      testimonialsTitle: "המלצות",
      testimonialsText1: "\"ליווי מקצועי ורגוע. קיבלנו מענה לכל שאלה בדרך.\"",
      testimonialsText2: "\"תהליך ממוקד, שקוף ומהיר. קיבלנו החלטות בביטחון.\"",
      testimonialsLink: "לכל ההמלצות",
      contactTitle: "צור קשר",
      contactBody:
        "לתיאום פגישה, שיחת ייעוץ או קבלת הערכת שווי, אפשר להשאיר פרטים ונחזור אליך במהירות.",
      contactCta: "לפתיחת פנייה",
      phoneLabel: "טלפון:",
      emailLabel: "אימייל:",
    },
    about: {
      title: "אודות",
      body:
        "אנג׳לה טרויה היא מתווכת ושמאית נדל\"ן הפועלת בישראל עם התמחות בנכסי מגורים ומסחר. החיבור בין הבנה משפטית, פיננסית ושיווקית מאפשר לה לספק ללקוחות תהליך מובנה, בטוח ומדויק.",
      highlights: [
        "הערכות שווי מדויקות המבוססות על ניסיון שמאי.",
        "ליווי אישי ומקצועי בכל שלב בתהליך.",
        "אסטרטגיית שיווק חכמה שממקסמת ערך לנכס.",
      ],
    },
    testimonials: {
      title: "המלצות",
      items: [
        "ליווי מקצועי, אמין ועם זמינות מלאה לאורך כל הדרך.",
        "קיבלנו הערכת שווי מדויקת ותהליך ברור בלי הפתעות.",
        "הגישה האישית והדיוק בפרטים עשו את ההבדל הגדול.",
      ],
    },
    contact: {
      title: "צור קשר",
      body: "לתיאום פגישה או קבלת הערכת שווי, ניתן להשאיר פרטים ונחזור אליך בהקדם.",
      phone: "טלפון: 054-317-9762",
      email: "אימייל: adamtroy@gmail.com",
      area: "מיקום פעילות: מרכז הארץ, ירושלים והשרון",
      whatsappTitle: "שליחת הודעה ב-WhatsApp",
      whatsappBody: "בלחיצת  כפתור תפתח שיחה עם אנג'לה ב-WhatsApp",
      whatsappButton: "פתיחת WhatsApp",
      regionsTitle: "אזורי פעילות",
      regionsBody: "מרכז הארץ, ירושלים והשרון - זמינות גבוהה לפגישות וסיורים.",
      regionsLink: "לפתיחה במפות",
      whatsappMessage:
        "שלום, הגעתי אלייך דרך האתר שלך, אני רוצה לברר לגבי קנייה/השכרה",
    },
    valuation: {
      title: "בקשת הערכת שווי",
      body: "מלאו פרטים ונחזור אליכם עם הערכה מקצועית לנכס.",
      success: "תודה! קיבלנו את הבקשה ונחזור אליכם בהקדם.",
      form: {
        name: "שם מלא",
        phone: "טלפון",
        email: "אימייל (לא חובה)",
        address: "כתובת הנכס (רחוב+מספר, עיר)",
        type: "סוג נכס",
        rooms: "מספר חדרים",
        notes: "פרטים נוספים שחשוב לדעת",
        submit: "שליחת בקשה",
      },
      types: ["דירה", "בית פרטי", "פנטהאוז", "דופלקס", "מגרש", "אחר"],
    },
    favorites: {
      title: "נכסים שמורים",
      count: (params) => `${params?.count ?? 0} נכסים שמורים`,
      back: "חזרה לנכסים",
      loading: "טוען נכסים...",
      empty: "אין נכסים שמורים כרגע.",
      cta: "לצפייה בנכסים",
      hot: "חם",
      sold: "נמכר",
      rented: "הושכר",
      propertyPrefix: "דירה:",
      descriptionLabel: "תיאור הנכס:",
      imagesLabel: "תמונות מהנכס:",
    },
    alerts: {
      title: "ההתראות שלי",
      body: "כאן אפשר לצפות בהתראות קיימות ולבטל אותן.",
      emailPlaceholder: "האימייל שלך",
      show: "הצגת התראות",
      errorNotFound: "לא נמצאו התראות או שהאימייל לא תקין.",
      empty: "אין התראות פעילות.",
      loading: "טוען...",
      deleteError: "לא הצלחנו למחוק את ההתראה.",
      createdAt: "נוצרה ב-",
      remove: "הסרה",
      typeSale: "למכירה",
      typeRent: "להשכרה",
      min: "מינימום",
      max: "מקסימום",
      rooms: "חדרים",
    },
    list: {
      filterTitle: "סינון חכם",
      filterBody: "בחרו את מה שחשוב לכם, ונציג רק נכסים מתאימים.",
      reset: "איפוס סינון",
      searchTitle: "חיפוש כללי",
      searchPlaceholder: "חיפוש לפי שם או תיאור",
      searchLocation: "אזור / עיר",
      priceTitle: "מחיר וסטטוס",
      minPrice: "מחיר מינימום",
      maxPrice: "מחיר מקסימום",
      statusAll: "כל הסטטוסים",
      statusAvailable: "זמין",
      statusSold: "נמכר",
      statusRented: "הושכר",
      detailsTitle: "פרטים חשובים",
      roomsMin: "חדרים (מינימום)",
      sizeMin: 'מ"ר בנוי מינימום',
      sizeMax: 'מ"ר בנוי מקסימום',
      floorMin: "קומה מינימום",
      parkingAll: "חניה",
      parkingYes: "עם חניה",
      parkingNo: "בלי חניה",
      alertTitle: "התראה חכמה",
      alertBody: "נשלח לך נכסים חדשים שמתאימים לסינון שלך.",
      alertOpen: "פתיחת התראה",
      alertModalTitle: "התראה על נכסים מתאימים",
      alertClose: "סגירה",
      alertModalBody: "מילוי מהיר וקצר - נשתמש בהעדפות שתבחרו כאן.",
      alertEmailPlaceholder: "כתובת אימייל",
      alertSave: "שמירת התראה",
      alertConsent: "שמור אימייל להתראות עתידיות",
      alertSuccess: "ההתראה נשמרה! נשלח עדכונים לפי הסינון שבחרת.",
      alertError: "לא הצלחנו לשמור את ההתראה. נסה שוב.",
      alertMissingEmail: "נא להזין כתובת אימייל.",
      mapEmpty: "אין נכסים עם מיקום מדויק להצגה במפה.",
    },
    property: {
      sold: "נמכר",
      rented: "הושכר",
      sale: "למכירה",
      rent: "להשכרה",
      hot: "חם",
      price: "מחיר:",
      images: "תמונות מהנכס:",
      description: "תיאור הנכס:",
      details: "פרטי הנכס:",
      map: "מיקום במפה:",
      visitTitle: "לתיאום ביקור",
      visitBody: "רוצה פרטים נוספים או תיאום סיור? אפשר ליצור קשר ישירות.",
      whatsapp: "שליחת הודעה ב-WhatsApp",
      inquiryTitle: "פנייה לגבי הנכס",
      inquiryBody: "שלחו פרטים קצרים ואחזור אליכם במהירות.",
      inquiryName: "שם מלא",
      inquiryPhone: "טלפון",
      inquiryEmail: "אימייל (לא חובה)",
      inquiryMessage: "על מה תרצה לדעת?",
      inquirySubmit: "שליחת פנייה",
      shareTitle: "שיתוף הנכס",
      shareBody: "העבר/י את הקישור לנכס למשפחה, חברים או לקוחות.",
      shareCopy: "העתקת קישור",
      shareCopied: "הקישור הועתק",
      shareQuick: "שיתוף מהיר",
      shareWhatsapp: "שיתוף ב-WhatsApp",
      shareText: (params) => `רציתי לשתף נכס: ${params?.title ?? ""}`,
    },
    favoritesToggle: {
      save: "שמירה",
      saved: "נשמר",
    },
    lightbox: {
      prev: "הקודם",
      next: "הבא",
      close: "סגירה",
    },
    map: {
      open: "פתיחת הנכס",
    },
    admin: {
      loginTitle: "התחברות מנהל",
      loginBody: "התחברות זו מיועדת למנהל בלבד. נא להזין אימייל וסיסמה.",
      loginEmail: "אימייל",
      loginPassword: "סיסמה",
      loginError: "פרטי התחברות שגויים. נסו שוב.",
      loginSubmit: "התחברות",
      loginSubmitting: "מתחבר...",
      loginNote: "המערכת תשמור אותך מחובר עד להתנתקות.",
      dashboardTitle: "דשבורד ניהול",
      dashboardBody: "ניהול נכסים ופניות מהאתר במקום אחד.",
      statsProperties: "נכסים במערכת",
      statsViews: "צפיות בדפי נכסים",
      statsInquiries: "סה\"כ פניות",
      topViewedTitle: "הכי נצפים",
      topViewedEmpty: "אין נכסים להצגה.",
      addPropertyTitle: "הוספת נכס",
      existingPropertiesTitle: "נכסים קיימים",
      noProperties: "אין נכסים במערכת.",
      edit: "עריכה",
      disable: "השבתה",
      enable: "הפעלה",
      delete: "מחיקה",
      confirmDisableTitle: "השבתת נכס",
      confirmEnableTitle: "הפעלת נכס",
      confirmDisableBody: "האם להשבית את הנכס הזה מהתצוגה באתר?",
      confirmEnableBody: "האם להפעיל את הנכס הזה ולהציג אותו באתר?",
      confirmDeleteTitle: "מחיקת נכס",
      confirmDeleteBody: "האם למחוק את הנכס הזה לצמיתות? לא ניתן לשחזר.",
      inquiriesTitle: "פניות מהאתר",
      inquiriesEmpty: "אין פניות חדשות.",
      propertyInquiriesTitle: "פניות על נכסים",
      propertyInquiriesEmpty: "אין פניות על נכסים.",
      statusNew: "חדש",
      statusProgress: "בטיפול",
      statusDone: "טופל",
      statusUpdate: "עדכון סטטוס",
      noEmail: "ללא אימייל",
      propertyMissing: "לא נמצא",
      createdAt: "נוצרה ב-",
      propertyLabel: "נכס:",
      active: "פעיל",
      inactive: "לא פעיל",
      hot: "חם",
      imagesCount: (params) => `${params?.count ?? 0} תמונות`,
      editTitle: "עריכת נכס",
      editBody: "עדכן פרטי נכס ותמונות.",
      form: {
        title: "כותרת",
        address: 'כתובת: "רחוב+מספר בית, עיר"',
        addressPreview: "תצוגת כתובת",
        description: "תיאור",
        params: "פרמטרים",
        price: "מחיר",
        sale: "למכירה",
        rent: "להשכרה",
        active: "פעיל להצגה באתר",
        isHot: "נכס חם",
        images: "תמונות לנכס",
        imagesHint: "אפשר לבחור כמה תמונות.",
        submitCreate: "הוספת נכס",
        submitUpdate: "שמירת שינויים",
        statusSold: "נמכר",
        statusRented: "הושכר",
        statusAvailable: "זמין",
        removeImage: "הסרת תמונה",
        keepImage: "שמור",
        close: "סגירה",
        saveParams: "שמירת פרמטרים",
        addressMap: "מפת כתובת",
        statusToggleSold: "סימון כנמכר",
        statusToggleAvailable: "החזרה לזמין",
        statusToggleRented: "סימון כהושכר",
      },
    },
    confirm: {
      approve: "אישור",
      cancel: "ביטול",
    },
    email: {
      alerts: {
        subject: (params) => `נכס חדש שמתאים לך: ${params?.title ?? ""}`,
        title: "נכס חדש שמתאים לך",
        view: "צפייה בנכס",
        unsubscribe: "להסרה מרשימת ההתראות",
        auto: "הודעה אוטומטית מהאתר",
        property: "נכס:",
        type: "סוג:",
        price: "מחיר:",
        sale: "למכירה",
        rent: "להשכרה",
        link: "קישור:",
      },
      inquiry: {
        subject: (params) => `פנייה חדשה לנכס: ${params?.title ?? ""}`,
        lead: "ליד חדש מהאתר",
        type: "סוג",
        price: "מחיר",
        address: "כתובת",
        details: "פרטים עיקריים",
        contact: "פרטי הפונה",
        name: "שם",
        phone: "טלפון",
        email: "אימייל",
        message: "הודעה",
        map: "מפות",
        view: "צפייה בנכס",
        noEmail: "ללא",
      },
      valuation: {
        subject: (params) => `בקשת הערכת שווי חדשה: ${params?.name ?? ""}`,
        title: "בקשת הערכת שווי",
        contact: "פרטי הפונה",
        property: "פרטי הנכס",
        name: "שם",
        phone: "טלפון",
        email: "אימייל",
        address: "כתובת",
        type: "סוג נכס",
        rooms: "חדרים",
        notes: "הערות",
        noEmail: "ללא",
      },
    },
  },
  ru: {
    site: {
      title: "ANJELA TROYA | Недвижимость и оценка",
      description: "Профессиональные услуги по недвижимости и оценке в Израиле.",
      tagline: "Недвижимость | Оценка | Личный консалтинг",
      footer: "ANJELA TROYA - Недвижимость и оценка",
      rights: "© 2026 Все права защищены.",
    },
    nav: {
      home: "Главная",
      about: "Обо мне",
      sale: "Продажа квартир",
      rent: "Аренда квартир",
      favorites: "Избранное",
      alerts: "Уведомления",
      valuation: "Оценка недвижимости",
      testimonials: "Отзывы",
      contact: "Связаться",
      dashboard: "Панель",
      login: "Вход",
      logout: "Выход",
    },
    language: {
      label: "Язык",
      he: "עברית",
      ru: "Русский",
    },
    home: {
      heroKicker: "Недвижимость и оценка",
      heroTitle: "Кто я и мое видение",
      heroBody:
        "Меня зовут Анжела Троя, я брокер и оценщик недвижимости с подтвержденным опытом сопровождения жилых и коммерческих сделок. Моя цель — провести клиента через безопасную, прозрачную и точную сделку с вниманием к личным потребностям.",
      heroContact: "Связаться",
      heroProperties: "Смотреть объекты",
      aboutTitle: "Обо мне",
      aboutBody:
        "Сочетание экспертной оценки и персонального сервиса помогает точнее определять стоимость, строить стратегию продажи и завершать сделки спокойно и уверенно.",
      cardPrecisionTitle: "Профессиональная точность",
      cardPrecisionBody: "Подробные оценки и план действий под цели клиента.",
      cardSupportTitle: "Личное сопровождение",
      cardSupportBody: "Высокая доступность, постоянная связь и координация до подписи.",
      saleTitle: "Квартиры на продажу",
      rentTitle: "Квартиры в аренду",
      allProperties: "Все объекты",
      noProperties: "Сейчас нет доступных объектов.",
      propertyPrefix: "Квартира:",
      propertyDescription: "Описание объекта:",
      hotTitle: "Горячие объекты на карте",
      testimonialsTitle: "Отзывы",
      testimonialsText1: "\"Профессиональное и спокойное сопровождение. На все вопросы были ответы.\"",
      testimonialsText2: "\"Четкий и быстрый процесс, приняли решение уверенно.\"",
      testimonialsLink: "Все отзывы",
      contactTitle: "Связаться",
      contactBody:
        "Чтобы договориться о встрече или получить оценку, оставьте данные — мы быстро свяжемся.",
      contactCta: "Открыть заявку",
      phoneLabel: "Телефон:",
      emailLabel: "Email:",
    },
    about: {
      title: "Обо мне",
      body:
        "Анжела Троя — брокер и оценщик недвижимости в Израиле, специализируется на жилых и коммерческих объектах. Комбинация юридической, финансовой и маркетинговой экспертизы дает клиентам четкий и безопасный процесс.",
      highlights: [
        "Точные оценки стоимости на основе опыта оценщика.",
        "Личное и профессиональное сопровождение на каждом этапе.",
        "Умная маркетинговая стратегия, повышающая ценность объекта.",
      ],
    },
    testimonials: {
      title: "Отзывы",
      items: [
        "Профессиональное и надежное сопровождение, всегда на связи.",
        "Получили точную оценку и прозрачный процесс без сюрпризов.",
        "Личный подход и внимание к деталям сыграли ключевую роль.",
      ],
    },
    contact: {
      title: "Связаться",
      body: "Чтобы договориться о встрече или получить оценку, оставьте данные — мы свяжемся в ближайшее время.",
      phone: "Телефон: 054-317-9762",
      email: "Email: adamtroy@gmail.com",
      area: "Зона работы: центр страны, Иерусалим и Шарон",
      whatsappTitle: "Отправить сообщение в WhatsApp",
      whatsappBody: "Нажмите кнопку — откроется чат с Анжелой в WhatsApp",
      whatsappButton: "Открыть WhatsApp",
      regionsTitle: "Регионы работы",
      regionsBody: "Центр страны, Иерусалим и Шарон — высокая доступность для встреч и показов.",
      regionsLink: "Открыть в картах",
      whatsappMessage: "Здравствуйте! Я нашел(а) вас через сайт и хочу узнать о покупке/аренде.",
    },
    valuation: {
      title: "Запрос оценки стоимости",
      body: "Заполните данные, и мы вернемся к вам с профессиональной оценкой.",
      success: "Спасибо! Мы получили запрос и свяжемся с вами в ближайшее время.",
      form: {
        name: "Полное имя",
        phone: "Телефон",
        email: "Email (необязательно)",
        address: "Адрес объекта (улица + номер, город)",
        type: "Тип недвижимости",
        rooms: "Количество комнат",
        notes: "Дополнительные детали",
        submit: "Отправить запрос",
      },
      types: ["Квартира", "Частный дом", "Пентхаус", "Дуплекс", "Участок", "Другое"],
    },
    favorites: {
      title: "Избранные объекты",
      count: (params) => `${params?.count ?? 0} объектов сохранено`,
      back: "Вернуться к объектам",
      loading: "Загрузка объектов...",
      empty: "Пока нет сохраненных объектов.",
      cta: "Смотреть объекты",
      hot: "Горячее",
      sold: "Продано",
      rented: "Сдано",
      propertyPrefix: "Квартира:",
      descriptionLabel: "Описание объекта:",
      imagesLabel: "Фото объекта:",
    },
    alerts: {
      title: "Мои уведомления",
      body: "Здесь можно просмотреть и отключить уведомления.",
      emailPlaceholder: "Ваш email",
      show: "Показать",
      errorNotFound: "Уведомления не найдены или email неверный.",
      empty: "Активных уведомлений нет.",
      loading: "Загрузка...",
      deleteError: "Не удалось удалить уведомление.",
      createdAt: "Создано",
      remove: "Удалить",
      typeSale: "Продажа",
      typeRent: "Аренда",
      min: "Минимум",
      max: "Максимум",
      rooms: "Комнаты",
    },
    list: {
      filterTitle: "Умный фильтр",
      filterBody: "Выберите важные параметры — покажем только подходящие объекты.",
      reset: "Сбросить фильтр",
      searchTitle: "Общий поиск",
      searchPlaceholder: "Поиск по названию или описанию",
      searchLocation: "Район / город",
      priceTitle: "Цена и статус",
      minPrice: "Минимальная цена",
      maxPrice: "Максимальная цена",
      statusAll: "Все статусы",
      statusAvailable: "Доступно",
      statusSold: "Продано",
      statusRented: "Сдано",
      detailsTitle: "Важные детали",
      roomsMin: "Комнаты (минимум)",
      sizeMin: "Мин. площадь (м2)",
      sizeMax: "Макс. площадь (м2)",
      floorMin: "Минимальный этаж",
      parkingAll: "Парковка",
      parkingYes: "С парковкой",
      parkingNo: "Без парковки",
      alertTitle: "Умное уведомление",
      alertBody: "Мы будем отправлять новые объекты по вашим параметрам.",
      alertOpen: "Создать уведомление",
      alertModalTitle: "Уведомление о подходящих объектах",
      alertClose: "Закрыть",
      alertModalBody: "Короткая форма — используем выбранные параметры.",
      alertEmailPlaceholder: "Email адрес",
      alertSave: "Сохранить уведомление",
      alertConsent: "Сохранить email для будущих уведомлений",
      alertSuccess: "Уведомление сохранено! Мы отправим новые объекты по фильтру.",
      alertError: "Не удалось сохранить уведомление. Попробуйте снова.",
      alertMissingEmail: "Пожалуйста, укажите email.",
      mapEmpty: "Нет объектов с точной геопозицией для карты.",
    },
    property: {
      sold: "Продано",
      rented: "Сдано",
      sale: "Продажа",
      rent: "Аренда",
      hot: "Горячее",
      price: "Цена:",
      images: "Фото объекта:",
      description: "Описание объекта:",
      details: "Детали объекта:",
      map: "Расположение на карте:",
      visitTitle: "Записаться на просмотр",
      visitBody: "Нужны детали или тур? Свяжитесь напрямую.",
      whatsapp: "Написать в WhatsApp",
      inquiryTitle: "Запрос по объекту",
      inquiryBody: "Оставьте данные, и мы быстро свяжемся.",
      inquiryName: "Полное имя",
      inquiryPhone: "Телефон",
      inquiryEmail: "Email (необязательно)",
      inquiryMessage: "Что вы хотите узнать?",
      inquirySubmit: "Отправить запрос",
      shareTitle: "Поделиться объектом",
      shareBody: "Поделитесь ссылкой с семьей, друзьями или клиентами.",
      shareCopy: "Скопировать ссылку",
      shareCopied: "Ссылка скопирована",
      shareQuick: "Быстро поделиться",
      shareWhatsapp: "Поделиться в WhatsApp",
      shareText: (params) => `Хочу поделиться объектом: ${params?.title ?? ""}`,
    },
    favoritesToggle: {
      save: "Сохранить",
      saved: "Сохранено",
    },
    lightbox: {
      prev: "Назад",
      next: "Далее",
      close: "Закрыть",
    },
    map: {
      open: "Открыть объект",
    },
    admin: {
      loginTitle: "Вход администратора",
      loginBody: "Эта форма предназначена только для администратора. Введите email и пароль.",
      loginEmail: "Email",
      loginPassword: "Пароль",
      loginError: "Неверные данные. Попробуйте снова.",
      loginSubmit: "Войти",
      loginSubmitting: "Вход...",
      loginNote: "Сессия сохранится до выхода.",
      dashboardTitle: "Панель управления",
      dashboardBody: "Управляйте объектами и заявками в одном месте.",
      statsProperties: "Объекты в системе",
      statsViews: "Просмотры объектов",
      statsInquiries: "Всего заявок",
      topViewedTitle: "Самые просматриваемые",
      topViewedEmpty: "Нет объектов для отображения.",
      addPropertyTitle: "Добавить объект",
      existingPropertiesTitle: "Существующие объекты",
      noProperties: "Нет объектов в системе.",
      edit: "Редактировать",
      disable: "Отключить",
      enable: "Включить",
      delete: "Удалить",
      confirmDisableTitle: "Отключить объект",
      confirmEnableTitle: "Включить объект",
      confirmDisableBody: "Скрыть этот объект на сайте?",
      confirmEnableBody: "Показать этот объект на сайте?",
      confirmDeleteTitle: "Удалить объект",
      confirmDeleteBody: "Удалить этот объект навсегда? Это действие нельзя отменить.",
      inquiriesTitle: "Заявки с сайта",
      inquiriesEmpty: "Новых заявок нет.",
      propertyInquiriesTitle: "Заявки по объектам",
      propertyInquiriesEmpty: "Заявок по объектам нет.",
      statusNew: "Новая",
      statusProgress: "В работе",
      statusDone: "Завершено",
      statusUpdate: "Обновить статус",
      noEmail: "Нет email",
      propertyMissing: "Не найден",
      createdAt: "Создано",
      propertyLabel: "Объект:",
      active: "Активен",
      inactive: "Неактивен",
      hot: "Горячий",
      imagesCount: (params) => `${params?.count ?? 0} фото`,
      editTitle: "Редактировать объект",
      editBody: "Обновите данные объекта и фото.",
      form: {
        title: "Заголовок",
        address: "Адрес: \"улица + номер дома, город\"",
        addressPreview: "Просмотр адреса",
        description: "Описание",
        params: "Параметры",
        price: "Цена",
        sale: "Продажа",
        rent: "Аренда",
        active: "Показывать на сайте",
        isHot: "Горячий объект",
        images: "Фото объекта",
        imagesHint: "Можно выбрать несколько фото.",
        submitCreate: "Добавить объект",
        submitUpdate: "Сохранить изменения",
        statusSold: "Продано",
        statusRented: "Сдано",
        statusAvailable: "Доступно",
        removeImage: "Удалить фото",
        keepImage: "Оставить",
        close: "Закрыть",
        saveParams: "Сохранить параметры",
        addressMap: "Карта адреса",
        statusToggleSold: "Отметить как продано",
        statusToggleAvailable: "Вернуть в доступно",
        statusToggleRented: "Отметить как сдано",
      },
    },
    confirm: {
      approve: "Подтвердить",
      cancel: "Отмена",
    },
    email: {
      alerts: {
        subject: (params) => `Новый объект для вас: ${params?.title ?? ""}`,
        title: "Новый объект для вас",
        view: "Открыть объект",
        unsubscribe: "Отписаться от уведомлений",
        auto: "Автоматическое сообщение с сайта",
        property: "Объект:",
        type: "Тип:",
        price: "Цена:",
        sale: "Продажа",
        rent: "Аренда",
        link: "Ссылка:",
      },
      inquiry: {
        subject: (params) => `Новая заявка по объекту: ${params?.title ?? ""}`,
        lead: "Новая заявка с сайта",
        type: "Тип",
        price: "Цена",
        address: "Адрес",
        details: "Основные параметры",
        contact: "Контакты",
        name: "Имя",
        phone: "Телефон",
        email: "Email",
        message: "Сообщение",
        map: "Карты",
        view: "Открыть объект",
        noEmail: "Нет",
      },
      valuation: {
        subject: (params) => `Новый запрос оценки: ${params?.name ?? ""}`,
        title: "Запрос оценки стоимости",
        contact: "Контакты",
        property: "Данные объекта",
        name: "Имя",
        phone: "Телефон",
        email: "Email",
        address: "Адрес",
        type: "Тип недвижимости",
        rooms: "Комнаты",
        notes: "Примечания",
        noEmail: "Нет",
      },
    },
  },
};

function getValue(locale: Locale, key: string): TranslationValue | TranslationValue[] | undefined {
  const parts = key.split(".");
  let current: TranslationValue | TranslationValue[] | TranslationObject | undefined = translations[locale];
  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }
    current = (current as TranslationObject)[part] as TranslationValue | TranslationValue[] | undefined;
  }
  return current as TranslationValue | TranslationValue[] | undefined;
}

export function t(locale: Locale, key: string, params?: TranslationParams) {
  const value = getValue(locale, key);
  if (typeof value === "function") {
    return value(params);
  }
  if (typeof value === "string") {
    return value;
  }
  return key;
}

export function getArray(locale: Locale, key: string) {
  const value = getValue(locale, key);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

const detailLabelMap: Record<string, { he: string; ru: string }> = {
  "מיקום": { he: "מיקום", ru: "Локация" },
  "סוג הנכס": { he: "סוג הנכס", ru: "Тип объекта" },
  "גודל": { he: "גודל", ru: "Площадь" },
  "מספר חדרים": { he: "מספר חדרים", ru: "Количество комнат" },
  "קומה": { he: "קומה", ru: "Этаж" },
  "כיווני אוויר": { he: "כיווני אוויר", ru: "Стороны света" },
  "מצב הנכס": { he: "מצב הנכס", ru: "Состояние" },
  "חניה": { he: "חניה", ru: "Парковка" },
  "תוספות": { he: "תוספות", ru: "Дополнительно" },
  "בניין וסביבה": { he: "בניין וסביבה", ru: "Здание и окружение" },
  "נוף": { he: "נוף", ru: "Вид" },
  "מחיר ותנאים": { he: "מחיר ותנאים", ru: "Цена и условия" },
  "למי זה מתאים": { he: "למי זה מתאים", ru: "Кому подходит" },
};

const detailValueMap: Record<string, string> = {
  "דירה": "Квартира",
  "בית פרטי": "Частный дом",
  "פנטהאוז": "Пентхаус",
  "דופלקס": "Дуплекс",
  "מגרש": "Участок",
  "אחר": "Другое",
  "חדש": "Новый",
  "משופץ": "После ремонта",
  "שמור": "Сохранен",
  "צריך שיפוץ": "Нужен ремонт",
  "מרפסת": "Балкон",
  "גינה": "Сад",
  "מחסן": "Кладовая",
  "חניה פרטית": "Частная парковка",
  "ממ״ד": "Защищенная комната",
  "יחידת דיור": "Доп. единица жилья",
  "חדר ארונות": "Гардеробная",
  "לובי": "Лобби",
  "תחזוקה": "Содержание",
  "ועד בית": "Домком",
  "שכנים": "Соседи",
  "שקט/רעש": "Шум/тишина",
  "יש": "Есть",
  "אין": "Нет",
};

const detailInlineMap: Record<string, string> = {
  "מ\"ר בנוי": "Жилая площадь м2",
  "מ\"ר מרפסת": "Площадь балкона м2",
  "שטח מגרש": "Площадь участка",
};

export function translateDetailLabel(locale: Locale, label: string) {
  if (locale === "he") {
    return label;
  }
  return detailLabelMap[label]?.ru ?? label;
}

export function translateDetailValue(locale: Locale, value: string) {
  if (locale === "he") {
    return value;
  }

  const parts = value.split(",").map((part) => part.trim());
  const translated = parts.map((part) => {
    if (part.startsWith("אחר - ")) {
      return `Другое - ${part.replace("אחר - ", "").trim()}`;
    }
    if (detailValueMap[part]) {
      return detailValueMap[part];
    }
    let next = part;
    Object.entries(detailInlineMap).forEach(([from, to]) => {
      next = next.replace(from, to);
    });
    Object.entries(detailValueMap).forEach(([from, to]) => {
      next = next.replace(from, to);
    });
    return next;
  });

  return translated.join(", ");
}

export function getPropertyTypeLabel(locale: Locale, type: "SALE" | "RENT") {
  return type === "SALE" ? t(locale, "property.sale") : t(locale, "property.rent");
}
