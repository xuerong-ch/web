import { CarListing, qualityMapping, qualityColors } from '../types';
import { ExternalLink } from 'lucide-react';

interface ListingDetailsProps {
  listing: CarListing | null;
}

export function ListingDetails({ listing }: ListingDetailsProps) {
  if (!listing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">Selecciona un anuncio para ver sus detalles</p>
      </div>
    );
  }

  const mappedQuality = qualityMapping[listing.CALIDAD] || listing.CALIDAD;
  const qualityColor = qualityColors[mappedQuality];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Detalles del Anuncio</h2>
        <a
          href={listing.LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Ver anuncio <ExternalLink size={16} />
        </a>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Marca:</p>
          <p>{listing.MARCA}</p>
        </div>
        <div>
          <p className="font-semibold">Modelo:</p>
          <p>{listing.MODELO}</p>
        </div>
        <div>
          <p className="font-semibold">Calidad:</p>
          <p style={{ color: qualityColor }}>{mappedQuality}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold">Explicación:</p>
        <p className="text-gray-700">{listing.EXPLICACION}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">Composición:</p>
          <p className="text-gray-700">{listing.COMPOSICIÓN}</p>
        </div>
        <div>
          <p className="font-semibold">Iluminación:</p>
          <p className="text-gray-700">{listing.ILUMINACIÓN}</p>
        </div>
        <div>
          <p className="font-semibold">Enfoque:</p>
          <p className="text-gray-700">{listing.ENFOQUE}</p>
        </div>
        <div>
          <p className="font-semibold">Color:</p>
          <p className="text-gray-700">{listing.COLOR}</p>
        </div>
      </div>
    </div>
  );
}