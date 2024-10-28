export const calculateMeanAndStdDev = (data, type) => {
    // Split the trimmed string and convert to numbers
    const numbers = data.trim().replace(/[,\s]+$/, '').split(/[,\s]+/).map(Number).filter(n => !isNaN(n));
  
    if (numbers.length === 0) return { average: 'NaN', stdDev: 'NaN' };
  
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    
    // Calculate variance
    const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = type === 'sample'
      ? squareDiffs.reduce((a, b) => a + b, 0) / (numbers.length - 1)  // Sample variance formula
      : squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;        // Population variance formula
  
    const stdDev = Math.sqrt(avgSquareDiff);
    return { mean, stdDev };
  };
  
export const getRandomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  };
  
  
export const calculateChartRange = (userXRange, userYRange, distributions) => {
    let xMin, xMax, yMin, yMax;
  
    if (userXRange.min !== '' && userXRange.max !== '') {
      xMin = parseFloat(userXRange.min);
      xMax = parseFloat(userXRange.max);
    } else {
      xMin = Math.min(...distributions.map(d => parseFloat(d.mean || d.average) - 5 * parseFloat(d.stdev || d.stdDev)));
      xMax = Math.max(...distributions.map(d => parseFloat(d.mean || d.average) + 5 * parseFloat(d.stdev || d.stdDev)));
    }
  
    yMin = userYRange.min !== '' ? parseFloat(userYRange.min) : 0;
    yMax = userYRange.max !== '' ? parseFloat(userYRange.max) : 'auto';
  
    return { xMin, xMax, yMin, yMax };
  };

  
export const lineWidthOptions = [
    { value: 1, label: 'Thin' },
    { value: 2, label: 'Normal' },
    { value: 3, label: 'Thick' },
    { value: 4, label: 'Very Thick' }
  ];
  
export const lineTypeOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' }
  ];
  
export const normalPDF = (x, mean, stdev) => {
    return (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdev, 2));
  };

export const generateChartData = (range, distributions) => {
    const { xMin, xMax } = range;
    const data = [];

    for (let x = xMin; x <= xMax; x +=  (xMax - xMin) / 200) {
      const point = { x };
      distributions.forEach(dist => {
        point[dist.id] = normalPDF(x, parseFloat(dist.mean || dist.average), parseFloat(dist.stdev || dist.stdDev));
      });
      data.push(point);
    }
    return data;
  };
