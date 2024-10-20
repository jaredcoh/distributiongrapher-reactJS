import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';
import { jStat } from 'jstat';
import './CalcOutliers.css';

// Helper functions for calculations
const calculateMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const calculateStandardDeviation = (arr, isSample) => {
  const mean = calculateMean(arr);
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (isSample ? arr.length - 1 : arr.length));
};

const calculateVariance = (arr, isSample) => {
  const mean = calculateMean(arr);
  return arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / (isSample ? arr.length - 1 : arr.length);
};

const getZScoreThreshold = (confidence) => {
  const alpha = 1 - confidence / 100;
  return jStat.normal.inv(1 - alpha / 2, 0, 1);
};

const getGrubbsThreshold = (n, alpha) => {
  const t = jStat.studentt.inv(1 - alpha / (2 * n), n - 2);
  return ((n - 1) / Math.sqrt(n)) * Math.sqrt(t ** 2 / (n - 2 + t ** 2));
};

// Function to determine significant figures
const findSmallestSignificantValue = (arr) => {
  const significantValues = arr.map(num => {
    const strNum = num.toString();
    const trimmed = strNum.replace(/\.?0+$/, '');
    return trimmed.includes('.') ? trimmed.split('.')[1].length : 0;
  });
  
  const maxComponent = Math.max(...significantValues);
  return maxComponent > 0 ? maxComponent +2 : 2;
};

// Function to format number with correct significant figures
const formatWithSignificantFigures = (number, sigFigs) => {
  if (sigFigs <= 0) return Math.round(number).toString();
  const factor = Math.pow(10, sigFigs);
  return (Math.round(number * factor) / factor).toFixed(sigFigs);
};

// Main Outliers Test Component
const OutliersTest = () => {
  const [data, setData] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [confidence, setConfidence] = useState(95);
  const [isSample, setIsSample] = useState(true);
  const [calcVariance, setCalcVariance] = useState(false);
  const [resultsHistory, setResultsHistory] = useState([]);
  
  const [initialStats, setInitialStats] = useState({ mean: 0, stdDev: 0, variance: 0, count: 0 });
  const [finalStats, setFinalStats] = useState({ mean: 0, stdDev: 0, variance: 0, count: 0 });

  // Handler functions for user input
  const handleDataChange = (e) => setData(e.target.value);
  const handleDelimiterChange = (e) => setDelimiter(e.target.value);
  const handleConfidenceChange = (e) => setConfidence(Number(e.target.value));
  const handleSampleChange = (value) => setIsSample(value === 'sample');
  const handleCalcVarianceChange = (value) => setCalcVariance(value === 'variance');

  const processInput = () => {
    let dataArr = data.split(delimiter).map(Number);
  
    // Calculate initial statistics
    const initialMean = calculateMean(dataArr);
    const initialStdDev = calculateStandardDeviation(dataArr, isSample);
    const initialVariance = calculateVariance(dataArr, isSample);
    const initialCount = dataArr.length;
    const precision = findSmallestSignificantValue(dataArr);
    
    setInitialStats({ 
      mean: formatWithSignificantFigures(initialMean, precision), 
      stdDev: formatWithSignificantFigures(initialStdDev, precision), 
      variance: formatWithSignificantFigures(initialVariance, precision),
      count: initialCount 
    });
  
    const history = [];

    while (dataArr.length > 0) {
      const mean = calculateMean(dataArr);
      const stdDev = calculateStandardDeviation(dataArr, isSample);
      const variance = calculateVariance(dataArr, isSample);
      const alpha = 1 - confidence / 100;
      const isSmallDataset = dataArr.length < 30;

      let resultData;

      if (isSmallDataset) {
        const grubbsCriticalValue = getGrubbsThreshold(dataArr.length, alpha);
        resultData = dataArr.map(val => {
          const gValue = Math.abs((val - mean) / stdDev);
          return {
            value: val,
            testValue: formatWithSignificantFigures(gValue, 3),
            criticalValue: formatWithSignificantFigures(grubbsCriticalValue, 3),
            isOutlier: gValue > grubbsCriticalValue,
          };
        });
      } else {
        const zThreshold = getZScoreThreshold(confidence);
        resultData = dataArr.map(val => {
          const zValue = (val - mean) / stdDev;
          return {
            value: val,
            testValue: formatWithSignificantFigures(zValue, 3),
            criticalValue: formatWithSignificantFigures(zThreshold, 3),
            isOutlier: Math.abs(zValue) > zThreshold,
          };
        });
      }

      history.push({
        mean: formatWithSignificantFigures(mean, precision),
        stdDev: formatWithSignificantFigures(stdDev, precision),
        variance: formatWithSignificantFigures(variance, precision),
        results: resultData,
        count: dataArr.length,
      });

      dataArr = resultData.filter(r => !r.isOutlier).map(r => r.value);

      if (dataArr.length === 0 || resultData.every(r => !r.isOutlier)) {
        break;
      }
    }

    const finalMean = calculateMean(dataArr);
    const finalStdDev = calculateStandardDeviation(dataArr, isSample);
    const finalVariance = calculateVariance(dataArr, isSample);
    const finalCount = dataArr.length;
    setFinalStats({ 
      mean: formatWithSignificantFigures(finalMean, precision), 
      stdDev: formatWithSignificantFigures(finalStdDev, precision),
      variance: formatWithSignificantFigures(finalVariance, precision),
      count: finalCount 
    });

    setResultsHistory(history);
  };

  return (
    <div className="outliers-container">
      <h2>Recursively Calculate and Eliminate Outliers</h2>
      <p>Enter your data, choose your algorithm options, and click "Find Outliers" to get started.</p>
      <div className="input-section">
        <textarea
          className="data-input"
          placeholder="Enter your data here"
          value={data}
          onChange={handleDataChange}
          rows={4}
          cols={50}
        />
        <div className="input-controls">
          <label className="input-label">
            Delimiter:
            <select className="input-select" value={delimiter} onChange={handleDelimiterChange}>
              <option value=",">Comma</option>
              <option value=" ">Whitespace</option>
              <option value=".">Period</option>
            </select>
          </label>
          <label className="input-label">
            Confidence Level (%):
            <input 
              className="input-number"
              type="number" 
              value={confidence} 
              onChange={handleConfidenceChange} 
              min="90" max="99"
            />
          </label>
          <label className="input-label">
            Standard Deviation Type:
            <select className="input-select" value={isSample ? 'sample' : 'population'} onChange={(e) => handleSampleChange(e.target.value)}>
              <option value="sample">Sample</option>
              <option value="population">Population</option>
            </select>
          </label>
          <label className="input-label">
            Calculation Type:
            <select className="input-select" value={calcVariance ? 'variance' : 'stddev'} onChange={(e) => handleCalcVarianceChange(e.target.value)}>
              <option value="stddev">Standard Deviation</option>
              <option value="variance">Variance</option>
            </select>
          </label>
        </div>
        <button className="process-button" onClick={processInput}>Find Outliers</button>
      </div>
  
      {resultsHistory.length > 0 && (
        <div className="results-section">
          <h3 className="results-title">Results:</h3>
          <div className="stats-comparison">
            <div className="stats-box before">
              <p><strong>Mean:</strong> {initialStats.mean}</p>
              <p><strong>{calcVariance ? 'Variance' : 'Standard Deviation'}:</strong> {calcVariance ? initialStats.variance : initialStats.stdDev}</p>
              <p><strong>N:</strong> {initialStats.count}</p>
            </div>
            <div className="arrow">➜</div>
            <div className="stats-box after">
              <p><strong>Mean:</strong> {finalStats.mean}</p>
              <p><strong>{calcVariance ? 'Variance' : 'Standard Deviation'}:</strong> {calcVariance ? finalStats.variance : finalStats.stdDev}</p>
              <p><strong>N:</strong> {finalStats.count}</p>
            </div>
          </div>
          <h3 className="results-title">Steps to Achieve Results:</h3>
          {resultsHistory.map((run, runIdx) => (
            <div key={runIdx} className="run-results">
              <h4 className="run-title">{`Run ${runIdx + 1}`}</h4>
              <div className="stats-container">
                <p className="stats-item"><strong>Mean:</strong> {run.mean}</p>
                <p className="stats-item"><strong>{calcVariance ? 'Variance' : 'Standard Deviation'}:</strong> {calcVariance ? run.variance : run.stdDev}</p>
                <p className="stats-item"><strong>N:</strong> {run.count}</p>
                
              </div>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Value</th>
                    <th>{run.results[0].hasOwnProperty('gValue') ? 'G Value' : 'Z Value'}</th>
                    <th>Critical Value</th>
                    <th>Outlier</th>
                  </tr>
                </thead>
                <tbody>
                  {run.results.map((result, idx) => (
                    <tr 
                      key={idx} 
                      className={result.isOutlier ? 'outlier-row' : ''}
                    >
                      <td>{result.value}</td>
                      <td>{result.testValue}</td>
                      <td>{result.criticalValue}</td>
                      <td>{result.isOutlier ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OutliersTest;