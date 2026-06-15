declare global {
  interface Window {
    wx: any;
    tcsas: any;
  }
}


function loadTcmpp() {
  const script = document.createElement('script');
  script.src = 'https://tcmpp-team.github.io/mini-programs/jssdk/tcsas-jssdk-1.0.1.js';
  script.async = true;

  script.onload = () => {
    console.log('TCMPP JSSDK loaded successfully.');
    console.log(window.wx)
  };

  script.onerror = () => {
    alert('Failed to load TCMPP JSSDK script from network.');
  };


  document.head.appendChild(script);

}

loadTcmpp()