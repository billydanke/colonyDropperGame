c = document.getElementById('main');
ctx = c.getContext('2d');
consoleText = document.getElementById('consoleText');
responseBar = document.getElementById('responseBar');

populationElement = document.getElementById('population');
probeElement = document.getElementById('probes');
pScanner = document.getElementById('pscanner');
moisture = document.getElementById('moisture');
atmosphere = document.getElementById('atmosphere');
hull = document.getElementById('hull');
propulsion = document.getElementById('propulsion');
electric = document.getElementById('electric');

wearVals = [100,100,100,100,100,100];
populationCount = 200;
probeCount = 4;

c.width = window.innerWidth;
c.height = window.innerHeight;

shipImg = new Image();
shipImg.src = 'gfx/colonyShip.png';
var colonyShip;

planetList = [];
var activePlanet;
var hasArrived = false;

var skipBtn;
var probeBtn;
var landBtn;

var starList = [];
var years = 3;
var uncheckedEnd = true;

var starTransition = false;

function makeText(x,y,txt,font,color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = 'hanging';
  ctx.fillText(txt,x,y);
}

function generateStars() {
  starList = [];
  for(let i=0; i<100; i++) {
    starList.push(new Star(Math.floor(Math.random() * c.width),Math.floor(Math.random() * c.height)));
  }
}

function generatePlanets() {
  for(let i=0; i<planetImgList.length; i++) {
    planetList.push(new Planet(800,-300,planetImgList[i],10,false));
  }
  for(let i=0; i<planetList.length; i++) {
    // Populate Planet Elements
    planetList[i].description = descList[i];
    planetList[i].surfaceScan = pScanList[i];
    planetList[i].moistureScan = moistureList[i];
    planetList[i].atmosphereScan = atmosList[i];
    planetList[i].probeResult = probeResultsList[i];
    planetList[i].landingSuccess = landingSuccList[i];
    planetList[i].landingFailure = landingFailList[i];
  }
}

function resizeScreen() {
  generateStars();

  colonyShip.x = window.innerWidth/2;
  colonyShip.y = window.innerHeight/2;
}

var writingQueue = [];
function consoleWrite(interval) {
  var i=0;
  var txt = writingQueue[0];
  var writing = setInterval(function(){
    txt = writingQueue[0];
    if(writingQueue.length > 0) {
      consoleText.innerHTML += writingQueue[0][i];
      i++;
      if(i >= txt.length) {
        writingQueue.splice(0,1);
        i = 0;
        txt = writingQueue[0];
        consoleText.innerHTML += '<br>';
      }
    }
  }, interval);
}

function waitForWriteEmpty(func) {
  var emptyCheck = setInterval(function(){
    if(writingQueue.length == 0) {
      clearInterval(emptyCheck);
      func();
    }
  }, 1000);
}



function draw() {
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  // Clear Screen
  ctx.clearRect(0,0,c.width,c.height);

  // Draw All Stars
  for(let i=0; i<starList.length; i++) {
    starList[i].draw();
  }

  // Draw Planets
  for(let i=0; i<planetList.length;i++) {
    planetList[i].draw();
  }

  // Draw Colony Ship
  colonyShip.draw();
  //console.log("Colony ship drawn")

  // Draw Time in Years
  makeText(20, 20, ("Year " + years.toString()), 'bold 48px monospace', 'white');
}

window.addEventListener('resize', resizeScreen);

function enableButton(button, func) {
  button.disabled = false;
  button.addEventListener('click', func, false);
}

function wearParts() {
  for(let i=0; i< wearVals.length; i++) {
    if(Math.random() < 0.05) {
      wearVals[i] -= 1
    }
  }
  runDiagnostics();
}

function runDiagnostics() {
  populationElement.innerHTML = populationCount;
  probeElement.innerHTML = probeCount;

  pScanner.value = wearVals[0].toString();
  moisture.value = wearVals[1].toString();
  atmosphere.value = wearVals[2].toString();
  hull.value = wearVals[3].toString();
  propulsion.value = wearVals[4].toString();
  electric.value = wearVals[5].toString();
}

function printPlanetDescriptions() {
  writingQueue.push(activePlanet.description);

  writingQueue.push(" ");

  if(Math.random() < (wearVals[0] / 100)) {
    writingQueue.push("Surface Scan: " + activePlanet.surfaceScan);
  } else {
    writingQueue.push("Surface Scan Inconclusive");
  }

  if(Math.random() < (wearVals[1] / 100)) {
    writingQueue.push("Moisture Scan: " + activePlanet.moistureScan);
  } else {
    writingQueue.push("Moisture Scan Inconclusive");
  }

  if(Math.random() < (wearVals[0] / 100)) {
    writingQueue.push("Atmospheric Scan: " + activePlanet.atmosphereScan);
  } else {
    writingQueue.push("Atmospheric Scan Inconclusive");
  }
}

function sleepMode(sleepTime=30) {
  starTransition = true;

  if(activePlanet != null) {
    activePlanet.inTransition = true;
  }
  var time = 0;

  responseBar.innerHTML = "";
  consoleText.innerHTML = "";

  var incrementYears = setInterval(function() { years++; wearParts(); }, 20);

  var transOutCheck = setInterval(function(){
    if(uncheckedEnd == false) {
      clearInterval(transOutCheck);
      clearInterval(wait);
    }
    if(activePlanet == null || activePlanet.inTransition == false) {
      clearInterval(transOutCheck);
      
      var wait = setInterval(function(){
        time++;
        if(time >= sleepTime) {
          clearInterval(wait);
          clearInterval(incrementYears);
          if(planetList.length > 1) {
            nextPlanet();
          } else {
            gameOver("endOfTheLine");
          }
        }
      }, 100);
    }
  }, 1000);
}

function nextPlanet() {
  console.log("planet");
  // Clear console
  responseBar.innerHTML = "";
  consoleText.innerHTML = "";

  starTransition = false;

  writingQueue.push("Your systems reactivate as long-range sensors detect a potentially habitable world. Your guidance systems successfully park the ship in orbit.");
  writingQueue.push(" ");

  // pick a random planet from the list
  if(activePlanet != null) {
    planetList.splice(planetList.indexOf(activePlanet),1);
  }

  try {
    activePlanet = planetList[Math.floor(Math.random() * planetList.length)];
  } catch(error) {
    gameOver("endOfTheLine");
    return null;
  }

  // trigger planet transition in
  activePlanet.isDrawn = true;
  activePlanet.inTransition = true;

  console.log(activePlanet);

  // print out the description and characteristics and display the button options
  var transCheck = setInterval(function(){
    if(activePlanet.inTransition == false) {
      clearInterval(transCheck);
      printPlanetDescriptions();

      skipBtn = responseBar.appendChild(document.createElement("button"));
      skipBtn.innerHTML = "Skip Planet";
      skipBtn.disabled = true;
      waitForWriteEmpty(function(){ enableButton(skipBtn,function() {sleepMode(3)}) });

      probeBtn = responseBar.appendChild(document.createElement("button"));
      probeBtn.innerHTML = "Send a Probe";
      probeBtn.disabled = true;
      waitForWriteEmpty(function(){ if(probeCount > 0) {enableButton(probeBtn,sendProbe)} });

      landBtn = responseBar.appendChild(document.createElement("button"));
      landBtn.innerHTML = "Plant Colony";
      landBtn.disabled = true;
      waitForWriteEmpty(function(){ enableButton(landBtn,landShip) });
    }
  }, 1000);
  // button options should be Skip Planet, Drop Probe, and Colonize Planet
}

function sendProbe() {
  // Disable Probe button and subtract 1 probe
  probeBtn.disabled = true;
  probeCount -= 1;
  runDiagnostics();

  // Do probe animation

  // Write probe text
  writingQueue.push(" ");
  writingQueue.push(activePlanet.probeResult);
}

function landShip() {
  // Remove all buttons and clear console
  responseBar.innerHTML = "";
  consoleText.innerHTML = "";

  // Do land ship animation

  // Write ship landing text for passing or failing based on some formula from the hull, propulsion, and electrical.
  if(Math.random() < ((wearVals[3] + wearVals[4] + wearVals[5]) / 300) - 0.2) {
    // Sucessful landing
    writingQueue.push(activePlanet.landingSuccess);
    gameOver("success");
  } else {
    // Failed landing
    writingQueue.push(activePlanet.landingFailure);
    gameOver("crash");
  }
}

function gameOver(endType) {
  uncheckedEnd = false;
  responseBar.innerHTML = "";

  // Do game over stuff
  console.log("game over");

  if(endType == "success") {
    writingQueue.push("Congradulations! To replay, just refresh the page.");
  }
  else if(endType == "crash") {
    writingQueue.push("Game Over! To replay, just refresh the page.");
  }
  else if(endType == "endOfTheLine") {
    writingQueue = [];
    consoleText.innerHTML = "";
    responseBar.innerHTML = "";
    writingQueue.push("Your ship sputters on for a time, the AI working to find any resemblance of a home for humanity. However, no one can cheat time. As the fuel runs low, the powerbanks run dry, and cosmic rays slowly degrade the AI's mind, the cryo-pods begin to fail, thawing the remaining colonists. the AI, in all its pickiness, has failed its mission, and humanity is doomed to die alone in the endless depths of space.");
    writingQueue.push("Game Over! Congradulations on somehow making it to the hardest ending of the game. To replay, just refresh the page.");
  }
  else if(endType == "hull") {
    writingQueue = [];
    consoleText.innerHTML = "";
    responseBar.innerHTML = "";
    writingQueue.push("The AI begins to notice rapid fluctuations in the onboard pressure regulator. It seems the cracks in the hull are beginning to widen, and pressure is escaping. Immediately jumping into action, the AI tries to save the colonists by sealing off the oxygen pumps into their cryo-pods. However, the ship is beyond repairing, and as time goes on the colonists suffocate in their pods one by one until none remain.");
    writingQueue.push("Game Over! To replay, just refresh the page.");
  }
  else if(endType == "propulsion") {
    writingQueue = [];
    consoleText.innerHTML = "";
    responseBar.innerHTML = "";
    writingQueue.push("The AI finds many potentially suitable planets along its course. However, the ship's propulsion system is no longer functioning. Unable to perform a deceleration burn, the ship continues on aimlessly, drifting forever into that endless nothingness.");
    writingQueue.push("Game Over! To replay, just refresh the page.");
  }
  else if(endType == "electrical") {
    writingQueue = [];
    consoleText.innerHTML = "";
    responseBar.innerHTML = "";
    writingQueue.push("The AI never saw its own end coming. Deep in its sleep mode, it never detected the sudden power failure that shut down the main computer and cryo-freezing units. The colonists slowly thaw, awakening with many questions and no answers from the dead AI. But with the power gone, so too was the oxygen regulator. Those who survived the thawing process waited in their sealed pods in agony as they slowly suffocated.");
    writingQueue.push("Game Over! To replay, just refresh the page.");
  }
  else if(endType == "outOfPop") {
    writingQueue = [];
    consoleText.innerHTML = "";
    responseBar.innerHTML = "";
    writingQueue.push("The AI, working its hardest to preserve the lives onboard its vessel, has succeeded for many years. However, today marks the day that the last colonist onboard is now dead. With the AI realizing its failure, and that its mission is now impossible, it simply shuts down");
    writingQueue.push("Game Over! To replay, just refresh the page.");
  }
}

function endGameCheck() {
  if(wearVals[3] <= 0 && uncheckedEnd) {
    // Write hull death message and game over
    gameOver("hull");
  }

  if(wearVals[4] <= 0 && uncheckedEnd) {
    // Write propulsion death message and game over
    gameOver("propulsion");
  }

  if(wearVals[5] <= 0 && uncheckedEnd) {
    // Write electrical death message and game over
    gameOver("electrical");
  }
}

function intro() {
  consoleText.innerHTML = "";
  writingQueue.push("Flight Time: T + 3 Years, 5 months, 23 days, 6 hours, 16 minutes, 14 seconds.");
  writingQueue.push("Hull: Heavy Machinery (Colony Deployment Unit), Human Cargo (Deep Freeze x200), Probes (x4).");
  writingQueue.push("Mission Objective: Locate suitable planetary candidate for colonization.");
  writingQueue.push("Self Designation: Cosmo AI Flight Control Unit.");

  var diagnosticsBtn = responseBar.appendChild(document.createElement("button"));
  diagnosticsBtn.innerHTML = "Run System Diagnostics";
  diagnosticsBtn.disabled = true;
  waitForWriteEmpty(function(){ enableButton(diagnosticsBtn,intro2) });
}

function intro2() {
  consoleText.innerHTML = "";
  responseBar.innerHTML = "";
  runDiagnostics();
  writingQueue.push("Performing routine self-diagnostics tests...")

  consoleText.innerHTML = "";
  writingQueue.push("Self-diagnostics complete. All systems functional.");
  writingQueue.push("Returning to sleep mode...          ");
  waitForWriteEmpty(function(){ sleepMode() });
}

function logicLoop() {
  
  endGameCheck();

  if(starTransition) {
    for(let i=0; i<starList.length; i++) {
      starList[i].move(3);
    }
  }

  if(uncheckedEnd) {
    if(activePlanet != null && activePlanet.inTransition == true && hasArrived == false) {
      activePlanet.transition(colonyShip.y);
    }
  
    if(activePlanet != null && activePlanet.inTransition == true && hasArrived == true) {
      activePlanet.transition(window.innerHeight);
    }
  
    if(activePlanet != null) {
      activePlanet.x = 3 * window.innerWidth / 4
    }
    if(activePlanet != null && activePlanet.inTransition == false && hasArrived) {
      activePlanet.y = colonyShip.y;
    }
  }

  draw();
  requestAnimationFrame(logicLoop);
}

function startup() {

  generateStars();
  generatePlanets();

  colonyShip = new Sprite(window.innerWidth/2,window.innerHeight/2,shipImg,8,true)

  consoleWrite(30);
  responseBar.innerHTML = "";

  intro();

  requestAnimationFrame(logicLoop);
}

shipImg.onload = function() {
  startup();
}
//startup();
