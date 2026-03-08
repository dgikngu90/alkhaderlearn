export const GRADES = [
  { value: "الصف السابع", labelAr: "الصف السابع", labelEn: "7th Grade" },
  { value: "الصف الثامن", labelAr: "الصف الثامن", labelEn: "8th Grade" },
  { value: "الصف التاسع", labelAr: "الصف التاسع", labelEn: "9th Grade" },
  { value: "الصف العاشر", labelAr: "الصف العاشر", labelEn: "10th Grade" },
  { value: "الصف الحادي عشر", labelAr: "الصف الحادي عشر", labelEn: "11th Grade" },
  { value: "الصف الثاني عشر", labelAr: "الصف الثاني عشر", labelEn: "12th Grade" },
] as const;

export type GradeValue = typeof GRADES[number]["value"];
