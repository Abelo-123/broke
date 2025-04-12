import React, { useState, useEffect } from 'react';
import './index.css';
import { supabase } from './supabaseClient'; // Import Supabase client
import Swal from "sweetalert2"; // Import SweetAlert2

function App() {
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingb, setLoadingB] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showModalb, setShowModalb] = useState(false);
  const [showModalc, setShowModalc] = useState(false);
  const [id, setId] = useState(null);
  const [link, setLink] = useState(null)
  const [amountWithdrawl, setAmountWithdrawl] = useState(null);
  const [cost, setCost] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerss, setCustomerss] = useState([]);
  const [un, setUsername] = useState(null);
  const [num, setNum] = useState(null);
  const [cancel, setCancel] = useState(false)

  const [imageUrl, setImageUrl] = useState(null); // To store the image URL from the customer table
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  
  const sendWithdrawl = async (uuid) => {

     if(!num) { 
      
      Swal.fire({
        icon: "error",
        title: "Invalid",
        text: "Please input your bank account.",
      })

    } else if(!un) {
      Swal.fire({
        icon: "error",
        title: "Invalid",
        text: "Please input your full name.",
      })
    }
     else {

      const { data, error } = await supabase
      .from('customer-withdrawl')
      .select('*')
      .eq('uid', uuid)
      .eq('status', 'pending');

    if (error) {
      console.error('Error checking pending withdrawals:', error);
      return false;
    }

    if(data.length == 1) {
      Swal.fire({
        icon: "error",
        title: "Invalid",
        text: "There's already pending request.",
      })
    } else {

     if(amountWithdrawl > cost) {
       Swal.fire({
         icon: "error",
         title: "Invalid",
         text: "You cant afford that balance.",
     })
     } else {


      const { data, error } = await supabase
      .from('customer')
      .select('username, account')
      .eq('uid', uuid)
      .single()
    
      if (error) {
        console.error('Error fetching user data:', error);
      } 
        const { username, account } = data;
      
        if (!username || !account) {
          
          const { error } = await supabase
      .from('customer')
      .update({username: un, account: num})
      .eq('uid', uuid);
        alert("good")
        } 

        
         
        
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js?2';
    script.async = true;
    document.body.appendChild(script);
  
    script.onload = async () => {
      try {
        const Telegram = window.Telegram;
        Telegram.WebApp.expand();
  
        if (Telegram && Telegram.WebApp) {
          Telegram.WebApp.ready();
          const { user } = Telegram.WebApp?.initDataUnsafe;
  
          try {
            const { data, error } = await supabase
              .from('customer-withdrawl')
              .insert([
                {
                  uid: user?.id,
                  name: user?.first_name,
                  amount: amountWithdrawl,
                  status: "pending",
                  account: num,
                  username: un
                },
              ])
              .select(); // Use .select() to return the inserted data
  
            if (error) {
              throw error;
            }


  
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Withdrawal request submitted successfully.",
            });
  
            // Add the new withdrawal to the customers state
            setCustomerss((prevCustomers) => [...prevCustomers, ...data]);
  
            setShowModalb(false);
            setShowModalc(false);
          } catch (error) {
            console.error("Error inserting withdrawal:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to submit withdrawal request. Please try again.",
            });
          }
        }
      } catch (error) {
        console.error('Error during Telegram script load:', error);
      }
    };
  }
}

}
  };

  const copyToClipboard = () => {
    const input = document.getElementById("yourInputId"); // Replace with your actual input's ID
    if (input) {
      navigator.clipboard.writeText(input.value).then(() => {
       
      }).catch((err) => {
        console.error("Clipboard copy failed:", err);
      });
    }
  };

  const handleImageUpload = async () => {
    setLoadingB(true)
    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "No Image",
        text: "Please select an image first.",
      });
      return;
    }
  
    try {
      const fileName = `user_${Date.now()}.png`; // Unffique file name
      const { data, error: uploadError } = await supabase.storage
        .from('images') // Replቭace 'images' with your Supabase storage bucket name
        .upload(fileName, dataURLtoBlob(image), {
          contentType: 'image/png',
        });
  
      if (uploadError) {
        throw uploadError;
      }
  
 
  
      const { error: dbError } = await supabase
        .from('customer')
        .update({ image: `https://bihqharjyezzxhsghell.supabase.co/storage/v1/object/public/images//${fileName}` })
        .eq('uid', id); // Upddate the recድorድd for the current user
  
      if (dbError) {
        throw dbError;
      }
      setIsUploaded(true); // Hide the "SEND" button
      setImageUrl('publicUrl');
      Swal.fire({
        icon: "success",
        title: "Uploaded",
        text: "Image uploaded successfully.",
      })
    } catch (error) {
      setLoadingB(false);
      setImageUrl('publicUrl');
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Try Again",
        text: "Please try again.",
      })
    }  finally {
      setLoadingB(false); // Always stop loading after script completes
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
     const fetchCostData = async () => {
      

       const { data: costData, error } = await supabase
         .from('customer')
         .select('*')
         .eq('uid', id)

       if (error) {
         console.error('Error fetching customer cost:', error);
       } else {
         setCost(costData[0]?.amount);
       }
     };

     fetchCostData();

     const costChannel = supabase
       .channel('realtime:customer-cost-by-uid')
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'customer' },
         (payload) => {
           if (payload.new?.uid == id) {
             fetchCostData();
           }
         }
       )
       .subscribe();

     return () => {
       supabase.removeChannel(costChannel);
     };
   }, [id]);


   useEffect(() => {
    const fetchWithdrawl = async () => {
     

      const { data: withData, error } = await supabase
        .from('customer-withdrawl')
        .select('*')
        .eq('uid', id)

      if (error) {
        console.error('Error fetching customer cost:', error);
      } else {

        const { data: withDat } = await supabase
        .from('customer')
        .select('*')
        .eq('uid', id)
        .single()

        if(withDat.status == "cancel") {
          setCancel(true)
        }
        setCustomerss(withData);
  
      }
    };

    fetchWithdrawl();
    const refChannel = supabase
    .channel('realtime:customer-withdrawl-ref')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customer-withdrawl' },
      (payload) => {
        if (payload.new?.uid === id) {
          fetchWithdrawl();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(refChannel);
  };
  }, [id]);


  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
  
      const { data: smmss, error } = await supabase
        .from('customer')
        .select('name, status, image')
        .eq('ref', id);
  
      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        setCustomers(smmss);
      }
    };
  
    fetchData();
  
    const refChannel = supabase
      .channel('realtime:customer-by-ref')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          if (payload.new?.ref === id) {
            fetchData();
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(refChannel);
    };
  }, [id]);
  
  useEffect(() => {
    const fetchDataByUserId = async (userId) => {
      const { data, error } = await supabase
        .from('customer')
        .select('user_link')
        .eq('uid', userId)
        .single();
  
      if (error) {
        console.error('Error fetching customer by user ID:', error);
      } else {
        if (data?.user_link) {
          setLink(data.user_link);
        }
      }
    };
  
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js?2';
    script.async = true;
    document.body.appendChild(script);
  
    script.onload = async () => {
      try {
        const Telegram = window.Telegram;
        Telegram.WebApp.expand();
  
        if (Telegram && Telegram.WebApp) {
          Telegram.WebApp.ready();
          const { user } = Telegram.WebApp?.initDataUnsafe;
  
          if (user?.id) {
            fetchDataByUserId(user.id);
          }
        } else {
          console.error('Telegram Web App API not loaded');
        }
      } catch (error) {
        console.error('Error during Telegram script load:', error);
      }
    };
  
    const uidChannel = supabase
      .channel('realtime:customer-by-uid')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          const userId = payload.new?.uid;
          if (userId === id) { // Ensure the uid matches the id
            fetchDataByUserId(userId);
          }
        }
      )
      .subscribe();
  
    return () => {
      document.body.removeChild(script);
      supabase.removeChannel(uidChannel);
    };
  }, [id]);
  
  

    useEffect(() => {
      setLoading(true); 
  
          // Load the Telegram Web App JavaScript SDK
          const script = document.createElement("script");
          script.src = "https://telegram.org/js/telegram-web-app.js?2";
          script.async = true;
          document.body.appendChild(script);
  
          script.onload = async () => {
            try {
              const Telegram = window.Telegram;
              Telegram.WebApp.expand();
              if (window.Telegram && window.Telegram.WebApp) {
                  window.Telegram.WebApp.ready();
                 
                  const { user } = Telegram.WebApp?.initDataUnsafe;
                  
                  const from = Telegram.WebApp?.initDataUnsafe?.start_param;                  
               
                  
                  const { data } = await supabase
                  .from('customer')
                  .select('image, user_link, username, account')
                  .eq('uid',user?.id)
                  .single();

                  const {  data:dataid } = await supabase
                  .from('customer')
                  .select('uid')
                  .eq('uid', user?.id);

                  
                  setId(user?.id)
                  


                  if(data?.user_link) {
                    setLink(data.user_link)
                  }

                  if(data?.username) {
                    setUsername(data.username)
                  }

                  if(data?.account) {
                    setNum(data.account)
                  }

                  if (data?.image) {
                    setImageUrl(data.image);
                  }

                  const storageKey = `userdata_name_${user.id}`; // Unique key for each user (or mini-app)
  
                  const userNameFromStorage = localStorage.getItem(storageKey);
  
                  
                  if (userNameFromStorage || dataid.length >= 1) {
                    
                
                    console.log('User data already exists in localStorage:', userNameFromStorage)
                    return; // Do not call the API idf the data is already set
                  } else {
                      // Show loading spinner
                      if (user) {
                
                         
                          
                          try {
                              const { data: refData, error: refError } = await supabase
                                .from('customer')
                                .select('link, cost')
                                .eq('uid', 7159821786) // Ensure this is a number, not a string
                                .single();

                              if (refError) {
                                console.error('Error fetching reference data:', refError);
                                return;
                              }

                              const { link, cost } = refData || {};

                              const { error } = await supabase
                                .from('customer')
                                .insert([
                                  {
                                    chat: user.username,
                                    name: user.first_name,
                                    uid: Number(user.id), // Convert user.id to a number
                                    ...(from && { ref: from }),
                                    link: link || null, // Use fetched link or null if not found
                                    cost: cost || null, // Use fetched cost or null if not found
                                  }
                                ]);

                              if (error) {
                                console.error(error.message);
                              } 
  
                              const userName = user.id;
  
                            
                              localStorage.setItem(storageKey, userName);

                              window.location.href = `https://t.me/djdj22_bot`; 

                              
                          } catch (error) {
                              console.error("Error adding user:", error);
                          }
                      }
                  }
  
              } else {
                  console.error("Telegram Web App API not loaded");
              } // Adjust timeout as necessary
            } catch (error) {
              console.error("Error during Telegram script load:", error);
            } finally {
              setLoading(false); // Always stop loading after script completes
            }
  
          };
  
         
  
          return () => {
              
              document.body.removeChild(script);
  
          };
      }, []);


  return (
    
    <div class="relative w-screen h-screen  flex flex-col items-center justify-center">
    {loading && (
  <div  className="w-screen  grid place-content-center absolute h-screen bg-black" style={{ textAlign: "center", padding: "2rem", zIndex: 100 }}>
    <div className="spinner"></div>
  </div>
    )}
    {loadingb && (
  <div className="w-screen grid place-content-center absolute h-screen bg-red-300" style={{ textAlign: "center", padding: "2rem" }}>
    <div className="spinner"></div>
    <h2 className="font-mono text-2xl mt-12">Inserting Image...</h2>
  </div>
    )}
     {showModal && (
        <div className="fixed inset-0 z-50 flex  items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
          
            <div className="flex flex-col justify-end gap-2">
              <button
                className="text-3xl bg-gray-700 text-gray-100 hover:bg-gray-400 px-1 w-12 py-1 rounded"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
             
              <p className="text-sm text-gray-600 mb-4">Your Referaal link</p>
              <div class="flex relative">
              <input
                type="text"
                id="yourInputId"
                className="text-stone-500 w-full p-3 pr-10 bg-gray-100 rounded-md"
                value={`tg://resolve?domain=djdj22_bot&startapp=${id}`}
                readOnly
              />
              <button
                onClick={copyToClipboard}
                className="absolute right-0 bg-gray-600 hover:text-black"
                title="Copy to clipboard"
              >
                📋 Copy
              </button>
              </div>
              <div style={{fontSize:'13px', color:'gray'}}>Your Refered {id}</div>
              <ul class="list-none list-inside text-sm text-gray-600 mb-4">
              {customers.map((customer, index) => (
                <li
                  key={index}
                  className="border-t-2 border-black pt-3 p-2"
                >
  <div
    className={`p-3 mr-2 rounded-md py-1 inline ${
      customer.status === "approved"
        ? "bg-green-200"
        : customer.image
        ? "bg-blue-200"
        : "bg-red-200"
    }`}
  >
  </div>
                    {customer.name} {" "}
 
 
                </li>
              ))}
            </ul>

            </div>
          </div>
        </div>
      )}

{showModalc && (
        <div style={{zIndex:10}} className="fixed inset-0 z-50 flex  items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
          
            <div className="flex flex-col justify-end gap-2">
              <button
                className="text-3xl bg-gray-700 text-gray-100 hover:bg-gray-400 px-1 w-12 py-1 rounded"
                onClick={() => setShowModalc(false)}
              >
                &times;
              </button>
             
              <p className="text-sm text-gray-600 mb-4">Fill the form to withdrawl</p>
              <div class="flex gap-3 flex-col relative">
              <input
                type="text"
                placeholder="Full name"
                className="text-stone-500 w-full p-3 pr-10 bg-gray-100 rounded-md"
                value={un}
                onChange={(e) => setUsername(e.target.value)}
                
              />
                <input
                type="text"
                placeholder="Bank Acc"
                className="text-stone-500 w-full p-3 pr-10 bg-gray-100 rounded-md"
                value={num}
                onChange={(e) => setNum(e.target.value)}
                
              />
              <input
                type="text"
                placeholder="Amount"
                id="yourInputId"
                className="text-stone-500 w-full p-3 pr-10 bg-gray-100 rounded-md"
                value={amountWithdrawl}
                onChange={(e) => setAmountWithdrawl(e.target.value)}
                
              />
              <button
                onClick={() => sendWithdrawl(id)}
                className="mt-4 right-0 bg-gray-700  hover:text-black"
                title="Copy to clipboard"
              >
               Send 
              </button>
              </div>
          </div>
        </div>
        </div>
      )}

{showModalb && (
        <div style={{zIndex:9}} className="fixed inset-0 z-50 flex  items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-90 shadow-xl">
          
            <div className="flex flex-col justify-end gap-2">
            <button
                className="text-3xl bg-gray-800 text-gray-100 hover:bg-gray-400 px-1 w-12 py-1 rounded"
                onClick={() => setShowModalb(false)}
              >
                &times;
              </button>
              <button className="bg-gray-500" onClick={() => setShowModalc(true)}>Withdrawl</button>
            
             
            
              <div style={{fontSize:'13px', color:'gray'}}>Withdrawl history</div>
          
            <div class="overflow-y-scroll h-96">
              <table class="min-w-full table-auto bg-white border border-gray-300 rounded-lg shadow-md">
              <thead>
  <tr className="bg-gray-200 text-gray-800">
    <th className="px-4 py-2 border-b">#</th>
    <th className="px-4 py-2 border-b">Id</th>
    <th className="px-4 py-2 border-b">amount</th>
  </tr>
</thead>
<tbody>
  {customerss.map((data, index) => {
    const rowBg =
      data.status === "pending"
        ? "bg-blue-100"
        :data.status === "cancel"
        ? "bg-blue-100"
        : data.status === "done"
        ? "bg-green-100"
        : "";

    return (
      <tr key={index} className={`${rowBg} text-gray-900`}>
      <td className="px-4 py-2 border-b text-center">{index + 1}</td>
      <td className="px-4 py-2 border-b">{data.created_at}</td>
      <td className="px-4 py-2 border-b">{data.amount}</td>
      </tr>
    );
    })}
    </tbody>

      </table>
      </div>

      </div>
      </div>
      </div>
      )}
    <div class="grid place-content-center grid-cols-2 gap-2 absolute  top-12 left-12" style={{ zIndex: 0 }}> 
    <div class="p-2 bg-gray-100 rounded-lg flex items-center justify-center"
    onClick={() => setShowModal(true)}
    >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    Invite Friends
    </div>
     <div class="m-auto font-mono">{cost || 0.00}</div> 
    </div>
    <div style={{fontSize:'15PX'}} class="w-auto rounded-lg absolute font-mono font-bold right-12 top-12 p-2  flex items-center justify-center"
     onClick={() => setShowModalb(true)}
    > 
      Withdrawl
    </div>
       {<button style={{display: 'none'}} onClick={() => {
                    localStorage.clear();

                }}>
                    Clean
                </button>}<br />
      <p class="font-mono mx-24 font-bold">
      {cancel ? (
  <p>Payment not received or proof incomplete. Please upload a proper screenshot with full details.</p>
) : link ? (
  <p>Your payment has been approved.<br/> Here is the link</p>
) : imageUrl ? (
  <p>You have uploaded a picture.<br/> Please wait for the admin to approve it and send you the invite link.</p>
) : (
  <>
    <p>Please send the payment to this account and upload a screenshot as proof of payment.</p>
    <p>Bank Name: CBE</p>
    <p>Account Number: 100092838</p>
    <p>Account Holder: Addis</p>
  </>
)}


</p>
      <div class="w-11/12 block gap-4  grid max-h-96 p-4">
      {!imageUrl && (
        <div class="w-12/12  h-56 rounded-lg opacity-90 bg-gray-400  text-black-900 p-3 flex place-content-center grid"
         onClick={() => document.getElementById('imageInput').click()}
        >
            {image ? (
        <img src={image} alt="Selected" className="max-h-56 max-w-full object-contain" />
        ) : (
          'Insert Image'
        )}
          
            <input
              id="imageInput"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
         
        </div>
         )}
        {image && (
          !isUploaded && (
        <div
        class="w-full bg-gray-200 rounded-lg p-4 py-4 text-center cursor-pointer animated-button"
        onClick={handleImageUpload}
      >
        SEND
      </div>
          )
        )}
        <div class="flex gap-3">
          <input
            type="text"
            value={link || "Waiting Link..."}
            id="copyInput"
            disabled
            style={{ background: "rgba(0, 0, 0, 0.1)" }}
            class="w-10/12  rounded-lg p-4 py-3"
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
        text: "Wait untill the link sent.",
      }); // Alert ifss the input dsoesn't contadidn a valid link
    }
  }}
>
  Visit
</button>
        </div>
      </div>
      <i style={{fontSize:'15px'}} class="w-9/12 mt-2 text-wrap">
      After you upload the proof, the invite link will be sent to you shortly. Click "Visit" to join.
      </i>
    </div>
  )
}

export default App
