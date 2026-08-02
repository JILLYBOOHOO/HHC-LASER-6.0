const fs = require('fs');

const path = 'c:\\Users\\Amber Student\\Downloads\\HHCLASER5.0-main\\HHCLASER5.0-main\\frontend\\src\\app\\features\\public\\services\\services.component.ts';
let content = fs.readFileSync(path, 'utf8');

const updates = {
  'WOOD THERAPY': 9000,
  'BOTOX Consultation': 10000,
  'DERMAL FILLERS (Consultation)': 10000,
  'DARK CIRCLES': 5000,
  'SKIN RESURFACING': 14000,
  'HEAT SHOCK- BODY/ SKIN DETOX': 9000,
  'ACNE / DARK SPOTS': 12000,
  'CHEMICAL PEEL': 28000,
  'ENLARGED PORES': 14000,
  'MICRODERMABRASION': 12000,
  'PHOTOREJUVENATION': 12000,
  'FAT REDUCTION': 40000,
  'FUNGUS': 5000,
  'HAIR RESTORATION': 29000,
  'IV THERAPY': 23000,
  'VITAL SHOTS': 9000,
  'KELOID (Consultation)': 5000,
  'Abdomen': 14000,
  'Aerola': 12000,
  'Armpits': 12000,
  'Arms and Shoulders': 20000,
  'Bikini Line': 12000,
  'Brazilian Only': 12000,
  'Chin Only': 10000,
  'Chin and Neck': 12000,
  'FOLLICULITIS': 12000,
  'Fingers and Toes': 12000,
  'Full Abdomen': 18000,
  'Full Abdomen and Chest': 22000,
  'Full Back': 24000,
  'Full Bottom': 16000,
  'Full Chest': 16000,
  'Full Legs': 26000,
  'Full Pubic + Armpits': 14000,
  'Full Thighs': 22000,
  'Full chest': 16000,
  'Inner Thigh': 14000,
  'Jawline and Neck': 12000,
  'Lower Back': 14000,
  'Lower Legs': 18000,
  'Mid-Chest': 12000,
  'Posterior Thighs': 18000,
  'Posterior Thighs and Bottom': 20000,
  'Pubic, Armpit and Brazilian (Special)': 16000,
  'Upper Back': 18000,
  'HEAD & BODY MASSAGE / HEAD SPA': 19000,
  'LYMPATHIC DRAINAGE': 9000,
  'MICRONEEDLING PRP': 29000,
  'PRF PLASMA TREATMENT': 29000,
  'NON-SURGICAL BBL': 5000,
  'PSEUDOFOLLICULITIS': 12000,
  'SCARS': 15000,
  'CELLULITES': 5000,
  'SKIN TIGHTENING': 5000,
  'STRETCH MARKS': 16000,
  'SKIN TAG': 5000,
  'TATTOO REMOVAL': 5000,
  'SEMEGLUTHIDE': 5000,
  'WEIGHTLOSS (Consultation)': 5000
};

// Also let's fix FOLLICULITIS and PSEUDOFOLLICULITIS images since they might be swapped or wrong
// We can use regex to replace price_jmd: 0 with the correct price based on the name

const regex = /name: '([^']+)', price_jmd: (\d+)/g;
content = content.replace(regex, (match, name, oldPrice) => {
  if (updates[name] !== undefined) {
    return `name: '${name}', price_jmd: ${updates[name]}`;
  }
  return match;
});

// Fix image for FOLLICULITIS
content = content.replace(
  /name: 'FOLLICULITIS', price_jmd: 12000, duration_minutes: 10, short_description: '[^']+', thumbnail_url: '[^']+'/,
  "name: 'FOLLICULITIS', price_jmd: 12000, duration_minutes: 10, short_description: 'A Consultation Is Necessary to Determine Treatment Needed. This Treatment Consist of a Combination of Treatment which Depends on Condition.', thumbnail_url: '/hhclaser_img/hhclaser_images/LASER HAIR REMOVAL & FOLLICULITIS.jpg'"
);

// Fix image for PSEUDOFOLLICULITIS
content = content.replace(
  /name: 'PSEUDOFOLLICULITIS', price_jmd: 12000, duration_minutes: 15, short_description: '[^']+', thumbnail_url: '[^']+'/,
  "name: 'PSEUDOFOLLICULITIS', price_jmd: 12000, duration_minutes: 15, short_description: 'Inflamation Mainly affecting head and other areas.', thumbnail_url: '/hhclaser_img/hhclaser_images/FOLLICULITIS - 1.jpg'"
);

fs.writeFileSync(path, content);
console.log('Prices updated successfully.');
