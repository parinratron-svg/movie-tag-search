// แมปคำ/วลีภาษาไทยไปหา keyword ภาษาอังกฤษที่ตรงกับ tags จริงในฐานข้อมูล
// อ้างอิงจากผลลัพธ์ scripts/listTags.ts
export const thaiTagDictionary: Record<string, string[]> = {
  // ซูเปอร์ฮีโร่ (ธีมหลักของฐานข้อมูลตอนนี้)
  "ซูเปอร์ฮีโร่": ["superhero", "hero", "superhero team", "masked superhero", "super power"],
  "ฮีโร่": ["hero", "superhero", "anti hero"],
  "พลังพิเศษ": ["super power", "supernatural"],
  "หน้ากาก": ["masked superhero", "masked vigilante", "secret identity"],
  "ตัวตนลับ": ["secret identity"],
  "วีรบุรุษ": ["hero", "anti hero"],
  "ฮีโร่กลุ่ม": ["superhero team", "teamwork"],
  "มาร์เวล": ["marvel cinematic universe (mcu)"],
  "จักรวาลมาร์เวล": ["marvel cinematic universe (mcu)"],

  // วายร้าย/อาชญากรรม
  "วายร้าย": ["villain", "masked vigilante"],
  "ผู้ร้าย": ["villain", "gangster"],
  "แก๊งอันธพาล": ["gangster"],
  "แก้แค้น": ["revenge", "betrayal"],
  "ทรยศ": ["betrayal"],

  // อวกาศ/นิยายวิทยาศาสตร์
  "อวกาศ": ["space", "space adventure", "space travel", "galaxy"],
  "กาแล็กซี่": ["galaxy", "space"],
  "มนุษย์ต่างดาว": ["alien", "alien invasion"],
  "เอเลี่ยน": ["alien", "alien invasion"],
  "บุกโลก": ["alien invasion"],
  "ผจญภัยในอวกาศ": ["space adventure"],
  "โลกอนาคต": ["dystopia"],
  "ดิสโทเปีย": ["dystopia"],
  "ทรานส์ฮิวแมน": ["transhumanism"],

  // การ์ตูน/คอมมิค/ดัดแปลง
  "คอมมิค": ["based on comic"],
  "การ์ตูน": ["based on comic", "3d animation", "pixar"],
  "ดัดแปลงจากนิยาย": ["based on novel or book"],
  "เรื่องจริง": ["based on true story"],
  "จากซีรีส์": ["based on tv series"],
  "ภาคต่อ": ["sequel", "spin off"],
  "รีบูท": ["reboot"],
  "ฉากหลังเครดิต": ["aftercreditsstinger", "duringcreditsstinger"],

  // เหนือธรรมชาติ/แฟนตาซี
  "เหนือธรรมชาติ": ["supernatural", "supernatural horror"],
  "ปีศาจ": ["demon"],
  "ผี": ["supernatural horror", "demon"],
  "เวทมนตร์": ["magic"],

  // ครอบครัว/มิตรภาพ
  "ครอบครัว": ["family", "father daughter relationship", "dysfunctional family"],
  "ครอบครัวมีปัญหา": ["dysfunctional family"],
  "พ่อลูก": ["father daughter relationship"],
  "มิตรภาพ": ["friendship", "teamwork"],
  "ทีมเวิร์ค": ["teamwork"],
  "กลั่นแกล้ง": ["bullying"],

  // ตลก/อารมณ์สนุก
  "ตลก": ["hilarious", "buddy comedy"],
  "ฮาๆ": ["hilarious", "amused"],
  "สนุกสนาน": ["joyous", "amused", "enthusiastic"],
  "คู่หูตลก": ["buddy comedy"],
  "ตื่นเต้น": ["excited", "enthusiastic"],
  "คิดถึงอดีต": ["nostalgic"],
  "อบอุ่นใจ": ["joyous", "family"],

  // ของเล่น/สัตว์
  "ของเล่นมีชีวิต": ["toy comes to life"],
  "สัตว์พูดได้": ["talking animal"],

  // อื่นๆ
  "นิวยอร์ก": ["new york city"],
  "หนังอินดี้": ["independent film"],
  "จิตวิทยา": ["psychological"],
  "ซับซ้อน": ["complex", "psychological"],
  "กล้าหาญ": ["bold", "audacious"],
  "ยุค 80": ["1980s"],
  "ยุค 40": ["1940s"],
};