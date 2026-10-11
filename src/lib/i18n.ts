import { useZad } from "./store";

const ar = {
  appName: "زاد", tagline: "أموالك ومهامك بذكاء",
  hello: "مرحباً", total: "الرصيد الكلي", ops: "عملية", growth: "نمو الرصيد", last7: "آخر 7 أيام",
  income: "دخل", expense: "مصروف", vaults: "الخزائن", goals: "الأهداف", reminders: "التذكيرات", settings: "الإعدادات", home: "الرئيسية",
  addIncome: "إضافة دخل", addExpense: "إضافة مصروف", addGoal: "هدف جديد", addReminder: "تذكير جديد", addVault: "خزنة جديدة",
  amount: "المبلغ", note: "ملاحظة", date: "التاريخ", time: "الوقت", vault: "الخزنة", name: "الاسم", save: "حفظ", cancel: "إلغاء", add: "إضافة", delete: "حذف", edit: "تعديل",
  splitAuto: "توزيع تلقائي على الخزائن حسب النسب", toVault: "إلى خزنة واحدة",
  seeAll: "عرض الكل", recent: "آخر العمليات", noTx: "لا توجد عمليات بعد", noGoals: "لا توجد أهداف بعد", noReminders: "لا توجد تذكيرات",
  target: "المبلغ المستهدف", deadline: "الموعد النهائي", fundedFrom: "ممول من", contribute: "إيداع للهدف", saved: "تم ادخار", left: "متبقي", reached: "تحقق الهدف 🎉",
  pct: "النسبة", pctSum: "مجموع النسب", mustBe100: "يجب أن يكون المجموع 100%", normalize: "ضبط إلى 100%",
  repeat: "التكرار", once: "مرة واحدة", daily: "يومياً", weekly: "أسبوعياً", weekdays: "أيام العمل", monthly: "شهرياً", yearly: "سنوياً", interval: "كل فترة مخصصة",
  every: "كل", minutes: "دقائق", hours: "ساعات", days: "أيام", weeks: "أسابيع", months: "أشهر",
  linkedGoal: "مرتبط بهدف", none: "بدون", snooze: "غفوة", min: "د", vibrate: "اهتزاز", sound: "الصوت", enabled: "مفعّل", next: "التالي",
  done: "تم", notifPerm: "السماح بالإشعارات", notifOn: "الإشعارات مفعّلة", notifOff: "الإشعارات غير مسموحة",
  language: "اللغة", gMorning: "صباح الخير", gNoon: "طاب ظهرك", gAfternoon: "طاب عصرك", gEvening: "مساء الخير", gNight: "مساء الخير، ليلة هانئة", email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "تسجيل الدخول", createAccount: "إنشاء حساب", noAccount: "ليس لديك حساب؟", haveAccount: "لديك حساب؟", checkEmail: "تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد ثم سجّل الدخول.", or: "أو", photoSetting: "الصورة الشخصية", useGooglePhoto: "استخدام صورة حساب Gmail تلقائياً", uploadPhoto: "رفع صورة يدوياً", removePhoto: "إزالة الصورة", authError: "تعذّر الدخول، تحقق من البيانات", account: "الحساب", signInGoogle: "المتابعة بحساب Google", signOut: "تسجيل الخروج", profile: "الملف الشخصي", photoOptional: "الصورة الشخصية (اختياري)", choosePhoto: "اختر صورة",  welcome: "مرحباً بك في زاد", signInHint: "سجّل دخولك بحساب Gmail لحفظ ملفك الشخصي.", skip: "المتابعة بدون حساب", uiFallback: "النصوص تظهر بالإنجليزية لهذه اللغة، والأرقام والتواريخ بصيغتها.", currency: "العملة", yourName: "اسمك", export: "تصدير نسخة احتياطية", import: "استيراد نسخة", reset: "مسح كل البيانات", resetConfirm: "سيتم حذف كل البيانات نهائياً. متأكد؟",
  insufficient: "الرصيد غير كافٍ في هذه الخزنة", invalidAmount: "أدخل مبلغاً صحيحاً", deleted: "تم الحذف", undo: "تراجع", added: "تمت الإضافة",
  essential: "الأساسيات", savings: "الادخار", investment: "الاستثمار", learning: "التعلم", lifestyle: "الترفيه", giving: "العطاء",
  thisMonth: "هذا الشهر", spent: "المصروف", earned: "الدخل", search: "بحث", all: "الكل", color: "اللون",
  sounds: { default: "افتراضي", gentle: "هادئ", urgent: "عاجل", bell: "جرس" },
};
type Dict = typeof ar;
const en: Dict = {
  appName: "Zad", tagline: "Your money & tasks, smarter",
  hello: "Hello", total: "Total balance", ops: "transactions", growth: "Balance growth", last7: "Last 7 days",
  income: "Income", expense: "Expense", vaults: "Vaults", goals: "Goals", reminders: "Reminders", settings: "Settings", home: "Home",
  addIncome: "Add income", addExpense: "Add expense", addGoal: "New goal", addReminder: "New reminder", addVault: "New vault",
  amount: "Amount", note: "Note", date: "Date", time: "Time", vault: "Vault", name: "Name", save: "Save", cancel: "Cancel", add: "Add", delete: "Delete", edit: "Edit",
  splitAuto: "Auto-split across vaults by percentage", toVault: "Into one vault",
  seeAll: "See all", recent: "Recent activity", noTx: "No transactions yet", noGoals: "No goals yet", noReminders: "No reminders",
  target: "Target amount", deadline: "Deadline", fundedFrom: "Funded from", contribute: "Contribute", saved: "Saved", left: "Left", reached: "Goal reached 🎉",
  pct: "Percent", pctSum: "Total", mustBe100: "Total must be 100%", normalize: "Fix to 100%",
  repeat: "Repeat", once: "Once", daily: "Daily", weekly: "Weekly", weekdays: "Weekdays", monthly: "Monthly", yearly: "Yearly", interval: "Custom interval",
  every: "Every", minutes: "minutes", hours: "hours", days: "days", weeks: "weeks", months: "months",
  linkedGoal: "Linked goal", none: "None", snooze: "Snooze", min: "m", vibrate: "Vibrate", sound: "Sound", enabled: "Enabled", next: "Next",
  done: "Done", notifPerm: "Allow notifications", notifOn: "Notifications on", notifOff: "Notifications blocked",
  language: "Language", gMorning: "Good morning", gNoon: "Good noon", gAfternoon: "Good afternoon", gEvening: "Good evening", gNight: "Good evening, have a calm night", email: "Email", password: "Password", signIn: "Sign in", createAccount: "Create account", noAccount: "No account?", haveAccount: "Have an account?", checkEmail: "Account created. Open your email, click the confirmation link, then sign in.", or: "or", photoSetting: "Profile photo", useGooglePhoto: "Use my Gmail photo automatically", uploadPhoto: "Upload photo manually", removePhoto: "Remove photo", authError: "Sign-in failed, check your details", account: "Account", signInGoogle: "Continue with Google", signOut: "Sign out", profile: "Profile", photoOptional: "Profile photo (optional)", choosePhoto: "Choose photo",  welcome: "Welcome to Zad", signInHint: "Sign in with your Gmail account to save your profile.", skip: "Continue without account", uiFallback: "Interface text shows in English for this language; numbers and dates use its format.", currency: "Currency", yourName: "Your name", export: "Export backup", import: "Import backup", reset: "Erase all data", resetConfirm: "All data will be deleted permanently. Sure?",
  insufficient: "Not enough balance in this vault", invalidAmount: "Enter a valid amount", deleted: "Deleted", undo: "Undo", added: "Added",
  essential: "Essentials", savings: "Savings", investment: "Investment", learning: "Learning", lifestyle: "Lifestyle", giving: "Giving",
  thisMonth: "This month", spent: "Spent", earned: "Earned", search: "Search", all: "All", color: "Color",
  sounds: { default: "Default", gentle: "Gentle", urgent: "Urgent", bell: "Bell" },
};

export const dicts = { ar, en };
export type Lang = string;
const RTL = new Set(["ar","he","fa","ur","ps","yi","ckb","dv","sd","ug","ku"]);
export const isRtl = (l: string) => RTL.has(l.split("-")[0]!);
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
