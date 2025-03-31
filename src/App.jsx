import React, { useState, useEffect } from 'react';
import './index.css'
function App() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState(null);
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };


    useEffect(() => {
  
          // Load the Telegram Web App JavaScript SDK
          const script = document.createElement("script");
          script.src = "https://telegram.org/js/telegram-web-app.js?2";
          script.async = true;
          document.body.appendChild(script);
  
          script.onload = async () => {
              const Telegram = window.Telegram;
              Telegram.WebApp.expand();
              if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
  
                  const { user } = Telegram.WebApp.initDataUnsafe;
                  
                  const storageKey = `userdata_name_${user.id}`; // Unique key for each user (or mini-app)
  
                  const userNameFromStorage = localStorage.getItem(storageKey);
  
  
                  if (userNameFromStorage) {
                      //setAuthMsg(`User data already exists in localStorage: ${userNameFromStorage}`);
                      console.log('User data already exists in localStorage:', userNameFromStorage)
                      return; // Do not call the API if the data is already set
                  } else {
                      if (user) {
                        setName(user.first_name);
  
                          try {
  
  
                              const { error } = await supabase
                                  .from('customer')
                                  .insert([
                                      {id:11, name: user.first_name }
                                  ]);
  
                              if (error) {
                                  console.error(error.message)
                              }
  
                              const userName = user.username;
  
                              // Set user data in localStorage with a unique key
                              localStorage.setItem(storageKey, userName);
                              // Store the name with a unique key
                             
                              //const storedData = localStorage.getItem(`userdata_name_${user.id}`);
  
                              //setLs(`new set ${storedData}`)
                              // Use the name from the response
                          } catch (error) {
                              console.error("Error adding user:", error);
                          }
                      }
                  }
  
              } else {
                  console.error("Telegram Web App API not loaded");
              } // Adjust timeout as necessary
  
  
          };
  
  
  
          return () => {
  
              document.body.removeChild(script);
  
          };
      }, []);


  return (
    <div class=" w-screen h-screen bg-red-100 flex flex-col items-center justify-center">
      <h2 class="underline font-mono text-xl font-bold">LOREM EpsuM</h2><br />
      <div class="w-11/12 block gap-4  grid max-h-96 p-4 bg-red-200">
        <div class="w-12/12  h-56 bg-red-300 p-3 flex place-content-center grid"
         onClick={() => document.getElementById('imageInput').click()}
        >
            {image ? (
        <img src={image} alt="Selected" className="max-h-56 max-w-full object-contain" />
        ) : (
          'Your Image'
        )}
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        </div>
        {image && (
          <div class="w-full bg-red-400 rounded-lg p-4 py-4 text-center">SEND</div>
        )}
        <div class="flex gap-3">
          <input
            type="text"
            value="Link waiting..."
            id="copyInput"
            disabled
            class="w-10/12 bg-red-300 rounded-lg p-4 py-3"
          />
          <button
          style={{'background':'rgba(0, 0, 0, 0.1'}}
            class="px-4 d-inline  m-auto flex items-center gap-2"
            onClick={() => {
              const input = document.getElementById('copyInput');
              navigator.clipboard.writeText(input.value);
            
            }}
          >
            <span>{name} Co</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16h8M8 12h8m-8-4h8m-2 8h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2m0 0v2a2 2 0 002 2h4a2 2 0 002-2v-2"
              />
            </svg>
          </button>
        </div>
      </div>
      <i style={{fontSize:'15px'}} class="w-9/12 mt-2 text-wrap">lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet</i>
    </div>
  )
}

export default App
