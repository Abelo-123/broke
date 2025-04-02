import React, { useState, useEffect } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Import Supabase client
import Swal from "sweetalert2"; // Import SweetAlert2

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

  const handleImageUpload = async () => {
    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "No Image",
        text: "Please select an image first.",
      });
      return;
    }
  
    try {
      const fileName = `user_${Date.now()}.png`; // Unique file name
      const { data, error: uploadError } = await supabase.storage
        .from('images') // Replace 'images' with your Supabase storage bucket name
        .upload(fileName, dataURLtoBlob(image), {
          contentType: 'image/png',
        });
  
      if (uploadError) {
        throw uploadError;
      }
  
      const { publicUrl, error: urlError } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);
  
      if (urlError) {
        throw urlError;
      }
  
      const { error: dbError } = await supabase
        .from('customer')
        .update({ image: publicUrl })
        .eq('name', name); // Update the record for the current user
  
      if (dbError) {
        throw dbError;
      }
  
      Swal.fire({
        icon: "success",
        title: "Uploaded",
        text: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Failed to upload the image.",
      });
    }
  };
  
  const dataURLtoBlob = (dataURL) => {
    const [header, base64] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
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
                      //setAuthMsg(`Uer ddata alresady exists in localStorage: ${userNameFromStorage}`);
                      console.log('User data already exists in localStorage:', userNameFromStorage)
                      return; // Do not call the API if the data is already set
                  } else {
                      if (user) {
                        setName(user.first_name);
  
                          try {
  
  
                              const { error } = await supabase
                                  .from('customer')
                                  .insert([
                                      {  name: user.first_name }
                                  ]);
  
                              if (error) {
                                  console.error(error.message)
                              }
  
                              const userName = user.first_name;
  
                              // Set user data ieen localStorage with a unique key
                              localStorage.setItem(storageKey, userName);
                              // Store the name with a unique key
                             
                              //const storedeData = localStorage.getItem(`userdata_name_${user.id}`);
  
                              //setLs(s`new set ${storedData}`)
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
       {<button onClick={() => {
                    localStorage.clear();

                }}>
                    Clean
                </button>}<br />
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
        <div
        class="w-full bg-red-400 rounded-lg p-4 py-4 text-center cursor-pointer animated-button"
        onClick={handleImageUpload}
      >
        SEND
      </div>
      
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
  style={{ background: "rgba(0, 0, 0, 0.1)" }}
  class="px-4 d-inline m-auto flex items-center gap-2"
  onClick={() => {
    const input = document.getElementById("copyInput");
    const url = input.value.trim(); // Get the URL from the input field

    if (url && url.startsWith("http")) {
      window.open(url, "_blank"); // Open in a new tab
    } else {
      Swal.fire({
        icon: "warning",
        title: "Invalid",
        text: "Insert the image first.",
      }); // Alert ifss the input doesn't contain a valid link
    }
  }}
>
  Visit Link {name}
</button>
        </div>
      </div>
      <i style={{fontSize:'15px'}} class="w-9/12 mt-2 text-wrap">lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet lorem epsum dolor sit amet</i>
    </div>
  )
}

export default App
