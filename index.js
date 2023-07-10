/*
TO DO LIST:
IMPORTANT :
Fix how to calculator handles "." and "0", harus bikin chart dulu kayanya

1. find a way biar kalo ada e di hasilnya displaynya bisa bener
2. updateDisplay function masih need alot of work
3. Delete and reset button
4. responsive 


*/
// Selects the DOM elements
const changeThemeBtn = document.querySelector(
  ".btn__change-theme"
);
const changeThemeCircle =
  document.querySelector(".btn__states");

const mainDisplay = document.querySelector(
  ".display__main"
);
const subDisplay = document.querySelector(".display__sub");

const btnKey = document.querySelectorAll(".btn-key");

// Stores the value of an ongoing operation
let onGoingOperation = ["0", "", "0"];

// format -> [i, "operation"]  : "result"
// E.G   { "1)10,+,10": "20" }
let operationHistory = {};

// Keep track of which index our input should be on the onGoingOperation array
let onGoingIndex = 0;

// Place to store the repeat calculation function
let repeatCalc;

// This listener will detect every time we hit the "=" button, when we clicked it more than once than the repeatCalc function will be called
let equalsClicked = 0;

// Variabel that stores a state of whether the 2nd has been typed yet or not
let secondInput_Is_Filled = false;

// ===== CHANGE THEME ========
const theme_link = document.querySelector("#theme-link");
let theme_direction = "right",
  theme_index = 0;
const themes = ["dark", "white", "neon"];

//prettier-ignore
changeThemeBtn.addEventListener("click", function () {

  theme_direction === "right" ? theme_index++ : theme_index-- 
  
  
  changeThemeCircle.style.transform = `translateX(${112.5 * theme_index}%)`

  if (theme_index === 0) theme_direction = "right";
  if (theme_index === 2) theme_direction = "left";

  switchTheme(themes[theme_index])
});

function switchTheme(theme) {
  theme_link.setAttribute("href", `theme-${theme}.css`);
}

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
    //prettier-ignore
    //(if it contains a "." already or is still at the starting point then return)
    if (
      (key === "." && `${onGoingOperation[onGoingIndex]}`.includes(".")) ||
      (key === "0" && onGoingOperation[onGoingIndex] === "0" && isTheSame(onGoingOperation, ["0","","0"])) ||
      (onGoingOperation[onGoingIndex].length === 12)
    ) 
      return;

    // replace the default "0" when inputting any numbers other than "."
    if (
      onGoingOperation[onGoingIndex] === "0" &&
      key !== "."
    )
      onGoingOperation[onGoingIndex] = null;

    // if its empty then add "" + key else current + key
    onGoingOperation[onGoingIndex] =
      (onGoingOperation[onGoingIndex] || "") + key;

    if (onGoingIndex === 2) secondInput_Is_Filled = true;

    const [first = "", operator = "", second = first] =
      onGoingOperation;

    //prettier-ignore
    // coming from the destructured ongoing operation array
    updateDisplay(onGoingOperation[onGoingIndex], [
      first,
      operator,
    ]);

    // We have broken the streak of pressing the equal button
    equalsClicked = 0;
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
    // If the onGoing array is filled with numbers that are not the default value, then proceed
    if (
      onGoingOperation.length === 3 &&
      onGoingOperation[2] !== "0"
    ) {
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

    // If we're not pressing the "=" in succession, then proceed
    // detects if there are operators added, if none then the function stops but if yes the proceed to calculate normally
    if (onGoingOperation[1] === "") return;

    if (
      (onGoingOperation[2] === "0") &
      !secondInput_Is_Filled
    ) {
      onGoingOperation[2] = onGoingOperation[0];
      calculateResult(historyLength);
      return;
    }

    calculateResult(historyLength);
  }

  if (key === "DEL") {
    onGoingOperation[onGoingIndex] =
      onGoingOperation[onGoingIndex].length === 1
        ? "0"
        : onGoingOperation[onGoingIndex].slice(0, -1);

    const [first = "", operator = "", second = first] =
      onGoingOperation;

    //prettier-ignore
    // coming from the destructured ongoing operation array
    updateDisplay(onGoingOperation[onGoingIndex], [
    first,
    operator,
  ]);

    // We have broken the streak of pressing the equal button
    equalsClicked = 0;
  }

  if (key === "RESET") {
    onGoingOperation = ["0", "", "0"];
    operationHistory = {};
    onGoingIndex = 0;
    equalsClicked = 0;
    secondInput_Is_Filled = false;

    mainDisplay.textContent = 0;
    subDisplay.textContent = "";
  }

  // Check if the ongoing array is empty or not and whether a calculation has been done
  function onGoingIsEmpty() {
    return isTheSame(onGoingOperation, ["0", "", "0"]) &&
      historyLength > 0
      ? true
      : false;
  }

  // ====== checking ===========
  // console.log(onGoingOperation, secondInput_Is_Filled);
}

function repeatCalculation(incrementBy) {
  return function (historyLength) {
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

// This function will test is arr1 and arr2 are equal
function isTheSame(arr1, arr2) {
  return arr1.every((val, i) => val === arr2[i]);
}

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
  onGoingOperation = ["0", "", "0"];
  secondInput_Is_Filled = false;

  // Reset ongoing index position
  onGoingIndex = 0;
}

// This function handles the display update on the DOM
function updateDisplay(main, secondary = []) {
  // destructure the secondary array
  const [subFirst = "", subOperator = "", subSecond = ""] =
    secondary;

  // Formats and updates the main display text
  mainDisplay.textContent = formatNumber(main);

  // Formats and updates the sub display text
  subDisplay.textContent = `${formatNumber(
    subFirst
  )} ${subOperator} ${formatNumber(subSecond)} ${
    secondary.length === 3 ? "=" : ""
  }`;
}

// Formats the number but without any rounding
//prettier-ignore
function formatNumber(num) {
  if(num == NaN) return "Error"
  if(num == Infinity) return "Infinity"
  if (num === "0.") return num;


  let result = [];
  let [number, comma] = num.includes("-") ? num.slice(1).split(".") : num.split(".") ;
  for (let i = number.length - 1; i >= 0; i--) {
    result.unshift(number[i]);
    if (!((number.length - i) % 3)) result.unshift(",");
  }

  comma = comma ? `.${comma}` : "";


  let answer = `${(number.length % 3 === 0 ? result.slice(1) : result).join("")}${comma}`;

  if(answer.includes("e")) answer = formatNumberWithE(answer)

  return `${num.includes("-") ? "-" : ""}${answer}`;
}

// console.log(formatNumber("-500"));

// Fromat but with big numbers that contains "e"
//prettier-ignore
function formatNumberWithE(num) {
  const [num_e, power_e] = num.split("e");
  if (num_e.length + power_e.length < 16) return num;
  return `${Number(num_e).toFixed(16 - (power_e.length + 4))}e${power_e}`;
}

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

/*TO DO

Weird behaviours

V when pressing the equal button subsquently after doing calculations it will repeat the same calculation with the same second input but different first
200 + 200 = 400 -> 400 + 200 = 600 -> 600 + 200 -> 1000 + 200 = 1200 -> 1200 + 200 = etc...

V When pressing the equal number before adding a second input, the second input will default to the first
200 + ... -> 200 + 200

V placing alot of zeros after a comma does not display on the screen
5.0000 -> 5

V on the second input, adding a dot without any numbers next to it won't display on the screen
2. -> 2 (on the screen)


*/
