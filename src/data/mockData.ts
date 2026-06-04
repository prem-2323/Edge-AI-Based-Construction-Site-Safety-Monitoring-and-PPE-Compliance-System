export type RiskZone = 'low' | 'medium' | 'high';

export type PPEItem = 
  | 'Helmet' 
  | 'Gloves' 
  | 'Safety Vest' 
  | 'Safety Shoes' 
  | 'Protective Clothing';

export const ALL_PPE_ITEMS: PPEItem[] = [
  'Helmet',
  'Gloves',
  'Safety Vest',
  'Safety Shoes',
  'Protective Clothing',
];

export interface Camera {
  id: number;
  name: string;
  location: string;
  status: 'safe' | 'violation';
  violations: string[];
  thumbnail: string;
  zone: RiskZone;
}

export interface Alert {
  id: number;
  cameraId: number;
  cameraName: string;
  violationType: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

export interface ViolationLog {
  id: number;
  time: Date;
  cameraId: number;
  cameraName: string;
  violationType: string;
  severity: 'low' | 'medium' | 'high';
  status: 'resolved' | 'unresolved';
}

export const cameras: Camera[] = [
  {
    id: 1,
    name: 'Camera 1',
    location: 'Main Entrance',
    status: 'safe',
    violations: [],
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    zone: 'low',
  },
  {
    id: 2,
    name: 'Camera 2',
    location: 'Zone A - Excavation',
    status: 'violation',
    violations: ['Helmet Missing', 'Safety Vest Missing'],
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    zone: 'high',
  },
  {
    id: 3,
    name: 'Camera 3',
    location: 'Zone B - Scaffolding',
    status: 'safe',
    violations: [],
    thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
    zone: 'medium',
  },
  {
    id: 4,
    name: 'Camera 4',
    location: 'Material Storage',
    status: 'violation',
    violations: ['Safety Shoes Missing'],
    thumbnail: 'https://images.unsplash.com/photo-1590725140246-20acdee442be?w=400&h=300&fit=crop',
    zone: 'low',
  },
  {
    id: 5,
    name: 'Camera 5',
    location: 'Zone C - Crane Area',
    status: 'safe',
    violations: [],
    thumbnail: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    zone: 'high',
  },
  {
    id: 6,
    name: 'Camera 6',
    location: 'Worker Rest Area',
    status: 'safe',
    violations: [],
    thumbnail: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop',
    zone: 'medium',
  },
];

export const alerts: Alert[] = [
  {
    id: 1,
    cameraId: 2,
    cameraName: 'Camera 2',
    violationType: 'Helmet Missing',
    timestamp: new Date(Date.now() - 5 * 60000),
    severity: 'high',
  },
  {
    id: 2,
    cameraId: 2,
    cameraName: 'Camera 2',
    violationType: 'Safety Vest Missing',
    timestamp: new Date(Date.now() - 5 * 60000),
    severity: 'medium',
  },
  {
    id: 3,
    cameraId: 4,
    cameraName: 'Camera 4',
    violationType: 'Safety Boots Missing',
    timestamp: new Date(Date.now() - 12 * 60000),
    severity: 'medium',
  },
  {
    id: 4,
    cameraId: 1,
    cameraName: 'Camera 1',
    violationType: 'Helmet Missing',
    timestamp: new Date(Date.now() - 45 * 60000),
    severity: 'high',
  },
];

export const violationLogs: ViolationLog[] = [
  {
    id: 1,
    time: new Date(Date.now() - 5 * 60000),
    cameraId: 2,
    cameraName: 'Camera 2',
    violationType: 'Helmet Missing',
    severity: 'high',
    status: 'unresolved',
  },
  {
    id: 2,
    time: new Date(Date.now() - 5 * 60000),
    cameraId: 2,
    cameraName: 'Camera 2',
    violationType: 'Safety Vest Missing',
    severity: 'medium',
    status: 'unresolved',
  },
  {
    id: 3,
    time: new Date(Date.now() - 12 * 60000),
    cameraId: 4,
    cameraName: 'Camera 4',
    violationType: 'Safety Boots Missing',
    severity: 'medium',
    status: 'unresolved',
  },
  {
    id: 4,
    time: new Date(Date.now() - 45 * 60000),
    cameraId: 1,
    cameraName: 'Camera 1',
    violationType: 'Helmet Missing',
    severity: 'high',
    status: 'resolved',
  },
  {
    id: 5,
    time: new Date(Date.now() - 2 * 3600000),
    cameraId: 3,
    cameraName: 'Camera 3',
    violationType: 'Safety Harness Missing',
    severity: 'high',
    status: 'resolved',
  },
  {
    id: 6,
    time: new Date(Date.now() - 4 * 3600000),
    cameraId: 5,
    cameraName: 'Camera 5',
    violationType: 'Safety Vest Missing',
    severity: 'medium',
    status: 'resolved',
  },
];
