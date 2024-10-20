import distributionImage from './DistributionCalculatorLogo.png';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import GraphMeanAndStdDev from './GraphMeanAndStdDev/GraphMeanAndStdDev';
import GraphCopyPasteData from './GraphCopyPaste/GraphCopyPasteData';
import CalcMeanStd from './CalcMeanStd/CalcMeanStd';
import CalcTTestHome from './CalcTTest/CalcTTestHome/CalcTTestHome';
import CalcThresPercent from './CalcThresPercent/CalcThresPercent';
import CalcOutliers from './CalcOutliers/CalcOutliers';
function AppContent() {
  const [showDropdown, setShowDropdown] = useState({ plot: false, calculate: false });
  const location = useLocation(); // Get current location

  // Effect to close dropdown when the route changes
  useEffect(() => {
    setShowDropdown({ plot: false, calculate: false });
  }, [location]); // This will trigger every time the location (route) changes

  const toggleDropdown = (option) => {
    setShowDropdown((prev) => ({
      plot: option === 'plot' ? !prev.plot : false,
      calculate: option === 'calculate' ? !prev.calculate : false,
    }));
  };

  const subtitleMap = {
    '/graph-mean-std-dev': 'Plot Datasets using their Means and Standard Deviations',
    '/graph-copy-paste-data': 'Plot by Copying/Pasting Datapoints',
    '/calc-mean-std': "Calculate Datasets' Means and Standard Deviations",
    '/calc-ttest': 'Calculate T-Test Matrix',
    '/calc-thres-percent': "Calculate Datasets' Thresholds and Percentages",
    '/home': 'Homepage',
    '/calc-outliers': 'Recursively Calculate and Eliminate Outliers for a Dataset',
  };

  // Get the subtitle based on the current path
  const subtitle = subtitleMap[location.pathname] || '';

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <img src={distributionImage} alt="Normal Distribution" className="header-image" />
          <div className="title-container">
            <h1 className="header-title">Multiple Normal Distribution Grapher</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        </div>
        <p className="author">Jared Cohen</p>
      </header>
      
      <div className="top-bar">
        <div
          className={`bar-option ${showDropdown.plot ? 'selected' : ''}`}
          onClick={() => toggleDropdown('plot')}
        >
          Plot Distributions
        </div>
        <div
          className={`bar-option ${showDropdown.calculate ? 'selected' : ''}`}
          onClick={() => toggleDropdown('calculate')}
        >
          Calculate Values
        </div>
      </div>

      {showDropdown.plot && (
        <div className={`dropdown-bar open`}>
        <div className="dropdown-links">
          <Link
            to="/graph-mean-std-dev"
            title="Plot a distribution using Mean and Standard Deviation"
            className="dropdown-link"
          >
            Plot via Mean and Standard Deviation
          </Link>
          <Link
            to="/graph-copy-paste-data"
            title="Plot a distribution by copy/pasting datapoints into a textbox"
            className="dropdown-link"
          >
            Plot via Copy/Paste Datapoints Manually
          </Link>
        </div>
      </div>
      )}

      {showDropdown.calculate && (
        <div className={`dropdown-bar open`}>
        <Link 
          to="/calc-mean-std" 
          title="Calculate the mean and sample/population standard deviation for a dataset"
          className="dropdown-link">
          Calculate Mean and Standard Deviations
        </Link>
        <Link 
          to="/calc-ttest" 
          title="Perform a T-Test on multiple datasets to compare"
          className="dropdown-link">
          Calculate T-Test Matrix
        </Link>
        <Link 
          to="/calc-thres-percent" 
          title="Calculate important thresholds and percentages for your dataset"
          className="dropdown-link">
          Calculate Threshold and Percentages
        </Link>
        <Link 
          to="/calc-outliers" 
          title="Calculate outliers with with %confidence"
          className="dropdown-link">
          Calculate Dataset Outliers
        </Link>
      </div>
      )}

      {/* Define routes for each option */}
      <Routes>
        <Route path="/graph-mean-std-dev" element={<GraphMeanAndStdDev />} />
        <Route path="/graph-copy-paste-data" element={<GraphCopyPasteData />} />
        <Route path="/calc-mean-std" element={<CalcMeanStd />} />
        <Route path="/calc-ttest" element={<CalcTTestHome />} />
        <Route path="/calc-thres-percent" element={<CalcThresPercent />} />
        <Route path="/calc-outliers" element={<CalcOutliers />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
