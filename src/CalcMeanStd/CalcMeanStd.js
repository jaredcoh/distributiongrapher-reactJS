import React, { useState } from 'react';
import './CalcMeanStd.css'; // Import your CSS file
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

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
    color: getRandomColor() // Initialize with a random color
  }]);
  const [stdevType, setStdevType] = useState('sample'); // State for dropdown selection

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
      count: 0,
      color: newColor // Assign a new color to the new row
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

  return (
    <div className='mean-std-dev-container'>
      <h2>Mean and Standard Deviation Calculator</h2>
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
                onChange={(e) => setStdevType(e.target.value)} // Update state on change
              >
                <option value="sample">Sample</option>
                <option value="population">Population</option>
              </select>
            </th>
          </tr>
          <tr>
            <th></th>
            <th className="center" title="Unique identifier for the dataset">Dataset ID</th>
            <th className="center" title="Label for the dataset">Label</th>
            <th className="center" title="Enter your numbers here, separated by the chosen delimiter">Add Numbers Here</th>
            <th className="center" title="Choose the delimiter for separating numbers">Delimiter</th>
            <th className="center" title="Count of entered values">N</th>
            <th className="center" title="Mean of the entered numbers">Mean</th>
            <th className="center" title="Standard Deviation">Standard Deviation</th>
            <th className="center" title="Variance">Variance</th>
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
                  style={{ borderColor: index === 0 ? '#000000' : row.color }} // Outline color for "Add Numbers Here"
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
                  <option value="whitespace">Whitespace</option>
                  <option value="period">Period</option>
                  <option value="comma">Comma</option>
                </select>
              </td>
              <td className="center">{row.count}</td>
              <td className="center">{row.mean}</td>
              <td className="center">
                {stdevType === 'sample' ? row.sampleStd : row.populationStd} {/* Display based on dropdown */}
              </td>
              <td className="center">
                {stdevType === 'sample' ? row.sampleVar : row.populationVar} {/* Display variance based on dropdown */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="add-row-button-container">
            <button onClick={addRow} title="Add row" className="add-row-button">Add Row</button>
      </div>

      {/* Explanation Section */}
      <div className="explanation-container">
        <h3>How to Calculate</h3>
        <hr />
        <div className="explanation-section">
          <h4>N (Count)</h4>
          <p>The number of values entered.</p>
          <BlockMath math="N = \text{Count of Values}" />
          <p>In Excel/Sheets: Use <code>=COUNT(range)</code>.</p>
        </div>

        <hr />

        <div className="explanation-section">
          <h4>[Arithmetic] Mean</h4>
          <p>The average of the dataset, calculated by the sum divided by the count</p>
          <BlockMath math="\text{Mean} = \frac{\sum_{i=1}^{N} x_i}{N}" />
          <p>In Excel/Sheets: Use <code>=AVERAGE(range)</code>.</p>
        </div>

        <hr />

        <div className="explanation-section">
          <h4>Sample Standard Deviation</h4>
          <p>Sample: a subset of a larger population</p>
          <p>A measure of the amount of variation or dispersion of a set of values.</p>
          <BlockMath math="s = \sqrt{\frac{\sum_{i=1}^{N} (x_i - \bar{x})^2}{N-1}}" />
          <p>In Excel/Sheets: Use <code>=STDEV.S(range)</code>.</p>
        </div>
        <hr />
        <div className="explanation-section">
          <h4>Sample Variance</h4>
          <p>Sample Variance can be calculated by squaring the sample standard deviation.</p>
          <BlockMath math="s^2 = \frac{\sum_{i=1}^{N} (x_i - \bar{x})^2}{N-1}" />
          <p>In Excel/Sheets: Use <code>=VAR.S(range)</code>.</p>
        </div>

        <hr />

        <div className="explanation-section">
          <h4>Population Standard Deviation</h4>
          <p>Population: the entire population</p>
          <p>A measure of the dispersion of a set of values in a population.</p>
          <BlockMath math="\sigma = \sqrt{\frac{\sum_{i=1}^{N} (x_i - \mu)^2}{N}}" />
          <p>In Excel/Sheets: Use <code>=STDEV.P(range)</code>.</p>
        </div>
        
        <hr />

        <div className="explanation-section">
          <h4>Population Variance</h4>
          <p>Population Variance can be calculated by squaring the population standard deviation.</p>
          <BlockMath math="\sigma^2 = \frac{\sum_{i=1}^{N} (x_i - \mu)^2}{N}" />
          <p>In Excel/Sheets: Use <code>=VAR.P(range)</code>.</p>
        </div>
      </div>
    </div>
  );
}

export default MeanAndStdDev;
