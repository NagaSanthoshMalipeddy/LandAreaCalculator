// Conversion factors to square feet (base unit for area conversions)
const conversionFactors = {
    // Linear measurements converted to feet first
    inch: 1/12,              // 1 inch = 1/12 feet
    feet: 1,                 // 1 foot = 1 foot (base for linear)
    yard: 3,                 // 1 yard = 3 feet
    
    // Area measurements in square feet
    sqfeet: 1,               // 1 sq ft = 1 sq ft (base unit)
    sqyard: 9,               // 1 sq yard = 9 sq feet
    ankanam: 72,             // 1 ankanam = 72 sq feet
    cent: 435.6,             // 1 cent = 435.6 sq feet
    gunta: 1089,             // 1 gunta = 1089 sq feet
    acre: 43560,             // 1 acre = 43560 sq feet
    hectare: 107639.1        // 1 hectare = 107639.1 sq feet
};

// Check if unit is a linear measurement
function isLinearUnit(unit) {
    return unit === 'inch' || unit === 'feet' || unit === 'yard';
}

// Get DOM elements
const inputValue = document.getElementById('inputValue');
const inputUnit = document.getElementById('inputUnit');
const resultsSection = document.getElementById('resultsSection');

// Function to convert value to square feet
function toSquareFeet(value, unit) {
    if (value === '' || value === null || isNaN(value)) {
        return null;
    }
    
    const numValue = parseFloat(value);
    
    // For linear units, convert to feet first, then square for area
    if (isLinearUnit(unit)) {
        const inFeet = numValue * conversionFactors[unit];
        return inFeet * inFeet; // Square the linear measurement
    }
    
    // For area units, directly multiply by conversion factor
    return numValue * conversionFactors[unit];
}

// Function to convert from square feet to target unit
function fromSquareFeet(sqFeetValue, targetUnit) {
    if (sqFeetValue === null) {
        return '-';
    }
    
    // For linear units, take square root first, then convert
    if (isLinearUnit(targetUnit)) {
        const linearFeet = Math.sqrt(sqFeetValue);
        const result = linearFeet / conversionFactors[targetUnit];
        return formatNumber(result);
    }
    
    // For area units, divide by conversion factor
    const result = sqFeetValue / conversionFactors[targetUnit];
    return formatNumber(result);
}

// Function to format numbers (up to 6 decimal places, remove trailing zeros)
function formatNumber(num) {
    if (num === 0) return '0';
    
    // For very small numbers, use scientific notation
    if (Math.abs(num) < 0.000001 && num !== 0) {
        return num.toExponential(4);
    }
    
    // For regular numbers, show up to 6 decimal places and remove trailing zeros
    let formatted = num.toFixed(6);
    formatted = formatted.replace(/\.?0+$/, '');
    
    // Add thousand separators for large numbers
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return parts.join('.');
}

// Function to update all result displays
function updateResults() {
    const value = inputValue.value;
    const unit = inputUnit.value;
    
    // Convert input to square feet (base unit)
    const sqFeetValue = toSquareFeet(value, unit);
    
    // Update all result fields
    const units = ['inch', 'feet', 'sqfeet', 'yard', 'sqyard', 'gunta', 'cent', 'ankanam', 'acre', 'hectare'];
    
    units.forEach(targetUnit => {
        const resultElement = document.getElementById(`result-${targetUnit}`);
        const resultItem = resultElement.parentElement;
        const newValue = fromSquareFeet(sqFeetValue, targetUnit);
        
        // Hide sqfeet and sqyard if input unit is yard, feet, or inch
        if ((isLinearUnit(unit) && (targetUnit === 'sqfeet' || targetUnit === 'sqyard')) || (!isLinearUnit(unit) && isLinearUnit(targetUnit))) {
            resultItem.style.display = 'none';
        } else {
            resultItem.style.display = 'flex';
        }
        
        // Add animation class
        resultElement.classList.add('updated');
        resultElement.textContent = newValue;
        
        // Remove animation class after animation completes
        setTimeout(() => {
            resultElement.classList.remove('updated');
        }, 300);
    });
}

// Add event listeners
inputValue.addEventListener('input', updateResults);
inputUnit.addEventListener('change', updateResults);

// Initialize with default values (optional)
inputValue.value = '';
updateResults();

// ============================================
// CALCULATOR FUNCTIONS
// ============================================

let currentDisplay = '0';
let expression = '';
let firstOperand = null;
let operator = null;
let waitingForSecondOperand = false;

function updateDisplay() {
    const display = document.getElementById('calcDisplay');
    display.textContent = expression || currentDisplay;
}

function appendNumber(num) {
    if (waitingForSecondOperand) {
        currentDisplay = num;
        expression += num;
        waitingForSecondOperand = false;
    } else {
        if (currentDisplay === '0' && num !== '.') {
            currentDisplay = num;
            if (!expression || expression.match(/[\+\-\*\/]$/)) {
                expression += num;
            } else {
                expression = num;
            }
        } else {
            // Prevent multiple decimal points
            if (num === '.' && currentDisplay.includes('.')) {
                return;
            }
            currentDisplay += num;
            expression += num;
        }
    }
    updateDisplay();
}

function appendOperator(nextOperator) {
    const inputValue = parseFloat(currentDisplay);
    
    if (firstOperand === null) {
        firstOperand = inputValue;
        expression = currentDisplay + ' ' + nextOperator + ' ';
    } else if (operator) {
        const result = performCalculation(firstOperand, inputValue, operator);
        currentDisplay = String(result);
        firstOperand = result;
        expression = currentDisplay + ' ' + nextOperator + ' ';
    }
    
    waitingForSecondOperand = true;
    operator = nextOperator;
    updateDisplay();
}

function performCalculation(first, second, operator) {
    switch (operator) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            return second !== 0 ? first / second : 'Error';
        default:
            return second;
    }
}

function calculateResult() {
    const inputValue = parseFloat(currentDisplay);
    
    if (operator && firstOperand !== null) {
        const result = performCalculation(firstOperand, inputValue, operator);
        
        if (result === 'Error') {
            currentDisplay = 'Error';
            expression = 'Error';
        } else {
            // Round to 8 decimal places to avoid floating point issues
            const roundedResult = Math.round(result * 100000000) / 100000000;
            expression = expression + ' = ' + roundedResult;
            currentDisplay = String(roundedResult);
        }
        
        firstOperand = null;
        operator = null;
        waitingForSecondOperand = true;
    }
    
    updateDisplay();
}

function clearCalculator() {
    currentDisplay = '0';
    expression = '';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    updateDisplay();
}

function deleteLastChar() {
    if (expression.includes('=')) {
        // If result is shown, clear everything
        clearCalculator();
        return;
    }
    
    if (currentDisplay.length > 1 && !waitingForSecondOperand) {
        currentDisplay = currentDisplay.slice(0, -1);
        expression = expression.slice(0, -1);
    } else if (!waitingForSecondOperand) {
        currentDisplay = '0';
        expression = expression.slice(0, -1);
    }
    updateDisplay();
}

// Initialize calculator display
updateDisplay();

