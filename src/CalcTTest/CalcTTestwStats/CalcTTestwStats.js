import React, { useState } from 'react';
import './CalcTTestwStats.css';
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

  const [activeTab, setActiveTab] = useState('inputValues');
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
          <div className='explanation-container'>
            <div className="assumptions-explanation">
            <h3>T-Test Assumptions</h3>
              <p>
                The T-test relies on several assumptions:
              </p>
              <BlockMath math="\text{1. The data is normally distributed.}" />
              <BlockMath math="\text{2. The samples are independent of each other.}" />
              <BlockMath math="\text{3. The variances between the groups are equal (for the equal variance test).}" />
              <p>
                Violations of these assumptions can affect the accuracy of the T-test results, 
                especially with smaller sample sizes.
              </p>
            </div>
            <hr />
            <div className="p-value-explanation">
              <h3>Understanding the P-Value</h3>
              <p>
                The p-value is a measure of the probability that the observed difference between datasets is due to chance, 
                assuming the null hypothesis (no difference between groups) is true. A lower p-value indicates stronger evidence 
                against the null hypothesis.
              </p>
              <p>
                In this case, if the p-value is <strong>below <InlineMath math='1-\text{\%}_{\text{Conf}}'/></strong>, it suggests that the difference between the datasets is statistically significant, 
                meaning there is less than a <InlineMath math='1-\text{\%}_{\text{Conf}}'/> chance that the observed difference is due to random variation. If the p-value is 
                <strong> greater than <InlineMath math='1-\text{\%}_{\text{Conf}}'/></strong>, it means the difference is not statistically significant, and the observed data could have 
                occurred by chance.
              </p>
              <p>
                Note: A statistically significant result does not necessarily mean the difference is practically important or meaningful.
              </p>
            </div>
            <hr />
            <div className="t-test-explanation">
              <h3>Understanding the T-Test</h3>
              <p>
                The T-Test is used to determine if there is a significant difference between the means of two datasets. 
                It compares the sample means and takes into account the variance within each dataset. The formula for the 
                T-value (for unpaired samples) is:
              </p>
              <BlockMath math="t = \frac{\bar{X}_1 - \bar{X}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}" />
              <p>Where:</p>
              <BlockMath math="\bar{X}_1, \bar{X}_2 \text{ are the means of the two samples.}" />
              <BlockMath math="s_1^2, s_2^2 \text{ are the variances of the two samples.}" />
              <BlockMath math="n_1, n_2 \text{ are the sample sizes.}" />
              <p>
                The degrees of freedom for unequal variances are approximated by:
              </p>
              <BlockMath math="df = \frac{\left( \frac{s_1^2}{n_1} + \frac{s_2^2}{n_2} \right)^2}{\frac{\left( \frac{s_1^2}{n_1} \right)^2}{n_1 - 1} + \frac{\left( \frac{s_2^2}{n_2} \right)^2}{n_2 - 1}}" />
              <p>
                The resulting T-value is then compared against a critical value from the T-distribution to determine the p-value.
              </p>
              <p>  
                <strong>A p-value less than </strong><InlineMath math='1-\text{\% Confidence}'/><strong> indicates a statistically significant difference between the datasets.</strong>
              </p>
            </div>
            <hr />
            <div className="Unpaired T-Test Types">
              <h3>Types of Unpaired T-Tests</h3>
              <p>
                A <strong>two-tailed test</strong> tests for the possibility of the relationship in both directions, while a 
                <strong> one-tailed test</strong> tests for the possibility of the relationship in only one direction.
              </p>
              <BlockMath math="H_0: \mu_1 = \mu_2 \quad \text{(Two-Tailed Test)}" />
              <BlockMath math="H_0: \mu_1 \leq \mu_2 \quad \text{or} \quad H_0: \mu_1 \geq \mu_2 \quad \text{(One-Tailed Test)}" />
              <p>
                Use a one-tailed test when you have a specific hypothesis about the direction of the difference. 
                Use a two-tailed test when you're only interested in detecting any difference.
              </p>
            </div>
          </div>
    </div>
  );
};

export default CalcTTest;
