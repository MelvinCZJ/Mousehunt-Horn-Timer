//background.js

let countdownInterval;
let remainingSeconds = 0;

// Preset badge appearance values
const badgeBackgroundColor = [0, 0, 0, 255]; // Black background
const badgeTextColor = "#ffffff"; // White text color

// Set badge style
chrome.action.setBadgeBackgroundColor({ color: badgeBackgroundColor });
chrome.action.setBadgeTextColor({ color: badgeTextColor });

// Function to update the extension icon badge with the countdown
function updateBadge(text) {
  chrome.action.setBadgeText({ text: text });
}

// Function to convert time to minutes and seconds
function timeInMinutesAndSeconds(seconds) {
  const minute = Math.floor(seconds / 60);
  const second = seconds % 60;
  return `${minute}:${second < 10 ? "0" : ""}${second}`;
}

// Function to get remaining seconds
function getRemainingSeconds() {
  return remainingSeconds;
}

// Define a fixed horn notification ID
const hornNotificationId = "horn_notification_id";

// Function to create horn notification
function createHornNotification() {
  chrome.notifications.clear(hornNotificationId, function () {
    chrome.notifications.create(hornNotificationId, {
      type: "basic",
      title: "MouseHunt Horn Is Ready!",
      message: "Click here to go back to Mouse Hunt!",
      iconUrl: "icons/air-horn.png",
    });
  });
}

// Function to create error notification
function createErrorNotification(errorMessage) {
  chrome.notifications.create(
    {
      type: "basic",
      title: errorMessage,
      message: "Please inform the Dev at:",
      iconUrl: "icons/air-horn.png",
    },
    function () {}
  );
}

// Function to redirect to MouseHunt tab if it exists, otherwise create a new tab
function redirectToMouseHunt() {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({}, function (tabs) {
      var foundTab = false;
      tabs.forEach(function (tab) {
        if (
          tab.url &&
          tab.url.includes("https://www.mousehuntgame.com/camp.php")
        ) {
          foundTab = true;
          if (!tab.active || tab.windowId !== currentWindow.id) {
            chrome.windows.update(tab.windowId, { state: "maximized" });
            chrome.tabs.update(tab.id, { active: true });
          } else if (tab.state === "minimized") {
            chrome.windows.update(tab.windowId, { state: "maximized" });
          }
        }
      });
      if (!foundTab) {
        if (tabs.length === 0) {
          chrome.windows.create({
            url: "https://www.mousehuntgame.com/camp.php",
          });
        } else {
          tabs.forEach(function (tab) {
            if (tab.state === "minimized") {
              chrome.windows.update(tab.windowId, { state: "maximized" });
            }
          });
          chrome.tabs.create({ url: "https://www.mousehuntgame.com/camp.php" });
        }
      }
    });
  });
}

// Add listener for button clicks
chrome.notifications.onClicked.addListener(function () {
  redirectToMouseHunt();
});

// Function to start the countdown timer
function startCountdown(seconds) {
  remainingSeconds = seconds;
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      clearInterval(countdownInterval);
      remainingSeconds = 0;
      createHornNotification();
    }
    if (remainingSeconds > 0) {
      updateBadge(timeInMinutesAndSeconds(remainingSeconds));
    } else {
      updateBadge("Ready!");
    }
  }, 1000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener(function (message) {
  if (message.action === "startTimer") {
    const seconds = message.seconds;
    startCountdown(seconds);
  } else if (message.action === "errorBadge") {
    const errorMessage = message.errorMessage;
    updateBadge("Error");
    createErrorNotification(errorMessage);
  }
});

// Function to send a check horn message to content script
function sendCheckHornMessage() {
  chrome.tabs.query(
    { url: "https://www.mousehuntgame.com/*" },
    function (tabs) {
      var tab = tabs.find(function (tab) {
        return tab.active;
      });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, "check horn");
      }
    }
  );
}

// Define a listener function to check for horn sound
function checkCompletedRequests(details) {
  if (details.url.includes("activeturn.php")) {
    sendCheckHornMessage();
  }
}

// Add a listener to intercept all web requests from the MouseHunt site
chrome.webRequest.onCompleted.addListener(checkCompletedRequests, {
  urls: ["https://www.mousehuntgame.com/*"],
});