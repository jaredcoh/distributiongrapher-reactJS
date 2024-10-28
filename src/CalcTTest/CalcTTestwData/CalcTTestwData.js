import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat'; // Import jStat for statistical calculations


const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};



const getContrastYIQ = (hexcolor) => {
  if (!hexcolor) return 'black'; // Fallback if hexcolor is undefined
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return (yiq >= 128) ? 'black' : 'white'; // Return black for light colors and white for dark colors
};

// Helper function to calculate mean
function calculateMean(values) {
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
}

// Helper function to calculate variance
function calculateVariance(values, isSample = true) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values
    .map(value => (value - mean) ** 2)
    .reduce((a, b) => a + b, 0) / (isSample ? values.length - 1 : values.length);
  return variance;
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(variance) {
  return Math.sqrt(variance).toFixed(2);
}

function MeanAndStdDev() {
  const [highlightCondition, setHighlightCondition] = useState('less'); // Dropdown for less/greater
  const [highlightThreshold, setHighlightThreshold] = useState(0.05);  // Input value for threshold
  const [stdevType, setStdevType] = useState('sample'); 
  const [tTestType, setTTestType] = useState('unpaired'); 
  const [tailType, setTailType] = useState('one-tailed');
  const [pValues, setPValues] = useState([]);
  const [rows, setRows] = useState([{ 
    numbers: '', 
    delimiter: 'comma', 
    label: '', 
    datasetId: 1, 
    mean: 0, 
    sampleStd: 0, 
    populationStd: 0, 
    sampleVar: 0, 
    populationVar: 0, 
    count: 0,
    std: 0,  // Add this line
    n: 0,    // Add this line
    color: getRandomColor() 
  }, { 
    numbers: '', 
    delimiter: 'comma', 
    label: '', 
    datasetId: 1, 
    mean: 0, 
    sampleStd: 0, 
    populationStd: 0, 
    sampleVar: 0, 
    populationVar: 0, 
    count: 0,
    std: 0,  // Add this line
    n: 0,    // Add this line
    color: getRandomColor() 
  }]);
  const determineVarianceType = () => {
    const stdSet = new Set(rows.map(row => row.std));
    return stdSet.size === 1 && !stdSet.has(0) ? 'equal' : 'unequal';
  };
  const areSampleSizesEqual = () => {
    const sampleCounts = rows.map(row => row.count);
    return sampleCounts.every(count => count === sampleCounts[0]);
  };


  const addRow = () => {
    const newRowId = rows.length + 1;
    const newColor = getRandomColor();
    setRows([...rows, { 
      numbers: '', 
      delimiter: 'comma', 
      label: '', 
      datasetId: newRowId, 
      mean: 0, 
      sampleStd: 0, 
      populationStd: 0, 
      sampleVar: 0, 
      populationVar: 0, 
      std: 0,  // Add this line
      n: 0,    // Add this line
      count: 0,
      color: newColor 
    }]);
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

    const delimiterMap = {
      whitespace: /\s+/,
      period: /\./,
      comma: /,/
    };

    const numbersArray = newRows[index].numbers.split(delimiterMap[newRows[index].delimiter])
      .map(num => num.trim())
      .filter(num => num !== '' && !isNaN(num));

    const numberCount = numbersArray.length;

    if (numberCount > 0) {
      const values = numbersArray.map(Number);
      newRows[index].mean = calculateMean(values);
      const sampleVariance = calculateVariance(values, true);
      const populationVariance = calculateVariance(values, false);
      newRows[index].sampleVar = sampleVariance.toFixed(2);
      newRows[index].populationVar = populationVariance.toFixed(2);
      newRows[index].sampleStd = calculateStandardDeviation(sampleVariance);
      newRows[index].populationStd = calculateStandardDeviation(populationVariance);
          // Set std and n properties
      newRows[index].std = stdevType === 'sample' ? newRows[index].sampleStd : newRows[index].populationStd;
      newRows[index].n = numberCount;
    } else {
      newRows[index].mean = 0;
      newRows[index].sampleStd = 0;
      newRows[index].populationStd = 0;
      newRows[index].sampleVar = 0;
      newRows[index].populationVar = 0;
    }

    newRows[index].count = numberCount;

    setRows(newRows);
  };

  const calculatePValues = () => {
    const resultsMatrix = Array(rows.length).fill(null).map(() => Array(rows.length).fill(null));
  
    for (let i = 0; i < rows.length; i++) {
      for (let j = 0; j < rows.length; j++) {
        if (i !== j) {
          const meanA = rows[i].mean;
          const stdA = rows[i].std; // Use std
          const nA = rows[i].n;     // Use n
          const meanB = rows[j].mean;
          const stdB = rows[j].std; // Use std
          const nB = rows[j].n;     // Use n
  
          const { tValue, pValFormatted } = calculateTTest(meanA, stdA, nA, meanB, stdB, nB); // Extract tValue and pValFormatted
          resultsMatrix[i][j] = { pValFormatted, tValue }; // Store both t-value and p-value
        }
      }
    }
  
    setPValues(resultsMatrix);
  };
  
  const calculateTTest = (meanA, stdA, nA, meanB, stdB, nB, isPaired) => {
    let t;
    let df;
    if (isPaired) {
      console.log('Paired test');
      const differences = rows.map(row => row.meanA - row.meanB); // Replace with actual paired means
      const meanDiff = jStat.mean(differences);
      const stdDiff = jStat.stdev(differences, true); // Sample standard deviation
      const nDiff = differences.length;
  
      t = meanDiff / (stdDiff / Math.sqrt(nDiff));
      df = nDiff - 1; // Degrees of freedom for paired test
      } 
    else {
      console.log('UnPaired test');
      const varianceType = determineVarianceType();
        
      if (varianceType === 'equal') {
        const pooledStd = Math.sqrt(((nA - 1) * Math.pow(stdA, 2) + (nB - 1) * Math.pow(stdB, 2)) / (nA + nB - 2));
        t = (meanA - meanB) / (pooledStd * Math.sqrt(1/nA + 1/nB));
        df = nA + nB - 2;
        } 
      else {
        t = (meanA - meanB) / Math.sqrt((Math.pow(stdA, 2) / nA) + (Math.pow(stdB, 2) / nB));
        df = Math.pow((stdA/nA + stdB/nB), 2) /
            ((Math.pow(stdA/nA, 2) / (nA - 1)) + (Math.pow(stdB/nB, 2) / (nB - 1)));
        }
      }
      console.log(t);
    
      // Check if t is a valid number
      if (typeof t !== 'number' || isNaN(t)) {
        alert(`You have inputted values that result in error.\n\nPlease make sure all of your input values are numbers.`);
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
    const shouldHighlight = (pVal) => {
      if (highlightCondition === 'less') {
        return pVal < highlightThreshold;
      } else {
        return pVal > highlightThreshold;
      }
    };
  

  return (
    <div className='mean-std-dev-container'>
      <table className='mean-std-dev-table'>
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th className="center" colSpan="2">
              <select
                value={stdevType}
                onChange={(e) => setStdevType(e.target.value)} 
              >
                <option value="sample">Sample</option>
                <option value="population">Population</option>
              </select>
            </th>
          </tr>
          <tr>
            <th></th>
            <th className="center">Dataset ID</th>
            <th className="center">Label</th>
            <th className="center">Add Numbers Here</th>
            <th className="center">Delimiter</th>
            <th className="center">N</th>
            <th className="center">Mean</th>
            <th className="center">Standard Deviation</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                {index > 0 && (
                  <button 
                    onClick={() => removeRow(index)} 
                    className="remove-row-button" 
                    style={{ backgroundColor: row.color, color: getContrastYIQ(row.color), 
                            borderColor: index === 0 ? '#000000' : row.color}}>
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
                  style={{ borderColor: index === 0 ? '#000000' : row.color }} // Outline color for the label// Outline color for the label
                />
              </td>
              <td className="center">
                <textarea
                  rows="3"
                  value={row.numbers}
                  onChange={(e) => handleInputChange(index, 'numbers', e.target.value)}
                  style={{ borderColor: index === 0 ? '#000000' : row.color }}
                />
              </td>
              <td className="center">
                <select
                  value={row.delimiter}
                  onChange={(e) => handleInputChange(index, 'delimiter', e.target.value)}
                  style={{
                    backgroundColor: index === 0 ? '#000000' : row.color, // Set the background color to the row's color
                    color: index === 0 ? '#ffffff' : getContrastYIQ(row.color), // Set text color based on contrast
                    borderColor: index === 0 ? '#000000' : row.color, // Outline color
                  }}
                >
                  <option value="comma">Comma</option>
                  <option value="period">Period</option>
                  <option value="whitespace">Whitespace</option>
                </select>
              </td>
              <td className="center">{row.count}</td>
              <td className="center">{row.mean}</td>
              <td className="center">
                {stdevType === 'sample' ? row.sampleStd : row.populationStd}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div class="add-row-button-container"><button class="add-row-button" onClick={addRow}>+</button></div>
      <hr className="divider" />
      <div className="dropdown-container">
        <label className="t-test-type">T-Test Type: </label>
        <select
          className='dropdown-label'
          id="t-test-type"
          value={tTestType}
          onChange={(e) => setTTestType(e.target.value)}
          disabled={!areSampleSizesEqual()} // Disable if sample sizes are not equal
        >
          {areSampleSizesEqual() ? (
            <>
              <option value="paired">Paired</option>
              <option value="unpaired">Unpaired</option>
            </>
          ) : (
            <option value="unpaired">Unpaired</option> // Only show unpaired option
          )}
        </select>

        <label className="tail-type">Tail Type: </label>
        <select
          className="dropdown-label"
          id="tail-type"
          value={tailType}
          onChange={(e) => setTailType(e.target.value)}
        >
          <option value="one-tailed">One-Tailed</option>
          <option value="two-tailed">Two-Tailed</option>
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
}

export default MeanAndStdDev;
