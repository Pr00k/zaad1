import { useZad } from "./store";

const ar = {
  appName: "زاد", tagline: "إدارة واعية لأموالك ومواعيدك",
  hello: "مرحبًا", total: "إجمالي الرصيد", ops: "عملية", growth: "تغيّر الرصيد", last7: "آخر 7 أيام",
  income: "الدخل", expense: "المصروفات", activity: "المعاملات", vaults: "الخزائن", goals: "الأهداف", reminders: "التذكيرات", settings: "الإعدادات", home: "الرئيسية",
  addIncome: "إضافة دخل", addExpense: "إضافة مصروف", addGoal: "هدف جديد", addReminder: "تذكير جديد", addVault: "خزنة جديدة",
  amount: "المبلغ", note: "ملاحظة", date: "التاريخ", time: "الوقت", vault: "الخزنة", name: "الاسم", reminderTitle: "عنوان التذكير", notFound: "لم نعثر على هذه الصفحة", unexpectedError: "تعذّر إكمال الطلب", retry: "إعادة المحاولة", save: "حفظ", cancel: "إلغاء", add: "إضافة", delete: "حذف", edit: "تعديل",
  splitAuto: "توزيع تلقائي وفق النسب المحددة", toVault: "إيداع في خزنة واحدة",
  seeAll: "عرض الكل", recent: "أحدث المعاملات", noTx: "لا توجد معاملات حتى الآن", noVaults: "لا توجد خزائن حتى الآن", noGoals: "لا توجد أهداف حتى الآن", noReminders: "لا توجد تذكيرات حتى الآن",
  target: "المبلغ المستهدف", deadline: "تاريخ تحقيق الهدف", fundedFrom: "خزنة التمويل", contribute: "إيداع للهدف", saved: "المبلغ المدّخر", left: "المبلغ المتبقي", reached: "تم تحقيق الهدف 🎉",
  pct: "نسبة التوزيع", pctSum: "إجمالي النسب", mustBe100: "يجب أن يكون إجمالي النسب 100%", normalize: "موازنة النسب إلى 100%",
  repeat: "التكرار", once: "مرة واحدة", daily: "يومياً", weekly: "أسبوعياً", weekdays: "أيام العمل", monthly: "شهرياً", yearly: "سنوياً", interval: "كل فترة مخصصة",
  every: "كل", minutes: "دقائق", hours: "ساعات", days: "أيام", weeks: "أسابيع", months: "أشهر",
  linkedGoal: "الهدف المرتبط", none: "دون ارتباط", snooze: "تأجيل التذكير", min: "د", vibrate: "الاهتزاز", sound: "نغمة التنبيه", enabled: "مفعّل", next: "الموعد القادم",
  done: "تم", notifPerm: "تفعيل الإشعارات", notifOn: "الإشعارات مفعّلة", notifOff: "الإشعارات غير مفعّلة",
  language: "اللغة", gMorning: "صباح الخير", gNoon: "نهارك سعيد", gAfternoon: "مساء الخير", gEvening: "مساء الخير", gNight: "مساء الخير", email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "تسجيل الدخول", createAccount: "إنشاء حساب", noAccount: "ليس لديك حساب؟", haveAccount: "لديك حساب؟", checkEmail: "تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد ثم سجّل الدخول.", or: "أو", photoSetting: "الصورة الشخصية", useGooglePhoto: "استخدام صورة حساب Google تلقائيًا", uploadPhoto: "اختيار صورة من الجهاز", removePhoto: "إزالة الصورة", authError: "تعذّر تسجيل الدخول. تحقّق من بياناتك وحاول مجددًا.", account: "الحساب", signInGoogle: "المتابعة بحساب Google", signOut: "تسجيل الخروج", profile: "الملف الشخصي", photoOptional: "الصورة الشخصية (اختياري)", choosePhoto: "اختر صورة",  welcome: "مرحباً بك في زاد", signInHint: "سجّل الدخول بالبريد الإلكتروني أو بحساب Google.", skip: "المتابعة بدون حساب", uiFallback: "النصوص تظهر بالإنجليزية لهذه اللغة، والأرقام والتواريخ بصيغتها.", currency: "العملة", yourName: "الاسم الكامل", export: "تصدير نسخة احتياطية", import: "استيراد نسخة احتياطية", reset: "مسح كل البيانات", resetConfirm: "سيتم حذف جميع بياناتك المالية والتذكيرات من هذا الجهاز نهائيًا. هل تريد المتابعة؟",
  insufficient: "رصيد هذه الخزنة غير كافٍ", invalidAmount: "أدخل مبلغًا صحيحًا أكبر من صفر", invalidBackup: "تعذّر استيراد النسخة الاحتياطية. اختر ملفًا صالحًا.", deleted: "تم الحذف", undo: "تراجع", added: "تمت الإضافة",
  essential: "الاحتياجات الأساسية", savings: "الادخار", investment: "الاستثمار", learning: "التعلّم", lifestyle: "الترفيه", giving: "العطاء", emergency: "صندوق الطوارئ",
  thisMonth: "هذا الشهر", spent: "إجمالي المصروفات", earned: "إجمالي الدخل", search: "بحث", all: "الكل", color: "اللون",
  sounds: { default: "افتراضي", gentle: "هادئ", urgent: "عاجل", bell: "جرس" },
};
type Dict = typeof ar;
const en: Dict = {
  appName: "Zad", tagline: "Mindful money and time management",
  hello: "Hello", total: "Total balance", ops: "transactions", growth: "Balance history", last7: "Last 7 days",
  income: "Income", expense: "Expenses", activity: "Transactions", vaults: "Vaults", goals: "Goals", reminders: "Reminders", settings: "Settings", home: "Home",
  addIncome: "Add income", addExpense: "Add expense", addGoal: "New goal", addReminder: "New reminder", addVault: "New vault",
  amount: "Amount", note: "Note", date: "Date", time: "Time", vault: "Vault", name: "Name", reminderTitle: "Reminder title", notFound: "Page not found", unexpectedError: "Unable to complete your request", retry: "Try again", save: "Save", cancel: "Cancel", add: "Add", delete: "Delete", edit: "Edit",
  splitAuto: "Auto-split across vaults by percentage", toVault: "Into one vault",
  seeAll: "View all", recent: "Recent transactions", noTx: "No transactions yet", noVaults: "No vaults yet", noGoals: "No goals yet", noReminders: "No reminders yet",
  target: "Target amount", deadline: "Target date", fundedFrom: "Funding vault", contribute: "Add to goal", saved: "Amount saved", left: "Amount remaining", reached: "Goal achieved 🎉",
  pct: "Allocation", pctSum: "Total allocation", mustBe100: "Total allocation must equal 100%", normalize: "Balance to 100%",
  repeat: "Repeat", once: "Once", daily: "Daily", weekly: "Weekly", weekdays: "Weekdays", monthly: "Monthly", yearly: "Yearly", interval: "Custom interval",
  every: "Every", minutes: "minutes", hours: "hours", days: "days", weeks: "weeks", months: "months",
  linkedGoal: "Linked goal", none: "None", snooze: "Snooze", min: "m", vibrate: "Vibrate", sound: "Sound", enabled: "Enabled", next: "Next",
  done: "Done", notifPerm: "Allow notifications", notifOn: "Notifications on", notifOff: "Notifications blocked",
  language: "Language", gMorning: "Good morning", gNoon: "Good afternoon", gAfternoon: "Good afternoon", gEvening: "Good evening", gNight: "Good evening", email: "Email", password: "Password", signIn: "Sign in", createAccount: "Create account", noAccount: "No account?", haveAccount: "Have an account?", checkEmail: "Account created. Open your email, click the confirmation link, then sign in.", or: "or", photoSetting: "Profile photo", useGooglePhoto: "Use my Google profile photo automatically", uploadPhoto: "Choose a photo", removePhoto: "Remove photo", authError: "Unable to sign in. Check your details and try again.", account: "Account", signInGoogle: "Continue with Google", signOut: "Sign out", profile: "Profile", photoOptional: "Profile photo (optional)", choosePhoto: "Choose photo",  welcome: "Welcome to Zad", signInHint: "Sign in with your email address or Google account.", skip: "Continue without account", uiFallback: "Interface text shows in English for this language; numbers and dates use its format.", currency: "Currency", yourName: "Full name", export: "Export backup", import: "Import backup", reset: "Erase all data", resetConfirm: "All financial data and reminders on this device will be permanently deleted. Continue?",
  insufficient: "This vault has insufficient funds", invalidAmount: "Enter a valid amount greater than zero", invalidBackup: "Unable to import this backup. Choose a valid backup file.", deleted: "Deleted", undo: "Undo", added: "Added",
  essential: "Essential needs", savings: "Savings", investment: "Investment", learning: "Learning", lifestyle: "Leisure", giving: "Giving", emergency: "Emergency fund",
  thisMonth: "This month", spent: "Total expenses", earned: "Total income", search: "Search", all: "All", color: "Color",
  sounds: { default: "Default", gentle: "Gentle", urgent: "Urgent", bell: "Bell" },
};

export const dicts = { ar, en };
export type Lang = string;
const RTL = new Set(["ar","he","fa","ur","ps","yi","ckb","dv","sd","ug","ku"]);
export const isRtl = (l: string) => RTL.has(l.split("-")[0] ?? l);
export const LANG_CODES = "af am ar as az be bg bn bo bs ca ceb ckb co cs cy da de dv el en eo es et eu fa fi fil fj fo fr fy ga gd gl gn gu ha haw he hi hmn hr ht hu hy id ig is it ja jv ka kk km kn ko ku ky la lb lo lt lv mg mi mk ml mn mr ms mt my ne nl no ny om or pa pl ps pt qu ro ru rw sd si sk sl sm sn so sq sr st su sv sw ta te tg th ti tk tl to tr tt ug uk ur uz vi wo xh yi yo zh zu".split(" ");
export function langName(code: string, inLang: string) {
  try { return new Intl.DisplayNames([inLang], { type: "language" }).of(code) ?? code; } catch { return code; }
}
export function nativeName(code: string) { return langName(code, code); }

export function useT() {
  const lang = useZad((s) => s.settings.lang);
  const t = lang === "ar" ? dicts.ar : dicts.en;
  return { t, lang, dir: isRtl(lang) ? "rtl" : "ltr" } as const;
}

export function greetingKey(h = new Date().getHours()) {
  if (h >= 5 && h < 11) return "gMorning" as const;
  if (h >= 11 && h < 14) return "gNoon" as const;
  if (h >= 14 && h < 17) return "gAfternoon" as const;
  if (h >= 17 && h < 21) return "gEvening" as const;
  return "gNight" as const;
}
