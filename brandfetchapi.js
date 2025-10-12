
  export default (props, {$f7, $h, $, $el, $theme, $on, $f7router, $update, $onMounted, $onBeforeUnmount}) => {
       
      var token = localStorage.getItem("WaoCardUserToken");
      var getdata = localStorage.getItem("WaoCardUserData");
      let autocompleteDropdownTypeahead;
      let organisationDropdownAjaxTypeahead;
      let sheetSwipeToClose;
     let brands = [];
     let branddata = null;
        const user = JSON.parse(getdata);
        const userid =  user.user_id;
         const username = user.username;
          const name = user.first_name;
          const email = user.email;
          const city =  user.city;
          const userstate =  user.state;
          const address =  user.address;
          const phone =  user.phone_number;
          const userwallet = user.wallet;
          const avatar = user.avatar;
          let cardtype = user.pro_type;
          let logosArray = null;
          let membership_card = null;  
          let id_card = null; 
          let business_card = null;
          let loyalty_card = null; 
          let event_ticket = null;
          let access_card = null;
          let hospital_card = null;
          let transport_card = null;
          let other_card = null;
          let waocard = null;
          let cardcolor = localStorage.getItem('cardcolor');
          let rechargephone = null;
          let rechargename = null;
          let billvalue = 100;
          let cardfont = null;
          let cardicon = null;
          let customer_data = null;
          let provider_id = null;
          let provider = null;
          let isjpgOrJpegLogo = null;
          let logo = null;
          let  brandlogo = "img/logo-placeholder-image.png";
          let companyname = null;
          let brandcolors = null;
          let swiper1 = null;
          let minimum_amount = 0.00;
          let  cardbg = '#fff';
          let cardtext = '#000';
          let ido ='';
          let cover = null;
          let coverbg = null;
          let office_title = '';
          let cardIdCounter = 0;
          let card_type = localStorage.getItem("WaoCardCreateCardype");
// Function to create a business card object
function BusinessCard(id, bname, bcompany, bemail, bphone, bposition, baddress, blogo, backgroundColor) {
  this.id = id; // Unique identifier for each card
  this.bname = bname;
  this.bcompany = bcompany;
  this.bemail = bemail;
  this.bphone = bphone;
  this.bposition = bposition;
  this.baddress = baddress;
  this.blogo = blogo; // URL path to the logo image
  this.backgroundColor = backgroundColor;
}
// Function to edit a card (logic remains the same)
function editCard(id) {
   // Update existing card
    const cards = JSON.parse(localStorage.getItem("businessCards"));
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].id === id) {
        cards[i] = new BusinessCard(id, bname, bcompany, bemail, bphone, bposition, baddress, blogo, backgroundColor);
        localStorage.setItem("businessCards", JSON.stringify(cards));
        
      }
    }
}

// Function to save business cards to local storage
function saveBusinessCards() {
  const businessCards = [];
  // Get data from form or other input source
  const bname = document.getElementById("bname").value;
  const bcompany = document.getElementById("organisation-dropdown").value;
  const bemail = document.getElementById("bemail").value;
  const bphone = document.getElementById("bphone").value;
  const bposition = document.getElementById("bposition").value;
  const baddress = document.getElementById("baddress").value;
  const blogo = brandlogo; // URL path from input field
  const backgroundColor = cardbg; // Hex code or color picker value

    // Create a new business card object with unique ID
    const card = new BusinessCard(cardIdCounter, bname, bcompany, bemail, bphone, bposition, baddress, blogo, backgroundColor);
    businessCards.push(card);
    cardIdCounter++; // Increment counter after creating the card
  
      // Check if there are existing cards in local storage
  const existingCards = JSON.parse(localStorage.getItem("businessCards"));

  // If there are existing cards, combine them with the new card array
  if (existingCards) {
    localStorage.setItem("businessCards", JSON.stringify(existingCards.concat(businessCards)));
  } else {
    // If no existing cards, save the new card array directly
    localStorage.setItem("businessCards", JSON.stringify(businessCards));
  }
      
      // Clear the form after saving
  document.getElementById("bname").value = "";
  document.getElementById("bcompany").value = "";
  document.getElementById("bemail").value = "";
  document.getElementById("bphone").value = "";
      
      
}
      
 const view_card = (data) =>{
      localStorage.setItem("WaoCardViewCard", data);
      app.views.current.router.navigate('/home_landing/', {
                    reloadCurrent: true, // Refresh the current page
                    ignoreCache: true // Ignore caching for the new page
});	 
}     
 
      
      if (card_type === "Membership Card"){
          
          membership_card = card_type;
          $update();
      }
       if (card_type === "ID Card"){
          
          id_card = card_type;
          $update();
      }
      if (card_type === "Loyalty Card"){
          
          loyalty_card = card_type;
          $update();
      }
      
       if (card_type === "Business Card"){
          
         business_card = card_type;
          $update();
      }
      
      if (card_type === "Tickets"){
          
         event_ticket = card_type;
          $update();
      }
      
      if (card_type === "Access Card"){
          
         access_card = card_type;
          $update();
      }
       if (card_type === "Transport Card"){
          
         transport_card = card_type;
          $update();
      }
      
       if (card_type === "Hospital Card"){
          
         hospital_card = card_type;
          $update();
      }
      if (card_type === "Other Card"){
          
         other_card = card_type;
          $update();
      }
   /* swiper carousel cardwiper */
  const swiper2 = new Swiper(".partnerscatswiper", {
    slidesPerView: "auto",
    spaceBetween: 5,
    pagination: false
  });
      
     const save_card = () =>{
  if (card_type === "Business Card"){
          
    saveBusinessCards();
      }	 
}
const home = () =>{
      
      app.views.current.router.navigate('/home_one/', {
                    reloadCurrent: true, // Refresh the current page
                    ignoreCache: true // Ignore caching for the new page
});	 
}
 // iDo on change
    $(document).on('change', '#ido', function() {                
      ido =  $('#ido').val();
    
        $update();
    }); 
  $(document).on('click', '.card-expandable', function() {                
      console.log("card clicked");
      let cover = true;
      $update();
    
    }); 
  
 $(document).on('change', '#office_title', function() {
      office_title = $('#office_title').val();
                 console.log(office_title);
     $update();
            });
          
  // open popup if meter verification is required
   setTimeout(function() {
	//	 app.sheet.open('.meterconfirm');
		}, 1000);  
    



    
        
const colorType = isHexColorDark(cardcolor);
console.log('Color type:', colorType);
      
  


function isHexColorDark(hexColor) {
  // Remove the '#' character if present
  if (hexColor.charAt(0) === '#') {
    hexColor = hexColor.substr(1);
  }
  
  // Convert the hex color code to RGB values
  var red = parseInt(hexColor.substr(0, 2), 16);
  var green = parseInt(hexColor.substr(2, 2), 16);
  var blue = parseInt(hexColor.substr(4, 2), 16);

  // Calculate the relative luminance of the color
  var relativeLuminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;

  // Determine if the color is dark or light based on the relative luminance
  if (relativeLuminance > 0.5) {
    cardfont = "#000";
    cardlogo = "img/icon_black.svg";
    return 'light';
    $update();
  } else {
    cardfont = "#fff";
    cardlogo = "img/icon_white.svg";

    return 'dark';
     $update();
    
  }
}


 $on('pageBeforeIn', function() {
  
      //rechargeinf();
        });
 $onMounted(() => {  

 

$(document).on('click', '.expandable-card', function () {
    console.log("Expanded");
  $(this).toggleClass('expanded');
  $('.subnavbar').toggleClass('hidden');
});
     
 document.getElementById("upload-button").addEventListener("click", function() {
    document.getElementById("my-file-input").click();
});

document.getElementById("my-file-input").addEventListener("change", function() {
    mindeeSubmit(event);
    app.sheet.close('.scanner');
});

// Scan paper card
    const mindeeSubmit = (evt) => {

        evt.preventDefault()

        let myFileInput = document.getElementById('my-file-input');

        let myFile = myFileInput.files[0]

        if (!myFile) { return }

        let data = new FormData();

        data.append("document", myFile, myFile.name);


        let xhr = new XMLHttpRequest();


        xhr.addEventListener("readystatechange", function () {

            if (this.readyState === 4) {

const ScanApiResponse =JSON.parse(xhr.responseText);  
console.log(ScanApiResponse); 
const extractedInfo = extractBusinessCardInfo(ScanApiResponse);
console.log(extractedInfo);

            }

        });


    xhr.open("POST", "https://api.mindee.net/v1/products/WaoCard/business_card/v1/predict");

   xhr.setRequestHeader("Authorization", "Token b1ae3642daeecab2bea58e87cd609e4b");

        xhr.send(data);

    }

function extractBusinessCardInfo(ScanApiResponse) {
    const extractedInfo = {
        companyName: [],
        address: [],
        phoneNumbers: [],
        emailAddress: [],
        website: [],
        names: [],
        position: []
    };

    const page = ScanApiResponse.document.inference.pages[0];

    if (page.prediction) {
        const { company, address, phone_number, email_address, website, name, position } = page.prediction;

        if (company && company.values) {
            extractedInfo.companyName = company.values.map(entry => entry.content);
        }

        if (address && address.values) {
            extractedInfo.address = address.values.map(entry => entry.content).join(' ');
        }

        if (phone_number && phone_number.values) {
            extractedInfo.phoneNumbers = phone_number.values.map(entry => entry.content);
        }

        if (email_address && email_address.values) {
            extractedInfo.emailAddress = email_address.values.map(entry => entry.content);
        }

        if (website && website.values) {
            extractedInfo.website = website.values.map(entry => entry.content);
        }

        if (name && name.values) {
            extractedInfo.names = name.values.map(entry => entry.content);
        }

        if (position && position.values) {
            extractedInfo.position = position.values.map(entry => entry.content);
        }
    }

    return extractedInfo;
}


 // Define an array to store the fetched brand data
let brands = [];

// Create Organisation autocomplete dropdown
const organisationDropdownAjaxTypeahead = $f7.autocomplete.create({
  inputEl: '#organisation-dropdown',
  openIn: 'dropdown',
  preloader: true, // Enable preloader
  valueProperty: 'name', // Object's "value" property name
  textProperty: 'name', // Object's "text" property name
  limit: 20, // Limit to 20 results
  typeahead: true,
  dropdownPlaceholderText: 'Search Brand',
  renderItem: function(item, index) {
    if (item.placeholder) {
      return `
        <li class="autocomplete-dropdown-placeholder">
          <label class="item-content">
            <div class="item-inner">
              <div class="item-title">${item.text}</div>
            </div>
          </label>
        </li>
      `;
    } else {
      // Filter the brand based on the item value
      let matchedBrands = brands.filter(function(e) {
        return e.name === item.value;
      });

      // Use the first matching brand (if any)
      let brand = matchedBrands.length > 0 ? matchedBrands[0] : null;

      // Render the brand item
      return `
        <li>
          <label class="item-radio item-content" data-value="${item.value}">
            <div class="item-media">
              <img src="${brand ? brand.icon : ''}" loading="lazy" width="32" alt="" />
            </div>
            <div class="item-inner">
              <div class="item-title">${item.text}</div>
            </div>
          </label>
        </li>
      `;
    }
  },
  source: function (query, render) {
    var autocomplete = this;
    var results = [];
    if (query.length === 0) {
      render(results);
      return;
    }
    // Show Preloader
    autocomplete.preloaderShow();

    // Do Ajax request to Autocomplete data
    var inputValue = query; // Use the user's input as the value for the API request
    var apiUrl = 'https://api.brandfetch.io/v2/search/' + inputValue;

    $f7.request({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: "Bearer QO4sDIKgRSRy1PcN6OSRrV2lmbAAlgo24zU5zKT4aTA="
      },
      success: function (data) {
        // Store the fetched data in the 'brands' array
        brands = data;

        // Hide Preloader
        autocomplete.preloaderHide();

        // Extract relevant information from the response and store in 'results' array
        for (var i = 0; i < data.length; i++) {
          results.push({
            id: data[i].brandId,
            name: data[i].name,
            icon: data[i].icon,
            domain: data[i].domain
          });
        }
        // Render items by passing array with result items
        render(results);
      },
      error: function (xhr, status) {
        // Handle error here if needed
        console.error("Error fetching data:", status);
        // Hide Preloader
        autocomplete.preloaderHide();
      }
    });
  }
});
     
     
// Create the autocomplete dropdown
autocompleteDropdownAjaxTypeahead = $f7.autocomplete.create({
  inputEl: '#searchbar-autocomplete input[type="search',
  openIn: 'dropdown',
  preloader: true, // Enable preloader
  valueProperty: 'name', // Object's "value" property name
  textProperty: 'name', // Object's "text" property name
  limit: 20, // Limit to 20 results
  typeahead: true,
  dropdownPlaceholderText: 'Search Brand',
  renderItem: function(item, index) {
    if (item.placeholder) {
      return `
        <li class="autocomplete-dropdown-placeholder">
          <label class="item-content">
            <div class="item-inner">
              <div class="item-title">${item.text}</div>
            </div>
          </label>
        </li>
      `;
    } else {
      // Filter the brand based on the item value
      let matchedBrands = brands.filter(function(e) {
        return e.name === item.value;
      });

      // Use the first matching brand (if any)
      let brand = matchedBrands.length > 0 ? matchedBrands[0] : null;

      // Render the brand item
      return `
     <li>
          <label class="item-radio item-content" data-value="${item.value}">
            <div class="item-media">
              <img src="${brand ? brand.icon : brandlogo}" loading="lazy" width="32" alt="" />
            </div>
            <div class="item-inner">
              <div class="item-title">${item.text}</div>
              <div class="item-footer">${brand ? brand.domain : ''}</div>
            </div>
          </label>
        </li>
      `;
    }
  },
  source: function (query, render) {
    var autocomplete = this;
    var results = [];
    if (query.length === 0) {
      render(results);
      return;
    }
    // Show Preloader
    autocomplete.preloaderShow();

    // Do Ajax request to Autocomplete data
    var inputValue = query; // Use the user's input as the value for the API request
    var apiUrl = 'https://api.brandfetch.io/v2/search/' + inputValue;

    $f7.request({
      url: apiUrl,
      method: 'GET',
      dataType: 'json',
      headers: {
        Authorization: "Bearer QO4sDIKgRSRy1PcN6OSRrV2lmbAAlgo24zU5zKT4aTA="
      },
      success: function (data) {
        // Store the fetched data in the 'brands' array
        brands = data;

        // Hide Preloader
        autocomplete.preloaderHide();

        // Extract relevant information from the response and store in 'results' array
        for (var i = 0; i < data.length; i++) {
          results.push({
            id: data[i].brandId,
            name: data[i].name,
            icon: data[i].icon,
            domain: data[i].domain
          });
        }
        // Render items by passing array with result items
        render(results);
      },
      error: function (xhr, status) {
        // Handle error here if needed
        console.error("Error fetching data:", status);
        // Hide Preloader
        autocomplete.preloaderHide();
      }
    });
  }
});
     
     
// Add an event listener to the input element
const inputEl = document.querySelector('#organisation-dropdown');
inputEl.addEventListener('change', function () {
 // const selectedItem = inputEl.value;
  console.log('Selected Value:', inputEl.value);
    // Find the selected item from the brands array based on the query
      let selectedItem = brands.find(function (item) {
        return item.name === inputEl.value;
      });

  // You can perform further actions with the selected value here
    
    // If the selected item is found, log its brand domain to the console
      if (selectedItem) {
        console.log('Selected Item Domain:', selectedItem.domain + " " +  selectedItem.icon);
          brandlogo = selectedItem.icon;
          $update();
          
  // Check our server for brand data with domain 
          
 // Replace this with the actual domain you want to fetch data for
const domain = selectedItem.domain;

// Create an XHR object
var xhr = new XMLHttpRequest();

// Define the PHP script URL with the domain as a query parameter
var phpScriptUrl = 'https://waocard.co/api/fetch_brand_data.php?domain=' + encodeURIComponent(domain);

// Open a GET request to the PHP script
xhr.open('GET', phpScriptUrl, true);

// Set the content type header (not necessary for GET requests)
// xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

// Define the event handler for successful response
xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    let apiResponse = JSON.parse(xhr.responseText);
    console.log('Data fetched successfully:', apiResponse);
      
    if (apiResponse.status ===  "notfound") {
        
        console.log("call brandfetch api" + domain);
        fetchbrands(domain);

        
     } else {
checklogo_prop(apiResponse);
        
updatebrand_data(apiResponse);
        
    }
    
    // Now you can use the responseData object as needed
  } else {
    console.log('Request failed:', xhr.status, xhr.statusText);
  }
};

// Define the event handler for error
xhr.onerror = function () {
  console.log('Request error');
};

// Send the GET request
xhr.send();
  
// Fetch brands from external API          
          
function fetchbrands(domain){
 var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4) {
      // The API response JSON data
const apiResponse = JSON.parse(this.responseText);
       
       
      savefetchbrand_data(apiResponse);
       updatebrand_data(apiResponse);
       
  }
});

xhr.open("GET", "https://api.brandfetch.io/v2/brands/" + domain);
xhr.setRequestHeader("Authorization", "Bearer cgNOppxvLFeVvc6Bpkjd2cXwWCCgvKQ0kPeX6n9H74o=");

xhr.send();     
      
      
  }        

// function to save brands info from external api cal
function savefetchbrand_data(apiResponse){

//save brand info
      
// Your JSON data
var jsonData = apiResponse; 
  // ... (Your provided JSON data here)

// Convert JSON data to a string
var jsonString = JSON.stringify(jsonData);

// Create an XHR object
var xhr = new XMLHttpRequest();

// Define the PHP script URL
var phpScriptUrl = 'https://waocard.co/api/brands_data.php';

// Open a POST request to the PHP script
xhr.open('POST', phpScriptUrl, true);

// Set the content type header
xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

// Define the event handler for successful response
xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log('Data sent successfully:', xhr.responseText);
 checklogo_prop(apiResponse);
  } else {
    console.log('Request failed:', xhr.status, xhr.statusText);
  }
};

// Define the event handler for error
xhr.onerror = function () {
  console.log('Request error');
};

// Send the JSON data
xhr.send(jsonString);



}

// Function to find the first sub-array with format "svg"
function findLogoWithSVGFormat(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "svg");
    });
}

// Function to find the first sub-array with format "png" and background "transparent"
function findLogoWithPngAndTransparentBackground(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "png" && format.background === "transparent");
    });
}

// Function to find the first sub-array with format "jpg" or "jpeg"
function findLogoWithJpgOrJpegFormat(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "jpg" || format.format === "jpeg");
    });
}

// Check if "logos" property exists and is an array
function checklogo_prop(apiResponse){
    if (apiResponse.logos && Array.isArray(apiResponse.logos)) {
        const logosArray = apiResponse.logos;
        
        console.log(logosArray);
        
        // Find the first sub-array with format "svg"
        const svgLogo = findLogoWithSVGFormat(logosArray);

        // If "svg" format is available, return the formats sub-array with "svg" format
        if (svgLogo) {
            const svgFormats = svgLogo.formats.filter((format) => format.format === "svg");
            console.log("Formats with SVG format:", svgFormats);
            brandlogo = svgFormats[0].src;
            isjpgOrJpegLogo = null;
            $update();
        } else {
            // If "svg" format is not available, check for "png" format with transparent background
            const pngLogoWithTransparentBackground = findLogoWithPngAndTransparentBackground(logosArray);
            
            if (pngLogoWithTransparentBackground) {
                const pngFormats = pngLogoWithTransparentBackground.formats.filter((format) => format.format === "png");
                console.log("Formats with PNG format and transparent background:", pngFormats);
                brandlogo = pngFormats[0].src;
                isjpgOrJpegLogo = null;
                $update();
            } else {
                // If "png" format is not available, check for "jpg" or "jpeg" format
                const jpgOrJpegLogo = findLogoWithJpgOrJpegFormat(logosArray);

                if (jpgOrJpegLogo) {
                    const jpgOrJpegFormats = jpgOrJpegLogo.formats.filter((format) => format.format === "jpg" || format.format === "jpeg");
                    console.log("Formats with JPG or JPEG format:", jpgOrJpegFormats);
                    brandlogo = jpgOrJpegFormats[0].src;
                    isjpgOrJpegLogo = true;
                    $update();
                } else {
                    console.log("No suitable logo format found.");
                }
            }
        }
    } else {
        console.log("No logos array found in the API response.");
    }
}


          
// update brands records
function updatebrand_data(apiResponse){
    
   companyname = apiResponse.name;
   coverbg = apiResponse.coverbg;
    console.log(coverbg);
   icon = apiResponse.icon;
  brandcolors = apiResponse.colors.length ? apiResponse.colors :[];
  console.log(brandcolors);
      console.log(brandcolors[0]);
      cardbg = brandcolors[0].hex;
      cardtext = brandcolors[0].type;
  if (cardtext === 'dark') {
    cardfont = "#fff";
} else if (cardtext === 'accent') {
    cardfont = "#fff";
} else {
    cardfont = "#000";
}   
 
  $(document).on('click', '.bcolor', function () {
    
    // Remove 'selected' class from all anchor tags with 'bcolor' class
    $('.bcolor').removeClass('selected');
    
    // Add 'selected' class to the clicked anchor tag
    $(this).addClass('selected');
    
    // Extract data attributes from the clicked anchor tag
    var bgColor = $(this).data('cardbg');
    var textColor = $(this).data('text');
    
    console.log(textColor);
    
    cardbg = bgColor;
    cardtext = textColor;
    
    // Set cardfont based on cardtext value
    if (cardtext === 'dark' || cardtext === 'accent') {
      cardfont = "#fff";
    } else {
      cardfont = "#000";
    }
    
    // Call your update function (assuming it's defined elsewhere)
    $update();
  });
   
    
    
    
}
  
      } else {
        console.log('Selected Item Not Found.');
      }      
  
    
});
    
   
      // Create the searchbar with a custom search event handler
searchbar = $f7.searchbar.create({
  el: '#searchbar-autocomplete',
  customSearch: true,
  on: {
    search: function (sb, query) {
      console.log(query);

      // Find the selected item from the brands array based on the query
      let selectedItem = brands.find(function (item) {
        return item.name === query;
      });

      // If the selected item is found, log its brand domain to the console
      if (selectedItem) {
        console.log('Selected Item Domain:', selectedItem.domain + " " +  selectedItem.icon);
          brandlogo = selectedItem.icon;
          $update();
          
  // Check our server for brand data with domain 
          
 // Replace this with the actual domain you want to fetch data for
const domain = selectedItem.domain;

// Create an XHR object
var xhr = new XMLHttpRequest();

// Define the PHP script URL with the domain as a query parameter
var phpScriptUrl = 'https://waocard.co/api/fetch_brand_data.php?domain=' + encodeURIComponent(domain);

// Open a GET request to the PHP script
xhr.open('GET', phpScriptUrl, true);

// Set the content type header (not necessary for GET requests)
// xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

// Define the event handler for successful response
xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    let apiResponse = JSON.parse(xhr.responseText);
    console.log('Data fetched successfully:', apiResponse);
      
    if (apiResponse.status ===  "notfound") {
        
        console.log("call brandfetch api" + domain);
        fetchbrands(domain);

        
     } else {
checklogo_prop(apiResponse);
        
updatebrand_data(apiResponse);
        
    }
    
    // Now you can use the responseData object as needed
  } else {
    console.log('Request failed:', xhr.status, xhr.statusText);
  }
};

// Define the event handler for error
xhr.onerror = function () {
  console.log('Request error');
};

// Send the GET request
xhr.send();
  
// Fetch brands from external API          
          
function fetchbrands(domain){
 var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4) {
      // The API response JSON data
const apiResponse = JSON.parse(this.responseText);
      console.log(apiResponse);
      savefetchbrand_data(apiResponse);
       updatebrand_data(apiResponse);
  }
});

xhr.open("GET", "https://api.brandfetch.io/v2/brands/" + domain);
xhr.setRequestHeader("Authorization", "Bearer cgNOppxvLFeVvc6Bpkjd2cXwWCCgvKQ0kPeX6n9H74o=");

xhr.send();     
      
      
  }        

// function to save brands info from external api cal
function savefetchbrand_data(apiResponse){

//save brand info
      
// Your JSON data
var jsonData = apiResponse; 
  // ... (Your provided JSON data here)

// Convert JSON data to a string
var jsonString = JSON.stringify(jsonData);

// Create an XHR object
var xhr = new XMLHttpRequest();

// Define the PHP script URL
var phpScriptUrl = 'https://waocard.co/api/brands_data.php';

// Open a POST request to the PHP script
xhr.open('POST', phpScriptUrl, true);

// Set the content type header
xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

// Define the event handler for successful response
xhr.onload = function () {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log('Data sent successfully:', xhr.responseText);
 checklogo_prop(apiResponse);
  } else {
    console.log('Request failed:', xhr.status, xhr.statusText);
  }
};

// Define the event handler for error
xhr.onerror = function () {
  console.log('Request error');
};

// Send the JSON data
xhr.send(jsonString);



}

// Function to find the first sub-array with format "svg"
function findLogoWithSVGFormat(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "svg");
    });
}

// Function to find the first sub-array with format "png" and background "transparent"
function findLogoWithPngAndTransparentBackground(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "png" && format.background === "transparent");
    });
}

// Function to find the first sub-array with format "jpg" or "jpeg"
function findLogoWithJpgOrJpegFormat(logosArray) {
    return logosArray.find((logo) => {
        return logo.formats.some((format) => format.format === "jpg" || format.format === "jpeg");
    });
}

// Check if "logos" property exists and is an array
function checklogo_prop(apiResponse){
    if (apiResponse.logos && Array.isArray(apiResponse.logos)) {
        const logosArray = apiResponse.logos;
        
        console.log(logosArray);
        
        // Find the first sub-array with format "svg"
        const svgLogo = findLogoWithSVGFormat(logosArray);

        // If "svg" format is available, return the formats sub-array with "svg" format
        if (svgLogo) {
            const svgFormats = svgLogo.formats.filter((format) => format.format === "svg");
            console.log("Formats with SVG format:", svgFormats);
            brandlogo = svgFormats[0].src;
            isjpgOrJpegLogo = null;
            $update();
        } else {
            // If "svg" format is not available, check for "png" format with transparent background
            const pngLogoWithTransparentBackground = findLogoWithPngAndTransparentBackground(logosArray);
            
            if (pngLogoWithTransparentBackground) {
                const pngFormats = pngLogoWithTransparentBackground.formats.filter((format) => format.format === "png");
                console.log("Formats with PNG format and transparent background:", pngFormats);
                brandlogo = pngFormats[0].src;
                isjpgOrJpegLogo = null;
                $update();
            } else {
                // If "png" format is not available, check for "jpg" or "jpeg" format
                const jpgOrJpegLogo = findLogoWithJpgOrJpegFormat(logosArray);

                if (jpgOrJpegLogo) {
                    const jpgOrJpegFormats = jpgOrJpegLogo.formats.filter((format) => format.format === "jpg" || format.format === "jpeg");
                    console.log("Formats with JPG or JPEG format:", jpgOrJpegFormats);
                    brandlogo = jpgOrJpegFormats[0].src;
                    isjpgOrJpegLogo = true;
                    $update();
                } else {
                    console.log("No suitable logo format found.");
                }
            }
        }
    } else {
        console.log("No logos array found in the API response.");
    }
}


          
// update brands records
function updatebrand_data(apiResponse){
   let branddata = apiResponse;
    console.log("Brand Data " + branddata);
   companyname = apiResponse.name;
  brandcolors = apiResponse.colors.length ? apiResponse.colors :[];
  console.log(brandcolors);
      console.log(brandcolors[0]);
      cardbg = brandcolors[0].hex;
      cardtext = brandcolors[0].type;
  if (cardtext === 'dark') {
    cardfont = "#fff";
} else if (cardtext === 'accent') {
    cardfont = "#fff";
} else {
    cardfont = "#000";
}   
 
  $(document).on('click', '.bcolor', function () {
    
    // Remove 'selected' class from all anchor tags with 'bcolor' class
    $('.bcolor').removeClass('selected');
    
    // Add 'selected' class to the clicked anchor tag
    $(this).addClass('selected');
    
    // Extract data attributes from the clicked anchor tag
    var bgColor = $(this).data('cardbg');
    var textColor = $(this).data('text');
    
    console.log(textColor);
    
    cardbg = bgColor;
    cardtext = textColor;
    
    // Set cardfont based on cardtext value
    if (cardtext === 'dark' || cardtext === 'accent') {
      cardfont = "#fff";
    } else {
      cardfont = "#000";
    }
    
    // Call your update function (assuming it's defined elsewhere)
    $update();
  });
   
    
    
    
}
  
      } else {
        console.log('Selected Item Not Found.');
      }
    }
  }
});

     
    });
      let initializeSmartSelectCustomOptionsImage = function() {
            smartSelectCustomOptionsImage = $f7.smartSelect.create({
                el: $el.value.find('#smart-select-custom-options-image'),
                openIn: 'popup'
            });
        }
  const  startBlinkIDScanning = () => {
      // Call the BlinkID Cordova plugin method to start scanning
      cordova.plugins.BlinkID.scan(
        // Success callback
        (result) => {
          // Handle the scanned data here
          console.log('Scanned Data:', result);
          // Implement logic to handle the scanned data
        },
        // Error callback
        (error) => {
          // Handle errors here
          console.error('Error:', error);
        },
        // Optional configurations (if needed)
        {
          // Add optional configuration options here
        }
      );
    }
  $on('pageBeforeIn', function() {
                  initializeSmartSelectCustomOptionsImage();

        });
  $on('pageInit', () => {
      
      sheetSwipeToClose = $f7.sheet.create({
        el: '.demo-sheet-swipe-to-close',
        swipeToClose: true,
        push: true,
        backdrop: true,
      });
     
    });
    return $render;
  };

