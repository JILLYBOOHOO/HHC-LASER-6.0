"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const types_1 = require("../models/types");
const router = (0, express_1.Router)();
const FALLBACK_SERVICES = [
    {
        "id": 55,
        "category_id": 11,
        "category_name": "BODY CONTOUR",
        "category_slug": "wood-therapy",
        "name": "WOOD THERAPY",
        "slug": "wood-therapy",
        "short_description": "Improves Blood Circulation, Reduces Cellulites and Fat Deposits While Promoting Lymphatic Drainage to Flush Toxins.",
        "duration_minutes": 45,
        "price_jmd": 9000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 1
    },
    {
        "id": 41,
        "category_id": 21,
        "category_name": "BOTOX / DERMAL FILLERS",
        "category_slug": "botox-consultation",
        "name": "BOTOX Consultation",
        "slug": "botox-consultation",
        "short_description": "Aid in SMOOTHING FACIAL WRINKLES, EXCESS SWEATING, CHRONIC MIGRAINES. \r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
        "duration_minutes": 20,
        "price_jmd": 10000,
        "thumbnail_url": "/images/botox_consultation.webp",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 2
    },
    {
        "id": 42,
        "category_id": 21,
        "category_name": "BOTOX / DERMAL FILLERS",
        "category_slug": "dermal-fillers-consultation-",
        "name": "DERMAL FILLERS (Consultation)",
        "slug": "dermal-fillers-consultation-",
        "short_description": "Filler add VOLUME and Plump Skin Face & Body.\r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
        "duration_minutes": 20,
        "price_jmd": 10000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 3
    },
    {
        "id": 67,
        "category_id": 2,
        "category_name": "DARK SPOTS / LASER RESURFACING",
        "category_slug": "dark-circles",
        "name": "DARK CIRCLES",
        "slug": "dark-circles",
        "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
        "duration_minutes": 15,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 4
    },
    {
        "id": 58,
        "category_id": 2,
        "category_name": "DARK SPOTS / LASER RESURFACING",
        "category_slug": "skin-resurfacing",
        "name": "SKIN RESURFACING",
        "slug": "skin-resurfacing",
        "short_description": "CONSULTATION NECESSARY ( Fee is put towards treatment)  Advanced laser treatments for skin Resurfacing and Rejuvenation.\r\nReduce HYPERPIGMENTATION, SPOTS, PORES, SCARS, WRINKLES  & FINE LINES.\r\nAreas Treated : FACE ● BACK ● INNER THIGH ● BOTTOM ●  LEGS●  ARMS ● CHEST",
        "duration_minutes": 25,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 5
    },
    {
        "id": 68,
        "category_id": 24,
        "category_name": "DETOX / HEAT SHOCK",
        "category_slug": "heat-shock-body-skin-detox",
        "name": "HEAT SHOCK- BODY/ SKIN DETOX",
        "slug": "heat-shock-body-skin-detox",
        "short_description": "Balance Metabolism, Reset, Aids Weightloss, and Skin Treatments",
        "duration_minutes": 25,
        "price_jmd": 9000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 6
    },
    {
        "id": 35,
        "category_id": 10,
        "category_name": "FACIALS",
        "category_slug": "acne-dark-spots",
        "name": "ACNE / DARK SPOTS",
        "slug": "acne-dark-spots",
        "short_description": "Inflammation cause by Hormonal, Blackheads, Whiteheads, Pustules, Milia. Skin Resurfacing is also added",
        "duration_minutes": 25,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 7
    },
    {
        "id": 63,
        "category_id": 10,
        "category_name": "FACIALS",
        "category_slug": "chemical-peel",
        "name": "CHEMICAL PEEL",
        "slug": "chemical-peel",
        "short_description": "Reduces Fine Lines and Wrinkles, Fades Dark Spots and Acne Scars,Treats ACNE and controls Oil, and Improves Overall Skin Texture and Radiance.",
        "duration_minutes": 50,
        "price_jmd": 28000,
        "thumbnail_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
        "is_active": 1,
        "is_featured": 1,
        "sort_order": 8
    },
    {
        "id": 61,
        "category_id": 10,
        "category_name": "FACIALS",
        "category_slug": "enlarged-pores",
        "name": "ENLARGED PORES",
        "slug": "enlarged-pores",
        "short_description": "TREATMENT REGENERATE  CELLS, EXOSOME : Visibly Shrink and Heal Skin Texture Appears Smooth and Soft to Touch.",
        "duration_minutes": 30,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 9
    },
    {
        "id": 62,
        "category_id": 10,
        "category_name": "FACIALS",
        "category_slug": "microdermabrasion",
        "name": "MICRODERMABRASION",
        "slug": "microdermabrasion",
        "short_description": "Reduces The Appearance of Fine Lines, Removes Dead Skin, While Unclogging PORES, Leavin a Smoother Skin, a Brighter Complexion and A More Even Skin Tone.",
        "duration_minutes": 30,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 10
    },
    {
        "id": 54,
        "category_id": 10,
        "category_name": "FACIALS",
        "category_slug": "photorejuvenation",
        "name": "PHOTOREJUVENATION",
        "slug": "photorejuvenation",
        "short_description": "Restores PEPTIDES and ENZYMES, Glow Forever When You Remove Dead Skin, Black Heads and White Heads.",
        "duration_minutes": 25,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 11
    },
    {
        "id": 40,
        "category_id": 17,
        "category_name": "FAT REDUCTION",
        "category_slug": "fat-reduction",
        "name": "FAT REDUCTION",
        "slug": "fat-reduction",
        "short_description": "FAT Reduction Treatment. Mini-Non-invasive.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        "duration_minutes": 45,
        "price_jmd": 40000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 12
    },
    {
        "id": 46,
        "category_id": 25,
        "category_name": "FUNGAL  TREATMENT",
        "category_slug": "fungus",
        "name": "FUNGUS",
        "slug": "fungus",
        "short_description": "MEDICAL TREATMENT for Skin, Toes, Head, Nails.\r\nA CONSULTATION is Necessary to Determine Treatment Needed.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 13
    },
    {
        "id": 38,
        "category_id": 3,
        "category_name": "HAIR RESTORATION",
        "category_slug": "hair-restoration",
        "name": "HAIR RESTORATION",
        "slug": "hair-restoration",
        "short_description": "Treats Alopecia, Hair Thinning and Bald Spots.",
        "duration_minutes": 45,
        "price_jmd": 29000,
        "thumbnail_url": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 14
    },
    {
        "id": 43,
        "category_id": 9,
        "category_name": "IV THERAPY / VITAL SHOTS",
        "category_slug": "iv-therapy",
        "name": "IV THERAPY",
        "slug": "iv-therapy",
        "short_description": "VITAMIN B, Vitamin C, NAD & GLUTHATHIONE.\r\nPower Shot Cocktails.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        "duration_minutes": 20,
        "price_jmd": 23000,
        "thumbnail_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 15
    },
    {
        "id": 44,
        "category_id": 9,
        "category_name": "IV THERAPY / VITAL SHOTS",
        "category_slug": "vital-shots",
        "name": "VITAL SHOTS",
        "slug": "vital-shots",
        "short_description": "VITAMIN B, Vitamin C, MAGNESIUM, NAD, Power Shot Cocktails.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
        "duration_minutes": 15,
        "price_jmd": 9000,
        "thumbnail_url": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1cdb?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 16
    },
    {
        "id": 45,
        "category_id": 18,
        "category_name": "KELOID TREATMENT",
        "category_slug": "keloid-consultation-",
        "name": "KELOID (Consultation)",
        "slug": "keloid-consultation-",
        "short_description": "Reduction of Scar and Raised Areas on the Skin.\r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED. \r\nConsultation & Treatment Can be Performed Same Day. This a Consultation for Treatment Plan",
        "duration_minutes": 15,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 17
    },
    {
        "id": 19,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "abdomen",
        "name": "Abdomen",
        "slug": "abdomen",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 18
    },
    {
        "id": 16,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "aerola",
        "name": "Aerola",
        "slug": "aerola",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 19
    },
    {
        "id": 15,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "armpits",
        "name": "Armpits",
        "slug": "armpits",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 20
    },
    {
        "id": 25,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "arms-and-shoulders",
        "name": "Arms and Shoulders",
        "slug": "arms-and-shoulders",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 25,
        "price_jmd": 20000,
        "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 21
    },
    {
        "id": 11,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "bikini-line",
        "name": "Bikini Line",
        "slug": "bikini-line",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 22
    },
    {
        "id": 13,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "brazilian-only",
        "name": "Brazilian Only",
        "slug": "brazilian-only",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 23
    },
    {
        "id": 8,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "chin-only",
        "name": "Chin Only",
        "slug": "chin-only",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 10000,
        "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 24
    },
    {
        "id": 9,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "chin-and-neck",
        "name": "Chin and Neck",
        "slug": "chin-and-neck",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 25
    },
    {
        "id": 50,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "folliculitis",
        "name": "FOLLICULITIS",
        "slug": "folliculitis",
        "short_description": "A Consultation Is Necessary to Determine Treatment Needed. This Treatment Consist of a Combination of Treatment which Depends on Condition.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 26
    },
    {
        "id": 33,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "fingers-and-toes",
        "name": "Fingers and Toes",
        "slug": "fingers-and-toes",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 27
    },
    {
        "id": 20,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-abdomen",
        "name": "Full Abdomen",
        "slug": "full-abdomen",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 18000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 28
    },
    {
        "id": 21,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-abdomen-and-chest",
        "name": "Full Abdomen and Chest",
        "slug": "full-abdomen-and-chest",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 25,
        "price_jmd": 22000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 29
    },
    {
        "id": 24,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-back",
        "name": "Full Back",
        "slug": "full-back",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 35,
        "price_jmd": 24000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 30
    },
    {
        "id": 32,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-bottom",
        "name": "Full Bottom",
        "slug": "full-bottom",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps - Dark Spots - Folliculitis",
        "duration_minutes": 10,
        "price_jmd": 16000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 31
    },
    {
        "id": 18,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-chest",
        "name": "Full Chest",
        "slug": "full-chest",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 16000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 32
    },
    {
        "id": 26,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-legs",
        "name": "Full Legs",
        "slug": "full-legs",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 55,
        "price_jmd": 26000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 33
    },
    {
        "id": 12,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-pubic-armpits",
        "name": "Full Pubic + Armpits",
        "slug": "full-pubic-armpits",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 34
    },
    {
        "id": 28,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-thighs",
        "name": "Full Thighs",
        "slug": "full-thighs",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 25,
        "price_jmd": 22000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 35
    },
    {
        "id": 34,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "full-chest",
        "name": "Full chest",
        "slug": "full-chest",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 16000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 36
    },
    {
        "id": 29,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "inner-thigh",
        "name": "Inner Thigh",
        "slug": "inner-thigh",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 37
    },
    {
        "id": 10,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "jawline-and-neck",
        "name": "Jawline and Neck",
        "slug": "jawline-and-neck",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 38
    },
    {
        "id": 23,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "lower-back",
        "name": "Lower Back",
        "slug": "lower-back",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 14000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 39
    },
    {
        "id": 27,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "lower-legs",
        "name": "Lower Legs",
        "slug": "lower-legs",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 25,
        "price_jmd": 18000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 40
    },
    {
        "id": 17,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "mid-chest",
        "name": "Mid-Chest",
        "slug": "mid-chest",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 41
    },
    {
        "id": 30,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "posterior-thighs",
        "name": "Posterior Thighs",
        "slug": "posterior-thighs",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 18000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 42
    },
    {
        "id": 31,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "posterior-thighs-and-bottom",
        "name": "Posterior Thighs and Bottom",
        "slug": "posterior-thighs-and-bottom",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 25,
        "price_jmd": 20000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 43
    },
    {
        "id": 14,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "pubic-armpit-and-brazilian-special-",
        "name": "Pubic, Armpit and Brazilian (Special)",
        "slug": "pubic-armpit-and-brazilian-special-",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 10,
        "price_jmd": 16000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 44
    },
    {
        "id": 22,
        "category_id": 1,
        "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
        "category_slug": "upper-back",
        "name": "Upper Back",
        "slug": "upper-back",
        "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingrown\r\nRazor Bumps & Dark Spots.",
        "duration_minutes": 15,
        "price_jmd": 18000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 45
    },
    {
        "id": 59,
        "category_id": 13,
        "category_name": "MASSAGES",
        "category_slug": "head-body-massage-head-spa",
        "name": "HEAD & BODY MASSAGE / HEAD SPA",
        "slug": "head-body-massage-head-spa",
        "short_description": "RELAXATION Head Spa Paired with Body Massage.",
        "duration_minutes": 45,
        "price_jmd": 19000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 46
    },
    {
        "id": 57,
        "category_id": 13,
        "category_name": "MASSAGES",
        "category_slug": "lympathic-drainage",
        "name": "LYMPATHIC DRAINAGE",
        "slug": "lympathic-drainage",
        "short_description": "Help Relieve Swelling (Lymphedema) Caused by Blockages or Medical Condition. This also Helps to Drain Fluid after Cosmetic surgery. Reduces Swelling, Brushing, and Discomfort.",
        "duration_minutes": 55,
        "price_jmd": 9000,
        "thumbnail_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 47
    },
    {
        "id": 49,
        "category_id": 20,
        "category_name": "MICRONEEDLING - PRF - PRP",
        "category_slug": "microneedling-prp",
        "name": "MICRONEEDLING PRP",
        "slug": "microneedling-prp",
        "short_description": "Treats Sun Damages and Hyperpigmentation, Improves Skin Tone and Skin Texture, Restores Collagen and Elastin Production.",
        "duration_minutes": 40,
        "price_jmd": 29000,
        "thumbnail_url": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 48
    },
    {
        "id": 48,
        "category_id": 20,
        "category_name": "MICRONEEDLING - PRF - PRP",
        "category_slug": "prf-plasma-treatment",
        "name": "PRF PLASMA TREATMENT",
        "slug": "prf-plasma-treatment",
        "short_description": "PRF Enhances Skin Rejuvenation, Gets Rid of Fine Lines, ACNE Scars, \r\nEnlarged PORES.  Skin becomes Smoother, Firmer and More Radiant.",
        "duration_minutes": 40,
        "price_jmd": 29000,
        "thumbnail_url": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 49
    },
    {
        "id": 39,
        "category_id": 22,
        "category_name": "NON-SURGICAL BBL CONSULTATION",
        "category_slug": "non-surgical-bbl",
        "name": "NON-SURGICAL BBL",
        "slug": "non-surgical-bbl",
        "short_description": "Adds Volume to Areas Necessary Ex: Hips and Bottom.\r\nA Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan.",
        "duration_minutes": 15,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 50
    },
    {
        "id": 53,
        "category_id": 26,
        "category_name": "PSEUDOFOLLICULITIS",
        "category_slug": "pseudofolliculitis",
        "name": "PSEUDOFOLLICULITIS",
        "slug": "pseudofolliculitis",
        "short_description": "Inflamation Mainly affecting head and other areas.",
        "duration_minutes": 15,
        "price_jmd": 12000,
        "thumbnail_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 51
    },
    {
        "id": 64,
        "category_id": 16,
        "category_name": "SCAR REDUCTION",
        "category_slug": "scars",
        "name": "SCARS",
        "slug": "scars",
        "short_description": "Reducing Appearance of scars cause by injury, insect bites, burn, surgery + more",
        "duration_minutes": 20,
        "price_jmd": 15000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 52
    },
    {
        "id": 56,
        "category_id": 15,
        "category_name": "SKIN TIGHTENING/CELLULITES",
        "category_slug": "cellulites",
        "name": "CELLULITES",
        "slug": "cellulites",
        "short_description": "can reduce the appearance of cellulite through a combination of exercise, diet and treatments. \r\nA Consultation is Necessary to Determine Treatment Needed. This a Consultation  for Treatment Plan.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 53
    },
    {
        "id": 37,
        "category_id": 15,
        "category_name": "SKIN TIGHTENING/CELLULITES",
        "category_slug": "skin-tightening",
        "name": "SKIN TIGHTENING",
        "slug": "skin-tightening",
        "short_description": "EFFECTIVELY Reduction of Sagging & Dimpled Skin  MINIMAL/NON-INVASIVE TREATMENT.\r\nA Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan. Please See Before and After.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1512290900673-700232490515?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 54
    },
    {
        "id": 60,
        "category_id": 14,
        "category_name": "STRETCH MARKS/ COLLAGEN STIMULATION",
        "category_slug": "stretch-marks",
        "name": "STRETCH MARKS",
        "slug": "stretch-marks",
        "short_description": "Stimulating Collagen By Using LASER, RADIOFREQUENCY & GROWTH FACTORS PROVEN to Aid  Blood Flow . STRIAE APPEARS Less Visible and Often Reversed in Appearance, While Healing Skin within 6weeks .Results are Permanent and Skin Continues to Heal up to 1 Year After Treatment.",
        "duration_minutes": 45,
        "price_jmd": 16000,
        "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 55
    },
    {
        "id": 52,
        "category_id": 12,
        "category_name": "TATTOO REMOVAL/ SKIN TAGS",
        "category_slug": "skin-tag",
        "name": "SKIN TAG",
        "slug": "skin-tag",
        "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 56
    },
    {
        "id": 51,
        "category_id": 12,
        "category_name": "TATTOO REMOVAL/ SKIN TAGS",
        "category_slug": "tattoo-removal",
        "name": "TATTOO REMOVAL",
        "slug": "tattoo-removal",
        "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 57
    },
    {
        "id": 65,
        "category_id": 19,
        "category_name": "WEIGHTLOSS MANAGEMENT",
        "category_slug": "semegluthide",
        "name": "SEMEGLUTHIDE",
        "slug": "semegluthide",
        "short_description": "Doctors Visit Consultation is Necessary. This is a Consultation for Treatment Plan",
        "duration_minutes": 15,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 58
    },
    {
        "id": 47,
        "category_id": 19,
        "category_name": "WEIGHTLOSS MANAGEMENT",
        "category_slug": "weightloss-consultation-",
        "name": "WEIGHTLOSS (Consultation)",
        "slug": "weightloss-consultation-",
        "short_description": "During Consultation an Assessment is Performed in Order to Recommend Suitable Treatment.",
        "duration_minutes": 10,
        "price_jmd": 5000,
        "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
        "is_active": 1,
        "is_featured": 0,
        "sort_order": 59
    }
];
// GET /api/services  — public service catalog
router.get('/', async (req, res) => {
    try {
        const categoryId = req.query['category_id'];
        const isFeatured = req.query['is_featured'];
        let sql = `
      SELECT s.*, sc.name as category_name, sc.slug as category_slug
      FROM services s
      JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.is_active = 1
    `;
        const params = [];
        if (categoryId) {
            sql += ' AND s.category_id = ?';
            params.push(categoryId);
        }
        if (isFeatured === 'true') {
            sql += ' AND s.is_featured = 1';
        }
        sql += ' ORDER BY sc.sort_order ASC, s.sort_order ASC';
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
// Admin Routes for CRUD
router.post('/', async (req, res, next) => {
    try {
        // In a real app we'd verify admin role here
        const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active } = req.body;
        const insertId = await (0, database_1.executeUpdate)(`INSERT INTO services (category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured ? 1 : 0, is_active ? 1 : 0]);
        res.json((0, types_1.successResponse)({ id: insertId, message: 'Service created successfully' }));
    }
    catch (e) {
        next(e);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const { category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured, is_active } = req.body;
        await (0, database_1.executeUpdate)(`UPDATE services SET category_id=?, name=?, slug=?, description=?, price_jmd=?, duration_minutes=?, thumbnail_url=?, is_featured=?, is_active=?
       WHERE id=?`, [category_id, name, slug, description, price_jmd, duration_minutes, thumbnail_url, is_featured ? 1 : 0, is_active ? 1 : 0, req.params['id']]);
        res.json((0, types_1.successResponse)({ message: 'Service updated successfully' }));
    }
    catch (e) {
        next(e);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await (0, database_1.executeUpdate)(`DELETE FROM services WHERE id=?`, [req.params['id']]);
        res.json((0, types_1.successResponse)({ message: 'Service deleted successfully' }));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/services/categories  — list categories
router.get('/categories', async (_req, res, next) => {
    try {
        const categories = await (0, database_1.executeQuery)('SELECT * FROM service_categories WHERE is_active = 1 ORDER BY sort_order ASC');
        res.json((0, types_1.successResponse)(categories));
    }
    catch (e) {
        next(e);
    }
});
// GET /api/services/:slug  — service detail by slug
router.get('/:slug', async (req, res, next) => {
    try {
        const service = await (0, database_1.executeQueryOne)(`SELECT s.*, sc.name as category_name
       FROM services s
       JOIN service_categories sc ON sc.id = s.category_id
       WHERE s.slug = ? AND s.is_active = 1`, [req.params['slug']]);
        if (!service) {
            res.status(404).json({ success: false, message: 'Service not found.' });
            return;
        }
        res.json((0, types_1.successResponse)(service));
    }
    catch (e) {
        next(e);
    }
});
exports.default = router;
//# sourceMappingURL=services.routes.js.map