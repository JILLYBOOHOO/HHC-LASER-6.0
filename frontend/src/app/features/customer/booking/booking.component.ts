import { Component, OnInit, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/store/auth-state.service';
import { DraftService } from '../../../core/services/draft.service';
import { Service, Employee, Location, BookingType, BookingStep } from '../../../core/models/models';

const DEFAULT_SERVICES: Service[] = [
  {
    "id": 55,
    "category_id": 11,
    "category_name": "BODY CONTOUR",
    "name": "WOOD THERAPY",
    "slug": "wood-therapy",
    "short_description": "Improves Blood Circulation, Reduces Cellulites and Fat Deposits While Promoting Lymphatic Drainage to Flush Toxins.",
    "duration_minutes": 45,
    "price_jmd": 9000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 1
  },
  {
    "id": 41,
    "category_id": 21,
    "category_name": "BOTOX / DERMAL FILLERS",
    "name": "BOTOX Consultation",
    "slug": "botox-consultation",
    "short_description": "Aid in SMOOTHING FACIAL WRINKLES, EXCESS SWEATING, CHRONIC MIGRAINES. \r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
    "duration_minutes": 20,
    "price_jmd": 10000,
    "thumbnail_url": "/images/botox_consultation.webp",
    "is_active": true,
    "is_featured": true,
    "sort_order": 2
  },
  {
    "id": 42,
    "category_id": 21,
    "category_name": "BOTOX / DERMAL FILLERS",
    "name": "DERMAL FILLERS (Consultation)",
    "slug": "dermal-fillers-consultation-",
    "short_description": "Filler add VOLUME and Plump Skin Face & Body.\r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED.",
    "duration_minutes": 20,
    "price_jmd": 10000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 3
  },
  {
    "id": 67,
    "category_id": 2,
    "category_name": "DARK SPOTS / LASER RESURFACING",
    "name": "DARK CIRCLES",
    "slug": "dark-circles",
    "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
    "duration_minutes": 15,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 4
  },
  {
    "id": 58,
    "category_id": 2,
    "category_name": "DARK SPOTS / LASER RESURFACING",
    "name": "SKIN RESURFACING",
    "slug": "skin-resurfacing",
    "short_description": "CONSULTATION NECESSARY ( Fee is put towards treatment)  Advanced laser treatments for skin Resurfacing and Rejuvenation.\r\nReduce HYPERPIGMENTATION, SP",
    "duration_minutes": 25,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 5
  },
  {
    "id": 68,
    "category_id": 24,
    "category_name": "DETOX / HEAT SHOCK",
    "name": "HEAT SHOCK- BODY/ SKIN DETOX",
    "slug": "heat-shock-body-skin-detox",
    "short_description": "Balance Metabolism, Reset, Aids Weightloss, and Skin Treatments",
    "duration_minutes": 25,
    "price_jmd": 9000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 6
  },
  {
    "id": 35,
    "category_id": 10,
    "category_name": "FACIALS",
    "name": "ACNE / DARK SPOTS",
    "slug": "acne-dark-spots",
    "short_description": "Inflammation cause by Hormonal, Blackheads, Whiteheads, Pustules, Milia. Skin Resurfacing is also added",
    "duration_minutes": 25,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 7
  },
  {
    "id": 63,
    "category_id": 10,
    "category_name": "FACIALS",
    "name": "CHEMICAL PEEL",
    "slug": "chemical-peel",
    "short_description": "Reduces Fine Lines and Wrinkles, Fades Dark Spots and Acne Scars,Treats ACNE and controls Oil, and Improves Overall Skin Texture and Radiance.",
    "duration_minutes": 50,
    "price_jmd": 28000,
    "thumbnail_url": "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80",
    "is_active": true,
    "is_featured": true,
    "sort_order": 8
  },
  {
    "id": 61,
    "category_id": 10,
    "category_name": "FACIALS",
    "name": "ENLARGED PORES",
    "slug": "enlarged-pores",
    "short_description": "TREATMENT REGENERATE  CELLS, EXOSOME : Visibly Shrink and Heal Skin Texture Appears Smooth and Soft to Touch.",
    "duration_minutes": 30,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 9
  },
  {
    "id": 62,
    "category_id": 10,
    "category_name": "FACIALS",
    "name": "MICRODERMABRASION",
    "slug": "microdermabrasion",
    "short_description": "Reduces The Appearance of Fine Lines, Removes Dead Skin, While Unclogging PORES, Leavin a Smoother Skin, a Brighter Complexion and A More Even Skin To",
    "duration_minutes": 30,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 10
  },
  {
    "id": 54,
    "category_id": 10,
    "category_name": "FACIALS",
    "name": "PHOTOREJUVENATION",
    "slug": "photorejuvenation",
    "short_description": "Restores PEPTIDES and ENZYMES, Glow Forever When You Remove Dead Skin, Black Heads and White Heads.",
    "duration_minutes": 25,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 11
  },
  {
    "id": 40,
    "category_id": 17,
    "category_name": "FAT REDUCTION",
    "name": "FAT REDUCTION",
    "slug": "fat-reduction",
    "short_description": "FAT Reduction Treatment. Mini-Non-invasive.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
    "duration_minutes": 45,
    "price_jmd": 40000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 12
  },
  {
    "id": 46,
    "category_id": 25,
    "category_name": "FUNGAL  TREATMENT",
    "name": "FUNGUS",
    "slug": "fungus",
    "short_description": "MEDICAL TREATMENT for Skin, Toes, Head, Nails.\r\nA CONSULTATION is Necessary to Determine Treatment Needed.",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 13
  },
  {
    "id": 38,
    "category_id": 3,
    "category_name": "HAIR RESTORATION",
    "name": "HAIR RESTORATION",
    "slug": "hair-restoration",
    "short_description": "Treats Alopecia, Hair Thinning and Bald Spots.",
    "duration_minutes": 45,
    "price_jmd": 29000,
    "thumbnail_url": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 14
  },
  {
    "id": 43,
    "category_id": 9,
    "category_name": "IV THERAPY / VITAL SHOTS",
    "name": "IV THERAPY",
    "slug": "iv-therapy",
    "short_description": "VITAMIN B, Vitamin C, NAD & GLUTHATHIONE.\r\nPower Shot Cocktails.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
    "duration_minutes": 20,
    "price_jmd": 23000,
    "thumbnail_url": "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 15
  },
  {
    "id": 44,
    "category_id": 9,
    "category_name": "IV THERAPY / VITAL SHOTS",
    "name": "VITAL SHOTS",
    "slug": "vital-shots",
    "short_description": "VITAMIN B, Vitamin C, MAGNESIUM, NAD, Power Shot Cocktails.\r\nCONSULTATION AND TREATMENT PERFORMED SAME DAY.",
    "duration_minutes": 15,
    "price_jmd": 9000,
    "thumbnail_url": "https://images.unsplash.com/photo-1631815588090-d4bfec5b1cdb?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 16
  },
  {
    "id": 45,
    "category_id": 18,
    "category_name": "KELOID TREATMENT",
    "name": "KELOID (Consultation)",
    "slug": "keloid-consultation-",
    "short_description": "Reduction of Scar and Raised Areas on the Skin.\r\nCONSULTATION IS NECESSARY TO DETERMINE TREATMENT NEEDED. \r\nConsultation & Treatment Can be Performed ",
    "duration_minutes": 15,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 17
  },
  {
    "id": 19,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Abdomen",
    "slug": "abdomen",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 18
  },
  {
    "id": 16,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Aerola",
    "slug": "aerola",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 19
  },
  {
    "id": 15,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Armpits",
    "slug": "armpits",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 20
  },
  {
    "id": 25,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Arms and Shoulders",
    "slug": "arms-and-shoulders",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 25,
    "price_jmd": 20000,
    "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 21
  },
  {
    "id": 11,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Bikini Line",
    "slug": "bikini-line",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 22
  },
  {
    "id": 13,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Brazilian Only",
    "slug": "brazilian-only",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 23
  },
  {
    "id": 8,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Chin Only",
    "slug": "chin-only",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 10000,
    "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 24
  },
  {
    "id": 9,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Chin and Neck",
    "slug": "chin-and-neck",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 25
  },
  {
    "id": 50,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "FOLLICULITIS",
    "slug": "folliculitis",
    "short_description": "A Consultation Is Necessary to Determine Treatment Needed. This Treatment Consist of a Combination of Treatment which Depends on Condition.",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 26
  },
  {
    "id": 33,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Fingers and Toes",
    "slug": "fingers-and-toes",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 27
  },
  {
    "id": 20,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Abdomen",
    "slug": "full-abdomen",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 18000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 28
  },
  {
    "id": 21,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Abdomen and Chest",
    "slug": "full-abdomen-and-chest",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 25,
    "price_jmd": 22000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 29
  },
  {
    "id": 24,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Back",
    "slug": "full-back",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 35,
    "price_jmd": 24000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 30
  },
  {
    "id": 32,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Bottom",
    "slug": "full-bottom",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 16000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 31
  },
  {
    "id": 18,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Chest",
    "slug": "full-chest",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 16000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 32
  },
  {
    "id": 26,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Legs",
    "slug": "full-legs",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 55,
    "price_jmd": 26000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 33
  },
  {
    "id": 12,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Pubic + Armpits",
    "slug": "full-pubic-armpits",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 34
  },
  {
    "id": 28,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full Thighs",
    "slug": "full-thighs",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 25,
    "price_jmd": 22000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 35
  },
  {
    "id": 34,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Full chest",
    "slug": "full-chest",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 16000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 36
  },
  {
    "id": 29,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Inner Thigh",
    "slug": "inner-thigh",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 37
  },
  {
    "id": 10,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Jawline and Neck",
    "slug": "jawline-and-neck",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 38
  },
  {
    "id": 23,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Lower Back",
    "slug": "lower-back",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 14000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 39
  },
  {
    "id": 27,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Lower Legs",
    "slug": "lower-legs",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 25,
    "price_jmd": 18000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 40
  },
  {
    "id": 17,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Mid-Chest",
    "slug": "mid-chest",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 41
  },
  {
    "id": 30,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Posterior Thighs",
    "slug": "posterior-thighs",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 18000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 42
  },
  {
    "id": 31,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Posterior Thighs and Bottom",
    "slug": "posterior-thighs-and-bottom",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 25,
    "price_jmd": 20000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 43
  },
  {
    "id": 14,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Pubic, Armpit and Brazilian (Special)",
    "slug": "pubic-armpit-and-brazilian-special-",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 10,
    "price_jmd": 16000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 44
  },
  {
    "id": 22,
    "category_id": 1,
    "category_name": "LASER HAIR REMOVAL & FOLLICULITIS",
    "name": "Upper Back",
    "slug": "upper-back",
    "short_description": "Laser hair removal is a procedure that uses a laser, or a concentrated beam of light, to get rid of hair in different areas of the body.\r\nReduce Ingro",
    "duration_minutes": 15,
    "price_jmd": 18000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 45
  },
  {
    "id": 59,
    "category_id": 13,
    "category_name": "MASSAGES",
    "name": "HEAD & BODY MASSAGE / HEAD SPA",
    "slug": "head-body-massage-head-spa",
    "short_description": "RELAXATION Head Spa Paired with Body Massage.",
    "duration_minutes": 45,
    "price_jmd": 19000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 46
  },
  {
    "id": 57,
    "category_id": 13,
    "category_name": "MASSAGES",
    "name": "LYMPATHIC DRAINAGE",
    "slug": "lympathic-drainage",
    "short_description": "Help Relieve Swelling (Lymphedema) Caused by Blockages or Medical Condition. This also Helps to Drain Fluid after Cosmetic surgery. Reduces Swelling, ",
    "duration_minutes": 55,
    "price_jmd": 9000,
    "thumbnail_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 47
  },
  {
    "id": 49,
    "category_id": 20,
    "category_name": "MICRONEEDLING - PRF - PRP",
    "name": "MICRONEEDLING PRP",
    "slug": "microneedling-prp",
    "short_description": "Treats Sun Damages and Hyperpigmentation, Improves Skin Tone and Skin Texture, Restores Collagen and Elastin Production.",
    "duration_minutes": 40,
    "price_jmd": 29000,
    "thumbnail_url": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 48
  },
  {
    "id": 48,
    "category_id": 20,
    "category_name": "MICRONEEDLING - PRF - PRP",
    "name": "PRF PLASMA TREATMENT",
    "slug": "prf-plasma-treatment",
    "short_description": "PRF Enhances Skin Rejuvenation, Gets Rid of Fine Lines, ACNE Scars, \r\nEnlarged PORES.  Skin becomes Smoother, Firmer and More Radiant.",
    "duration_minutes": 40,
    "price_jmd": 29000,
    "thumbnail_url": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 49
  },
  {
    "id": 39,
    "category_id": 22,
    "category_name": "NON-SURGICAL BBL CONSULTATION",
    "name": "NON-SURGICAL BBL",
    "slug": "non-surgical-bbl",
    "short_description": "Adds Volume to Areas Necessary Ex: Hips and Bottom.\r\nA Consultation is Necessary to Determine Treatment Needed. This a Consultation for Treatment Plan",
    "duration_minutes": 15,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 50
  },
  {
    "id": 53,
    "category_id": 26,
    "category_name": "PSEUDOFOLLICULITIS",
    "name": "PSEUDOFOLLICULITIS",
    "slug": "pseudofolliculitis",
    "short_description": "Inflamation Mainly affecting head and other areas.",
    "duration_minutes": 15,
    "price_jmd": 12000,
    "thumbnail_url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 51
  },
  {
    "id": 64,
    "category_id": 16,
    "category_name": "SCAR REDUCTION",
    "name": "SCARS",
    "slug": "scars",
    "short_description": "Reducing Appearance of scars cause by injury, insect bites, burn, surgery + more",
    "duration_minutes": 20,
    "price_jmd": 15000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 52
  },
  {
    "id": 56,
    "category_id": 15,
    "category_name": "SKIN TIGHTENING/CELLULITES",
    "name": "CELLULITES",
    "slug": "cellulites",
    "short_description": "can reduce the appearance of cellulite through a combination of exercise, diet and treatments. \r\nA Consultation is Necessary to Determine Treatment Ne",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 53
  },
  {
    "id": 37,
    "category_id": 15,
    "category_name": "SKIN TIGHTENING/CELLULITES",
    "name": "SKIN TIGHTENING",
    "slug": "skin-tightening",
    "short_description": "EFFECTIVELY Reduction of Sagging & Dimpled Skin  MINIMAL/NON-INVASIVE TREATMENT.\r\nA Consultation is Necessary to Determine Treatment Needed. This a Co",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1512290900673-700232490515?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 54
  },
  {
    "id": 60,
    "category_id": 14,
    "category_name": "STRETCH MARKS/ COLLAGEN STIMULATION",
    "name": "STRETCH MARKS",
    "slug": "stretch-marks",
    "short_description": "Stimulating Collagen By Using LASER, RADIOFREQUENCY & GROWTH FACTORS PROVEN to Aid  Blood Flow . STRIAE APPEARS Less Visible and Often Reversed in App",
    "duration_minutes": 45,
    "price_jmd": 16000,
    "thumbnail_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 55
  },
  {
    "id": 52,
    "category_id": 12,
    "category_name": "TATTOO REMOVAL/ SKIN TAGS",
    "name": "SKIN TAG",
    "slug": "skin-tag",
    "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 56
  },
  {
    "id": 51,
    "category_id": 12,
    "category_name": "TATTOO REMOVAL/ SKIN TAGS",
    "name": "TATTOO REMOVAL",
    "slug": "tattoo-removal",
    "short_description": "A Consultation is Necessary to Determine Treatment Needed.",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 57
  },
  {
    "id": 65,
    "category_id": 19,
    "category_name": "WEIGHTLOSS MANAGEMENT",
    "name": "SEMEGLUTHIDE",
    "slug": "semegluthide",
    "short_description": "Doctors Visit Consultation is Necessary. This is a Consultation for Treatment Plan",
    "duration_minutes": 15,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 58
  },
  {
    "id": 47,
    "category_id": 19,
    "category_name": "WEIGHTLOSS MANAGEMENT",
    "name": "WEIGHTLOSS (Consultation)",
    "slug": "weightloss-consultation-",
    "short_description": "During Consultation an Assessment is Performed in Order to Recommend Suitable Treatment.",
    "duration_minutes": 10,
    "price_jmd": 5000,
    "thumbnail_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "is_active": true,
    "is_featured": false,
    "sort_order": 59
  }
];




@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatCardModule, MatProgressSpinnerModule, MatSnackBarModule, MatRadioModule,
    MatDatepickerModule, MatNativeDateModule,
  ],
  template: `
    <div class="min-h-screen py-1.5 px-4 md:px-6" style="background: #FFFFFF">
      <div class="max-w-7xl mx-auto">
        
        <!-- Centered Header & Subtext -->
        <div class="text-center mb-1">
          <h1 class="text-lg md:text-xl font-heading font-extrabold text-black tracking-tight leading-tight">
            {{ currentStep() === 'confirmation' ? 'Booking Confirmed!' : 'Book Your Treatment' }}
          </h1>
          <p class="text-[11px] text-neutral-500 font-medium mt-0.5">
            {{ currentStep() === 'confirmation' ? 'Your appointment has been successfully booked.' : 'Complete each step to reserve your appointment.' }}
          </p>
        </div>

        <!-- 6-Step Progress Tracker (Compact Mobile Layout) -->
        <div class="flex items-center justify-start sm:justify-center gap-0 mb-2 overflow-x-auto py-1 px-1">
          @for (step of steps; track step.key; let i = $index) {
            <div class="flex items-center flex-shrink-0">
              <div class="flex flex-col items-center gap-0.5 cursor-pointer px-0.5 sm:px-1.5"
                   (click)="i === 0 ? router.navigate(['/services']) : (currentStep() !== step.key && i < currentStepIndex() && goToStep(step.key))">
                <div class="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all shadow-xs"
                     [class.bg-[#D4A359]]="currentStepIndex() >= i"
                     [class.bg-neutral-200]="currentStepIndex() < i"
                     [class.text-white]="currentStepIndex() >= i"
                     [class.text-neutral-700]="currentStepIndex() < i">
                  @if (currentStepIndex() > i || (i === 0 && selectedServiceId())) {
                    <mat-icon class="!text-[10px] sm:!text-xs text-white">check</mat-icon>
                  } @else {
                    {{ i + 1 }}
                  }
                </div>
                <span class="text-[9px] sm:text-[10px] whitespace-nowrap font-bold"
                      [class.text-black]="currentStep() === step.key"
                      [class.text-neutral-500]="currentStep() !== step.key">
                  {{ step.label }}
                </span>
              </div>
              @if (!$last) {
                <div class="w-2 sm:w-6 h-[2px] mx-0.5 transition-colors flex-shrink-0"
                     [class.bg-[#D4A359]]="currentStepIndex() > i"
                     [class.bg-neutral-300]="currentStepIndex() <= i">
                </div>
              }
            </div>
          }
        </div>

        <!-- Resume Booking Prompt Banner -->
        @if (hasSavedProgress()) {
          <div class="mb-2 p-2 bg-black text-white rounded-xl shadow-lg border border-gold/50 flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 border border-gold/40">
                <mat-icon class="!text-base">restore</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-extrabold text-xs text-white">Unfinished Booking Saved</h4>
                  <span class="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-gold text-black uppercase tracking-wider">
                    Step: {{ savedProgressDetails()?.stepLabel }}
                  </span>
                </div>
                <p class="text-[10px] text-neutral-300">
                  Resume {{ savedProgressDetails()?.serviceName }}
                  @if (savedProgressDetails()?.locationName) { at {{ savedProgressDetails()?.locationName }} }
                  @if (savedProgressDetails()?.dateStr) { ({{ savedProgressDetails()?.dateStr }}) }
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <button (click)="discardSavedBooking()" 
                      class="px-2.5 py-0.5 rounded text-[10px] font-bold text-neutral-400 hover:text-white border border-white/20 hover:border-white transition-all">
                Start Fresh
              </button>
              <button (click)="resumeSavedBooking()" 
                      class="px-3 py-0.5 rounded text-[10px] font-extrabold bg-gold text-black hover:bg-yellow-400 transition-all flex items-center gap-1 shadow-xs">
                <mat-icon class="!text-xs">play_arrow</mat-icon>
                Resume
              </button>
            </div>
          </div>
        }

        <!-- Need Help? Luxury Consultation Banner -->
        <div class="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 mb-2 border border-gold/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-full bg-gold/15 text-gold flex items-center justify-center flex-shrink-0">
              <mat-icon class="!text-xs">help_outline</mat-icon>
            </div>
            <span class="text-xs font-bold text-black leading-tight">Need help? call us.</span>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <a href="tel:18763196241" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-extrabold text-black hover:text-gold border border-black/15 rounded-lg bg-neutral-50 transition-colors">
              <mat-icon class="text-gold !text-xs">phone</mat-icon>
              <span>(876) 319-6241</span>
            </a>
            <a href="tel:18766318134" class="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[11px] font-extrabold text-black hover:text-gold border border-black/15 rounded-lg bg-neutral-50 transition-colors">
              <mat-icon class="text-gold !text-xs">phone</mat-icon>
              <span>(876) 631-8134</span>
            </a>
          </div>
        </div>

        <!-- Mobile Collapsible Booking Summary Drawer (Shown only on mobile screens < md) -->
        @if (selectedService() && currentStep() !== 'confirmation') {
          <div class="block md:hidden mb-3 bg-white rounded-xl border border-gold/40 shadow-xs overflow-hidden transition-all">
            <!-- Collapsible Header / Quick Bar -->
            <div (click)="mobileSummaryExpanded.set(!mobileSummaryExpanded())" 
                 class="p-2.5 bg-gradient-to-r from-neutral-50 to-white flex items-center justify-between cursor-pointer border-b border-black/5 select-none">
              <div class="flex items-center gap-2 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-black/10 bg-neutral-100">
                  <img loading="lazy" [src]="getServiceImage(selectedService()?.thumbnail_url, selectedService()?.name)" 
                       [alt]="selectedService()?.name"
                       class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[9px] font-extrabold text-gold uppercase tracking-wider">Summary</span>
                    <span class="text-[9px] font-bold text-neutral-400">• Step {{ currentStepIndex() + 1 }} of {{ steps.length }}</span>
                  </div>
                  <div class="text-xs font-extrabold text-black truncate">{{ selectedService()?.name }}</div>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0 pl-2">
                <div class="text-right">
                  <div class="text-[9px] font-bold text-neutral-400 uppercase">Total</div>
                  <div class="text-xs font-black text-black">J$ {{ selectedService()?.price_jmd | number }}</div>
                </div>
                <mat-icon class="text-neutral-500 !text-sm transition-transform duration-200"
                          [class.rotate-180]="mobileSummaryExpanded()">
                  expand_more
                </mat-icon>
              </div>
            </div>

            <!-- Expandable Details Panel -->
            @if (mobileSummaryExpanded()) {
              <div class="p-3 bg-white space-y-2 text-xs animate-fade-in border-t border-black/5">
                @if (selectedLocationId()) {
                  <div class="flex items-center justify-between text-neutral-700 pt-1 border-t border-dashed border-black/10">
                    <span class="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                      <mat-icon class="!text-xs text-gold">location_on</mat-icon> Location
                    </span>
                    <span class="font-bold text-black text-[11px]">{{ selectedLocationId() === 1 ? 'Constant Spring' : 'Mannings Hill Rd' }}</span>
                  </div>
                }
                @if (selectedDate && selectedTime) {
                  <div class="flex items-center justify-between text-neutral-700 pt-1 border-t border-dashed border-black/10">
                    <span class="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                      <mat-icon class="!text-xs text-gold">calendar_today</mat-icon> Date & Time
                    </span>
                    <span class="font-bold text-black text-[11px]">{{ selectedDate | date:'MMM d' }} at {{ formatTime(selectedTime) }}</span>
                  </div>
                }
                @if (detailsForm.get('first_name')?.value) {
                  <div class="flex items-center justify-between text-neutral-700 pt-1 border-t border-dashed border-black/10">
                    <span class="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                      <mat-icon class="!text-xs text-gold">person</mat-icon> Guest
                    </span>
                    <span class="font-bold text-black text-[11px] truncate max-w-[160px]">{{ detailsForm.get('first_name')?.value }} {{ detailsForm.get('last_name')?.value }}</span>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- 2-Column Side-by-Side Grid (Step Content on Left, Booking Summary on Right) -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          <!-- Step Content Card Container (Left) -->
          <div class="md:col-span-7 lg:col-span-8">
            <div class="card p-3.5 md:p-4 shadow-sm border border-black/10 rounded-xl bg-white">



          <!-- Step 2: Location -->
          @if (currentStep() === 'location') {
            <h3 class="mb-2 text-black font-bold text-base">Choose Location</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl">
              <!-- Location 1: Constant Spring -->
              <div class="border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between"
                   [ngClass]="selectedLocationId() === 1 ? 'border-gold-500 bg-[#D2B48C]/20 shadow-xs' : 'border-black/15 hover:border-black/30 bg-white'"
                   (click)="selectLocation(1)">
                <div>
                  <div class="flex items-center gap-1.5 mb-1">
                    <mat-icon class="!text-xl" [ngClass]="selectedLocationId() === 1 ? 'text-gold' : 'text-neutral-400'">location_on</mat-icon>
                    <div class="font-extrabold text-sm text-black">Constant Spring Clinic</div>
                  </div>
                  <div class="text-[11px] text-neutral-600 leading-tight mb-2 pl-6">48 Constant Spring Rd, Kingston</div>
                  <div class="text-[11px] text-black font-bold flex items-center gap-2 pt-1.5 border-t border-black/10 pl-6">
                    <mat-icon class="!text-xs text-gold">phone</mat-icon>
                    <span>(876) 319-6241 / (876) 631-8134</span>
                  </div>
                </div>
              </div>

              <!-- Location 2: Mannings Hill Road -->
              <div class="border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col justify-between"
                   [ngClass]="selectedLocationId() === 2 ? 'border-gold-500 bg-[#D2B48C]/20 shadow-xs' : 'border-black/15 hover:border-black/30 bg-white'"
                   (click)="selectLocation(2)">
                <div>
                  <div class="flex items-center gap-1.5 mb-1">
                    <mat-icon class="!text-xl" [ngClass]="selectedLocationId() === 2 ? 'text-gold' : 'text-neutral-400'">location_on</mat-icon>
                    <div class="font-extrabold text-sm text-black">Mannings Hill Road Clinic</div>
                  </div>
                  <div class="text-[11px] text-neutral-600 leading-tight mb-2 pl-6">63 Mannings Hill Rd, Kingston</div>
                  <div class="text-[11px] text-black font-bold flex items-center gap-2 pt-1.5 border-t border-black/10 pl-6">
                    <mat-icon class="!text-xs text-gold">phone</mat-icon>
                    <span>(876) 319-6241 / (876) 631-8134</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-3">
              <button class="btn-secondary" (click)="prevStep()">Back</button>
              <button class="btn-primary" [disabled]="!selectedLocationId()" (click)="continueFromLocation()">
                Continue <mat-icon class="!text-base ml-1">arrow_forward</mat-icon>
              </button>
            </div>
          }

          <!-- Bottom sheet: who is this booking for? (before calendar) -->
          @if (showBookingForSheet()) {
            <div class="fixed inset-0 z-[100] flex flex-col justify-end" role="dialog" aria-modal="true" aria-labelledby="booking-for-title">
              <div class="absolute inset-0 bg-black/45 backdrop-blur-[2px]" (click)="closeBookingForSheet()"></div>
              <div class="booking-for-sheet relative z-10 mx-auto w-full max-w-lg rounded-t-2xl bg-white shadow-2xl border border-black/10 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300"></div>
                <h3 id="booking-for-title" class="text-center font-heading text-xl text-charcoal-900 mb-1">Who are you booking for?</h3>
                <p class="text-center text-sm text-neutral-500 mb-5">Choose an option to continue to scheduling.</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                  <button type="button" (click)="chooseBookingFor('myself')"
                          class="flex items-center gap-3 rounded-xl border-2 border-black/15 bg-white px-4 py-3.5 text-left transition-all hover:border-gold-500 hover:bg-[#D2B48C]/15 active:scale-[0.98]">
                    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-gold">
                      <mat-icon>person</mat-icon>
                    </span>
                    <span>
                      <span class="block font-bold text-sm text-black">Myself</span>
                      <span class="block text-[11px] text-neutral-500 mt-0.5">Book for your own treatment</span>
                    </span>
                  </button>
                  <button type="button" (click)="chooseBookingFor('someone_else')"
                          class="flex items-center gap-3 rounded-xl border-2 border-black/15 bg-white px-4 py-3.5 text-left transition-all hover:border-gold-500 hover:bg-[#D2B48C]/15 active:scale-[0.98]">
                    <span class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-gold">
                      <mat-icon>person_add</mat-icon>
                    </span>
                    <span>
                      <span class="block font-bold text-sm text-black">Someone else</span>
                      <span class="block text-[11px] text-neutral-500 mt-0.5">Book on behalf of another person</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Step 3: Date, Time, Specialist -->
          @if (currentStep() === 'datetime') {
            <h3 class="mb-2 text-lg font-bold text-black">Select Date & Time</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Date Selection (Instant Load) -->
              <div>
                <label class="text-xs font-bold text-charcoal-600 mb-1 block uppercase tracking-wider">1. Select Date</label>
                <div class="rounded-xl overflow-hidden p-1.5 shadow-lg booking-calendar relative" style="max-width: 340px; background: #000000; border: 1px solid rgba(0,0,0,0.15);">
                  <mat-calendar [dateFilter]="dateFilter" [dateClass]="dateClass" (activeDateChange)="onActiveDateChange($any($event))" [(selected)]="selectedDate" [minDate]="minDate" (selectedChange)="onDateChange()"></mat-calendar>
                  
                  <!-- Mobile Scroll Cue (Only shows when date is selected and time needs selection) -->
                  @if (selectedDate && !selectedTime) {
                    <div class="md:hidden absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center animate-bounce pointer-events-none">
                      <div class="bg-black/80 text-[#FFD700] px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1 border border-[#FFD700]/30 backdrop-blur-sm">
                        <span>Scroll for time</span>
                        <mat-icon class="!text-sm">arrow_downward</mat-icon>
                      </div>
                    </div>
                  }
                </div>

                <!-- Calendar Color Key / Legend -->
                <div class="mt-1.5 p-2 rounded-lg bg-neutral-900 border border-black/20 text-[11px] max-w-[340px]">
                  <div class="flex items-center justify-between gap-2">
                    <!-- Selected Day -->
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-[#FFD700] text-black text-[9px] font-extrabold flex items-center justify-center shadow-xs">✓</span>
                      <span class="text-white font-bold">Selected</span>
                    </div>
                    <!-- Available Day -->
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-black border border-white/80 text-white text-[9px] font-extrabold flex items-center justify-center">15</span>
                      <span class="text-neutral-300 font-medium">Available</span>
                    </div>
                    <!-- Fully Booked / Unavailable -->
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full bg-white/10 text-white/30 text-[9px] font-bold line-through flex items-center justify-center">X</span>
                      <span class="text-neutral-400 font-medium">Booked</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Time Selection & Navigation Column -->
              <div id="time-selection-section" class="flex flex-col justify-between scroll-mt-24">
                <div>
                  <label class="text-xs font-bold text-charcoal-600 mb-1 block uppercase tracking-wider">2. Select Time</label>
                  @if (!selectedDate) {
                    <div class="p-4 border border-dashed border-charcoal-300 rounded-xl text-center flex flex-col items-center justify-center min-h-[140px]">
                      <mat-icon class="!text-2xl text-charcoal-400 mb-1">calendar_month</mat-icon>
                      <p class="text-xs text-charcoal-400">Please select a date from the calendar<br>to view available times.</p>
                    </div>
                  } @else if (isLoadingSlots()) {
                    <div class="flex justify-center items-center py-6">
                      <mat-spinner diameter="28"></mat-spinner>
                    </div>
                  } @else if (availableSlots().length > 0) {
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2 max-h-[250px] overflow-y-auto custom-visible-scrollbar pr-1.5 p-1 border border-neutral-100 rounded-xl bg-neutral-50/50">
                      @for (slot of availableSlots(); track slot) {
                        <button (click)="selectTimeSlotAndScroll(slot)" 
                                [ngClass]="selectedTime === slot ? 'bg-[#D4A359] text-black font-extrabold shadow-md scale-[1.02] border-2 border-black' : 'bg-white text-black border border-black/15 hover:border-[#D4A359] hover:bg-neutral-50'" 
                                class="py-2 px-2 rounded-lg text-xs font-bold transition-all text-center">
                          {{ formatTime(slot) }}
                        </button>
                      }
                    </div>
                  } @else {
                    <div class="p-4 border border-dashed border-charcoal-300 rounded-xl text-center mb-2">
                      <p class="text-xs text-neutral-500">No available time slots on this date.</p>
                    </div>
                  }
                </div>

                <!-- Navigation Buttons (Positioned directly under Time Selection with smooth scroll anchor) -->
                <div id="datetime-actions" class="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-black/10 scroll-mt-6">
                  <button (click)="prevStep()" 
                          class="px-4 py-2 border border-black/25 bg-white text-black font-bold text-xs hover:bg-neutral-100 transition-colors flex items-center gap-1 rounded-lg">
                    <mat-icon class="!text-sm">arrow_back</mat-icon> Back
                  </button>
                  <button (click)="nextStep()" [disabled]="!selectedDate || !selectedTime"
                          class="px-5 py-2 bg-[#D4A359] text-black font-extrabold text-xs hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center gap-1 rounded-lg shadow-sm">
                    Continue <mat-icon class="!text-sm">arrow_forward</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- Step 4: Contact Details -->
          @if (currentStep() === 'details') {
            <div id="booking-details-section" class="scroll-mt-24">
            <div class="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
              <div>
                <h3 class="text-xl font-bold text-black">
                  {{ bookingFor() === 'someone_else' ? 'Details for Person You Are Booking For' : 'Your Contact Details' }}
                </h3>
                <p class="text-xs text-neutral-500 mt-0.5">
                  {{ bookingFor() === 'someone_else' ? 'Please enter the guest’s contact information below.' : 'Please verify your contact information for appointment updates.' }}
                </p>
              </div>
              <span class="px-2.5 py-1 text-[11px] font-bold rounded-full border border-black/20 bg-neutral-100 text-black uppercase tracking-wider">
                {{ bookingFor() === 'someone_else' ? 'Guest Booking' : 'Personal Booking' }}
              </span>
            </div>

            <form [formGroup]="detailsForm" class="space-y-4 max-w-2xl">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">First Name <span class="text-red-500">*</span></label>
                  <input type="text" formControlName="first_name" placeholder="e.g. John" 
                         class="w-full px-3.5 py-2.5 bg-white text-black text-sm font-medium border border-black/25 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-xs">
                  @if (detailsForm.get('first_name')?.invalid && detailsForm.get('first_name')?.touched) {
                    <p class="text-red-600 text-[11px] mt-1 font-semibold">First name is required</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Last Name <span class="text-red-500">*</span></label>
                  <input type="text" formControlName="last_name" placeholder="e.g. Doe" 
                         class="w-full px-3.5 py-2.5 bg-white text-black text-sm font-medium border border-black/25 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-xs">
                  @if (detailsForm.get('last_name')?.invalid && detailsForm.get('last_name')?.touched) {
                    <p class="text-red-600 text-[11px] mt-1 font-semibold">Last name is required</p>
                  }
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Email Address <span class="text-red-500">*</span></label>
                  <input type="email" formControlName="email" placeholder="john@example.com" 
                         class="w-full px-3.5 py-2.5 bg-white text-black text-sm font-medium border border-black/25 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-xs">
                  @if (detailsForm.get('email')?.invalid && detailsForm.get('email')?.touched) {
                    <p class="text-red-600 text-[11px] mt-1 font-semibold">Valid email address is required</p>
                  }
                </div>

                <div>
                  <label class="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Phone Number <span class="text-red-500">*</span></label>
                  <input type="tel" formControlName="phone" placeholder="(876) 000-0000" 
                         class="w-full px-3.5 py-2.5 bg-white text-black text-sm font-medium border border-black/25 rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-xs">
                  @if (detailsForm.get('phone')?.invalid && detailsForm.get('phone')?.touched) {
                    <p class="text-red-600 text-[11px] mt-1 font-semibold">Phone number is required</p>
                  }
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-black uppercase tracking-wider mb-1.5">Special Requests or Notes (Optional)</label>
                <textarea formControlName="notes" rows="3" placeholder="Let us know of any medical conditions, preferences, or specific requests..." 
                          class="w-full px-3.5 py-2.5 bg-white text-black text-sm font-medium border border-black/25 rounded-lg resize-none focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all shadow-xs"></textarea>
              </div>

              <div class="flex justify-between mt-6 pt-3 border-t border-black/10">
                <button type="button" class="btn-secondary" (click)="prevStep()">Back</button>
                <button type="button" class="btn-primary" [disabled]="detailsForm.invalid" (click)="nextStep()">
                  Continue <mat-icon class="!text-base ml-1">arrow_forward</mat-icon>
                </button>
              </div>
            </form>
            </div>
          }

          <!-- Step 5: Payment (Secure Fiserv Hosted Checkout) -->
          @if (currentStep() === 'payment') {
            <div class="space-y-3">
              <!-- Patient Information Card -->
              <div class="bg-white rounded-xl border border-black/10 p-3 shadow-xs relative">
                <div class="flex items-center gap-2 mb-2">
                  <mat-icon class="text-neutral-500 !text-base">person</mat-icon>
                  <h4 class="font-extrabold text-xs text-black uppercase tracking-wider">Patient Information</h4>
                  <button type="button" (click)="goToStep('details')" 
                          class="absolute top-2 right-2 px-2.5 py-0.5 border border-black/15 bg-white text-black font-extrabold text-[10px] hover:bg-neutral-100 transition-colors flex items-center gap-1 rounded">
                    <mat-icon class="!text-[10px] text-neutral-600">edit</mat-icon> Edit
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span class="text-neutral-400 text-[9px] uppercase font-bold tracking-wider block">Contact Person</span>
                    <span class="text-black font-extrabold text-[11px] leading-tight block">{{ detailsForm.get('first_name')?.value }} {{ detailsForm.get('last_name')?.value }}</span>
                  </div>
                  <div>
                    <span class="text-neutral-400 text-[9px] uppercase font-bold tracking-wider block">Email</span>
                    <span class="text-black font-extrabold text-[11px] truncate leading-tight block">{{ detailsForm.get('email')?.value }}</span>
                  </div>
                  <div>
                    <span class="text-neutral-400 text-[9px] uppercase font-bold tracking-wider block">Phone</span>
                    <span class="text-black font-extrabold text-[11px] leading-tight block">{{ detailsForm.get('phone')?.value }}</span>
                  </div>
                  <div>
                    <span class="text-neutral-400 text-[9px] uppercase font-bold tracking-wider block">Special Requests</span>
                    <span class="text-black font-semibold text-[11px] line-clamp-1 leading-tight block">{{ detailsForm.get('notes')?.value || 'None' }}</span>
                  </div>
                </div>
              </div>

              <!-- Secure Payment Box -->
              <div class="bg-white rounded-xl border border-black/15 shadow-md p-3.5 space-y-3">
                
                <!-- Security Header -->
                <div class="flex items-center gap-2 pb-2.5 border-b border-black/10">
                  <mat-icon class="text-black !text-base">lock</mat-icon>
                  <h3 class="font-heading font-extrabold text-xs uppercase tracking-wider text-black">Secure Payment</h3>
                </div>

                <!-- Accepted Cards -->
                <div class="flex items-center gap-2 py-0.5 text-xs">
                  <span class="font-bold text-neutral-500 text-[10px]">We accept:</span>
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded bg-white border border-black/10 text-[#1A1F71] font-black text-[9px] flex items-center tracking-wider">VISA</span>
                    <span class="px-1.5 py-0.5 rounded bg-white border border-black/10 text-[#eb001b] font-black text-[9px] flex items-center tracking-wider">MASTERCARD</span>
                    <span class="px-1.5 py-0.5 rounded bg-white border border-black/10 text-[#0070CD] font-black text-[9px] flex items-center tracking-wider">AMEX</span>
                    <span class="px-1.5 py-0.5 rounded bg-white border border-black/10 text-[#F68620] font-black text-[9px] flex items-center tracking-wider">DISCOVER</span>
                    <span class="px-1.5 py-0.5 rounded bg-white border border-black/10 text-[#003087] font-black text-[9px] flex items-center tracking-wider">PAYPAL</span>
                  </div>
                </div>

                <!-- Secure Payment Processing Info Box -->
                <div class="p-3 rounded-lg bg-[#f0f9ff] border border-[#bae6fd] space-y-2 text-left">
                  <div class="font-bold text-[#0369a1] text-[11px] tracking-wide">Secure Payment Processing</div>
                  <p class="text-[11px] text-[#0c4a6e] leading-relaxed">
                    You will be redirected to our secure payment partner (Fiserv) to complete your transaction. Your payment information is processed through bank-grade security.
                  </p>
                  <div class="flex items-center gap-1 text-[10px] text-[#0284c7] font-bold pt-1.5 border-t border-[#bae6fd]/50">
                    <mat-icon class="!text-xs">lock</mat-icon>
                    <span>256-bit SSL encryption • PCI DSS compliant • Secure hosted payment</span>
                  </div>
                </div>

                <!-- Action Button & Back -->
                <div class="flex items-center justify-between gap-3 pt-1">
                  <button type="button" class="px-3.5 py-2 border border-black/25 bg-white text-black font-bold text-xs hover:bg-neutral-100 transition-colors flex items-center gap-1 rounded-lg" 
                          (click)="prevStep()">
                    <mat-icon class="!text-xs">arrow_back</mat-icon> Back
                  </button>
                  <button type="button" 
                          [disabled]="isPaying()" 
                          (click)="submitPayment()"
                          class="px-5 py-2.5 bg-[#D4A359] text-black font-extrabold text-xs md:text-sm hover:bg-yellow-400 transition-all flex items-center gap-2 rounded-lg shadow-md uppercase tracking-wider">
                    @if (isPaying()) {
                      <mat-spinner diameter="18"></mat-spinner>
                      <span>Redirecting...</span>
                    } @else {
                      <mat-icon class="!text-sm">lock</mat-icon>
                      <span>Confirm and Pay</span>
                    }
                  </button>
                </div>

              </div>
            </div>
          }

          <!-- Step 6: Confirmation -->
          @if (currentStep() === 'confirmation') {
            <div class="text-center py-6">
              
              <!-- Thank You Card Banner -->
              <div class="flex flex-col md:flex-row items-center justify-center gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm mb-8 max-w-2xl mx-auto">
                <div class="w-14 h-14 rounded-full border border-gold flex items-center justify-center flex-shrink-0">
                  <mat-icon class="text-gold !text-3xl flex items-center justify-center">favorite_border</mat-icon>
                </div>
                <div class="text-center md:text-left">
                  <h2 class="text-3xl font-heading font-extrabold text-black mb-1">Thank you, {{ detailsForm.get('name')?.value || 'Sarah' }}!</h2>
                  <p class="text-sm text-neutral-600 font-semibold">We look forward to seeing you.</p>
                </div>
              </div>

              <!-- Confirmation Code -->
              <div class="mb-8 max-w-xl mx-auto">
                <div class="text-[11px] font-bold text-gold uppercase tracking-[0.2em] mb-4">YOUR BOOKING CONFIRMATION CODE</div>
                <div class="flex items-center justify-center gap-6 mb-4">
                  <mat-icon class="text-gold !text-2xl opacity-70">auto_awesome</mat-icon>
                  <div class="border border-neutral-300 rounded-lg py-3 px-10 font-bold text-2xl text-black tracking-widest bg-white shadow-sm">
                    {{ confirmationCode() }}
                  </div>
                  <mat-icon class="text-gold !text-2xl opacity-70">auto_awesome</mat-icon>
                </div>
                <p class="text-xs text-neutral-500 font-semibold">Please save this code. You'll need it to manage your booking.</p>
              </div>

              <!-- Booking Details -->
              <div class="border-t border-black/10 pt-8 mb-8 text-left max-w-2xl mx-auto">
                <div class="flex items-center gap-2 mb-6">
                  <mat-icon class="text-gold !text-xl">event_available</mat-icon>
                  <h4 class="text-xs font-bold text-gold uppercase tracking-wider mb-0">YOUR BOOKING DETAILS</h4>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 p-6 rounded-2xl border border-black/5">
                  <!-- Column 1 -->
                  <div class="space-y-5">
                    <div class="flex gap-3.5 items-start">
                      <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-gold !text-xl">spa</mat-icon>
                      </div>
                      <div>
                        <div class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">TREATMENT</div>
                        <div class="font-extrabold text-sm text-black leading-tight">{{ selectedService()?.name }}</div>
                        <div class="text-xs text-neutral-500 font-semibold mt-0.5">{{ selectedService()?.category_name || 'Treatment' }}</div>
                      </div>
                    </div>

                    <div class="flex gap-3.5 items-start">
                      <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-gold !text-xl">calendar_today</mat-icon>
                      </div>
                      <div>
                        <div class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">DATE</div>
                        <div class="font-extrabold text-sm text-black">{{ selectedDate | date:'fullDate' }}</div>
                      </div>
                    </div>

                    <div class="flex gap-3.5 items-start">
                      <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-gold !text-xl">schedule</mat-icon>
                      </div>
                      <div>
                        <div class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">TIME</div>
                        <div class="font-extrabold text-sm text-black">{{ selectedTime }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Column 2 -->
                  <div class="space-y-5">
                    <div class="flex gap-3.5 items-start">
                      <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-gold !text-xl">location_on</mat-icon>
                      </div>
                      <div>
                        <div class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">LOCATION</div>
                        <div class="font-extrabold text-sm text-black">{{ selectedLocationId() === 1 ? 'Constant Spring Clinic' : 'Mannings Hill Road Clinic' }}</div>
                        <div class="text-xs text-neutral-500 font-medium leading-relaxed mt-0.5">
                          {{ selectedLocationId() === 1 ? '48 Constant Spring Road, Kingston' : '63 Mannings Hill Rd, Kingston' }}
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-3.5 items-start">
                      <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                        <mat-icon class="text-gold !text-xl">timer</mat-icon>
                      </div>
                      <div>
                        <div class="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-0.5">DURATION</div>
                        <div class="font-extrabold text-sm text-black">{{ selectedService()?.duration_minutes || 60 }} mins</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Confirmation Notice Email -->
              <div class="flex items-start gap-3 bg-[#D2B48C]/20 p-4 rounded-xl border border-gold/20 max-w-2xl mx-auto mb-8 text-left">
                <mat-icon class="text-gold !text-xl flex-shrink-0 mt-0.5">info</mat-icon>
                <div class="text-xs text-neutral-800 leading-relaxed font-semibold">
                  A confirmation email has been sent to <span class="text-black font-extrabold">{{ detailsForm.get('email')?.value || 'your email' }}</span>.
                  Please check your email for full appointment details.
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-2xl mx-auto border-b border-black/10 pb-8 mb-8">
                <button class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-neutral-300 bg-white text-black hover:bg-neutral-50 transition-colors"
                        (click)="addToCalendar()">
                  <mat-icon class="!text-sm">calendar_today</mat-icon> Add to Google Calendar
                </button>
                <button class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gold text-white hover:opacity-90 transition-opacity border-none"
                        (click)="viewBookingDetails()">
                  View Booking Details
                </button>
                <a routerLink="/customer/dashboard" 
                   class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-black text-white hover:bg-black/90 transition-colors">
                  <mat-icon class="!text-sm">keyboard_backspace</mat-icon> Return to Dashboard
                </a>
              </div>

              <!-- Need Help Footer -->
              <div class="flex items-center justify-center gap-2 text-xs text-neutral-500 font-semibold">
                <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <mat-icon class="text-gold !text-sm">phone</mat-icon>
                </div>
                <span>Need help? call us.</span>
              </div>
            </div> <!-- Close text-center py-6 -->
          } <!-- Close confirmation step -->
        </div> <!-- Close Step Content Card -->
      </div> <!-- Close md:col-span-7 lg:col-span-8 -->

      <!-- Booking Summary Sidebar Card (Right - Aligned side-by-side with Location Card) -->
      <div class="md:col-span-5 lg:col-span-4">
        <div class="card p-4 md:p-5 rounded-xl border border-black/10 shadow-md bg-white">
              
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-black/10 pb-2.5 mb-3">
                <h3 class="text-sm font-extrabold text-black uppercase tracking-wider font-heading">Booking Summary</h3>
                <span class="text-[10px] font-extrabold text-gold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10">
                  Step {{ currentStepIndex() + 1 }} of {{ steps.length }}
                </span>
              </div>

              <!-- Step 1: Selected Treatment -->
              @if (selectedService()) {
                <div class="mb-3 pb-3 border-b border-black/10">
                  <div class="flex gap-3 items-center">
                    <div class="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-black/10 shadow-sm bg-neutral-100">
                      <img loading="lazy" [src]="getServiceImage(selectedService()?.thumbnail_url, selectedService()?.name)" 
                           [alt]="selectedService()?.name"
                           class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1 min-w-0">
                      <span class="text-[9px] font-extrabold text-gold uppercase tracking-wider block">Treatment</span>
                      <h4 class="font-extrabold text-black text-sm truncate leading-tight">{{ selectedService()?.name }}</h4>
                      <div class="flex items-center justify-between mt-1">
                        <span class="text-xs text-neutral-500 font-medium flex items-center gap-1">
                          <mat-icon class="!text-xs text-gold">schedule</mat-icon>
                          {{ selectedService()?.duration_minutes }} min
                        </span>
                        <span class="text-xs font-extrabold text-black">JMD $ {{ selectedService()?.price_jmd | number }}</span>
                      </div>
                    </div>
                  </div>
                  @if (selectedService()?.short_description) {
                    <p class="text-[11px] text-neutral-500 line-clamp-2 mt-2 leading-snug">
                      {{ selectedService()?.short_description }}
                    </p>
                  }
                </div>
              } @else {
                <p class="text-xs text-neutral-400 italic mb-3">Select a treatment to view summary.</p>
              }

              <!-- Step 2: Location (Progressive Reveal) -->
              @if (selectedLocationId()) {
                <div class="mb-3 pb-3 border-b border-black/10 flex items-start gap-2.5">
                  <mat-icon class="!text-lg text-gold mt-0.5 flex-shrink-0">location_on</mat-icon>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Location</span>
                    <div class="font-bold text-black text-xs truncate">
                      {{ selectedLocationId() === 1 ? 'Constant Spring Clinic' : 'Mannings Hill Road Clinic' }}
                    </div>
                    <div class="text-[11px] text-neutral-500 truncate">
                      {{ selectedLocationId() === 1 ? '48 Constant Spring Road, Kingston' : '63 Mannings Hill Rd, Kingston' }}
                    </div>
                  </div>
                </div>
              }

              <!-- Step 3: Date & Time (Progressive Reveal) -->
              @if (selectedDate && selectedTime) {
                <div class="mb-3 pb-3 border-b border-black/10 flex items-start gap-2.5">
                  <mat-icon class="!text-lg text-gold mt-0.5 flex-shrink-0">calendar_today</mat-icon>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Date & Time</span>
                    <div class="font-bold text-black text-xs">
                      {{ selectedDate | date:'EEE, MMM d, y' }}
                    </div>
                    <div class="text-[11px] text-neutral-600 font-medium">
                      {{ formatTime(selectedTime) }}
                    </div>
                  </div>
                </div>
              }

              <!-- Step 4: Details / Customer Info (Progressive Reveal) -->
              @if (detailsForm.get('first_name')?.value && detailsForm.get('last_name')?.value) {
                <div class="mb-3 pb-3 border-b border-black/10 flex items-start gap-2.5">
                  <mat-icon class="!text-lg text-gold mt-0.5 flex-shrink-0">person</mat-icon>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9px] font-extrabold text-neutral-400 uppercase tracking-wider block">Guest Info</span>
                    <div class="font-bold text-black text-xs truncate">
                      {{ detailsForm.get('first_name')?.value }} {{ detailsForm.get('last_name')?.value }}
                    </div>
                    <div class="text-[11px] text-neutral-500 truncate">
                      {{ detailsForm.get('email')?.value }}
                    </div>
                  </div>
                </div>
              }

              <!-- Step 5: Payment Summary / Total -->
              @if (selectedService()) {
                <div class="pt-1">
                  <div class="flex justify-between items-center">
                    <span class="text-xs font-extrabold text-neutral-700 uppercase tracking-wider">Total Amount Due</span>
                    <span class="text-base font-extrabold text-black">JMD $ {{ selectedService()?.price_jmd | number }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-for-sheet {
      animation: bookingForSlideUp 280ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes bookingForSlideUp {
      from { transform: translateY(100%); opacity: 0.85; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* ─── Booking Calendar Custom Styles ──────────────────────────── */
    .booking-calendar {
      background: #000000 !important;

      ::ng-deep .mat-calendar {
        background: #000000 !important;
      }

      /* Available dates — white text, clearly clickable */
      ::ng-deep .mat-calendar-body-cell:not(.mat-calendar-body-disabled):not(.custom-selected-date):not(.mat-calendar-body-selected) .mat-calendar-body-cell-content {
        color: #ffffff !important;
        font-weight: 700;
        background: transparent !important;
        border-radius: 50%;
        transition: all 0.2s ease;
      }

      /* Available dates hover — gold highlight */
      ::ng-deep .mat-calendar-body-cell:not(.mat-calendar-body-disabled):not(.custom-selected-date):not(.mat-calendar-body-selected):hover .mat-calendar-body-cell-content {
        background: rgba(212, 175, 55, 0.3) !important;
        color: #ffffff !important;
      }

      /* Unavailable / disabled dates — greyed out */
      ::ng-deep .mat-calendar-body-disabled .mat-calendar-body-cell-content {
        color: rgba(255, 255, 255, 0.2) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        text-decoration: line-through;
        cursor: not-allowed;
      }

      /* Selected date — ULTRA BRIGHT ELECTRIC SOLID GOLD FILL WITH BOLD BLACK TEXT */
      ::ng-deep .booking-calendar .custom-selected-date .mat-calendar-body-cell-content,
      ::ng-deep .booking-calendar .custom-selected-date,
      ::ng-deep .mat-calendar-body-cell.mat-calendar-body-selected .mat-calendar-body-cell-content,
      ::ng-deep .mat-calendar-body-selected .mat-calendar-body-cell-content,
      ::ng-deep .mat-calendar-body-selected {
        background: #FFD700 !important;
        background-color: #FFD700 !important;
        color: #000000 !important;
        font-weight: 900 !important;
        border-radius: 50% !important;
        box-shadow: 0 0 16px rgba(255, 215, 0, 1), inset 0 0 4px rgba(255, 255, 255, 0.8) !important;
      }

      /* Today indicator */
      ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
        border-color: var(--gold) !important;
      }

      /* Calendar header */
      ::ng-deep .mat-calendar-header {
        padding: 4px 4px 0 !important;
      }
      ::ng-deep .mat-calendar-controls {
        margin-bottom: 2px !important;
      }
      ::ng-deep .mat-calendar-arrow {
        fill: var(--gold);
      }
      ::ng-deep .mat-calendar-period-button {
        color: #ffffff;
        font-weight: 700;
      }
      ::ng-deep .mat-calendar-previous-button,
      ::ng-deep .mat-calendar-next-button {
        color: var(--gold);
      }

      /* Day-of-week headers */
      ::ng-deep .mat-calendar-table-header th {
        color: #ffffff !important;
        font-weight: 700;
        font-size: 0.65rem !important;
        padding: 1px 0 !important;
      }
      ::ng-deep .mat-calendar-body-cell {
        padding: 0 !important;
      }
      ::ng-deep .mat-calendar-body-cell-content {
        width: 25px !important;
        height: 25px !important;
        line-height: 25px !important;
        font-size: 0.7rem !important;
      }
      ::ng-deep .mat-calendar-content {
        padding: 0 2px 2px 2px !important;
      }
    }
  `],
})
export class BookingComponent implements OnInit {
  currentStep       = signal<BookingStep>('location');
  confirmationCode  = signal<string>('8241');
  selectedLocationId = signal<number | null>(null);
  selectedBookingType = signal<BookingType>('self');
  groupSize         = 1;
  selectedServiceId = signal<number | null>(1);
  selectedEmployeeId = signal<number | null>(null);
  bookingFor = signal<'myself' | 'someone_else' | 'group' | null>(null);
  showBookingForSheet = signal(false);
  // Mobile summary expanded state for collapsible drawer on mobile
  mobileSummaryExpanded = signal<boolean>(false);
  // Toggle helper method
  toggleMobileSummary() {
    this.mobileSummaryExpanded.update(v => !v);
  }
  availableSlots    = signal<string[]>([]);
  employees         = signal<Employee[]>([]);
  allServices       = signal<Service[]>(DEFAULT_SERVICES);
  selectedService   = computed<any | null>(() => {
    const id = this.selectedServiceId();
    return this.allServices().find(s => s.id === id) || this.allServices()[0] || null;
  });
  isLoadingServices = signal(false);
  isLoadingEmployees = signal(false);
  isLoadingSlots    = signal(false);
  isBooking         = signal(false);
  isPaying          = signal(false);
  currentAppointmentId: number | null = null;
  /** Prefetched Fiserv session so Confirm and Pay can redirect immediately. */
  private pendingPaymentSession: { redirectUrl: string; formFields: Record<string, string> } | null = null;
  private paymentPrefetchInFlight = false;
  private paymentPrefetchError: string | null = null;

  selectedDate: Date | null = null;
  selectedTime = '';
  minDate = new Date();
  availableDatesList = signal<string[]>([]);
  isLoadingDates = signal(false);
  datesLoaded = signal(false);
  hasSavedProgress = signal<boolean>(false);
  savedProgressDetails = signal<{ serviceName?: string; locationName?: string; stepLabel?: string; dateStr?: string } | null>(null);

  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;
    // If dates haven't loaded yet, allow all future dates
    if (!this.datesLoaded()) return true;
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return this.availableDatesList().includes(dateStr);
  };

  dateClass = (cellDate: Date, view: string): string => {
    if (view === 'month' && this.selectedDate) {
      const isSelected = cellDate.getDate() === this.selectedDate.getDate() &&
                         cellDate.getMonth() === this.selectedDate.getMonth() &&
                         cellDate.getFullYear() === this.selectedDate.getFullYear();
      if (isSelected) {
        return 'custom-selected-date';
      }
    }
    return '';
  };

  onActiveDateChange(activeDate: Date): void {
    if (activeDate) {
      this.loadAvailableDates(activeDate.getFullYear(), activeDate.getMonth() + 1);
    }
  }

  formatTime(time: string): string {
    if (!time) return '';
    const [h, m] = time.split(':');
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    return `${hour}:${m} ${suffix}`;
  }

  loadAvailableDates(year: number, month: number): void {
    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);
    const locId = this.selectedLocationId() || 1;
    const svcId = this.selectedServiceId();
    if (!svcId) return;

    this.isLoadingDates.set(true);
    this.api.getAvailableDates(empId, locId, svcId, year, month).subscribe({
      next: res => {
        if (res.data && res.data.length > 0) {
          const current = this.availableDatesList();
          const merged = Array.from(new Set([...current, ...res.data]));
          this.availableDatesList.set(merged);
        } else {
          // Fallback: generate available weekday dates for this month
          this.generateFallbackDates(year, month);
        }
        this.datesLoaded.set(true);
        this.isLoadingDates.set(false);
      },
      error: () => {
        // Fallback: generate available weekday dates for this month
        this.generateFallbackDates(year, month);
        this.datesLoaded.set(true);
        this.isLoadingDates.set(false);
      }
    });
  }

  private generateFallbackDates(year: number, month: number): void {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysInMonth = new Date(year, month, 0).getDate();
    const fallback: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      // Available: Mon-Sat (1-6), exclude Sundays (0)
      if (dayOfWeek !== 0 && date >= today) {
        fallback.push(`${year}-${pad(month)}-${pad(d)}`);
      }
    }
    const current = this.availableDatesList();
    const merged = Array.from(new Set([...current, ...fallback]));
    this.availableDatesList.set(merged);
  }

  triggerLoadDates(): void {
    const today = new Date();
    this.availableDatesList.set([]); // Reset
    this.datesLoaded.set(false);
    this.loadAvailableDates(today.getFullYear(), today.getMonth() + 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.loadAvailableDates(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  }

  detailsForm: FormGroup;

  steps = [
    { key: 'service' as BookingStep,         label: 'Treatment' },
    { key: 'location' as BookingStep,        label: 'Location' },
    { key: 'datetime' as BookingStep,        label: 'Calendar' },
    { key: 'details' as BookingStep,         label: 'Details' },
    { key: 'payment' as BookingStep,         label: 'Payment' },
    { key: 'confirmation' as BookingStep,    label: 'Done' },
  ];



  
  currentStepIndex = computed(() => this.steps.findIndex(s => s.key === this.currentStep()));

  bookingTypes = [
    { value: 'self' as BookingType,  icon: 'person',       label: 'For Myself',      description: 'Book for your own treatment session' },
    { value: 'other' as BookingType, icon: 'person_add',   label: 'For Someone Else', description: 'Book on behalf of another person' },
    { value: 'group' as BookingType, icon: 'group',        label: 'Group Booking',   description: 'Book for multiple people at once' },
  ];

  categorizedServices = computed(() => {
    const cats = new Map<string, { name: string; services: Service[] }>();
    for (const s of this.allServices()) {
      const key = s.category_name ?? 'Unknown';
      if (!cats.has(key)) cats.set(key, { name: key, services: [] });
      cats.get(key)!.services.push(s);
    }
    return Array.from(cats.values());
  });

  constructor(
    private api: ApiService,
    public router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    public authState: AuthStateService,
    private draftService: DraftService,
    private fb: FormBuilder
  ) {
    this.detailsForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadEmployees();
    this.initInstantDates();
    this.populateGuestDetails();
    this.checkSavedProgress();
    
    // Real-time auto-save as user types in any text box / input field
    this.detailsForm.valueChanges.subscribe(() => {
      this.saveBookingProgress();
    });

    // Auto-select service if passed in query params; otherwise redirect to services page if no saved progress
    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        const id = Number(params['service']);
        this.selectedServiceId.set(id);
        this.currentStep.set('location');
      } else if (!this.hasSavedProgress()) {
        this.router.navigate(['/services']);
      }
    });
  }

  @HostListener('window:beforeunload')
  @HostListener('window:pagehide')
  @HostListener('window:offline')
  onWindowUnloadOrOffline(): void {
    this.saveBookingProgress();
  }

  checkSavedProgress(): void {
    const draft = this.draftService.draft();
    if (draft && this.authState.isAuthenticated()) {
      const svc = this.allServices().find(s => draft.service_ids?.includes(s.id));
      const locName = draft.location_id === 1 ? 'Constant Spring' : (draft.location_id === 2 ? 'Mannings Hill Rd' : '');
      const stepObj = this.steps.find(s => s.key === draft.current_step);
      this.savedProgressDetails.set({
        serviceName: svc?.name || 'Treatment',
        locationName: locName,
        stepLabel: stepObj?.label || draft.current_step,
        dateStr: draft.scheduled_date ? new Date(draft.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined
      });
      this.hasSavedProgress.set(true);
      return;
    }

    const raw = localStorage.getItem('hhc_booking_progress');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data && data.currentStep && data.currentStep !== 'confirmation' && (Date.now() - (data.savedAt || 0)) < 7 * 24 * 60 * 60 * 1000) {
        const svc = this.allServices().find(s => s.id === data.selectedServiceId);
        const locName = data.selectedLocationId === 1 ? 'Constant Spring' : (data.selectedLocationId === 2 ? 'Mannings Hill Rd' : '');
        const stepObj = this.steps.find(s => s.key === data.currentStep);
        this.savedProgressDetails.set({
          serviceName: svc?.name || 'Treatment',
          locationName: locName,
          stepLabel: stepObj?.label || data.currentStep,
          dateStr: data.selectedDateIso ? new Date(data.selectedDateIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined
        });
        this.hasSavedProgress.set(true);
      }
    } catch (e) {
      this.clearSavedProgress();
    }
  }

  saveBookingProgress(): void {
    if (this.currentStep() === 'confirmation') {
      this.clearSavedProgress();
      return;
    }

    const progress = {
      currentStep: this.currentStep(),
      selectedServiceId: this.selectedServiceId(),
      selectedLocationId: this.selectedLocationId(),
      bookingFor: this.bookingFor(),
      selectedDateIso: this.selectedDate ? this.selectedDate.toISOString() : null,
      selectedTime: this.selectedTime,
      detailsFormValues: this.detailsForm ? this.detailsForm.value : null,
      savedAt: Date.now()
    };
    localStorage.setItem('hhc_booking_progress', JSON.stringify(progress));

    if (this.authState.isAuthenticated()) {
      this.draftService.saveDraft({
        current_step: this.currentStep(),
        location_id: this.selectedLocationId(),
        employee_id: this.selectedEmployeeId(),
        service_ids: this.selectedServiceId() ? [this.selectedServiceId()!] : [],
        scheduled_date: this.selectedDate ? this.selectedDate.toISOString().split('T')[0] : null,
        start_time: this.selectedTime || null,
        customer_info: this.detailsForm ? this.detailsForm.value : null
      }).subscribe({ error: () => {} }); // catch error silently on auto-save
    }
  }

  resumeSavedBooking(): void {
    const draft = this.draftService.draft();
    if (draft && this.authState.isAuthenticated()) {
      if (draft.service_ids && draft.service_ids.length > 0) this.selectedServiceId.set(draft.service_ids[0]);
      if (draft.location_id) this.selectedLocationId.set(draft.location_id);
      if (draft.employee_id) this.selectedEmployeeId.set(draft.employee_id);
      if (draft.scheduled_date) {
        const [year, month, day] = draft.scheduled_date.split('T')[0].split('-').map(Number);
        this.selectedDate = new Date(year, month - 1, day);
        this.onDateChange();
      }
      if (draft.start_time) this.selectedTime = draft.start_time;
      if (draft.customer_info && this.detailsForm) {
        this.detailsForm.patchValue(draft.customer_info);
      }
      if (draft.current_step && draft.current_step !== 'service') {
        this.currentStep.set(draft.current_step as BookingStep);
      } else {
        this.currentStep.set('location');
      }
      this.hasSavedProgress.set(false);
      this.snackBar.open('Restored your previous booking progress!', 'OK', { duration: 3000 });
      return;
    }

    const raw = localStorage.getItem('hhc_booking_progress');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      if (data.selectedServiceId) this.selectedServiceId.set(data.selectedServiceId);
      if (data.selectedLocationId) this.selectedLocationId.set(data.selectedLocationId);
      if (data.bookingFor) this.bookingFor.set(data.bookingFor);
      if (data.selectedDateIso) {
        this.selectedDate = new Date(data.selectedDateIso);
        this.onDateChange();
      }
      if (data.selectedTime) this.selectedTime = data.selectedTime;
      if (data.detailsFormValues && this.detailsForm) {
        this.detailsForm.patchValue(data.detailsFormValues);
      }
      if (data.currentStep && data.currentStep !== 'service') {
        this.currentStep.set(data.currentStep);
      } else {
        this.currentStep.set('location');
      }
      this.hasSavedProgress.set(false);
      this.snackBar.open('Restored your previous booking progress!', 'OK', { duration: 3000 });
    } catch (e) {
      this.clearSavedProgress();
    }
  }

  discardSavedBooking(): void {
    this.clearSavedProgress();
    this.hasSavedProgress.set(false);
    this.router.navigate(['/services']);
    this.snackBar.open('Please select a treatment to start a new booking.', 'OK', { duration: 3000 });
  }

  clearSavedProgress(): void {
    localStorage.removeItem('hhc_booking_progress');
    this.hasSavedProgress.set(false);
    if (this.authState.isAuthenticated()) {
      this.draftService.deleteDraft().subscribe({ error: () => {} });
    }
  }

  populateGuestDetails(): void {
    if (this.bookingFor() === 'myself') {
      const user = this.authState.user();
      const fullName = (this.authState.userFullName() || '').trim();
      const parts = fullName.split(' ');
      const firstName = user?.first_name || parts[0] || '';
      const lastName = user?.last_name || parts.slice(1).join(' ') || '';

      this.detailsForm.patchValue({
        first_name: firstName,
        last_name: lastName,
        email: user?.email || '',
        phone: user?.phone || '',
      });
    } else if (this.bookingFor() === 'someone_else') {
      // Clear fields for guest details when booking for someone else
      this.detailsForm.patchValue({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
      });
    }
  }

  private initInstantDates(): void {
    const today = new Date();
    this.generateFallbackDates(today.getFullYear(), today.getMonth() + 1);
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.generateFallbackDates(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
    this.datesLoaded.set(true);

    if (!this.selectedDate) {
      let d = new Date();
      if (d.getDay() === 0) d.setDate(d.getDate() + 1); // If Sunday, default to Monday
      this.selectedDate = d;
      this.onDateChange();
    }
  }

  private loadServices(): void {
    this.isLoadingServices.set(true);
    this.api.getServices().subscribe({
      next: res => {
        if (res.data && res.data.length > 0) {
          this.allServices.set(res.data);
        } else {
          this.allServices.set(DEFAULT_SERVICES);
        }
        this.isLoadingServices.set(false);
      },
      error: () => {
        this.allServices.set(DEFAULT_SERVICES);
        this.isLoadingServices.set(false);
      },
    });
  }

  private loadEmployees(): void {
    this.isLoadingEmployees.set(true);
    this.api.getEmployees().subscribe({
      next: res => {
        if (res.data) this.employees.set(res.data);
        this.isLoadingEmployees.set(false);
      },
      error: () => this.isLoadingEmployees.set(false),
    });
  }

  goToStep(step: BookingStep): void {
    if (this.currentStep() !== 'confirmation') {
      // Don't jump to calendar (or beyond) without choosing who the booking is for
      if (step !== 'location' && !this.bookingFor()) {
        this.showBookingForSheet.set(true);
        return;
      }
      this.currentStep.set(step);
      if (step === 'datetime') {
        this.triggerLoadDates();
      } else if (step === 'details') {
        if (!this.detailsForm.get('first_name')?.value) {
          this.populateGuestDetails();
        }
        this.scrollToDetailsSection();
      } else if (step === 'payment') {
        this.prefetchPaymentSession();
      }
      this.saveBookingProgress();
    }
  }

  selectLocation(id: number): void {
    this.selectedLocationId.set(id);
    // Require who-the-booking-is-for before the calendar
    this.bookingFor.set(null);
    this.showBookingForSheet.set(true);
  }

  continueFromLocation(): void {
    if (!this.selectedLocationId()) return;
    if (!this.bookingFor()) {
      this.showBookingForSheet.set(true);
      return;
    }
    this.nextStep();
  }

  chooseBookingFor(who: 'myself' | 'someone_else'): void {
    this.bookingFor.set(who);
    this.selectedBookingType.set(who === 'myself' ? 'self' : 'other');
    this.populateGuestDetails();
    this.showBookingForSheet.set(false);
    this.saveBookingProgress();
    // Advance to date/time only after an explicit choice
    if (this.currentStep() === 'location') {
      this.nextStep();
    }
  }

  closeBookingForSheet(): void {
    // Allow dismiss, but stay on location until they choose
    this.showBookingForSheet.set(false);
  }

  redirectToLogin(): void {
    // Save current selection to session storage so we could potentially restore it
    if (this.selectedServiceId()) sessionStorage.setItem('pendingBookingService', this.selectedServiceId()!.toString());
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/customer/book' } });
  }

  nextStep(): void {
    const order: BookingStep[] = ['location', 'datetime', 'details', 'payment', 'confirmation'];
    const idx = order.indexOf(this.currentStep());
    if (idx < order.length - 1) {
      // Block calendar until booking-for is chosen
      if (this.currentStep() === 'location' && !this.bookingFor()) {
        this.showBookingForSheet.set(true);
        return;
      }
      const next = order[idx + 1];
      this.currentStep.set(next);
      if (next === 'datetime') {
        this.triggerLoadDates();
      } else if (next === 'details') {
        if (!this.detailsForm.get('first_name')?.value) {
          this.populateGuestDetails();
        }
        this.scrollToDetailsSection();
      } else if (next === 'payment') {
        // Create booking + Fiserv session while the user reads the payment screen
        this.prefetchPaymentSession();
      }
      this.saveBookingProgress();
    }
  }

  prevStep(): void {
    const order: BookingStep[] = ['location', 'datetime', 'details', 'payment', 'confirmation'];
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) {
      this.currentStep.set(order[idx - 1]);
      this.saveBookingProgress();
    } else {
      // If user clicks back on Location step, take them back to Services page to change treatment
      this.router.navigate(['/services']);
    }
  }


  onDateChange(): void {
    if (!this.selectedDate || !this.selectedServiceId()) return;
    this.isLoadingSlots.set(true);
    this.selectedTime = '';

    const svc = this.allServices().find(s => s.id === this.selectedServiceId());
    const duration = svc ? svc.duration_minutes : 30;
    
    // For demo, if employee not selected, use first one or ID 1
    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);

    const pad = (n: number) => n < 10 ? '0' + n : n;
    const dateStr = `${this.selectedDate.getFullYear()}-${pad(this.selectedDate.getMonth() + 1)}-${pad(this.selectedDate.getDate())}`;

    this.api.getAvailableSlots(
      empId,
      this.selectedLocationId() || 1,
      dateStr,
      duration
    ).subscribe({
      next: (res) => {
        this.isLoadingSlots.set(false);
        const slots = res.data && res.data.length > 0 ? res.data : this.generateDefault15MinSlots();
        this.availableSlots.set(slots);
        this.scrollToTimeSelection();
      },
      error: () => {
        this.isLoadingSlots.set(false);
        this.availableSlots.set(this.generateDefault15MinSlots());
        this.scrollToTimeSelection();
      }
    });
  }

  generateDefault15MinSlots(): string[] {
    return [
      '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45',
      '11:00', '11:15', '11:30', '11:45',
      '12:00', '12:15', '12:30', '12:45',
      '13:00', '13:15', '13:30', '13:45',
      '14:00', '14:15', '14:30', '14:45',
      '15:00', '15:15', '15:30', '15:45',
      '16:00', '16:15', '16:30'
    ];
  }

  selectTimeSlotAndScroll(slot: string): void {
    this.selectedTime = slot;
    this.saveBookingProgress();
    this.scrollToContinueActions();
  }

  scrollToContinueActions(): void {
    setTimeout(() => {
      const actionsElement = document.getElementById('datetime-actions');
      if (actionsElement) {
        actionsElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }

  private scrollToTimeSelection(): void {
    setTimeout(() => {
      if (window.innerWidth < 768) {
        const timeSection = document.getElementById('time-selection-section');
        if (timeSection) {
          timeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 100);
  }

  private scrollToDetailsSection(): void {
    // Wait for the details step to render, then scroll so the form is fully visible on mobile
    setTimeout(() => {
      const detailsSection = document.getElementById('booking-details-section');
      if (detailsSection) {
        detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  }

  confirmBooking(): void {
    // Same live booking + Fiserv checkout path as Confirm and Pay
    this.submitPayment();
  }

  addToCalendar(): void {
    if (!this.selectedDate || !this.selectedTime || !this.selectedService()) return;
    const startStr = this.selectedTime.split(' ')[0]; // E.g. "10:00"
    const isPM = this.selectedTime.toLowerCase().includes('pm');
    let [hours, minutes] = startStr.split(':').map(Number);
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const startDate = new Date(this.selectedDate);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + (this.selectedService()?.duration_minutes || 60));

    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const text = encodeURIComponent(this.selectedService()?.name || 'Med Spa Treatment');
    const details = encodeURIComponent(`Spa Treatment booking at HHC LASER. Confirmation Code: ${this.confirmationCode()}`);
    const location = encodeURIComponent(this.selectedLocationId() === 1 ? 'Constant Spring Clinic, 48 Constant Spring Road, Kingston' : 'Mannings Hill Road Clinic, 63 Mannings Hill Rd, Kingston');
    const dates = `${fmt(startDate)}/${fmt(endDate)}`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  }

  viewBookingDetails(): void {
    this.router.navigate(['/customer/bookings']);
  }

  submitPayment(): void {
    if (this.isPaying()) return;
    this.isPaying.set(true);

    // Prefetch finished — redirect immediately
    if (this.pendingPaymentSession) {
      this.postToFiservGateway(
        this.pendingPaymentSession.redirectUrl,
        this.pendingPaymentSession.formFields
      );
      return;
    }

    // Prefetch still running — wait briefly, then fall through
    if (this.paymentPrefetchInFlight) {
      const started = Date.now();
      const waitForPrefetch = () => {
        if (this.pendingPaymentSession) {
          this.postToFiservGateway(
            this.pendingPaymentSession.redirectUrl,
            this.pendingPaymentSession.formFields
          );
          return;
        }
        if (this.paymentPrefetchInFlight && Date.now() - started < 20000) {
          setTimeout(waitForPrefetch, 50);
          return;
        }
        if (this.paymentPrefetchError) {
          this.isPaying.set(false);
          this.snackBar.open(this.paymentPrefetchError, 'Close', { duration: 6000 });
          return;
        }
        this.createBookingAndPay();
      };
      waitForPrefetch();
      return;
    }

    this.createBookingAndPay();
  }

  /** Starts booking + payment session as soon as the payment step is shown. */
  private prefetchPaymentSession(): void {
    if (this.pendingPaymentSession || this.paymentPrefetchInFlight || this.currentAppointmentId) {
      if (this.currentAppointmentId && !this.pendingPaymentSession && !this.paymentPrefetchInFlight) {
        this.paymentPrefetchInFlight = true;
        this.api.createCheckoutSession(this.currentAppointmentId).subscribe({
          next: (res) => {
            this.paymentPrefetchInFlight = false;
            if (res.data?.redirectUrl && res.data?.formFields) {
              this.pendingPaymentSession = {
                redirectUrl: res.data.redirectUrl,
                formFields: res.data.formFields,
              };
            }
          },
          error: () => {
            this.paymentPrefetchInFlight = false;
          },
        });
      }
      return;
    }

    this.paymentPrefetchInFlight = true;
    this.paymentPrefetchError = null;

    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const dateStr = `${this.selectedDate!.getFullYear()}-${pad(this.selectedDate!.getMonth() + 1)}-${pad(this.selectedDate!.getDate())}`;

    const dto = {
      booking_type: this.selectedBookingType(),
      employee_id: empId,
      location_id: this.selectedLocationId() || 1,
      scheduled_date: dateStr,
      start_time: this.selectedTime,
      service_ids: [this.selectedServiceId()!],
      notes: this.detailsForm.value.notes
    };

    this.api.createBooking(dto).subscribe({
      next: (res) => {
        this.paymentPrefetchInFlight = false;
        if (res.data?.appointment) {
          this.currentAppointmentId = res.data.appointment.id;
          if (res.data.appointment.confirmation_code) {
            this.confirmationCode.set(res.data.appointment.confirmation_code);
          } else {
            this.confirmationCode.set(String(res.data.appointment.id));
          }
        }

        const payment = res.data?.payment;
        if (payment?.redirectUrl && payment?.formFields) {
          this.pendingPaymentSession = {
            redirectUrl: payment.redirectUrl,
            formFields: payment.formFields,
          };
        }
      },
      error: (err) => {
        this.paymentPrefetchInFlight = false;
        this.paymentPrefetchError = err.error?.message || 'Failed to prepare payment. Please try again.';
      },
    });
  }

  private createBookingAndPay(): void {
    // Existing appointment: start a live Fiserv checkout for that booking
    if (this.currentAppointmentId) {
      this.initiateCheckoutSession();
      return;
    }

    const empId = this.selectedEmployeeId() || (this.employees().length > 0 ? this.employees()[0].id : 1);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const dateStr = `${this.selectedDate!.getFullYear()}-${pad(this.selectedDate!.getMonth() + 1)}-${pad(this.selectedDate!.getDate())}`;

    const dto = {
      booking_type: this.selectedBookingType(),
      employee_id: empId,
      location_id: this.selectedLocationId() || 1,
      scheduled_date: dateStr,
      start_time: this.selectedTime,
      service_ids: [this.selectedServiceId()!],
      notes: this.detailsForm.value.notes
    };

    // Create the real appointment, then immediately POST to the live Fiserv gateway
    this.api.createBooking(dto).subscribe({
      next: (res) => {
        if (res.data?.appointment) {
          this.currentAppointmentId = res.data.appointment.id;
          if (res.data.appointment.confirmation_code) {
            this.confirmationCode.set(res.data.appointment.confirmation_code);
          } else {
            this.confirmationCode.set(String(res.data.appointment.id));
          }
        }

        const payment = res.data?.payment;
        if (payment?.redirectUrl && payment?.formFields) {
          this.postToFiservGateway(payment.redirectUrl, payment.formFields);
          return;
        }

        // Fallback: build a live checkout session for the appointment
        this.initiateCheckoutSession();
      },
      error: (err) => {
        this.isPaying.set(false);
        this.snackBar.open(err.error?.message || 'Failed to create booking. Please try again.', 'Close', { duration: 6000 });
      }
    });
  }

  private initiateCheckoutSession(): void {
    if (!this.currentAppointmentId) {
      this.isPaying.set(false);
      return;
    }

    this.api.createCheckoutSession(this.currentAppointmentId).subscribe({
      next: (res) => {
        this.isPaying.set(false);
        if (res.data?.redirectUrl && res.data?.formFields) {
          this.postToFiservGateway(res.data.redirectUrl, res.data.formFields);
        } else {
          this.snackBar.open('Unable to initialize secure payment. No gateway redirect URL received.', 'Close', { duration: 6000 });
        }
      },
      error: (err) => {
        this.isPaying.set(false);
        if (err.status === 0 || err.name === 'HttpErrorResponse') {
          this.snackBar.open(
            '⚠️ Cannot reach the payment server. Please ensure the backend is running on port 3000.',
            'Close',
            { duration: 10000 }
          );
        } else {
          const msg = err.error?.message || 'Unable to connect to payment gateway. Please try again.';
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        }
      }
    });
  }

  /** Dynamically creates and submits an HTML form via POST to the Fiserv gateway. */
  private postToFiservGateway(url: string, fields: Record<string, string>): void {
    const gatewayUrl = String(url || '').trim();
    if (!gatewayUrl || !/^https:\/\/.+\.ipg-online\.com\//i.test(gatewayUrl)) {
      this.isPaying.set(false);
      console.error('[Fiserv] Refusing to submit — invalid gateway URL:', gatewayUrl);
      this.snackBar.open(
        'Payment gateway URL is invalid. Please contact support.',
        'Close',
        { duration: 8000 }
      );
      return;
    }

    // Never accidentally POST to our SPA fail/success routes
    if (/\/payment\/(failure|success)/i.test(gatewayUrl) || /localhost:4200/i.test(gatewayUrl)) {
      this.isPaying.set(false);
      console.error('[Fiserv] Refusing to submit — URL looks like an app return path:', gatewayUrl);
      this.snackBar.open(
        'Payment could not start (bad redirect). Please try again.',
        'Close',
        { duration: 8000 }
      );
      return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    form.acceptCharset = 'UTF-8';
    form.style.display = 'none';

    for (const [key, value] of Object.entries(fields || {})) {
      if (value == null || value === '') continue;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }

    console.info('[Fiserv] Submitting to gateway', {
      action: gatewayUrl,
      currency: fields?.['currency'],
      chargetotal: fields?.['chargetotal'],
      timezone: fields?.['timezone'],
      oid: fields?.['oid'],
    });

    document.body.appendChild(form);
    form.submit();
  }

  getServiceImage(url?: string, name?: string): string {
    const sName = (name || '').toLowerCase();
    const sUrl = url || '';

    if (sUrl && (sUrl.startsWith('http') || sUrl.startsWith('/images/'))) {
      if ((sName.includes('bikini') || sName.includes('brazilian') || sName.includes('pubic')) && sUrl.includes('photo-1544161515-4ab6ce6db874')) {
        return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80';
      }
      return sUrl;
    }

    if (sName.includes('botox')) return '/images/botox_consultation.webp';
    if (sName.includes('filler')) return '/images/dermal_fillers_consultation.webp';
    if (sName.includes('bikini') || sName.includes('brazilian') || sName.includes('pubic')) {
      return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80';
    }
    if (sName.includes('leg') || sName.includes('thigh')) {
      return 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=600&q=80';
    }
    if (sName.includes('abdomen') || sName.includes('chest') || sName.includes('stomach')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80';
    }
    if (sName.includes('back')) {
      return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80';
    }
    if (sName.includes('arm') || sName.includes('shoulder')) {
      return 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80';
    }
    if (sName.includes('face') || sName.includes('chin') || sName.includes('jaw') || sName.includes('neck')) {
      return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&q=80';
  }
}