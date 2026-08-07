"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
const FALLBACK_SERVICES = [
    {
        id: 55,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "WOOD THERAPY",
        price_jmd: 9000,
        duration_minutes: 45,
        short_description: "Improves Blood Circulation, Reduces Cellulites and Fat Deposits While Promoting Lymphatic Drainage to Flush Toxins.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/55_WOOD THERAPY.jpg",
    },
    {
        id: 41,
        category_id: 2,
        category_name: "Injectables & Aesthetics",
        name: "BOTOX Consultation",
        price_jmd: 10000,
        duration_minutes: 20,
        short_description: "Aid in SMOOTHING FACIAL WRINKLES, EXCESS SWEATING, CHRONIC MIGRAINES.  CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/41_BOTOX Consultation.jpg",
    },
    {
        id: 42,
        category_id: 2,
        category_name: "Injectables & Aesthetics",
        name: "DERMAL FILLERS (Consultation)",
        price_jmd: 10000,
        duration_minutes: 20,
        short_description: "Filler add VOLUME and Plump Skin Face &amp; Body. CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/42_DERMAL FILLERS _Consultation_.jpg",
    },
    {
        id: 67,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "DARK CIRCLES",
        price_jmd: 5000,
        duration_minutes: 15,
        short_description: "A Consultation is Necessary to Determine Treatment Needed.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/67_DARK CIRCLES.webp",
    },
    {
        id: 58,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "SKIN RESURFACING",
        price_jmd: 14000,
        duration_minutes: 25,
        short_description: "CONSULTATION NECESSARY ( Fee is put towards treatment)  Advanced laser treatments for skin Resurfacing and Rejuvenation. Reduce HYPERPIGMENTATION, SPOTS, PORES, SCARS, WRINKLES  &amp; FINE LINES. A...",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/58_SKIN RESURFACING.jpg",
    },
    {
        id: 68,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "HEAT SHOCK- BODY/ SKIN DETOX",
        price_jmd: 9000,
        duration_minutes: 25,
        short_description: "Balance Metabolism, Reset, Aids Weightloss, and Skin Treatments",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/68_HEAT SHOCK_ BODY_ SKIN DETOX.jpg",
    },
    {
        id: 35,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "ACNE / DARK SPOTS",
        price_jmd: 12000,
        duration_minutes: 25,
        short_description: "Inflammation cause by Hormonal, Blackheads, Whiteheads, Pustules, Milia. Skin Resurfacing is also added",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/35_ACNE _ DARK SPOTS.jpg",
    },
    {
        id: 63,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "CHEMICAL PEEL",
        price_jmd: 28000,
        duration_minutes: 50,
        short_description: "Reduces Fine Lines and Wrinkles, Fades Dark Spots and Acne Scars,Treats ACNE and controls Oil, and Improves Overall Skin Texture and Radiance.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/63_CHEMICAL PEEL.jpg",
    },
    {
        id: 61,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "ENLARGED PORES",
        price_jmd: 14000,
        duration_minutes: 30,
        short_description: "TREATMENT REGENERATE  CELLS, EXOSOME : Visibly Shrink and Heal Skin Texture Appears Smooth and Soft to Touch.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/61_ENLARGED PORES.jpg",
    },
    {
        id: 62,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "MICRODERMABRASION",
        price_jmd: 12000,
        duration_minutes: 30,
        short_description: "Reduces The Appearance of Fine Lines, Removes Dead Skin, While Unclogging PORES, Leavin a Smoother Skin, a Brighter Complexion and A More Even Skin Tone.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/62_MICRODERMABRASION.webp",
    },
    {
        id: 54,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "PHOTOREJUVENATION",
        price_jmd: 12000,
        duration_minutes: 25,
        short_description: "Restores PEPTIDES and ENZYMES, Glow Forever When You Remove Dead Skin, Black Heads and White Heads.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/54_PHOTOREJUVENATION.jpg",
    },
    {
        id: 40,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "FAT REDUCTION",
        price_jmd: 40000,
        duration_minutes: 45,
        short_description: "FAT Reduction Treatment. Mini-Non-invasive. CONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/40_FAT REDUCTION.jpg",
    },
    {
        id: 46,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "FUNGUS",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "MEDICAL TREATMENT for Skin, Toes, Head, Nails. A CONSULTATION is Necessary to Determine Treatment Needed.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/46_FUNGUS.jpg",
    },
    {
        id: 38,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "HAIR RESTORATION",
        price_jmd: 29000,
        duration_minutes: 45,
        short_description: "Treats Alopecia, Hair Thinning and Bald Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/38_HAIR RESTORATION.jpg",
    },
    {
        id: 43,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "IV THERAPY",
        price_jmd: 23000,
        duration_minutes: 20,
        short_description: "VITAMIN B, Vitamin C, NAD &amp; GLUTHATHIONE. Power Shot Cocktails. CONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/43_IV THERAPY.jpg",
    },
    {
        id: 44,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "VITAL SHOTS",
        price_jmd: 9000,
        duration_minutes: 15,
        short_description: "VITAMIN B, Vitamin C, MAGNESIUM, NAD, Power Shot Cocktails. CONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/44_VITAL SHOTS.jpg",
    },
    {
        id: 45,
        category_id: 2,
        category_name: "Injectables & Aesthetics",
        name: "KELOID (Consultation)",
        price_jmd: 5000,
        duration_minutes: 15,
        short_description: "Reduction of Scar and Raised Areas on the Skin. CONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.  Consultation &amp; Treatment Can be Performed Same Day. This a Consultation for Treatment Plan",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/45_KELOID _Consultation_.jpg",
    },
    {
        id: 19,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Abdomen",
        price_jmd: 14000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/19_Abdomen.webp",
    },
    {
        id: 16,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Aerola",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/16_Aerola.webp",
    },
    {
        id: 15,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Armpits",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/15_Armpits.png",
    },
    {
        id: 25,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Arms and Shoulders",
        price_jmd: 20000,
        duration_minutes: 25,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/25_Arms and Shoulders.webp",
    },
    {
        id: 11,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Bikini Line",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/11_Bikini Line.webp",
    },
    {
        id: 13,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Brazilian Only",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/13_Brazilian Only.webp",
    },
    {
        id: 8,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Chin Only",
        price_jmd: 10000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/8_Chin Only.webp",
    },
    {
        id: 9,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Chin and Neck",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/9_Chin and Neck.webp",
    },
    {
        id: 50,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "FOLLICULITIS",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "A Consultation Is Necessary to Determine Treatment Needed. This Treatment Consist of a Combination of Treatment which Depends on Condition.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/50_FOLLICULITIS.jpg",
    },
    {
        id: 33,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Fingers and Toes",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/33_Fingers and Toes.webp",
    },
    {
        id: 20,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Abdomen",
        price_jmd: 18000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/20_Full Abdomen.webp",
    },
    {
        id: 21,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Abdomen and Chest",
        price_jmd: 22000,
        duration_minutes: 25,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/21_Full Abdomen and Chest.webp",
    },
    {
        id: 24,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Back",
        price_jmd: 24000,
        duration_minutes: 35,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/24_Full Back.webp",
    },
    {
        id: 32,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Bottom",
        price_jmd: 16000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps - Dark Spots - Folliculitis",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/32_Full Bottom.webp",
    },
    {
        id: 18,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Chest",
        price_jmd: 16000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/18_Full Chest.webp",
    },
    {
        id: 26,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Legs",
        price_jmd: 26000,
        duration_minutes: 55,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/26_Full Legs.webp",
    },
    {
        id: 12,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Pubic + Armpits",
        price_jmd: 14000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/12_Full Pubic _ Armpits.webp",
    },
    {
        id: 28,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full Thighs",
        price_jmd: 22000,
        duration_minutes: 25,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/28_Full Thighs.webp",
    },
    {
        id: 34,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Full chest",
        price_jmd: 16000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/34_Full chest.webp",
    },
    {
        id: 29,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Inner Thigh",
        price_jmd: 14000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/29_Inner Thigh.webp",
    },
    {
        id: 10,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Jawline and Neck",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/10_Jawline and Neck.webp",
    },
    {
        id: 23,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Lower Back",
        price_jmd: 14000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/23_Lower Back.png",
    },
    {
        id: 27,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Lower Legs",
        price_jmd: 18000,
        duration_minutes: 25,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/27_Lower Legs.webp",
    },
    {
        id: 17,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Mid-Chest",
        price_jmd: 12000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/17_Mid_Chest.webp",
    },
    {
        id: 30,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Posterior Thighs",
        price_jmd: 18000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/30_Posterior Thighs.webp",
    },
    {
        id: 31,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Posterior Thighs and Bottom",
        price_jmd: 20000,
        duration_minutes: 25,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/31_Posterior Thighs and Bottom.png",
    },
    {
        id: 14,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Pubic, Armpit and Brazilian (Special)",
        price_jmd: 16000,
        duration_minutes: 10,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/14_Pubic_ Armpit and Brazilian _Special_.webp",
    },
    {
        id: 22,
        category_id: 4,
        category_name: "Laser Hair Removal",
        name: "Upper Back",
        price_jmd: 18000,
        duration_minutes: 15,
        short_description: "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body. Reduce Ingrown Razor Bumps &amp; Dark Spots.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/22_Upper Back.webp",
    },
    {
        id: 59,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "HEAD & BODY MASSAGE / HEAD SPA",
        price_jmd: 19000,
        duration_minutes: 45,
        short_description: "RELAXATION Head Spa Paired with Body Massage.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/59_HEAD _ BODY MASSAGE _ HEAD SPA.jpg",
    },
    {
        id: 57,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "LYMPATHIC DRAINAGE",
        price_jmd: 9000,
        duration_minutes: 55,
        short_description: "Help Relieve Swelling (Lymphedema) Caused by Blockages or Medical Condition. This also Helps to Drain Fluid after Cosmetic surgery. Reduces Swelling, Brushing, and Discomfort.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/57_LYMPATHIC DRAINAGE.jpg",
    },
    {
        id: 49,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "MICRONEEDLING PRP",
        price_jmd: 29000,
        duration_minutes: 40,
        short_description: "Treats Sun Damages and Hyperpigmentation, Improves Skin Tone and Skin Texture, Restores Collagen and Elastin Production.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/49_MICRONEEDLING PRP.jpg",
    },
    {
        id: 48,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "PRF PLASMA TREATMENT",
        price_jmd: 29000,
        duration_minutes: 40,
        short_description: "PRF Enhances Skin Rejuvenation, Gets Rid of Fine Lines, ACNE Scars,  Enlarged PORES.  Skin becomes Smoother, Firmer and More Radiant.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/48_PRF PLASMA TREATMENT.jpg",
    },
    {
        id: 39,
        category_id: 2,
        category_name: "Injectables & Aesthetics",
        name: "NON-SURGICAL BBL",
        price_jmd: 5000,
        duration_minutes: 15,
        short_description: "Adds Volume to Areas Necessary Ex: Hips and Bottom. A Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/39_NON_SURGICAL BBL.jpg",
    },
    {
        id: 53,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "PSEUDOFOLLICULITIS",
        price_jmd: 12000,
        duration_minutes: 15,
        short_description: "Inflamation Mainly affecting head and other areas.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/53_PSEUDOFOLLICULITIS.jpg",
    },
    {
        id: 64,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "SCARS",
        price_jmd: 15000,
        duration_minutes: 20,
        short_description: "Reducing Appearance of scars cause by injury, insect bites, burn, surgery + more",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/64_SCARS.jpg",
    },
    {
        id: 56,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "CELLULITES",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "can reduce the appearance of cellulite through a combination of exercise, diet and treatments.  A Consultation is Necessary to Determine Treatment Needed. This a Consultation  for Treatment Plan.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/56_CELLULITES.jpg",
    },
    {
        id: 37,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "SKIN TIGHTENING",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "EFFECTIVELY Reduction of Sagging &amp; Dimpled Skin  MINIMAL/NON-INVASIVE TREATMENT. A Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan. Please See Be...",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/37_SKIN TIGHTENING.png",
    },
    {
        id: 60,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "STRETCH MARKS",
        price_jmd: 16000,
        duration_minutes: 45,
        short_description: "Stimulating Collagen By Using LASER, RADIOFREQUENCY &amp; GROWTH FACTORS PROVEN to Aid  Blood Flow . STRIAE APPEARS Less Visible and Often Reversed in Appearance, While Healing Skin within 6weeks ....",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/60_STRETCH MARKS.jpg",
    },
    {
        id: 52,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "SKIN TAG",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "A Consultation is Necessary to Determine Treatment Needed.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/52_SKIN TAG.jpg",
    },
    {
        id: 51,
        category_id: 3,
        category_name: "Facial & Skin Treatments",
        name: "TATTOO REMOVAL",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "A Consultation is Necessary to Determine Treatment Needed.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/51_TATTOO REMOVAL.jpg",
    },
    {
        id: 65,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "SEMEGLUTHIDE",
        price_jmd: 5000,
        duration_minutes: 15,
        short_description: "Doctors Visit Consultation is Necessary. This is a Consultation for Treatment Plan",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/65_SEMEGLUTHIDE.jpg",
    },
    {
        id: 47,
        category_id: 1,
        category_name: "Body & Wellness",
        name: "WEIGHTLOSS (Consultation)",
        price_jmd: 5000,
        duration_minutes: 10,
        short_description: "During Consultation an Assessment is Performed in Order to Recommend Suitable Treatment.",
        thumbnail_url: "/hhclaser_img/hhclaser_images/live/47_WEIGHTLOSS _Consultation_.webp",
    },
];
// GET /api/services  — public service catalog
router.get("/", async (req, res) => {
    try {
        const categoryId = req.query["category_id"];
        const isFeatured = req.query["is_featured"];
        let sql = `
      SELECT s.*, sc.name as category_name, sc.slug as category_slug
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.is_active = TRUE
    `;
        const params = [];
        if (categoryId) {
            sql += " AND s.category_id = ?";
            params.push(categoryId);
        }
        if (isFeatured === "true") {
            sql += " AND s.is_featured = TRUE";
        }
        sql += " ORDER BY sc.sort_order ASC, s.sort_order ASC";
        const services = await (0, database_1.executeQuery)(sql, params);
        if (services && services.length > 0) {
            res.json((0, types_1.successResponse)(services));
            return;
        }
        res.json((0, types_1.successResponse)(FALLBACK_SERVICES));
    }
    catch (e) {
        res.json((0, types_1.successResponse)(FALLBACK_SERVICES));
    }
});
// GET /api/services/:slug - fetch a single service by slug
router.get("/:slug", async (req, res, next) => {
    try {
        const slug = req.params["slug"];
        // Let's also support fetching by ID just in case
        const isId = !isNaN(Number(slug));
        const sql = `
      SELECT s.*, sc.name as category_name, sc.slug as category_slug
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE (s.slug = ? OR s.id = ?) AND s.is_active = TRUE
      LIMIT 1
    `;
        let service = await (0, database_1.executeQueryOne)(sql, [slug, isId ? Number(slug) : 0]);
        if (!service) {
            // Fallback to memory array if DB doesn't have it
            const fallbackMatch = FALLBACK_SERVICES.find((s) => s.slug === slug || (isId && s.id === Number(slug)));
            if (fallbackMatch) {
                let galleryStr = null;
                try {
                    const fs = require("fs");
                    const path = require("path");
                    const galleriesPath = path.join(__dirname, "../../../live_galleries.json");
                    if (fs.existsSync(galleriesPath)) {
                        const allGalleries = JSON.parse(fs.readFileSync(galleriesPath, "utf8"));
                        if (allGalleries[fallbackMatch.id]) {
                            galleryStr = JSON.stringify(allGalleries[fallbackMatch.id]);
                        }
                    }
                }
                catch (e) {
                    console.error("Error reading live_galleries.json", e);
                }
                service = {
                    ...fallbackMatch,
                    gallery_images: galleryStr,
                };
            }
        }
        // Prefer optimized galleries from live_galleries.json when available
        if (service) {
            try {
                const fs = require('fs');
                const path = require('path');
                const galleriesPath = path.join(__dirname, '../../../live_galleries.json');
                if (fs.existsSync(galleriesPath)) {
                    const allGalleries = JSON.parse(fs.readFileSync(galleriesPath, 'utf8'));
                    const items = allGalleries[String(service.id)] || allGalleries[service.id];
                    if (Array.isArray(items) && items.length) {
                        service.gallery_images = items;
                    }
                }
            }
            catch (err) {
                console.error('Error attaching live_galleries.json', err);
            }
        }
        if (service) {
            res.json((0, types_1.successResponse)(service));
        }
        else {
            res.status(404).json({ error: 'Service not found' });
        }
    }
    catch (e) {
        const slug = req.params['slug'];
        const isId = !isNaN(Number(slug));
        const fallbackMatch = FALLBACK_SERVICES.find((s) => s.slug === slug || (isId && s.id === Number(slug)));
        if (fallbackMatch) {
            let gallery = null;
            try {
                const fs = require('fs');
                const path = require('path');
                const galleriesPath = path.join(__dirname, '../../../live_galleries.json');
                if (fs.existsSync(galleriesPath)) {
                    const allGalleries = JSON.parse(fs.readFileSync(galleriesPath, 'utf8'));
                    gallery = allGalleries[String(fallbackMatch.id)] || null;
                }
            }
            catch (_) { }
            res.json((0, types_1.successResponse)({ ...fallbackMatch, gallery_images: gallery }));
            return;
        }
        next(e);
    }
});
// Admin Routes for CRUD
router.post("/", async (req, res, next) => {
    try {
        // In a real app we'd verify admin role here
        const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active, gallery_images, } = req.body;
        const insertId = await (0, database_1.executeUpdate)(`INSERT INTO services (category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active, gallery_images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            category_id,
            name,
            slug,
            description,
            price_jmd,
            duration_minutes,
            thumbnail_url,
            is_featured ? 1 : 0,
            is_active ? 1 : 0,
            gallery_images ? JSON.stringify(gallery_images) : null,
        ]);
        res.json((0, types_1.successResponse)({
            id: insertId,
            message: "Service created successfully",
        }));
    }
    catch (e) {
        next(e);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active, gallery_images, } = req.body;
        await (0, database_1.executeUpdate)(`UPDATE services SET category_id=?, name=?, slug=?, description=?, price_jmd=?, duration_minutes=?, thumbnail_url=?, is_featured=?, is_active=?, gallery_images=?
       WHERE id=?`, [
            category_id,
            name,
            slug,
            description,
            price_jmd,
            duration_minutes,
            thumbnail_url,
            is_featured ? 1 : 0,
            is_active ? 1 : 0,
            gallery_images ? JSON.stringify(gallery_images) : null,
            req.params["id"],
        ]);
        res.json((0, types_1.successResponse)({ message: "Service updated successfully" }));
    }
    catch (e) {
        next(e);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await (0, database_1.executeUpdate)(`DELETE FROM services WHERE id=?`, [req.params["id"]]);
        res.json((0, types_1.successResponse)({ message: "Service deleted successfully" }));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/services/categories  — list categories
router.get("/categories", async (_req, res, next) => {
    try {
        const categories = await (0, database_1.executeQuery)("SELECT * FROM service_categories WHERE is_active = TRUE ORDER BY sort_order ASC");
        res.json((0, types_1.successResponse)(categories));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=services.routes.js.map