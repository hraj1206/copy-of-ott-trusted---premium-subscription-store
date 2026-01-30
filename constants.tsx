
import React from 'react';
import { OTTService } from './types';

export const ADMIN_CREDENTIALS = {
  email: 'hraj48147@gmail.com',
  password: '9113401017'
};

export const WHATSAPP_NUMBER = '9113401017'; // Updated admin number

export const SERVICES: OTTService[] = [
  {
    id: 'netflix',
    name: 'Netflix Premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png',
    color: '#E50914',
    plans: [
      { id: 'n1', name: 'Standard (Full HD)', price: 199, duration: '1 Month', features: ['2 Screens Access', '1080p Video Quality', 'No Ads Ever', 'Download on 2 Devices'] },
      { id: 'n2', name: 'Ultra Premium (4K)', price: 499, duration: '1 Month', features: ['4 Screens Access', '4K + HDR Quality', 'Spatial Audio Support', 'Download on 6 Devices'] }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo.png',
    color: '#FF0000',
    plans: [
      { id: 'y1', name: 'Individual Pro', price: 99, duration: '1 Month', features: ['Ad-free Experience', 'Background Play', 'YouTube Music Premium', 'Offline Downloads'] },
      { id: 'y2', name: 'Family Shield', price: 189, duration: '1 Month', features: ['Up to 5 Family Members', 'Dedicated Kids App Access', 'All Individual Perks', 'Shared Billing'] }
    ]
  },
  {
    id: 'disney',
    name: 'Disney+ Hotstar',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Disney%2B_Hotstar_logo.svg/512px-Disney%2B_Hotstar_logo.svg.png',
    color: '#0063E5',
    plans: [
      { id: 'd1', name: 'Super Saver', price: 149, duration: '3 Months', features: ['2 Devices Support', '1080p Video Quality', 'Live Sports Access', 'Standard Audio'] },
      { id: 'd2', name: 'Premium Elite', price: 299, duration: '3 Months', features: ['4 Devices Support', '4K Video Quality', 'Ad-free (Except Sports)', 'Dolby Atmos Audio'] }
    ]
  },
  {
    id: 'prime',
    name: 'Amazon Prime',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png',
    color: '#00A8E1',
    plans: [
      { id: 'p1', name: 'Annual Gold', price: 999, duration: '1 Year', features: ['4K Streaming', 'Fast Free Delivery', 'Prime Music Unlimited', 'Prime Reading'] },
      { id: 'p2', name: 'Lite Experience', price: 599, duration: '1 Year', features: ['HD Streaming Only', 'Fast Free Delivery', 'Ad-supported Video', 'Limited Music'] }
    ]
  }
];
