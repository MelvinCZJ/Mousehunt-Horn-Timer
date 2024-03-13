//content.js

// Function to convert time to seconds
function timeInSeconds(minutesAndSeconds) {
  const [minute, second] = minutesAndSeconds.split(":");
  return 60 * parseInt(minute) + parseInt(second);
}

// Function to send a message to the background script to start counting down from specified seconds
function sendStartMessage(seconds) {
  chrome.runtime.sendMessage({
    action: "startTimer",
    seconds: seconds,
  });
}

// Function to send a message to the background script to update badge to show error 
function sendErrorMessage(errorMessage) {
  chrome.runtime.sendMessage({
    action: "errorBadge",
    errorMessage: errorMessage
  });
}

// Function to delay the execution of input function by input delay in milliseconds
function delayExecution(func, delay) {
  setTimeout(func, delay);
}

// Function to check the countdown timer and send a message to the background script to start the countdown
function checkCountdown() {
  const divElementCountdown = document.querySelector(
    "[class$='huntersHornView__countdown']"
  );
  if (!divElementCountdown) {
    const errorMessage = "Countdown time missing!"
    sendErrorMessage(errorMessage);
    console.log(errorMessage);
    return;
  }
  const minutesAndSeconds = divElementCountdown.innerHTML;
  const seconds = timeInSeconds(minutesAndSeconds);
  sendStartMessage(seconds);
}

// Function to check countdown timer each time the horn is sounded
function checkCountdownOnHornSound() {
  const hornButton = document.querySelector(
    "[class^='huntersHornView__horn huntersHornView__']"
  );
  if (hornButton) {
    hornButton.addEventListener("click", () => {
      delayExecution(checkCountdown, 3000);
    });
  } else {
    const errorMessage = "Horn button missing!"
    sendErrorMessage(errorMessage);
    console.log(errorMessage);
  }
}

// Run on initial page visit
delayExecution(checkCountdown, 1000);

// Run on horn sound with one second delay to allow page to load before running
delayExecution(checkCountdownOnHornSound, 1000);
