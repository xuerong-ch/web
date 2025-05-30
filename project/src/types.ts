export interface CarListing {
  MARCA: string;
  MODELO: string;
  LINK: string;
  CALIDAD: string;
  EXPLICACION: string;
  COMPOSICIÓN: string;
  ILUMINACIÓN: string;
  ENFOQUE: string;
  EXPOSICIÓN: string;
  COLOR: string;
  ANGULO: string;
  CONTEXTO: string;
  EDICION: string;
  ENCUADRE: string;
  'CALIDAD DE IMAGEN': string;
}

export const qualityMapping: Record<string, string> = {
  'MUY BIEN': 'Bien',
  'BIEN': 'Aceptable',
  'REGULAR': 'Regular',
  'MALA': 'Mala',
  'MUY MALA': 'Muy Mala'
};

export const qualityColors: Record<string, string> = {
  'Bien': '#22c55e',
  'Aceptable': '#3b82f6',
  'Regular': '#eab308',
  'Mala': '#ef4444',
  'Muy Mala': '#7f1d1d'
};