import React, { useState, useEffect } from 'react';
import { Plus, Mic, FileText, BarChart3, Paperclip, Send } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement } from 'chart.js';

// Register the required Chart.js components
ChartJS.register(ArcElement);

// A reusable component for the Chart.js donut charts
const ChartJSDonut = ({ value, label, chartData }) => {
  const data = {
    datasets: [
      {
        data: chartData,
        backgroundColor: [
          '#AABDE6', // Theme color for the filled part
          '#E5E7EB', // Light gray for the empty part
        ],
        borderColor: 'transparent', // No borders between segments
        borderRadius: 20, // This creates the rounded caps on the arc
        cutout: '80%',    // Controls the thickness of the donut ring
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false, // Hide the default legend
      },
      tooltip: {
        enabled: false, // Disable tooltips on hover
      },
    },
    rotation: 270, // Starts the chart from the bottom, to match the visual
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-800">{value}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
};

function Compliance() {
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(0); 
  const [error, setError] = useState(null);

  // Function to count the number of categories
  const countCategories = (items) => {
    if (!items || items.length === 0) {
      setCategory(0);
      return 0;
    }
    const categories = new Set();   
    items.forEach(item => {
      if (item.type) {
        categories.add(item.type.toLowerCase());
      }
    });
    setCategory(categories.size);
    return categories.size;
  };

  // Function to map severity of risk to risk score based on your formula:
  // No Risk = Low = 1, Mild = Medium = 2, Severe = High = 3
  const getSeverityRiskScore = (severity) => {
    if (!severity) return 0;
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes('no risk')) return 1; // Low
    if (lowerSeverity.includes('mild')) return 2; // Medium
    if (lowerSeverity.includes('severe')) return 3; // High
    return 0;
  };

  // Function to get risk level from severity of risk
  const getRiskLevel = (severity) => {
    if (!severity) return 'unknown';
    const lowerSeverity = severity.toLowerCase();
    if (lowerSeverity.includes('no risk')) return 'low';
    if (lowerSeverity.includes('mild')) return 'medium';
    if (lowerSeverity.includes('severe')) return 'high';
    return 'unknown';
  };

  // Function to calculate overall risk score using your formula
  const calculateOverallScore = (items) => {
    if (!items || items.length === 0) return 0;
    
    let total = 0;
    items.forEach(item => {
      const riskScore = getSeverityRiskScore(item['Severity of Risk']);
      total += riskScore;
    });
    
    return total;
  };

  // Function to count items by risk level (based on severity of risk)
  const countByRiskLevel = (items, level) => {
    if (!items || items.length === 0) return 0;
    return items.filter(item => {
      const riskLevel = getRiskLevel(item['Severity of Risk']);
      return riskLevel === level;
    }).length;
  };

  // Function to calculate chart data for donut charts
  const calculateChartData = (items, complianceType) => {
    const typeItems = items.filter(item => 
      item.type?.toLowerCase() === complianceType.toLowerCase()
    );
    
    const totalScore = typeItems.reduce((sum, item) => {
      return sum + getSeverityRiskScore(item['Severity of Risk']);
    }, 0);
    
    // Calculate percentage for visualization
    // Max possible score would be if all items were High (score 3 each)
    const maxPossibleScore = typeItems.length * 3;
    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    return {
      value: totalScore.toString(),
      data: [percentage, 100 - percentage]
    };
  };

  // Function to determine grid columns based on category count
  const getGridColumns = (categoryCount) => {
    switch(categoryCount) {
      case 1:
        return 'md:grid-cols-1';
      case 2:
        return 'md:grid-cols-2';
      case 3:
        return 'md:grid-cols-3';
      case 4:
        return 'md:grid-cols-4';
      case 5:
        return 'md:grid-cols-5';
      case 6:
        return 'md:grid-cols-6';
      default:
        return categoryCount > 6 ? 'md:grid-cols-6' : 'md:grid-cols-4';
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/compliance');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        // Handle both array and object with compliance array
        let data = Array.isArray(result) ? result : result.compliance;
        
        // Count categories
        countCategories(data);
        
        setComplianceData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching compliance data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplianceData();
  }, []);

  // Retry function
  const handleRetry = () => {
    setError(null);
    setComplianceData(null);
    // Re-trigger the useEffect by changing loading state
    setLoading(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-b-2 mx-auto mb-4 animate-spin" style={{borderColor: '#AABDE6'}}></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Error loading compliance data</p>
          <p className="text-gray-600 text-sm mt-2">{error}</p>
          <button 
            onClick={handleRetry}
            className="mt-4 px-4 py-2 text-white rounded-md hover:opacity-90" 
            style={{backgroundColor: '#AABDE6'}}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!complianceData || complianceData.length === 0) {
    return (
      <div className="p-8 bg-white min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No compliance data available</p>
        </div>
      </div>
    );
  }

  const items = complianceData || [];
  const overallScore = calculateOverallScore(items);
  const highCount = countByRiskLevel(items, 'high');
  const mediumCount = countByRiskLevel(items, 'medium');
  const lowCount = countByRiskLevel(items, 'low');

  // Get unique compliance types for charts
  const complianceTypes = [...new Set(items.map(item => item.type))];
  const chartValues = {};
  
  complianceTypes.forEach(type => {
    chartValues[type.toLowerCase()] = calculateChartData(items, type);
  });

  return (
    <div className="p-8 bg-white min-h-full flex flex-col">
      <div className="flex-grow">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Overall Risk Score</p>
            <p className="text-4xl font-bold text-gray-800">{overallScore}</p>
          </div>
          <div className="p-4 rounded-lg" style={{backgroundColor: '#AABDE6'}}>
            <p className="text-sm text-white">High</p>
            <p className="text-4xl font-bold text-white">{highCount}</p>
          </div>
          <div className="bg-gray-200 p-4 rounded-lg">
            <p className="text-sm text-gray-700">Medium</p>
            <p className="text-4xl font-bold text-gray-800">{mediumCount}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Low</p>
            <p className="text-4xl font-bold text-gray-800">{lowCount}</p>
          </div>
        </div>

        {/* Compliance Distribution Charts */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-800">
              Compliance-wise Distribution of risk score 
            </h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-sm mr-2" style={{backgroundColor: '#AABDE6'}}></span>
                High
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-sm mr-2"></span>
                Medium
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-gray-300 rounded-sm mr-2"></span>
                Low
              </div>
            </div>
          </div>
          
          {/* Dynamic Grid Layout Based on Category Count */}
          <div className={`grid grid-cols-1 gap-6 ${getGridColumns(category)}`}>
            {complianceTypes.map(type => {
              const typeKey = type.toLowerCase();
              const chartData = chartValues[typeKey] || { value: '0', data: [0, 100] };
              return (
                <ChartJSDonut 
                  key={type}
                  value={chartData.value} 
                  label={type} 
                  chartData={chartData.data} 
                />
              );
            })}
          </div>
          
          {/* Display message if more than 6 categories */}
          {category > 6 && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing {complianceTypes.length} compliance categories in a responsive grid layout
              </p>
            </div>
          )}
        </div>

        {/* Compliance Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-500 uppercase sticky top-0 z-10">
            <div className="col-span-2">Type</div>
            <div className="col-span-3">Compliance Item</div>
            <div className="col-span-2">Severity</div>
            <div className="col-span-4">Analysis</div>
            <div className="col-span-1"></div>
          </div>
          {/* Table Body with Scroll */}
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {items.map((item, index) => {
              const riskLevel = getRiskLevel(item['Severity of Risk']);
              return (
                <div key={item.id || index} className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm">
                  <div className="col-span-2 font-medium text-gray-800">{item.type}</div>
                  <div className="col-span-3 text-gray-800">{item['Checklist Item']}</div>
                  <div className="col-span-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      riskLevel === 'high' 
                        ? 'text-white' 
                        : riskLevel === 'medium'
                        ? 'bg-gray-200 text-gray-800'
                        : riskLevel === 'low'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                    style={riskLevel === 'high' ? {backgroundColor: '#AABDE6'} : {}}
                    >
                      {item['Severity of Risk']}
                    </span>
                  </div>
                  <div className="col-span-4 text-gray-600 text-xs leading-relaxed">{item.Analysis || 'No analysis provided'}</div>
                  <div className="col-span-1 flex justify-end">
                    <button className="text-gray-400 hover:text-gray-600">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Input Bar */}
      <div className="mt-8">
        <div className="relative border border-gray-200 rounded-lg p-2 flex items-center space-x-3 bg-white">
          <input 
            type="text" 
            placeholder="Let me know what do you want to extract ..." 
            className="flex-grow bg-transparent focus:outline-none text-sm text-gray-700 placeholder-gray-400 pl-2"
          />
          <div className="flex items-center space-x-1">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Mic size={16} /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><FileText size={16} /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><Paperclip size={16} /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"><BarChart3 size={16} /></button>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">More</button>
          </div>
          <button className="bg-gray-800 text-white p-2 rounded-md hover:bg-gray-900">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Compliance;