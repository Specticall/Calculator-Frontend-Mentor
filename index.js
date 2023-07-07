/*
TO DO LIST:
IMPORTANT :
Fix how to calculator handles "." and "0", harus bikin chart dulu kayanya

1. find a way biar kalo ada e di hasilnya displaynya bisa bener
2. updateDisplay function masih need alot of work (skrg baru update main display doang)
3. Delete and reset button
4. responsive 


BUG :
when pressing "." comma after a result it becomes NaN
*/

const btnKey = document.querySelectorAll(".btn-key");

// Stores the value of an ongoing operation
let onGoingOperation = [];

// format -> [i, "operation"]  : "result"
// E.G   { "1)10,+,10": "20" }
const operationHistory = {};

// Keep track of which index our input should be on the onGoingOperation array
let onGoingIndex = 0;

// Place to store the repeat calculation function
let repeatCalc;

// This listener will detect every time we hit the "=" button, when we clicked it more than once than the repeatCalc function will be called
let equalsClicked = 0;

const calculate = {
  "+"(a, b) {
    return a + b;
  },
  "-"(a, b) {
    return a - b;
  },
  "/"(a, b) {
    return a / b;
  },
  x(a, b) {
    return a * b;
  },
};

function insertKey() {
  const key = this.dataset.key;

  // Checks the length is our history object.
  const historyLength = Object.keys(
    operationHistory
  ).length;

  // [0-9] if either converting the key results in a number, key is 0 or key is "." then proceed
  if (Number(key) || key === "0" || key === ".") {
    if (
      (key === "0" &&
        `${onGoingOperation[onGoingIndex]}`[0] === "0") ||
      (key === "." &&
        `${onGoingOperation[onGoingIndex]}`.includes("."))
    )
      return;

    console.log(onGoingOperation);

    if (
      key === "." &&
      `${onGoingOperation[onGoingIndex]}`[0] !== "0"
    )
      onGoingOperation[onGoingIndex] =
        (onGoingOperation[onGoingIndex] || "") + 0;

    // if its empty then add "" + key else current + key (if it contains a "." already then return)
    onGoingOperation[onGoingIndex] =
      (onGoingOperation[onGoingIndex] || "") + key;

    const [first = "", operator = "", second = first] =
      onGoingOperation;

    //prettier-ignore
    // coming from the destructured ongoing operation array
    updateDisplay(onGoingOperation[onGoingIndex], [first,operator]);

    // We have broken the streak of pressing the equal button
    equalsClicked = 0;

    // console.log(
    //   onGoingOperation[onGoingIndex].includes(".")
    // );
  }

  // Stops any buttons other than numbers from being pressed
  if (onGoingOperation.length === 0 && historyLength === 0)
    return;

  // [Operator] If its an operator then proceed
  if (/x|\+|-|\//.test(key)) {
    // Checks if the user presses the operator button right after the = button
    if (onGoingIsEmpty()) {
      const [previousCalc, previousResult] = Object.entries(
        operationHistory
      )[historyLength - 1];

      onGoingOperation[0] = previousResult;
    }

    // Checks if the user does another operation before pressing the = button
    if (onGoingOperation.length === 3) {
      calculateResult(historyLength);

      // Retrieve the previous calculation from the object
      const [previousCalc, previousResult] = Object.entries(
        operationHistory
      )[historyLength];
      // history length has been updated, so does not need the -1

      // Populates the onGoingOperation array using value from the previous calculation;
      onGoingOperation[0] = previousResult;
    }

    onGoingOperation[1] = key;
    onGoingIndex = 2;

    const [first = "", operator = "", second = first] =
      onGoingOperation;

    // coming from the destructured ongoing operation array
    updateDisplay(first, [first, operator]);

    // We have broken the streak of pressing the equal button
    equalsClicked = 0;
  }

  // [=] If its the equal sign then proceed
  if (key === "=") {
    // Keeps track of how many equals we have clicked
    equalsClicked++;
    // Checks if the "=" button is pressed again without inputing new numbers
    if (onGoingIsEmpty()) {
      // Retrieve the previous calculation data from the object
      const previousCalc = Object.keys(operationHistory)[
        historyLength - 1
      ];

      // If we clicked the = button two times in a row then initiate the function which returns another counter function
      if (equalsClicked === 2) {
        repeatCalc = repeatCalculation(
          previousCalc.split(",")[2]
        );
      }
      if (equalsClicked < 2) return;
      repeatCalc(historyLength);
    }

    // If there is only the first index at the ongoing operation array, return
    // if (onGoingOperation.length < 2) return;

    // If we're not pressing the "=" in succession, then proceed
    if (onGoingOperation.length < 2) return;
    calculateResult(historyLength);
  }

  function onGoingIsEmpty() {
    return onGoingOperation.length === 0 &&
      historyLength > 0
      ? true
      : false;
  }

  // ====== checking ===========
  console.log(onGoingOperation);
}

function repeatCalculation(incrementBy) {
  return function (historyLength) {
    console.log(incrementBy);

    // Retrieve the previous calculation from the object
    const [previousCalc, previousResult] = Object.entries(
      operationHistory
    )[historyLength - 1];

    // Populates the onGoingOperation array using value from the previous calculation;
    // the split(",")[1] is to extract the operator of the previous calculation
    onGoingOperation = [
      previousResult,
      previousCalc.split(",")[1],
      incrementBy,
    ];

    calculateResult(historyLength);
  };
}

// This function will calculate the ongoing array and store the result in the object

function calculateResult(historyLength) {
  // We can press it before inputing 2nd numbers
  const [first, operator, second = first] =
    onGoingOperation;

  // prettier-ignore
  // Store the calculation result
  /*
      format -> "1)1+1"  : "2"
      format -> "2)10*12"  : "120"
      */

  // The key of the current calculation in the history object as a string e.g "10)40-20"
  const historyKey = `${historyLength + 1})${onGoingOperation}`

  operationHistory[historyKey] = `${calculate[operator](
    Number(first),
    Number(second)
  )}`;
  // prettier-ignore
  // Updates the display
  updateDisplay(operationHistory[historyKey], onGoingOperation);
  // Reset ongoing operation
  onGoingOperation = [];

  // Reset ongoing index position
  onGoingIndex = 0;
  console.log(operationHistory);
}

// This function handles the display update on the DOM
function updateDisplay(main, secondary = []) {
  // Selects the DOM elements
  const mainDisplay = document.querySelector(
    ".display__main"
  );
  const subDisplay =
    document.querySelector(".display__sub");

  // destructure the secondary array
  const [subFirst = "", subOperator = "", subSecond = ""] =
    secondary;

  // Limits character amount to 15 and formats it properly
  const formatMain = Number(main)
    .toLocaleString("de-DE", {
      maximumFractionDigits: 20,
    })
    .slice(0, 15);

  // Formats and updates the main display text
  mainDisplay.textContent = formatMain;

  // Formats and updates the sub display text
  subDisplay.textContent = `${subFirst} ${subOperator} ${subSecond} ${
    secondary.length === 3 ? "=" : ""
  }`;
}

// Example input
// updateDisplay("123456.1249081752893", ["10", "+"]);

btnKey.forEach((btn) => {
  btn.addEventListener("click", insertKey);
});

/*
Logic :

1. How does a calculatot work?
  - When we input 1000, it will display :

  1000 (current input)

  - When we add the operator :
    1000 + (current input & operator)
  1000 (current input)

  - When we add the second input, 2000 :
    1000 +
  2000 (current input)

  - If we press = :
    1000 + 2000 = (prev input, operator, current input)
  3000 (result)

  - If we enter another input operator, x :
    3000 x
  3000 (result)

*/

/*
2. What are the Edge Cases?
  - Nothing except numbers should appear
  when we first open the calculator

  - When we press = before adding a second input,
  the current operation will be done by using the
  first input as both the first and second input.

  1000 + -> 1000 + 1000
  2000 x -> 2000 x 2000

  - TBA (To be added...)

*/
/*

3. How it the program going to work?
  - When we input the number 1000, we save it in
  an array called onGoingOperation

  onGoingOperation = [1000]


  
  - When we input an operator, lets say +, it will
  be save next to the onGoing operator at index 1, this
  array will also be printed as "1000 +"

    onGoingOperation = [1000, +]



  - When we input another number it will stored at
  index 2

    onGoingOperation = [1000, +, 2000]

  - If we instead, input a = sign, then the
  array will look like, 

    onGoingOperation = [1000, +, 1000]

  which then displays

  1000 + [first, operator]
  2000 [result]


  - If we press = then the array will be printed
  as a string "1000 + 2000 =" and the result
  "3000", after we display, we store the array in an object
  then reset to empty.

  Secondary : "1000 + 2000 =" [first, operator, second]
  Main : "3000" [result]

  onGoingOperation = []



  - If we press another operator, the array will NOT
  be printed, but in its place will be the result and
  inputed operator. at the bottom will be the new input

  Secondary : "3000 x" [result, new operator]
  Main : "6" [new first input]

  onGoingOperation = [3000, x]
*/
