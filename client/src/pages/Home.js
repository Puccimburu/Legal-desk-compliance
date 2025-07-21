import React, { useState } from "react";
import { 
  LayoutGrid, 
  FileText, 
  ClipboardList, 
  Scale, 
  Shield,
  Search,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import Compliance from '../components/Compliance';

function Home() {
  const [activeTab, setActiveTab] = useState('compliance');

  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { id: 'digitize', icon: FileText, label: 'Digitize' },
    { id: 'obligations', icon: ClipboardList, label: 'Obligations' },
    { id: 'legal_desk', icon: Scale, label: 'Legal Desk', active: true },
    { id: 'risks', icon: Shield, label: 'Risks' }
  ];

  const legalDeskTabs = [
      { id: 'draft', label: 'Draft Contract', checked: true },
      { id: 'digitization', label: 'Digitization', checked: true },
      { id: 'analytics', label: 'Analytics', checked: true },
      { id: 'compliance', label: 'Compliance', checked: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        <div className="h-8 mb-8"> </div> {/* Spacer to align with header */}
        
        <nav className="flex-1 w-full px-2">
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.id} className="flex flex-col items-center">
                <a
                  href="#"
                  className={`w-16 h-12 flex justify-center items-center rounded-lg transition-colors duration-200 ${
                    item.active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <item.icon size={22} />
                </a>
                <div className={`text-xs mt-1 text-center ${item.active ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          {/* Top Header Row: Logo, Search, Profile */}
          <div className="flex items-center justify-between px-6 py-2">
            <div className="flex items-center">
              {/* MODIFIED: Changed text-blue-950 to the specific hex code */}
              <div className="text-3xl font-black text-[#011A69] tracking-tighter">
                execo
              </div>
              <div className="w-px h-6 bg-gray-200 mx-4"></div>
              <h1 className="text-xl font-medium text-gray-700">Legal Desk</h1>
            </div>
            
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anything ..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-full text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow">
                  <span className="text-sm font-bold text-gray-600">AB</span>
              </div>
              <div>
                  <p className="text-sm font-semibold text-gray-700">Aniruddha Bonde</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Header Row: Tabs */}
          <div className="flex items-center justify-between px-6">
            <nav className="flex space-x-6">
              {legalDeskTabs.map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.checked && <CheckCircle2 size={16} className="text-green-500" />}
                </button>
              ))}
            </nav>
            <button className="flex items-center space-x-2 text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200">
                <Copy size={16} />
                <span>Stack Tabs</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {activeTab === 'compliance' ? <Compliance /> : (
             <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-lg">
                Content for '{legalDeskTabs.find(t => t.id === activeTab)?.label}' goes here.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Home;