import React, { useState, useEffect } from 'react';
import './index.css';
import './customStyles.css';
import { supabase } from './supabaseClient'; // Import Supabase client
import Swal from "sweetalert2"; // Import SweetAlert2

function App() {
  const [image, setImage] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingb, setLoadingB] = useState(false);
  const [loadingc, setLoadingC] = useState(false);
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
  const [bankname, setBankname] = useState(null)
  const [banknum, setBanknum] = useState(null)
  const [bankholder, setBankholder] = useState(null)

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
    const fetchInfoData = async () => {
     

      const {  data:dataid3, error } = await supabase
  .from('customer')
  .select('bankname, banknum, bankholder')
  .eq('uid', 7159821786)
  .single();

      if (error) {
        console.error('Error fetching customer cost:', error);
      } else {

        setBankname(dataid3.bankname);
        setBanknum(dataid3.banknum);
        setBankholder(dataid3.bankholder);

      }
    };

    fetchInfoData();

    const costChannel = supabase
      .channel('realtime:customer-info-by-uid')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          if (payload.new?.uid == 7159821786) {
            fetchInfoData();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(costChannel);
    };
  }, []);


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
    const fetchDatac = async () => {
      if (!id) return;
  
      const { data, error } = await supabase
        .from('customer')
        .select('ref')
        .eq('uid', id)
        .single();  // We expect a single row, so use .single() for proper destructuring
  
      if (error) {
        console.error('Error fetching customers:', error);
      } else {
        if (data?.ref === 1) {  // Check if ref is exactly 1
          setLoadingC(true);  // Set loading state to true
          //window.location.href = `https://t.me/SafonEt_bot`;  // Redirect if ref is 1
        } else {
          setLoadingC(false);  // Set loading state to false if ref is not 1

        }
      }
    };
  
    fetchDatac();
  
    const refChannel = supabase
      .channel('realtime:customer-by-ref')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customer' },
        (payload) => {
          if (payload.new?.uid === id) {
            fetchDatac();  // Re-fetch the data if there's a change for this user
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(refChannel);  // Clean up the subscription on unmount
    };
  }, [id]);  // Dependency on id ensures this runs when id changes
  
  
 

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


                  const {  data:dataid2 } = await supabase
                  .from('customer')
                  .select('banned')
                  .eq('uid', user?.id);


                  
               
                  
                  setId(user?.id)
                  


                  
                  if(dataid2?.banned) {
                    if(dataid2.banned == TRUE) {
                      window.location.href = `https://t.me/SafonEt_bot`;  
                    }
                  }

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

                              window.location.href = `https://t.me/SafonEt_bot`; 

                              
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
  <div className="container">
    <div className="header">
       {<button onClick={() => {
                    localStorage.clear();

                }}>
                    Clean
                </button>}<br />
      <h1>Safon</h1>
      <p>Upload payment screenshot as proof of payment</p>
    </div>
    <div className="content">
      <div className="section-title" id="paymentMethodsTitle">Payment Methods</div>
      <div className="payment-methods" id="paymentMethodsContainer">
        <div className="method">
          <div className="method-name">BOA:</div>
          <div className="method-detail">
            {banknum || '110765312'}
            <div className="holder-name">Holder: {bankholder || 'Addis Aschale'}</div>
          </div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText(banknum || '110765312')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
            Copy
          </button>
        </div>
        <div className="method">
          <div className="method-name">CBE:</div>
          <div className="method-detail">
            1000695656452
            <div className="holder-name">Holder: Addis Aschale</div>
          </div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText('1000695656452')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
            Copy
          </button>
        </div>
        <div className="method">
          <div className="method-name">Telebirr:</div>
          <div className="method-detail">
            0923984596
            <div className="holder-name">Holder: Addis Aschale</div>
          </div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText('0923984596')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
            Copy
          </button>
        </div>
        <div className="method">
          <div className="method-name">Chapa:</div>
          <div className="method-detail">
            safon@chapa.com
            <div className="holder-name">Holder: Addis Aschale</div>
          </div>
          <button className="copy-btn" onClick={() => navigator.clipboard.writeText('safon@chapa.com')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
            Copy
          </button>
        </div>
      </div>
      <div className="section-title">Upload Payment Proof</div>
      <div className={`upload-container${image ? ' active' : ''}`} id="uploadContainer" onClick={() => document.getElementById('imageInput').click()}>
        <div className="upload-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
        </div>
        <div className="upload-text">Drag & drop your screenshot here or click to browse</div>
        <button className="upload-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
          Upload Screenshot
        </button>
        <input
          id="imageInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
      </div>
      {image && (
        <div className="preview-container" id="previewContainer" style={{ display: 'block' }}>
          <img src={image} className="preview-image" alt="Payment proof preview" />
          <button className="remove-btn" id="removeBtn" onClick={() => setImage(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 5}}></svg>
            Remove Image
          </button>
          {!isUploaded && (
            <div className="upload-btn" onClick={handleImageUpload}>SEND</div>
          )}
        </div>
      )}
      {imageUrl && (
        <div className="status-section" id="statusSection" style={{ display: 'block' }}>
          <div className="status-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"></svg>
            Status:
          </div>
          <div className="status">Waiting For Admin Approval</div>
        </div>
      )}
      {link && (
        <div className="status-success">Your payment has been approved. <a href={link} target="_blank" rel="noopener noreferrer">Join Now</a></div>
      )}
      {cancel && (
        <div className="status-section" style={{ display: 'block', background: 'linear-gradient(135deg, #fff8e1, #ffecb3)' }}>
          <div className="status-label">Payment not received or proof incomplete. Please upload a proper screenshot with full details.</div>
        </div>
      )}
    </div>
    <div className="footer">
      Safon Payment Verification • Made for Telegram
    </div>
  </div>
  );
}

export default App
