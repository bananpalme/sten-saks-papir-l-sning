//opret server med express
const express = require('express')
//Vi opretter en variablen APP som indeholder server biblioteket
const app = express()
//Vælg en port
const port = 4444
//Sig at appen skal serve mappen public
app.use('/', express.static('public'))
//Set appen til at lytte på porten 
const server = app.listen(port, ()=>{
    console.log('server lytter på adressen: http://localhost:' + port)
})
//opret en socket  - hent et socket bibliotek
const io = require('socket.io')
//serveres hoved walkie talkie som 1000ner af kklineter kan snakke igennem
const serverSocket = io(server)

//serverens variabler til at holde styr på hvor i spillet vi er nået til
let gotName = 0, gotChoice = 0

//players arrayet er serverens sted til at holde styr på de to spillere
let players = []


//al snak med klienterne sker på connection
serverSocket.on('connection', socket => {
    //tjek om der er plads til flere spillere 
    //hvis ikke, send join, false
    if(players.length >= 2){
        console.log('der var ikke plads til: ' + socket.id)
        socket.emit('join', false)
        //luk spillerens socket
        socket.disconnect()
    }else{
        //ellers tilføj spillere til players array
        players.push({ 'id':socket.id, points:0})
        //og send join, true
        socket.emit('join', true)        
        console.log('ny spiller: ' + socket.id)
        console.log('Der er nu ' + players.length + ' spillere')
        console.log('Hvoraf ' + players.filter(p=>p.name).length + ' har indtastet deres navn')    
    }
    
    //modtag spillernavne
    socket.on('name', name => {
        //find retunere DET FØRSTE element der lever op til en betingelse
        let thisPlayer = players.find( p => p.id == socket.id )
        //indsæt navnet i objektet i players array 
        thisPlayer.name = name
        //hvad hvis der to med det samme navn
        let otherPlayer = players.find( p => p.id != socket.id)
        if(otherPlayer && (otherPlayer.name == thisPlayer.name)){
            thisPlayer.name = 'Klunkesmager-' + thisPlayer.name
        }
        //registrer at vi har modtaget et navn til - læg 1 til navnetæller
        gotName ++
        console.log('Fik navn: ' + name, ' Vi har nu ' + gotName + ' navn(e)')        
        //hvis vi har modtaget BEGGE navne, start spil 
        if(gotName == 2){
            console.log('got both names, ready to play')
            serverSocket.emit('play', true)

        } 
    })

    //lav timer på 10 sekunder
    socket.on('playTime', ()=>{
        let time = 10

        const myInterval = setInterval( ()=>{
            serverSocket.emit('time', time)
            time--
            if(time==0){
                //stop spillet
                clearInterval(myInterval)
                let winner = players[0].name
                if(players[0].points == players[1].points) winner = 'ingen'
                if(players[0].points < players[1].points) winner = players[1].name
                serverSocket.emit('result', winner)
                
            }
        }, 1000)
    })

    socket.on('click', ()=>{

        let thisPlayer = players.find( p => p.id == socket.id)
        thisPlayer.points++
        serverSocket.emit('status', players)
        console.log('modtog klik' + thisPlayer.name, players)
    })

    //modtag kliks fra begge spillere
    //indsæt resultat i players array
    //er tiden gået?
    //beregn resultat
    //send resultat



    //håndter disconnect - hvis en spiller lukker sin side
    socket.on('disconnect', ()=>{
        console.log('Player disconnected opdaterer array ')
        //fjern spilleren fra players array
        players = players.filter( p => p.id != socket.id)
        //find ud af om der er flere spillere tilbage, og sæt navnetælleren
        gotName = players.filter(p => p.name).length 
        //set valgtælleren til nul
        gotChoice = 0
        //send eventuel spiller tilbage til start 
        serverSocket.emit('join', true)
        console.log('Har fjernet spiller', players, 'Der er ' + gotName + ' spillere tilbage, som har indtastet navn')
    })

    //håndter 'nyt spil' knap
    socket.on('restart', ()=>{
        console.log('Restarting game, same players ')
        players.map(p =>{
            p.points = 0
        })
        
        //start spil
        serverSocket.emit('play', true)
    })
})