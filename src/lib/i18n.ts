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
  language: "اللغة", currency: "العملة", yourName: "اسمك", export: "تصدير نسخة احتياطية", import: "استيراد نسخة", reset: "مسح كل البيانات", resetConfirm: "سيتم حذف كل البيانات نهائياً. متأكد؟",
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
  language: "Language", currency: "Currency", yourName: "Your name", export: "Export backup", import: "Import backup", reset: "Erase all data", resetConfirm: "All data will be deleted permanently. Sure?",
  insufficient: "Not enough balance in this vault", invalidAmount: "Enter a valid amount", deleted: "Deleted", undo: "Undo", added: "Added",
  essential: "Essentials", savings: "Savings", investment: "Investment", learning: "Learning", lifestyle: "Lifestyle", giving: "Giving",
  thisMonth: "This month", spent: "Spent", earned: "Earned", search: "Search", all: "All", color: "Color",
  sounds: { default: "Default", gentle: "Gentle", urgent: "Urgent", bell: "Bell" },
};

export const dicts = { ar, en };
export type Lang = keyof typeof dicts;

export function useT() {
  const lang = useZad((s) => s.settings.lang);
  return { t: dicts[lang], lang, dir: lang === "ar" ? "rtl" : "ltr" } as const;
}
