import React, { useState } from 'react';
import jStat from 'jstat';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const CalcTTest = () => {
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getTextColor = (bgColor) => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000' : '#fff'; // Black for light colors, white for dark colors
  };

  const [rows, setRows] = useState([
    { datasetId: 1, label: '', mean: 0, std: 0, n: 0, color: "#000" },
    { datasetId: 2, label: '', mean: 0, std: 0, n: 0, color: "#999" }
  ]);
  const [tailType, setTailType] = useState('two-tailed');
  const [pValues, setPValues] = useState([]);
  const [highlightCondition, setHighlightCondition] = useState('less'); // Dropdown for less/greater
  const [highlightThreshold, setHighlightThreshold] = useState(0.05);  // Input value for threshold

  const addRow = () => {
    const newRowId = rows.length + 1;
    const newColor = getRandomColor();
    setRows([...rows, { datasetId: newRowId, label: '', mean: 0, std: 0, n: 0, color: newColor }]);
  };

  const removeRow = (index) => {
    if (rows.length > 1) {
      const newRows = rows.filter((_, i) => i !== index);
      newRows.forEach((row, idx) => row.datasetId = idx + 1);
      setRows(newRows);
    }
  };

  const handleInputChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  
  const calculatePValues = () => {
    const resultsMatrix = Array(rows.length).fill(null).map(() => Array(rows.length).fill(null));
  
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows.length; j++) {
        if (i !== j) {
          const meanA = rows[i].mean;
          const stdA = rows[i].std;
          const nA = rows[i].n;
          const meanB = rows[j].mean;
          const stdB = rows[j].std;
          const nB = rows[j].n;
  
          const { tValue, pValFormatted } = calculateTTest(meanA, stdA, nA, meanB, stdB, nB); // Extract tValue and pValFormatted
          resultsMatrix[i][j] = { pValFormatted, tValue }; // Store both t-value and p-value
        }
      }
    }
  
    setPValues(resultsMatrix);
  };
  
  const calculateTTest = (meanA, stdA, nA, meanB, stdB, nB, isPaired = false) => {
    let t;
    let df;
  
    if (isPaired) {
      const differences = rows.map(row => row.meanA - row.meanB); // Replace with actual paired means
      const meanDiff = jStat.mean(differences);
      const stdDiff = jStat.stdev(differences, true); // Sample standard deviation
      const nDiff = differences.length;
  
      t = meanDiff / (stdDiff / Math.sqrt(nDiff));
      df = nDiff - 1; // Degrees of freedom for paired test
      } else {
        const varianceType = determineVarianceType();
        
        if (varianceType === 'equal') {
          const pooledStd = Math.sqrt(((nA - 1) * Math.pow(stdA, 2) + (nB - 1) * Math.pow(stdB, 2)) / (nA + nB - 2));
          t = (meanA - meanB) / (pooledStd * Math.sqrt(1/nA + 1/nB));
          df = nA + nB - 2;
        } else {
          t = (meanA - meanB) / Math.sqrt((Math.pow(stdA, 2) / nA) + (Math.pow(stdB, 2) / nB));
          df = Math.pow((stdA/nA + stdB/nB), 2) /
              ((Math.pow(stdA/nA, 2) / (nA - 1)) + (Math.pow(stdB/nB, 2) / (nB - 1)));
        }
      }
    
      // Check if t is a valid number
      if (typeof t !== 'number' || isNaN(t)) {
        alert("You have inputted values that result in error");
        return { tValue: 'N/A', pValFormatted: 'N/A' }; // Return 'N/A' for the result
      }
    
      // Calculate the two-tailed p-value based on the absolute t-value
      const pValue = tailType === 'one-tailed'
        ? 1 - jStat.studentt.cdf(Math.abs(t), df)  // One-tailed
        : 2 * (1 - jStat.studentt.cdf(Math.abs(t), df));  // Two-tailed
    
      // Ensure t is a number before calling .toFixed()
      const tValue = t.toFixed(4);  // You can adjust precision as needed
      const pValFormatted = pValue.toFixed(4);  // Format p-value to 4 decimal places
    
      return { tValue, pValFormatted };
    };
  

  const determineVarianceType = () => {
    const stdSet = new Set(rows.map(row => row.std));
    return stdSet.size === 1 && !stdSet.has(0) ? 'equal' : 'unequal';
  };

  const shouldHighlight = (pVal) => {
    if (highlightCondition === 'less') {
      return pVal < highlightThreshold;
    } else {
      return pVal > highlightThreshold;
    }
  };

  return (
    <div className='t-test-container'>
          <table className='t-test-table'>
            <thead>
              <tr>
                <th></th>
                <th className="center">Dataset ID</th>
                <th className="center">Label</th>
                <th className="center">Mean</th>
                <th className="center">Standard Deviation</th>
                <th className="center">N</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    {index > 0 && (
                      <button 
                        title="Remove row" 
                        onClick={() => removeRow(index)} 
                        className="remove-row-button" 
                        style={{ backgroundColor: row.color, color: getTextColor(row.color) }}>
                        X
                      </button>
                    )}
                  </td>
                  <td className="center">{row.datasetId}</td>
                  <td className="center">
                    <input
                      type="text"
                      value={row.label}
                      onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                      style={{ borderColor: row.color }}
                    />
                  </td>
                  <td className="center">
                    <input
                      type="number"
                      value={row.mean}
                      onChange={(e) => handleInputChange(index, 'mean', e.target.value)}
                    />
                  </td>
                  <td className="center">
                    <input
                      type="number"
                      value={row.std}
                      onChange={(e) => handleInputChange(index, 'std', e.target.value)}
                    />
                  </td>
                  <td className="center">
                    <input
                      type="number"
                      value={row.n}
                      onChange={(e) => handleInputChange(index, 'n', e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          

          <div className="add-row-button-container">
            <button onClick={addRow} className="add-row-button">Add Row</button>
          </div>

          <hr className="divider" />

          
          <div className="tail-type-dropdown">
            <label htmlFor="tailType">Select Tail Type: </label>
            <select id="tailType" value={tailType} onChange={(e) => setTailType(e.target.value)}>
              <option value="two-tailed">Two-Tailed</option>
              <option value="one-tailed">One-Tailed</option>
            </select>
          </div>
          
          
          <div className="highlight-options"  title="A p-value indicates the probability of observing the data, given that the null hypothesis is true. The chosen p-value (between 0 and 1) suggests statistical significance, meaning there's less than a <p-value> chance the observed results are due to random variation. A 95% confidence interval is normal, so 0.05 best represents this">
            <label htmlFor="highlightCondition" >Highlight if p-value is: </label>
            <select id="highlightCondition" value={highlightCondition} onChange={(e) => setHighlightCondition(e.target.value)}>
              <option value="less">Less than</option>
              <option value="greater">Greater than</option>
            </select>
            <input 
              type="number" 
              value={highlightThreshold} 
              onChange={(e) => setHighlightThreshold(Number(e.target.value))} 
              step="0.01"
              min="0" 
              max="2"
            />
          </div>
          <button onClick={calculatePValues} className="calculate-button">Calculate T-Test</button>
          {pValues.length > 0 && (
            <table className="results-table">
              <thead>
                <tr>
                  <th></th>
                  {rows.map((row, index) => (
                    <th key={index}>{row.label || "Dataset " + row.datasetId}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th>{row.label || "Dataset " + row.datasetId}</th>
                    {pValues[rowIndex]?.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={cell && shouldHighlight(parseFloat(cell.pValFormatted)) ? 'highlight' : ''}
                      >
                        {cell ? cell.pValFormatted : 'N/A'}
                      </td>
                    )) || <td>N/A</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          
            
          )}
    </div>
  );
};

export default CalcTTest;
