let clientSocket
let currentPage = '#lobby'
let nameInput, nameButton, myName, rejectButton, lobbyText, timer, winner, restartButton, rejectPicture, loadingGIF, playPicture, player1, player1Name, player1Score, player2, player2Name, player2Score, resultPicture 

function setup(){
  noCanvas()
  //log på serveren 
  clientSocket = io.connect()
  initVars()
  shiftPage('#result')


  //få besked om du er med eller om du må vente
  clientSocket.on('join', ok => {
    if(ok){
      console.log('got ok to join, showing namepage')
      shiftPage('#name')
    }else{
      shiftPage('#reject')
    }
  })

  //håndter reject
  rejectButton.mousePressed(()=>{
    window.location.reload()
  })

  //håndter navn
  nameButton.mousePressed(()=>{
    if(nameInput.value() != ''){
      clientSocket.emit('name', nameInput.value())
      myName.html(nameInput.value())
      lobbyText.html('Venter på spillere')
      shiftPage('#lobby')
    }else{
      confirm('indtast et navn')
    }
    
    
    
  })

  //start spil
  clientSocket.on('play', () => {
    console.log('got play, starting game')
    shiftPage('#play')
    clientSocket.emit('playTime')
  })
  
  //send kliks når palmen klikkes
  playPicture.mousePressed(()=>{
    clientSocket.emit('click')
    console.log('klikker')
  })
  //her vises navnet på de 2 spillere og deres points/kliks når de klikker på palmen
  clientSocket.on('status', players =>{
    player1Name.html(players[0].name)
    player1Score.html(players[0].points + '🍌')
    player2Name.html(players[1].name)
    player2Score.html(players[1].points + '🍌')
  })
  //her ser klienterne en timer der starter på 10 og går til 0 som bliver opdateret hvert sekund
  clientSocket.on('time', count =>{
    timer.html(count)
    console.log(count)
  })
  // her ser klienterne deres resultat og hvem der har vundet og fået flest kliks
  clientSocket.on('result', w => {
    winner.html(w)
    console.log('got result, winner is ', w)
    shiftPage('#result')
    //her kan players trykke på restart button og når det sker fjenes deres points biver visuelt sat til 0
    restartButton.mousePressed(()=>{
      player1Score.html('0🍌')
      player2Score.html('0🍌')
      clientSocket.emit('restart')
      
    })
    
  })

}

function shiftPage(pageId){
  select(currentPage).removeClass('show')
  select(pageId).addClass('show')
  currentPage = pageId
}

function initVars(){
  nameInput = select('#nameInput')
  nameButton = select('#nameButton')
  myName = select('#myName')
  rejectButton = select('#rejectButton')
  lobbyText = select('#lobbyText')
  timer = select('#timer')
  player1 = select('#player1')
  player1Name = select('#player1Name')
  player1Score = select('#player1Score')
  player2 = select('#player2')
  player2Name = select('#player2Name')
  player2Score = select('#player2Score')
  winner = select('#winner')
  restartButton = select('#restartButton')
  rejectPicture = select('#rejectPicture')
  loadingGIF = select('#loadingGIF')
  playPicture = select('#playPicture')
  resultPicture = select('#resultPicture')
}

