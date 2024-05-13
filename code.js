function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}


function exportURLList(urlList) {
  var urls = urlList.split('\n').map(url => [url.trim()]);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, urls.length, 1).setValues(urls);
}


function getEmailFromWebsite(url) {
  try {
    var response = UrlFetchApp.fetch(url);
    var content = response.getContentText();


  // You may need to customize this regex pattern based on the structure of the website
    var emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    var match = content.match(emailPattern);


    return match ? match[0] : null;
  } catch (e) {
    return null;
  }
}


function getWhoisInfo(domain) {
  try {
    var whoisUrl = "https://www.whois.com/whois/" + encodeURIComponent(domain);
    var response = UrlFetchApp.fetch(whoisUrl);
    var content = response.getContentText();
    return content;
  } catch (e) {
    return "Error: " + e.toString();
  }
}


function reverseEmailLookup(email) {
  try {
    var reverseEmailUrl = "https://thatsthem.com/email/" + encodeURIComponent(email);
    var response = UrlFetchApp.fetch(reverseEmailUrl);
    var content = response.getContentText();
    return content;
  } catch (e) {
    return "Error: " + e.toString();
  }
}


function enrichWithEmailClearbit(email) {
  var apiKey = "sk_d378fb7643fc27a4c24f7a10bb05ebf0"; // Replace with your Clearbit API key
  try {
    var clearbitUrl = "https://person.clearbit.com/v2/combined/find?email=" + encodeURIComponent(email);
    var headers = {
      Authorization: "Bearer " + apiKey
    };
    var options = {
      method: "GET",
      headers: headers
    };


    var response = UrlFetchApp.fetch(clearbitUrl, options);
    var content = response.getContentText();
    return content;
  } catch (e) {
    return "Error: " + e.toString();
  }
}


function guessEmail(domain, firstName, lastName) {
  // Generate possible email address formats
  var formats = [
    `${firstName}@${domain}`,
    `${firstName}.${lastName}@${domain}`,
    `${firstName.charAt(0)}.${lastName}@${domain}`
    // Add more formats as needed
  ];


  // Return the generated formats
  return formats;
}


function searchForEmail(site, domain) {
  try {
    // Construct a search query for common email-related keywords
    var searchQuery = `site:${site} email OR contact OR info`;
    var searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;


    // Fetch search results
    var response = UrlFetchApp.fetch(searchUrl);
    var content = response.getContentText();




    return "Email not found in search results";
  } catch (e) {
    return "Error: " + e.toString();
  }
}


function checkPublicDatabases(industry, domain) {
  try {
  

    return "Email not found in public databases";
  } catch (e) {
    return "Error: " + e.toString();
  }
}


function searchLinkedInForEmail(url) {
  try {
    var response = UrlFetchApp.fetch(url);
    var content = response.getContentText();


    var emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    var rolePattern = /CEO|Page Moderator/i;



    var emailMatches = content.match(emailPattern);

    var roles = content.match(rolePattern);


    var uniqueEmails = removeDuplicates(emailMatches);


    if (roles && roles.length > 0) {
      // Assuming you are updating the same row, adjust the row number accordingly
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.getRange( 3).setValue(uniqueEmails.join(", "));
    }
  } catch (e) {
    Logger.log("Error: " + e.toString());
  }
}


function removeDuplicates(array) {
  var uniqueArray = [];
  for (var i = 0; i < array.length; i++) {
    if (uniqueArray.indexOf(array[i]) === -1) {
      uniqueArray.push(array[i]);
    }
  }
  return uniqueArray;
}




searchLinkedInForEmail("https://www.linkedin.com/company/example");


function processWebsites() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();

    var websiteRange = sheet.getRange("A1:A" + lastRow);
    var emailsRange = sheet.getRange("B1:B" + lastRow);


    var websites = websiteRange.getValues();
    var emails = emailsRange.getValues();


    var results = []; // To store URL and extracted email pairs


   
    for (var i = 1; i <= lastRow; i++) {
      var url = websites[i - 1][0];
      var email = emails[i - 1][0];


      if (!email) {
        // Your email retrieval logic here
        var extractedEmail = getEmailFromWebsite(url); // Adjust this line as needed


        // Update the result in column B
        sheet.getRange(i, 2).setValue(extractedEmail || "  ");


        // Store URL and extracted email pair
        results.push({ url: url, email: extractedEmail || "  " });
      }


      // Remove email addresses ending with ".png"
      var emailColumnValues = emailsRange.getValues();
      var rowsToRemove = [];


      for (var j = 0; j < emailColumnValues.length; j++) {
        var emailValue = emailColumnValues[j][0];
        if (emailValue && emailValue.toLowerCase().endsWith(".png")) {
          rowsToRemove.push(j + 1); // Add 1 to convert from zero-based to one-based index
        }
      }
    }


    // Display the results on the HTML page
    return results;
  } catch (error) {
    return "Error: " + error.toString();
  }
}

