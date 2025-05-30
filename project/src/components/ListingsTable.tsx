import { CarListing, qualityMapping, qualityColors } from '../types';

interface ListingsTableProps {
  data: CarListing[];
  onSelectListing: (listing: CarListing) => void;
}

export function ListingsTable({ data, onSelectListing }: ListingsTableProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Listado de Anuncios</h2>
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((listing, index) => {
            const mappedQuality = qualityMapping[listing.CALIDAD] || listing.CALIDAD;
            const qualityColor = qualityColors[mappedQuality];
            
            return (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{listing.MARCA}</td>
                <td className="px-6 py-4 whitespace-nowrap">{listing.MODELO}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span style={{ color: qualityColor }}>{mappedQuality}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onSelectListing(listing)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Ver detalles
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}