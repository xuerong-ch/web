import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell 
} from 'recharts';
import { ExternalLink, ArrowUpDown, FileText } from 'lucide-react';

interface Listing {
  MARCA: string;
  MODELO: string;
  LINK: string;
  CALIDAD: string;
  EXPLICACION: string;
  COMPOSICIÓN: string;
  ILUMINACIÓN: string;
  ENFOQUE: string;
  COLOR: string;
  hasDetailedAnalysis?: boolean;
}

const QUALITY_MAPPING = {
  'MUY BIEN': 'ACEPTABLE',
  'BIEN': 'BIEN',
  'REGULAR': 'REGULAR',
  'MALA': 'MALA',
  'MUY MALA': 'MUY MALA'
};

const QUALITY_ORDER = {
  'ACEPTABLE': 1,
  'BIEN': 2,
  'REGULAR': 3,
  'MALA': 4,
  'MUY MALA': 5
};

const COLORS = {
  'ACEPTABLE': '#84cc16',
  'BIEN': '#4ade80',
  'REGULAR': '#fbbf24',
  'MALA': '#ef4444',
  'MUY MALA': '#991b1b'
};

function App() {
  const [data, setData] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showOnlyDetailed, setShowOnlyDetailed] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSV data
    fetch('/Calidad de publicaciones - Listings_Deysa (1).csv')
      .then(response => response.text())
      .then(csvText => {
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        
        // Check which listings have detailed analysis
        const listings = result.data as Listing[];
        const urlToCheck = 'www.deysa.com_coches_km0_madrid_ford_focus_gasolina_st-2-3-ecoboost-206kw-280cv_1051053';
        
        const enhancedListings = listings.map(listing => ({
          ...listing,
          hasDetailedAnalysis: listing.LINK?.includes(urlToCheck) || false
        }));
        
        setData(enhancedListings);
      });
  }, []);

  const fetchDetailedAnalysis = async (listing: Listing) => {
    if (listing.hasDetailedAnalysis) {
      const response = await fetch('/www.deysa.com_coches_km0_madrid_ford_focus_gasolina_st-2-3-ecoboost-206kw-280cv_1051053.txt');
      const text = await response.text();
      setDetailedAnalysis(text);
    } else {
      setDetailedAnalysis(null);
    }
  };

  const qualityDistribution = React.useMemo(() => {
    const filteredData = showOnlyDetailed ? data.filter(item => item.hasDetailedAnalysis) : data;
    const distribution: { [key: string]: number } = {};
    filteredData.forEach(item => {
      const mappedQuality = QUALITY_MAPPING[item.CALIDAD as keyof typeof QUALITY_MAPPING];
      if (mappedQuality) {
        distribution[mappedQuality] = (distribution[mappedQuality] || 0) + 1;
      }
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => QUALITY_ORDER[a.name as keyof typeof QUALITY_ORDER] - QUALITY_ORDER[b.name as keyof typeof QUALITY_ORDER]);
  }, [data, showOnlyDetailed]);

  const getQualityColor = (quality: string) => {
    const mappedQuality = QUALITY_MAPPING[quality as keyof typeof QUALITY_MAPPING];
    return COLORS[mappedQuality as keyof typeof COLORS];
  };

  const getQualityClasses = (quality: string) => {
    const mappedQuality = QUALITY_MAPPING[quality as keyof typeof QUALITY_MAPPING];
    switch (mappedQuality) {
      case 'ACEPTABLE':
        return 'bg-lime-100 text-lime-800';
      case 'BIEN':
        return 'bg-green-100 text-green-800';
      case 'REGULAR':
        return 'bg-yellow-100 text-yellow-800';
      case 'MALA':
        return 'bg-red-100 text-red-800';
      case 'MUY MALA':
        return 'bg-red-900 text-red-100';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const sortedData = React.useMemo(() => {
    const filteredData = showOnlyDetailed ? data.filter(item => item.hasDetailedAnalysis) : data;
    return [...filteredData].sort((a, b) => {
      const qualityA = QUALITY_ORDER[QUALITY_MAPPING[a.CALIDAD as keyof typeof QUALITY_MAPPING] as keyof typeof QUALITY_ORDER] || 0;
      const qualityB = QUALITY_ORDER[QUALITY_MAPPING[b.CALIDAD as keyof typeof QUALITY_MAPPING] as keyof typeof QUALITY_ORDER] || 0;
      return sortOrder === 'asc' ? qualityA - qualityB : qualityB - qualityA;
    });
  }, [data, sortOrder, showOnlyDetailed]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Análisis de Calidad de Anuncios
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyDetailed}
              onChange={(e) => setShowOnlyDetailed(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mostrar solo anuncios con análisis detallado</span>
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Distribución de Calidad (Gráfico Circular)
            </h2>
            <PieChart width={400} height={300}>
              <Pie
                data={qualityDistribution}
                cx={200}
                cy={150}
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => 
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {qualityDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Distribución de Calidad (Gráfico de Barras)
            </h2>
            <BarChart width={400} height={300} data={qualityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8">
                {qualityDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS]} 
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Listado de Anuncios</h2>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                Ordenar por calidad <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Análisis Detallado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData
                    .filter(item => QUALITY_MAPPING[item.CALIDAD as keyof typeof QUALITY_MAPPING])
                    .map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityClasses(item.CALIDAD)}`}
                          >
                            {QUALITY_MAPPING[item.CALIDAD as keyof typeof QUALITY_MAPPING]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.hasDetailedAnalysis && (
                            <span className="text-green-600">
                              <FileText className="w-4 h-4 inline" /> Disponible
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => {
                              setSelectedListing(item);
                              fetchDetailedAnalysis(item);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedListing && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Detalles del Anuncio</h2>
                <a
                  href={selectedListing.LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  Ver anuncio <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-gray-700">Marca</h3>
                  <p>{selectedListing.MARCA}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Modelo</h3>
                  <p>{selectedListing.MODELO || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Calidad</h3>
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityClasses(selectedListing.CALIDAD)}`}
                >
                  {QUALITY_MAPPING[selectedListing.CALIDAD as keyof typeof QUALITY_MAPPING]}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="font-medium text-gray-700">Explicación</h3>
                <p className="text-gray-600">{selectedListing.EXPLICACION}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-medium text-gray-700">Composición</h3>
                  <p className="text-gray-600">{selectedListing.COMPOSICIÓN}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Iluminación</h3>
                  <p className="text-gray-600">{selectedListing.ILUMINACIÓN}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Enfoque</h3>
                  <p className="text-gray-600">{selectedListing.ENFOQUE}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700">Color</h3>
                  <p className="text-gray-600">{selectedListing.COLOR}</p>
                </div>
              </div>

              {selectedListing.hasDetailedAnalysis && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Análisis Detallado</h3>
                  {detailedAnalysis && (
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap text-sm">{detailedAnalysis}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;