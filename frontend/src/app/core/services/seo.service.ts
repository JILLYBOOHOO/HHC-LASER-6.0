import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  schema?: object | object[];
}

const BASE_URL = 'https://hhclaser.com';
const DEFAULT_IMAGE = `${BASE_URL}/HCClogo.jpg`;
const DEFAULT_KEYWORDS = 'Havendale Healthcare, Havendale Healthcare Kingston, HHC Laser, HHC LASER, HHC Laser & Co, HHC Laser Jamaica, hhclaser.com, hhclaser.co, HCC LASER.CO, Medical Spa Jamaica, Med Spa Kingston Jamaica, Laser Hair Removal Jamaica, Botox Jamaica, Dermal Fillers Jamaica, IV Therapy Jamaica, Body Contouring Jamaica, Wood Therapy Jamaica, Heat Shock Sauna Jamaica, Skin Rejuvenation Jamaica, Chemical Peel Jamaica, Acne Treatment Jamaica, Hair Restoration Jamaica, Aesthetic Clinic Kingston Jamaica';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  updatePage(config: SeoConfig): void {
    const fullUrl = `${BASE_URL}${config.canonicalPath ?? ''}`;
    const image = config.ogImage ?? DEFAULT_IMAGE;
    const ogType = config.ogType ?? 'website';

    // ── Title ───────────────────────────────────────────────────────
    this.title.setTitle(config.title);

    // ── Primary meta ────────────────────────────────────────────────
    this.setTag('description', config.description);
    this.setTag('keywords', config.keywords ?? DEFAULT_KEYWORDS);
    this.setTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1');
    this.setTag('author', 'HHC Laser & Co. / Havendale Healthcare');

    // ── Geo & Location SEO Tags ──────────────────────────────────────
    this.setTag('geo.region', 'JM-08');
    this.setTag('geo.placename', 'Kingston, Jamaica');
    this.setTag('geo.position', '18.0220372;-76.7956654');
    this.setTag('ICBM', '18.0220372, -76.7956654');

    // ── Open Graph ──────────────────────────────────────────────────
    this.setProp('og:title', config.title);
    this.setProp('og:description', config.description);
    this.setProp('og:url', fullUrl);
    this.setProp('og:image', image);
    this.setProp('og:type', ogType);
    this.setProp('og:site_name', 'HHC Laser & Co. (Havendale Healthcare)');
    this.setProp('og:locale', 'en_JM');

    // ── Twitter Card ─────────────────────────────────────────────────
    this.setTag('twitter:card', 'summary_large_image');
    this.setTag('twitter:title', config.title);
    this.setTag('twitter:description', config.description);
    this.setTag('twitter:image', image);

    // ── Canonical URL ─────────────────────────────────────────────────
    this.upsertCanonical(fullUrl);

    // ── JSON-LD Schema ────────────────────────────────────────────────
    if (config.schema) {
      this.upsertJsonLd('page-schema', config.schema);
    }
  }

  injectSchema(id: string, schema: object | object[]): void {
    this.upsertJsonLd(id, schema);
  }

  private setTag(name: string, content: string): void {
    if (this.meta.getTag(`name='${name}'`)) {
      this.meta.updateTag({ name, content });
    } else {
      this.meta.addTag({ name, content });
    }
  }

  private setProp(property: string, content: string): void {
    if (this.meta.getTag(`property='${property}'`)) {
      this.meta.updateTag({ property, content });
    } else {
      this.meta.addTag({ property, content });
    }
  }

  private upsertCanonical(url: string): void {
    let link: HTMLLinkElement = this.doc.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private upsertJsonLd(id: string, schema: object | object[]): void {
    const existing = this.doc.getElementById(`ld-${id}`);
    if (existing) existing.remove();

    const script = this.doc.createElement('script');
    script.id = `ld-${id}`;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(Array.isArray(schema) ? schema : schema);
    this.doc.head.appendChild(script);
  }
}
