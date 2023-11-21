const micBtn = document.querySelector('.voice-btn')
const speechRecognition = window.speechRecognition || window.webkitSpeechRecognition
const recognition = new speechRecognition();
const token = "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";






function computerSpeech(words){
  const speech = new SpeechSynthesisUtterance();
  speech.lang = 'eng-gb';
  speech.pitch = 1;
  speech.volume = 2;
  speech.text = words;
  speech.rate =1;
  speech.voice = speechSynthesis.getVoices().find((voice) => voice.name.includes('Amy'));
  window.speechSynthesis.speak(speech)

    // start speech recognition when speech ends
    speech.onend = () => {
        recognition.start();
    }
}






recognition.onstart = (event) =>{
    window.speechSynthesis.cancel()
    micBtn.classList.add('active')
    let message = `<div class="bot-msg listening"><span class="bot-img"><img src="assets/support.png" alt="bot profile image"></span><p>Listening...<i class='bx bx-user-voice'></i></p></div>`
    
    document.querySelector('.message-body').innerHTML+= message
    $('.message-body').scrollTop($('.message-body')[0].scrollHeight);
}
recognition.onend = (event) =>{
    micBtn.classList.remove('active')
    document.querySelector('.listening').remove()


}

recognition.onerror = (event) => {
    let errorMessage = '';
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Error capturing audio. Please check your microphone and try again.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please grant permission to use your microphone.';
        break;
      default:
        errorMessage = 'An error occurred. Please try again.';
        break;
    }

    document.querySelector('.message-body').innerHTML += `<div class="bot-msg"><span class="bot-img"><img src="assets/support.png" alt="bot profile image"></span><p>${errorMessage}</p></div>`;
    $('.message-body').scrollTop($('.message-body')[0].scrollHeight);
    computerSpeech(errorMessage);

  };
  
recognition.onresult = (event) => {
    const spokenWords = event.results[0][0].transcript;
    console.log(spokenWords);

    document.querySelector('.message-body').innerHTML += `<div class="user-msg"><p>${spokenWords}</p></div>`;
    $('.message-body').scrollTop($('.message-body')[0].scrollHeight);
  
    const requestData = {
      "model": "gpt-3.5-turbo-1106",
      "messages": [{ "role": "user", "content": spokenWords }]
  };

  
const makeRequest = async () => {
  try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
              'Content-type': 'application/json',
              'Authorization': 'Bearer ' + token,
          },
          body: JSON.stringify(requestData)
      });

      if (!response.ok) {
          throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
       const   answer = data.choices[0].message.content;

       document.querySelector('.message-body').innerHTML += `<div class="bot-msg"><span class="bot-img"><img src="assets/support.png" alt="bot profile image"></span><p>${answer}</p></div>`;

       $('.message-body').scrollTop($('.message-body')[0].scrollHeight);
       computerSpeech(answer);
 
      } else {
          throw new Error('Unexpected data format from the API.');
      }
  } catch (error) {
      console.error('Error:', error.message);

      if (error.message.includes('429')) {
          await new Promise(resolve => setTimeout(resolve, 5000)); 
          await makeRequest();
      }
  }
};

  makeRequest();

  };




micBtn.addEventListener('click',() =>{
    recognition.start();
})
