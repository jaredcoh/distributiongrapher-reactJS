import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Title, Legend, ReferenceLine, ResponsiveContainer } from 'recharts';
import './GraphMeanAndStdDev.css';
import { Box } from '@mui/material';

function NormalDistributionTable() {
  const [distributions, setDistributions] = useState([
    { mean: '', stdev: '', label: '', color: '#000000', id: 1, lineWidth: 2, lineType: 'solid' }
  ]);
  const [userXRange, setUserXRange] = useState({ min: '', max: '' });
  const [userYRange, setUserYRange] = useState({ min: '', max: '' });
  const [lines, setLines] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [rangeError, setRangeError] = useState({ x: '', y: '' });
  const [chartRange, setChartRange] = useState({ xMin: 0, xMax: 0, yMin: 0, yMax: 0 });
  const [chartTitle, setChartTitle] = useState(''); // New state for chart title
  const [XAxisTitle, setXAxisTitle] = useState(''); // New state for X-axis title
  const [YAxisTitle, setYAxisTitle] = useState(''); // New state for Y-axis title
  const [showLineTable, setShowLineTable] = useState(true);
  const [showPlotOptions, setShowPlotOptions] = useState(true);

  const calculateChartRange = () => {
    let xMin, xMax, yMin, yMax;

    if (userXRange.min !== '' && userXRange.max !== '') {
      xMin = parseFloat(userXRange.min);
      xMax = parseFloat(userXRange.max);
    } else {
      xMin = Math.min(...distributions.map(d => parseFloat(d.mean) - 5 * parseFloat(d.stdev)));
      xMax = Math.max(...distributions.map(d => parseFloat(d.mean) + 5 * parseFloat(d.stdev)));
    }
    
    yMin = userYRange.min !== '' ? parseFloat(userYRange.min) : 0;
    yMax = userYRange.max !== '' ? parseFloat(userYRange.max) : 'auto';

    return { xMin, xMax, yMin, yMax };
  };

  const generateChartData = (range) => {
    const { xMin, xMax } = range;
    const step = (xMax - xMin) / 200;
    const data = [];

    for (let x = xMin; x <= xMax; x += step) {
      const point = { x };
      distributions.forEach(dist => {
        const y = normalPDF(x, parseFloat(dist.mean), parseFloat(dist.stdev));
        point[dist.id] = y;
      });
      data.push(point);
    }

    setChartData(data);
  };
  
  const handleChartTitleChange = (e) => {
    setChartTitle(e.target.value);
  };

  const handleXAxisTitleChange = (e) => {
    setXAxisTitle(e.target.value);
  }

  const handleYAxisTitleChange = (e) => {
    setYAxisTitle(e.target.value);
  }

  const handleRangeChange = (axis, bound, value) => {
    const newRange = axis === 'x' ? { ...userXRange } : { ...userYRange };
    newRange[bound] = value;
    
    if (axis === 'x') {
      setUserXRange(newRange);
    } else {
      setUserYRange(newRange);
    }

    validateRange(axis, newRange);
  };

  const validateRange = (axis, range) => {
    const min = parseFloat(range.min);
    const max = parseFloat(range.max);
    
    if (range.min !== '' && range.max !== '' && !isNaN(min) && !isNaN(max) && min >= max) {
      setRangeError({ ...rangeError, [axis]: 'Min must be less than Max' });
    } else {
      setRangeError({ ...rangeError, [axis]: '' });
    }
  };

  const getRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };



  const addRow = () => {
    const newColor = getRandomColor();
    setDistributions([...distributions, { mean: 0, stdev: 1, label: '', color: newColor, id: distributions.length + 1, lineWidth: 2, lineType: 'solid' }]);
  };

  const removeRow = (id) => {
    const updatedDistributions = distributions.filter(dist => dist.id !== id);
    setDistributions(updatedDistributions);
  };

  const addLine = () => {
    const newColor = getRandomColor();
    setLines([...lines, { id: lines.length + 1, color: newColor, label: `Line ${lines.length + 1}`, type: 'vertical', value: "", lineWidth: 2, lineType: 'dashed' }]);
  };

  const removeLine = (id) => {
    const updatedLines = lines.filter(line => line.id !== id);
    setLines(updatedLines);
  };

  const handleInputChange = (index, field, value) => {
    const newDistributions = [...distributions];
    newDistributions[index][field] = value;
    setDistributions(newDistributions);
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const normalPDF = (x, mean, stdev) => {
    return (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdev, 2));
  };

  useEffect(() => {
    const range = calculateChartRange();
    setChartRange(range);
    generateChartData(range);
  }, [distributions, lines, userXRange, userYRange]);

  const lineWidthOptions = [
    { value: 1, label: 'Thin' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Thick' },
    { value: 4, label: 'Very Thick' }
  ];

  const lineTypeOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' }
  ];

  return (
    <><div className="distribution-table-container">
      <h2>Nomral Distribution Curves</h2>
      <table className="distribution-table">
        <thead>
          <tr className="table-header-row">
            <th className="table-header"></th>
            <th className="table-header">Dataset ID</th>
            <th className="table-header">Color</th>
            <th className="table-header">Label</th>
            <th className="table-header">Mean</th>
            <th className="table-header">Standard Deviation</th>
            <th className="table-header">Line Width</th>
            <th className="table-header">Line Type</th>
          </tr>
        </thead>
        <tbody>
          {distributions.map((dist, index) => (
            <tr key={index} className="table-row" style={{ backgroundColor: `${dist.color}22` }}>
              <td className="table-cell">
                <button onClick={() => removeRow(dist.id)} className="remove-row-button" style={{ backgroundColor: dist.color, color: 'white' }}>X</button>
              </td>
              <td className="table-cell">{dist.id}</td>
              <td className="table-cell">
                <input
                  type="color"
                  value={dist.color}
                  onChange={(e) => handleInputChange(index, 'color', e.target.value)}
                  className="color-picker" />
              </td>
              <td className="table-cell">
                <input
                  type="text"
                  value={dist.label}
                  placeholder="Enter Label"
                  onChange={(e) => handleInputChange(index, 'label', e.target.value)}
                  className="input-label"
                  style={{ borderColor: dist.color }} />
              </td>
              <td className="table-cell">
                <input
                  type="number"
                  value={dist.mean}
                  placeholder="Mean"
                  onChange={(e) => handleInputChange(index, 'mean', e.target.value)}
                  className="input-mean"
                  style={{ borderColor: dist.color }} />
              </td>
              <td className="table-cell">
                <input
                  type="number"
                  value={dist.stdev}
                  placeholder="Standard Deviation"
                  onChange={(e) => handleInputChange(index, 'stdev', e.target.value)}
                  className="input-stdev"
                  style={{ borderColor: dist.color }} />
              </td>
              <td className="table-cell">
                <select
                  value={dist.lineWidth}
                  onChange={(e) => handleInputChange(index, 'lineWidth', parseInt(e.target.value))}
                  className="select-line-width"
                  style={{ borderColor: dist.color }}
                >
                  {lineWidthOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </td>
              <td className="table-cell">
                <select
                  value={dist.lineType}
                  onChange={(e) => handleInputChange(index, 'lineType', e.target.value)}
                  className="select-line-type"
                  style={{ borderColor: dist.color }}
                >
                  {lineTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="add-row-button">Add Row</button>
    </div>
    <div className="line-table-container">
      <div className="line-table-header">
        <h2>Add Horizontal/Vertical Lines</h2>
        <button className="toggle-button" onClick={() => setShowLineTable(!showLineTable)}>
          {showLineTable ? 'Hide' : 'Show'}
        </button>
      </div>
      {showLineTable && (
        <>
        <table className="line-table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header"></th>
              <th className="table-header">Line ID</th>
              <th className="table-header">Color</th>
              <th className="table-header">Label</th>
              <th className="table-header">Type</th>
              <th className="table-header">Value</th>
              <th className="table-header">Line Width</th>
              <th className="table-header">Line Type</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index} className="table-row">
                <td className="table-cell">
                  <button onClick={() => removeLine(line.id)} className="remove-line-button">X</button>
                </td>
                <td className="table-cell">{line.id}</td>
                <td className="table-cell">
                  <input
                    type="color"
                    value={line.color}
                    onChange={(e) => handleLineChange(index, 'color', e.target.value)}
                    className="color-picker" />
                </td>
                <td className="table-cell">
                  <input
                    type="text"
                    value={line.label}
                    placeholder="Enter Label"
                    onChange={(e) => handleLineChange(index, 'label', e.target.value)}
                    className="input-label" />
                </td>
                <td className="table-cell">
                  <select
                    value={line.type}
                    onChange={(e) => handleLineChange(index, 'type', e.target.value)}
                    className="line-type-select"
                  >
                    <option value="vertical">Vertical (X=)</option>
                    <option value="horizontal">Horizontal (Y=)</option>
                  </select>
                </td>
                <td className="table-cell">
                  <input
                    type="number"
                    value={line.value}
                    placeholder="Value"
                    onChange={(e) => handleLineChange(index, 'value', parseFloat(e.target.value))}
                    className="line-value-input" />
                </td>
                <td className="table-cell">
                  <select
                    value={line.lineWidth}
                    onChange={(e) => handleLineChange(index, 'lineWidth', parseInt(e.target.value))}
                    className="select-line-width"
                  >
                    {lineWidthOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </td>
                <td className="table-cell">
                  <select
                    value={line.lineType}
                    onChange={(e) => handleLineChange(index, 'lineType', e.target.value)}
                    className="select-line-type"
                  >
                    {lineTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addLine} className="add-line-button">Add Line</button>
        </>
          )}
      </div>

      <div className="plot-options-container">
        <div className="plot-options-header">
          <h2>Adjust Your Plot</h2>
          <button  className="toggle-button" onClick={() => setShowPlotOptions(!showPlotOptions)}>
            {showPlotOptions ? 'Hide' : 'Show'}
          </button>
        </div>
        {showPlotOptions && (
          <>
        <div className="plot-options">
          <div className="chart-title-input">
            <h3>Chart Title</h3>
            <input
              type="text"
              value={chartTitle}
              onChange={handleChartTitleChange}
              placeholder="Enter chart title"
              className="input-chart-title" />
          </div>
          <div className="axes-title-input">
            <h3>X and Y Axes Title</h3>
            <div>
              <input
                type="text"
                value={XAxisTitle}
                onChange={handleXAxisTitleChange}
                placeholder="Enter X-axis title"
                className="range-input" />
              <input
                type="text"
                value={YAxisTitle}
                onChange={handleYAxisTitleChange}
                placeholder="Enter Y-axis title"
                className="range-input" />
            </div>
          </div>
          <div className="range-inputs">
            <h3>Chart Range</h3>
            <div>
              <label>X-axis: </label>
              <input
                className="range-input"
                type="number"
                placeholder="Add value here"
                value={userXRange.min}
                onChange={(e) => handleRangeChange('x', 'min', e.target.value)} />
              <span className="axis-label">(Min)</span>
              <input
                className="range-input"
                type="number"
                placeholder="Add value here"
                value={userXRange.max}
                onChange={(e) => handleRangeChange('x', 'max', e.target.value)} />
              <span className="axis-label">(Max)</span>
              {rangeError.x && <span className="error">{rangeError.x}</span>}
            </div>
            <div>
              <label>Y-axis: </label>
              <input
                className="range-input"
                type="number"
                placeholder="Add value here"
                value={userYRange.max}
                onChange={(e) => handleRangeChange('y', 'max', e.target.value)} />
              <span className="axis-label">(Max, must be larger than highest y-value in distributions)</span>
              {rangeError.y && <span className="error">{rangeError.y}</span>}
            </div>
          </div>
        </div>
        </>
        )}
      </div>
      <div className="plot-container">
        <hr />
        <div className="plot-image-container">
          <Box
            marginBottom={"40px"}
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <strong style={{fontSize: "20px" }}>{chartTitle}</strong>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="1 1 " />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[chartRange.xMin, chartRange.xMax]}
                  tickFormatter={(value) => Number(value.toFixed(2))}
                  label={{
                    value: XAxisTitle,
                    angle: 0,
                    position: 'bottom',
                    offset: 0
                  }} />
                <YAxis
                  domain={[chartRange.yMin, chartRange.yMax]}
                  label={{
                    value: YAxisTitle,
                    angle: -90,
                    position: 'left',
                    offset: 0
                  }} />
                <Legend
                  layout="horizontal"
                  verticalAlign="top"
                  align="center"
                  wrapperStyle={{ paddingBottom: '20px' }} />
                {distributions.map((dist, index) => (
                  <React.Fragment key={index}>
                    <Line
                      type="monotone"
                      dataKey={dist.id.toString()}
                      stroke={dist.color}
                      strokeWidth={dist.lineWidth}
                      strokeDasharray={dist.lineType === 'dashed' ? '5 5' : dist.lineType === 'dotted' ? '1 1' : ''}
                      dot={false}
                      name={`${dist.label || `Dataset ${dist.id}`} (μ=${dist.mean}, σ=${dist.stdev})`}
                      isAnimationActive={false} />
                  </React.Fragment>
                ))}
                {lines.map((line, index) => (
                  <ReferenceLine
                    key={index}
                    x={line.type === 'vertical' ? line.value : undefined}
                    y={line.type === 'horizontal' ? line.value : undefined}
                    stroke={line.color}
                    strokeWidth={line.lineWidth}
                    strokeDasharray={line.lineType === 'dashed' ? '5 5' : line.lineType === 'dotted' ? '1 1' : ''}
                    label={{
                      value: line.label,
                      position: 'insideTopRight',
                      fill: line.color
                    }}
                    isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <span className="axis-label">(Screenshot this (Prnt Screen or Win+Shft+S or Cmd + Shift + 4) and save/paste in a secure location for future reference!)</span>  
        </div>
      </div></>
  );
}

export default NormalDistributionTable;