import React, { useState } from 'react';
import './CalcTTestHome.css';
import CalcTTestwData from '../CalcTTestwData/CalcTTestwData.js';
import CalcTTestwStats from '../CalcTTestwStats/CalcTTestwStats.js';
import 'katex/dist/katex.min.css';

const CalcTTestHome = () => {
  const [activeTab, setActiveTab] = useState('inputValues');
  
  return (
    <div className='t-test-container'>
      <div className='tabs'>
        <button onClick={() => setActiveTab('inputValues')} className={activeTab === 'inputValues' ? 'active' : ''}>
          Input Mean, STDev, N for Unpaired T-Tests
        </button>
        <button onClick={() => setActiveTab('gatherDataset')} className={activeTab === 'gatherDataset' ? 'active' : ''}>
          Input Datasets for Paired/Unpaired T-Tests
        </button>
      </div>

      {activeTab === 'inputValues' ? (
        <CalcTTestwStats />
      ) : (
        <CalcTTestwData />
      )}
    </div>
  );
};

export default CalcTTestHome;
