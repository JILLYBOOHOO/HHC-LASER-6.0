import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Shared service using localStorage
export const CONTACT_MESSAGES_KEY = 'hhc_contact_messages';

export function getContactMessages(): ContactMessage[] {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
  } catch { return []; }
}

export function saveContactMessage(msg: Omit<ContactMessage, 'id' | 'timestamp' | 'read'>): void {
  const messages = getContactMessages();
  messages.unshift({
    ...msg,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
}
