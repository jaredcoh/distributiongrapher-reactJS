import distributionImage from './DistributionCalculatorLogo.png';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import GraphMeanAndStdDev from './GraphMeanAndStdDev';
import GraphCopyPasteData from './GraphCopyPasteData';
import CalcMeanStd from './CalcMeanStd';
import CalcTTestHome from './CalcTTest/CalcTTestHome/CalcTTestHome.js';
import CalcThresPercent from './CalcThresPercent';
import CalcOutliers from './CalcOutliers';
import HomePage from './Home.js'
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
    '/graph-mean-stdev': 'Plot Datasets using their Means and Standard Deviations',
    '/graph-data': 'Plot by Copying/Pasting Datapoints',
    '/calc-mean-stdev': "Calculate Datasets' Means and Standard Deviations",
    '/ttest-matrix': 'Calculate T-Test Matrix',
    '/calc-thres-percent': "Calculate Datasets' Thresholds and Percentages",
    '/': 'Homepage',
    '/elim-outliers': 'Recursively Calculate and Eliminate Outliers for a Dataset',
  };

  // Get the subtitle based on the current path
  const subtitle = subtitleMap[location.pathname] || '';

  return (
    
    <div className="App">
      <head><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1591793840351191"
     crossorigin="anonymous"></script></head>
      <header className="App-header">
        <Link to="/" className="header-link">
          <div className="header-content">
            <img src={distributionImage} alt="Normal Distribution" className="header-image" />
            <div className="title-container">
              <h1 className="header-title">Multiple Normal Distributions Grapher</h1>
              {subtitle && <p className="header-subtitle">{subtitle}</p>}
            </div>
          </div>
        </Link>
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
            to="/graph-mean-stdev"
            title="Plot a distribution using Mean and Standard Deviation"
            className="dropdown-link"
          >
            Plot via Mean and Standard Deviation
          </Link>
          <Link
            to="/graph-data"
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
          to="/calc-mean-stdev" 
          title="Calculate the mean and sample/population standard deviation for a dataset"
          className="dropdown-link">
          Calculate Mean and Standard Deviations
        </Link>
        <Link 
          to="/ttest-matrix" 
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
          to="/elim-outliers" 
          title="Calculate outliers with with %confidence"
          className="dropdown-link">
          Calculate Dataset Outliers
        </Link>
      </div>
      
      )}

      {/* Define routes for each option */}
      <Routes>
        <Route path="/graph-mean-stdev" element={<GraphMeanAndStdDev />} />
        <Route path="/graph-data" element={<GraphCopyPasteData />} />
        <Route path="/calc-mean-stdev" element={<CalcMeanStd />} />
        <Route path="/ttest-matrix" element={<CalcTTestHome />} />
        <Route path="/calc-thres-percent" element={<CalcThresPercent />} />
        <Route path="/elim-outliers" element={<CalcOutliers />} />
        <Route path="/" element={<HomePage/>} />
      </Routes>

      <footer className="app-footer">
        <p>
          <a href="https://www.jaredscottcohen.com" target="_blank" rel="noopener noreferrer">
            Website by Jared Cohen (learn more about me here!)
          </a>
        </p>
        <p>
          <a href="mailto:jaredscohen2000@gmail.com?subject=Grapher%20Website%20-%20Bug/Issue">
            Report a Bug
          </a>
        </p>
        <p>
          <a href="mailto:jaredscohen2000@gmail.com?subject=Grapher%20Website%20-%20Feature%20Request">
            Request a Feature
          </a>
        </p>
      </footer>
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
