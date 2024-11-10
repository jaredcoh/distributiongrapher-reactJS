import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

// Define grid size
const GRID_ROWS = 4;
const GRID_COLS = 5;

// Define possible box sizes
const BOX_SIZES = [
  { colSpan: 1, rowSpan: 1 }, // 1x1
  { colSpan: 2, rowSpan: 1 }, // 2x1
  { colSpan: 1, rowSpan: 2 }, // 1x2
  { colSpan: 3, rowSpan: 1 }, // 3x1
  { colSpan: 2, rowSpan: 2 }, // 2x2
  { colSpan: 1, rowSpan: 3 }, // 1x3
  { colSpan: 3, rowSpan: 1 }  // 3x1 (another option for 3-cell wide)
];

// Link data
const linkData = [
  { 
    label: 'Calculate a Dataset\'s Mean and Standard Deviations', 
    descriptor: 'Input your dataset to calculate its mean and population/sample standard deviations', 
    link: '/calc-mean-stdev'
  },
  { 
    label: 'Calculate Distributions\' T-Tests', 
    descriptor: 'Input your datasets to calculate to determine whether each dataset is similar', 
    link: '/ttest-matrix'
  },
  { 
    label: 'Calculate a Dataset\'s Thresholds and Percentages', 
    descriptor: 'Input your dataset to calculate range of likelihood for a given percent, and its percent-likelihood to be found in a given range', 
    link: '/calc-thres-percent'
  },
  { 
    label: 'Calculate a Dataset\'s Outliers Recursively', 
    descriptor: 'Input your dataset to eliminate outliers', 
    link: '/elim-outliers'
  },
  { 
    label: 'Plot Distributions using their Means and Standard Deviations', 
    descriptor: 'Input your datasets\' mean and standard deviation to visualize the datasets\'s distributions', 
    link: '/plot-mean-stdev'
  },
  { 
    label: 'Plot Distriubtions using Copy-and-Pasted Datapoints', 
    descriptor: 'Input your datasets\' datapoints to visualize the datasets\'s distributions', 
    link: '/graph-data'
  }
];

// Create an empty grid
const createEmptyGrid = () => Array.from({ length: GRID_ROWS }, () => Array(GRID_COLS).fill(null));

// Check if space is available in the grid
const isSpaceAvailable = (grid, startRow, startCol, rowSpan, colSpan) => {
  if (startRow + rowSpan > GRID_ROWS || startCol + colSpan > GRID_COLS) return false;
  
  for (let r = 0; r < rowSpan; r++) {
    for (let c = 0; c < colSpan; c++) {
      if (grid[startRow + r][startCol + c] !== null) return false;
    }
  }
  return true;
};

// Find random empty position in grid
const findRandomEmptyPosition = (grid, rowSpan, colSpan) => {
  const possiblePositions = [];
  
  for (let row = 0; row <= GRID_ROWS - rowSpan; row++) {
    for (let col = 0; col <= GRID_COLS - colSpan; col++) {
      if (isSpaceAvailable(grid, row, col, rowSpan, colSpan)) {
        possiblePositions.push({ row, col });
      }
    }
  }
  
  if (possiblePositions.length === 0) return null;
  return possiblePositions[Math.floor(Math.random() * possiblePositions.length)];
};

// Place a box in the grid
const placeBox = (grid, row, col, rowSpan, colSpan, value) => {
  for (let r = 0; r < rowSpan; r++) {
    for (let c = 0; c < colSpan; c++) {
      grid[row + r][col + c] = value;
    }
  }
};

function Home() {
  const [placedBoxes, setPlacedBoxes] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [usedPlaceholders, setUsedPlaceholders] = useState(new Set(['blank']));

  useEffect(() => {
    const grid = createEmptyGrid();
    const boxes = [];
    let attempts = 0;
    const maxAttempts = 100;

    // Try to place all 6 links
    while (boxes.length < linkData.length && attempts < maxAttempts) {
      attempts++;
      
      const randomSize = BOX_SIZES[Math.floor(Math.random() * BOX_SIZES.length)];
      const position = findRandomEmptyPosition(grid, randomSize.rowSpan, randomSize.colSpan);
      
      if (position) {
        const boxInfo = {
          ...randomSize,
          ...linkData[boxes.length],
          gridRow: position.row,
          gridCol: position.col
        };
        
        placeBox(grid, position.row, position.col, randomSize.rowSpan, randomSize.colSpan, `link-${boxes.length}`);
        boxes.push(boxInfo);
      }
    }

    const emptySpots = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (grid[row][col] === null) {
          emptySpots.push({ gridRow: row, gridCol: col, colSpan: 1, rowSpan: 1 });
          grid[row][col] = 'placeholder';
        }
      }
    }

    setPlacedBoxes(boxes);
    setPlaceholders(emptySpots);
    // Reset usedPlaceholders when grid is regenerated
    setUsedPlaceholders(new Set(['blank']));
  }, []);

  return (
    
    <Box className="homepage-container">
      <Box className="top-box">
        <h2 className="welcome-text">Welcome to the Distributions Grapher!</h2>
        <p className="welcome-text">This is the only website where you can plot an infinite number of datasets' distributions on one graph.</p>
        <p className="welcome-text">Click on one ofthe boxes below to analyze your data! You can always click on the header to take you back home or to any of the other pages of the site!</p>
      </Box>
      
      <Box className="bento-grid">
        {/* Link boxes */}
        {placedBoxes.map((box, index) => (
          <Link
            key={index}
            to={box.link}
            className="box-link"
            style={{
              gridColumn: `${box.gridCol + 1} / span ${box.colSpan}`,
              gridRow: `${box.gridRow + 1} / span ${box.rowSpan}`
            }}
          >
            <div className="box-content">
              <h3>{box.label}</h3>
              <p>{box.descriptor}</p>
            </div>
          </Link>
        ))}
        
        {/* Placeholder images in empty cells */}
        {placeholders.map((placeholder, index) => {
          
          return (
            <Box
              key={`placeholder-${index}`}
              className={`placeholder-box blank-cell`}
              style={{
                gridColumn: `${placeholder.gridCol + 1} / span ${placeholder.colSpan}`,
                gridRow: `${placeholder.gridRow + 1} / span ${placeholder.rowSpan}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default Home;