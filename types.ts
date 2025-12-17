
export enum TShirtColor {
  WHITE = 'WHITE',
  BLACK = 'BLACK'
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  color: TShirtColor;
  designUrl: string;
  status: 'pending' | 'processing' | 'shipped';
  createdAt: number;
  total: number;
  aiDescription?: string;
}

export interface DesignState {
  color: TShirtColor;
  overlayImage: string | null;
  scale: number;
  position: { x: number; y: number };
}
