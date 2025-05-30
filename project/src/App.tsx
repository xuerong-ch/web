import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { CarListing } from './types';
import { QualityChart } from './components/QualityChart';
import { ListingDetails } from './components/ListingDetails';
import { ListingsTable } from './components/ListingsTable';

function App() {
  const [data, setData] = useState<CarListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Calidad de publicaciones - Listings_Deysa (1).csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const filteredData = (results.data as CarListing[]).filter(
              listing => listing.CALIDAD && listing.CALIDAD !== ''
            );
            setData(filteredData);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Análisis de Calidad de Anuncios</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <QualityChart data={data} />
          <ListingDetails listing={selectedListing} />
        </div>

        <ListingsTable 
          data={data} 
          onSelectListing={setSelectedListing}
        />
      </div>
    </div>
  );
}

export default App;