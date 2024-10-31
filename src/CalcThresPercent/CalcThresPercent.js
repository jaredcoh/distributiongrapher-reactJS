import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
const jStat = require('jstat'); // Make sure to install jStat library

function NormalDistributionCalculator() {
  const [activeTab, setActiveTab] = useState('thresholds');
  const [mean, setMean] = useState('');
  const [stdDev, setStdDev] = useState('');
  const [thresholdType, setThresholdType] = useState('');
  const [lowerBound, setLowerBound] = useState('');
  const [upperBound, setUpperBound] = useState('');
  const [result, setResult] = useState(null);
  const [occurrenceRate, setOccurrenceRate] = useState(null);
  const [totalSamples, setTotalSamples] = useState('');
  const [expectedSamples, setExpectedSamples] = useState(null);
  const [percentInput, setPercentInput] = useState('');
  const [percentResult, setPercentResult] = useState(null);
  const [rangeType, setRangeType] = useState(''); // For selecting left, right, or middle
  const [probability, setProbability] = useState(null);


  const calculateExpectedSamples = () => {
    if (!probability || !totalSamples) {
      setExpectedSamples('Please calculate a probability first and enter total samples.');
      return;
    }

    const total = parseInt(totalSamples, 10);
    
    if (!isNaN(total) && total > 0) {
      const expected = Math.round(probability * total);
      setExpectedSamples(`Approximately ${expected} of ${total} samples will fall in the defined range.`);
    } else {
      setExpectedSamples('Please enter a valid number of total samples.');
    }
  };

  const calculatePercent = () => {
    const avg = parseFloat(mean);
    const stDev = parseFloat(stdDev);
    const percent = parseFloat(percentInput) / 100;
    
    if (isNaN(avg) || isNaN(stDev) || stDev <= 0 || isNaN(percent) || percent < 0 || percent > 1) {
      setPercentResult('Please enter valid mean, standard deviation, percent, and number of samples values.');
      return;
    }
  
    let upperBound;
    let lowerBound;
  
    // Calculate bounds based on the selected range type
    switch (rangeType) {
      case 'left':
        // Find the upper bound for which the cumulative distribution function (CDF) equals percent
        upperBound = avg + jStat.normal.inv(percent, 0, stDev); // Z-score for left-side coverage
        setPercentResult(`${percent * 100}% of values in this dataset will be less than ${formatNumber(upperBound)}`);
        break;
  
      case 'right':
        // Find the lower bound for which the cumulative distribution function (CDF) equals 1 - percent
        lowerBound = avg + jStat.normal.inv(1 - percent, 0, stDev); // Z-score for right-side coverage
        setPercentResult(`${percent * 100}% of values in this dataset will be greater than ${formatNumber(lowerBound)}`);
        break;
  
      case 'symmetric':
        // Calculate symmetric bounds
        const zScore = jStat.normal.inv((1 - percent) / 2, 0, 1); // Z-score corresponding to the given percent
        lowerBound = avg + (zScore * stDev); // Lower bound
        upperBound = avg - (zScore * stDev); // Upper bound
        setPercentResult(`${percent * 100}% of values in this dataset will be between ${formatNumber(lowerBound)} and ${formatNumber(upperBound)}.`);
        break;
  
      default:
        setPercentResult('Please select a range type.');
        return;
    }
  };

  const formatNumber = (probability) => {
    if (probability < 0.0001 || probability > 100000) {
      return probability.toExponential(4);
    }
    if (Math.abs(Math.round(probability) - probability) < Number.EPSILON) {
      return Math.round(probability).toString();
    }
    return probability.toFixed(4);
  };
  
  const calculateProbability = () => {
    const avg = parseFloat(mean);
    const stDev = parseFloat(stdDev);

    if (isNaN(avg) || isNaN(stDev) || stDev <= 0) {
      setResult('Please enter valid mean and standard deviation values.');
      setOccurrenceRate(null);
      setProbability(null);
      return;
    }

    const standardNormalCDF = (x) => {
      const t = 1 / (1 + 0.2316419 * Math.abs(x));
      const d = 0.3989423 * Math.exp(-x * x / 2);
      const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
      return x > 0 ? 1 - probability : probability;
    };

    const calculateZ = (x) => (x - avg) / stDev;

    let probability;
    let boundDescription;

    switch (thresholdType) {
      case 'lower':
        probability = 1 - standardNormalCDF(calculateZ(lowerBound));
        boundDescription = `greater than ${formatNumber(lowerBound)}`;
        break;
      case 'upper':
        probability = standardNormalCDF(calculateZ(upperBound));
        boundDescription = `less than ${formatNumber(upperBound)}`;
        break;
      case 'between':
        probability = standardNormalCDF(calculateZ(upperBound)) - standardNormalCDF(calculateZ(lowerBound));
        boundDescription = `between ${formatNumber(lowerBound)} and ${formatNumber(upperBound)}`;
        console.log(probability);
        break;
      default:
        setResult('Please select a threshold type.');
        setProbability(null);
        return;
    }

    setResult(`The probability is approximately ${formatNumber(probability)}`);
    
    let occurrenceRateText;
    if (probability > 0.5) {
      let occurrences=Math.round(probability * 1000); // Starting with a larger scale
      occurrenceRateText = `${formatNumber(occurrences)} in every ${formatNumber(1000)} samples will be ${boundDescription}.`;
    } else {
        const inverseRate = Math.round(1 / probability);
        occurrenceRateText = `1 in every ${formatNumber(inverseRate)} samples will be ${boundDescription}.`;
    }
    setProbability(probability);
    setOccurrenceRate(occurrenceRateText);
  };

  return (
    <div className="calculator-container">
      <h2>Thresholds and Percentages</h2>
      <p>Enter the mean and standard deviation of the distribution, and choose between thresholds or percentages.</p>
      <div className="input-group">
        <label className="label-thres-percent" htmlFor="mean">Mean (μ):</label>
        <input
          className="input-thres-percent"
          id="mean"
          type="number"
          value={mean}
          onChange={(e) => setMean(e.target.value)}
          placeholder="Enter Mean"
        />
      </div>
      <div className="input-group">
        <label className="label-thres-percent" htmlFor="stdDev">Standard Deviation (σ):</label>
        <input
          className="input-thres-percent"
          id="stdDev"
          type="number"
          value={stdDev}
          onChange={(e) => setStdDev(e.target.value)}
          placeholder="Enter Standard Deviation"
        />
      </div>
      <div className="tabs">
        <button onClick={() => setActiveTab('thresholds')} className={activeTab === 'thresholds' ? 'active' : ''}>
          Probability for Given Bound(s)
        </button>
        <button onClick={() => setActiveTab('percent')} className={activeTab === 'percent' ? 'active' : ''}>
          Bounds for Given Probability
        </button>
      </div>
      {activeTab === 'thresholds' && (
        <>
          <div className="input-group">
            <label htmlFor="thresholdType">Choose Threshold Type:</label>
            <select
              className="select-thres-percent"
              id="thresholdType"
              value={thresholdType}
              onChange={(e) => setThresholdType(e.target.value)}
            >
              <option value="" disabled>Select Threshold Type</option>
              <option value="lower">P(x &gt; a)</option>
              <option value="upper">P(x &lt; b)</option>
              <option value="between">P(a &lt; x &lt; b)</option>
            </select>
          </div>
          <div className="input-group">
            {thresholdType && (
              <>
                {thresholdType !== 'upper' && (
                  <div className="input-group">
                    <label htmlFor="lowerBound">Lower Bound (a):</label>
                    <input
                      className="input-thres-percent"
                      id="lowerBound"
                      type="number"
                      value={lowerBound}
                      onChange={(e) => setLowerBound(e.target.value)}
                      placeholder="Enter Lower Bound"
                    />
                  </div>
                )}
                {thresholdType !== 'lower' && (
                  <div className="input-group">
                    <label htmlFor="upperBound">Upper Bound (b):</label>
                    <input
                      className="input-thres-percent"
                      id="upperBound"
                      type="number"
                      value={upperBound}
                      onChange={(e) => setUpperBound(e.target.value)}
                      placeholder="Enter Upper Bound"
                    />
                  </div>
                )}
              </>
            )}
            </div>
            <button class="process-button" onClick={calculateProbability}>Calculate Probability</button>
          <hr></hr>
          {result && <p>{result}</p>}
          
          {occurrenceRate && <p>{occurrenceRate}</p>}
          <hr></hr>
          <div className="input-group">
            <label htmlFor="totalSamples">Total Samples:</label>
            <input
              className="input-thres-percent"
              id="totalSamples"
              type="number"
              value={totalSamples}
              onChange={(e) => setTotalSamples(e.target.value)}
              placeholder="Enter Total Samples"
            />
            <button class="process-button" onClick={calculateExpectedSamples}>Calculate Expected Samples</button>
            {expectedSamples && <p>{expectedSamples}</p>}
          </div>
        </>
      )}
      {activeTab === 'percent' && (
        <div className="percent-tab">
          <div className="input-group">
            <label className="label-thres-percent" htmlFor="percentInput">Enter Percent of Range (%):</label>
            <input
              className="input-thres-percent"
              id="percentInput"
              type="number"
              value={percentInput}
              onChange={(e) => setPercentInput(e.target.value)}
              placeholder="Enter Percent of Range"
            />
          </div>
          Range Options:
          <div>
            <label>
              <input type="radio" value="left" checked={rangeType === 'left'} onChange={(e) => setRangeType(e.target.value)} />
              (-∞, a)
            </label>
          </div>
          <div>
            <label>
              <input type="radio" value="right" checked={rangeType === 'right'} onChange={(e) => setRangeType(e.target.value)} />
              (b, ∞)
            </label>
          </div>
          <div>
            <label>
              <input type="radio" value="symmetric" checked={rangeType === 'symmetric'} onChange={(e) => setRangeType(e.target.value)} />
              (a, b) [Symmetric about mean]
            </label>
          </div>
          <button className="process-button" onClick={calculatePercent}>Calculate Percent</button>
          {percentResult && <p>{percentResult}</p>}
        </div>
      )}
    </div>
  );
}

export default NormalDistributionCalculator;