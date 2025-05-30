import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { ExternalLink, ArrowUpDown, FileText } from 'lucide-react';
import { formatTextForDisplay } from './utils/textProcessor';

const transformLinkToDeysaBaseFilename = (link: string | undefined): string | null => {
  if (!link) return null;
  let filename = link.replace(/https?:\/\//, '');
  if (filename.endsWith('/')) {
    filename = filename.slice(0, -1);
  }
  filename = filename.replace(/\//g, '_');
  return filename;
};

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
  detailedAnalysisFilename?: string | null;
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
  'ACEPTABLE': '#4ade80',
  'BIEN': '#84cc16',
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
    fetch('/Calidad de publicaciones - Listings_Deysa (1).csv')
      .then(response => response.text())
      .then(csvText => {
        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const listingsFromCsv = result.data as Omit<Listing, 'hasDetailedAnalysis' | 'detailedAnalysisFilename'>[];

        const targetDetailedAnalysisBaseFilename = 'www.deysa.com_coches_km0_madrid_ford_focus_gasolina_st-2-3-ecoboost-206kw-280cv_1051053';

        const enhancedListings = listingsFromCsv.map(listing => {
          const currentListingBaseFilename = transformLinkToDeysaBaseFilename(listing.LINK);
          const hasAnalysis = currentListingBaseFilename === targetDetailedAnalysisBaseFilename;

          return {
            ...listing,
            hasDetailedAnalysis: hasAnalysis,
            detailedAnalysisFilename: hasAnalysis ? `${targetDetailedAnalysisBaseFilename}.txt` : null,
          };
        });

        setData(enhancedListings as Listing[]);
      });
  }, []);

  const fetchDetailedAnalysis = async (listing: Listing) => {
    if (listing.hasDetailedAnalysis && listing.detailedAnalysisFilename) {
      try {
        const response = await fetch(`/${listing.detailedAnalysisFilename}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} for ${listing.detailedAnalysisFilename}`);
        }
        const text = await response.text();
        const formattedText = formatTextForDisplay(text);
        setDetailedAnalysis(formattedText);
      } catch (error) {
        console.error('Error fetching detailed analysis:', error);
        setDetailedAnalysis(`Error al cargar el análisis: ${error instanceof Error ? error.message : String(error)}`);
      }
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
        return 'bg-green-100 text-green-800';
      case 'BIEN':
        return 'bg-lime-100 text-lime-800';
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
      const qualityA = QUALITY_ORDER[QUALITY_MAPPING[a.CALIDAD as keyof typeof QUALITY_MAPPING] as keyof typeof QUALITY_ORDER] || Infinity;
      const qualityB = QUALITY_ORDER[QUALITY_MAPPING[b.CALIDAD as keyof typeof QUALITY_MAPPING] as keyof typeof QUALITY_ORDER] || Infinity;
      return sortOrder === 'asc' ? qualityA - qualityB : qualityB - qualityA;
    });
  }, [data, sortOrder, showOnlyDetailed]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Análisis de Calidad de Anuncios
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-white rounded-lg shadow">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showOnlyDetailed}
              onChange={(e) => setShowOnlyDetailed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Mostrar solo anuncios con análisis detallado
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Distribución de Calidad (Circular)
            </h2>
            {qualityDistribution.length > 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
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
                      key={`cell-pie-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <p className="text-gray-500">No hay datos para mostrar.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Distribución de Calidad (Barras)
            </h2>
            {qualityDistribution.length > 0 ? (
              <BarChart width={400} height={300} data={qualityDistribution} margin={{ top: 5, right: 20, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} style={{ fontSize: '0.8rem' }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {qualityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-bar-${index}`}
                      fill={COLORS[entry.name as keyof typeof COLORS]}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <p className="text-gray-500">No hay datos para mostrar.</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Listado de Anuncios</h2>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 px-3 rounded-md hover:bg-indigo-50 transition-colors"
              >
                Ordenar por calidad <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              {sortedData.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Análisis Det.
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
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.MARCA}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.MODELO || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityClasses(item.CALIDAD)}`}
                            >
                              {QUALITY_MAPPING[item.CALIDAD as keyof typeof QUALITY_MAPPING]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {item.hasDetailedAnalysis ? (
                              <FileText className="w-5 h-5 text-green-500 inline\" titleAccess="Análisis detallado disponible"/>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => {
                                setSelectedListing(item);
                                fetchDetailedAnalysis(item);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 font-medium"
                            >
                              Ver detalles
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 text-gray-500">No hay anuncios para mostrar según los filtros actuales.</p>
              )}
            </div>
          </div>

          {selectedListing && (
            <div className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6 self-start">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Detalles del Anuncio</h2>
                <button
                  onClick={() => setSelectedListing(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Cerrar detalles"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Marca</h3>
                  <p className="text-gray-800">{selectedListing.MARCA}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                  <p className="text-gray-800">{selectedListing.MODELO || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Calidad</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityClasses(selectedListing.CALIDAD)}`}
                  >
                    {QUALITY_MAPPING[selectedListing.CALIDAD as keyof typeof QUALITY_MAPPING]}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Explicación</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.EXPLICACION}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Composición</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.COMPOSICIÓN}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Iluminación</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.ILUMINACIÓN}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Enfoque</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.ENFOQUE}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Color</h3>
                  <p className="text-gray-700 text-sm">{selectedListing.COLOR}</p>
                </div>
              </div>
              <a
                href={selectedListing.LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4"
              >
                Ver anuncio original <ExternalLink className="w-4 h-4" />
              </a>

              {selectedListing.hasDetailedAnalysis && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-base font-semibold text-gray-700 mb-2">Análisis Detallado del Anuncio</h3>
                  {detailedAnalysis ? (
                    detailedAnalysis.startsWith('Error al cargar') ? (
                      <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm">
                        {detailedAnalysis}
                      </div>
                    ) : (
                      <div className="bg-gray-100 p-3 rounded-md overflow-auto max-h-[32rem]">
                        <div 
                          className="prose prose-sm max-w-none text-gray-700"
                          dangerouslySetInnerHTML={{ __html: detailedAnalysis }}
                        />
                      </div>
                    )
                  ) : (
                    <p className="text-gray-500 text-sm">Cargando análisis...</p>
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