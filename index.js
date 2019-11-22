"use strict";

(function() {

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let buffer, successSFXBuffer, failureSFXBuffer;
    let gainNode = ctx.createGain();
    let gainNode2 = ctx.createGain();
    let gainNode3 = ctx.createGain();
    let gainNodeMaster = ctx.createGain();

    const score = document.querySelector('.score'),
          lives = document.querySelector('.lives'),
          startGameBtn = document.querySelector('.start-game-btn'),
          startGameDisplay = document.querySelector('.start-game-display'),
          questionAndAnswerDisplay = document.querySelector('.question-answer-display'),
          scoreWrapper = document.querySelector('.score-wrapper'),
          livesWrapper = document.querySelector('.lives-wrapper'),
          volumeControl = document.querySelector('.volume-control'),
          questionCount = document.querySelector('.question-count'),
          whoIsThis = document.querySelector('.who-is-this'),
          playGame = document.querySelector('.play-game'),
          btnGroup = playGame.querySelector('.btn-group'),
          gameOverDisplay = document.querySelector('.game-over'),
          container = document.querySelector('.container'),
          gameOverSFX = document.createElement('audio'),
          img = document.createElement('img');
    
    let scoreCount = 0,
        questionCountCounter = 1,
        livesCount = 3,
        currentTrack;

        gameOverSFX.src = './audio/sfx/game_over/Cutting Power.mp3';
        
    score.textContent = scoreCount;
    questionCount.textContent = `${questionCountCounter}/10`;
    lives.textContent = livesCount;

    volumeControl.addEventListener('click', function () {
        gainNodeMaster.gain.value === 0.0010000000474974513? gainNodeMaster.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.2) :
                                                             gainNodeMaster.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        const iconElement = this.querySelector('i');
        iconElement.classList.toggle('fa-volume-up');
        iconElement.classList.toggle('fa-volume-off');
    })

    const guitaristNames = tracks.map(track => track.name),
          setupButtons = () => randomBtnAppend(createCorrectButton(currentTrack), createWrongButton()),
          getRandomTrack = () => tracks[Math.floor(Math.random() * tracks.length)],
          getRandomName = (arr) => arr[Math.floor(Math.random() * guitaristNames.length)];

    function init() {
        gameOverSFX.muted = true; 
        startGameDisplay.style.display = 'none';
        whoIsThis.style.display = playGame.style.display = container.style.display = 'block';
        gameOverDisplay.textContent = '';
        scoreCount = 0;
        livesCount = 3;
        lives.textContent = livesCount;
        score.textContent = scoreCount;
        questionCountCounter = 1;
        questionCount.textContent = `${questionCountCounter}/10`;
        removeButtons();
        removeClassNames();
        setRandomTrack();
        setupButtons();
        removeNameText();
    }

    function removeButtons(){
        removeClassNames();
        Array.from(btnGroup.children).forEach(child => {
            child.tagName === 'BUTTON' ? btnGroup.removeChild(child) : null            
        })
    }

    function disableButtons() {
        Array.from(btnGroup.children).forEach(child => {
            child.tagName === 'BUTTON' ? child.style.display = 'none' : null
        })
    }

    function getAudioData(path, bufferSrc){
         fetch(path)
            .then((data) => data.arrayBuffer())
            .then((data) => ctx.decodeAudioData(data,
                        data => {
                            bufferSrc.buffer = data;
                            bufferSrc.start();
                        },
                        error => {
                            console.error(error)
                        }))
    }

    function setRandomTrack(){
        currentTrack = getRandomTrack();
        buffer = ctx.createBufferSource();
        getAudioData(`./audio/cuts/${currentTrack.fileName}`, buffer);
        buffer.loop = true;
        buffer.connect(gainNode);
        gainNode.gain.setValueAtTime(1, ctx.currentTime)
        gainNode.connect(gainNodeMaster);
        gainNodeMaster.connect(ctx.destination);
    }

    function displayImage(){
        img.style.display = 'block';
        img.src = `./images/optimized/${currentTrack.image}`;
        img.style.width = "300px";
        img.style.height = "300px";
        questionAndAnswerDisplay.appendChild(img);
    }

    function displayName(){
        const h3 = document.createElement('h3');
        h3.classList.add('name-display');
        h3.textContent = currentTrack.name;
        questionAndAnswerDisplay.appendChild(h3);
    }
    
    function removeClassNames(){
        scoreWrapper.className = '';
        livesWrapper.className = '';
    }

    function revealCorrectAnswer(){
        displayImage();
        displayName();
        gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.030);
        buffer.stop(ctx.currentTime + 0.030);
    }
    
    function setupNextQuestion(){
        revealCorrectAnswer();
        setTimeout(() => {
            if(questionCountCounter === 10) {
                removeNameText();
                setGameOver();
            } else{
                questionCount.textContent = `${questionCountCounter += 1}/10`;
                whoIsThis.style.display = 'block';
                img.style.display = 'none';
                removeNameText();
                setRandomTrack();
                removeButtons();
                setupButtons();
            }}, 2000)
    }

    function removeNameText(){
        Array.from(questionAndAnswerDisplay.children).forEach((child) => {
            child.tagName === 'H3'? questionAndAnswerDisplay.removeChild(child) : null
        })
    }

    function setGameOver(){
        revealCorrectAnswer();
        setTimeout(() => {
            gameOverSFX.muted = false;
            gameOverSFX.play();
            img.style.display = playGame.style.display = 'none';
            gameOverDisplay.innerHTML = `<h1>Game Over<h1>
                                        <h2>Final Score: ${scoreCount}<h2>`
                 gameOverDisplay.classList.add('game-over-display')
            createPlayAgainButton();
        }, 2000)
    }

    function startGame(){
        img.style.display = playGame.style.display  = 'none';
        startGameBtn.addEventListener('click', () => {
        ctx.resume()
            .then(() => init())
        });
    }

    function createPlayAgainButton(){
        const button = document.createElement('button');
        button.innerHTML = `
                <i class="fa fa-play" aria-hidden="true"></i>
                <span>Play Again?</span>`;
        button.classList.add('play-again-btn');
        gameOverDisplay.appendChild(button);
        button.addEventListener('click', () => init());
    }

    function createCorrectButton(currentTrack){
        const button =  document.createElement('button');
        button.textContent = `${currentTrack.name}`;
        button.addEventListener('click', () => {
                successSFXBuffer = ctx.createBufferSource();
                getAudioData('./audio/sfx/success/gregg-omnisphere5.mp3', successSFXBuffer);
                successSFXBuffer.start();
                gainNode2.gain.setValueAtTime(1, ctx.currentTime);
                successSFXBuffer.connect(gainNode2);
                gainNode2.connect(gainNodeMaster);
                gainNodeMaster.connect(ctx.destination);
                disableButtons();
                img.src = '';
                whoIsThis.style.display = 'none';
                scoreWrapper.classList.add('success');
                score.textContent = scoreCount += 100;;
                setupNextQuestion();
            }, { once: true })
            return button;
    }

    function createWrongButton() {
        const button = document.createElement('button');
        while (!button.textContent) {
            let randomName = getRandomName(guitaristNames);
            if (randomName !== currentTrack.name) {
                button.textContent = randomName;
            }
        }
        button.addEventListener('click', () => {
            failureSFXBuffer = ctx.createBufferSource();
            getAudioData('./audio/sfx/failure/2_DANCE_FX_DANCE_1_003.mp3', failureSFXBuffer);
            failureSFXBuffer.start();
            gainNode3.gain.setValueAtTime(1, ctx.currentTime);
            failureSFXBuffer.connect(gainNode3);
            gainNode3.connect(gainNodeMaster);
            gainNodeMaster.connect(ctx.destination);
            disableButtons();
            img.src = '';
            whoIsThis.style.display = 'none';
            livesWrapper.classList.add('failure');
            livesCount -= 1;
            if(livesCount === 0){
                lives.textContent = 0;
                setGameOver();
            } else{
                lives.textContent = livesCount;
                setupNextQuestion();
            }
        }, {once: true})
        return button;
    }

    function randomBtnAppend(...buttons) {
        const shuffledBtns = _.shuffle([...buttons]);
        shuffledBtns.forEach(btn => btnGroup.appendChild(btn));
    }

    startGame()
 })();