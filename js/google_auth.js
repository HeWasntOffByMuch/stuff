'use strict';
var clientId = '36779222916-fmgoemftdrolrec2cetsq1669n1pk5ra.apps.googleusercontent.com';
    var apiKey = 'AIzaSyAiSoq1LJSgxlzJ5RF0WMoC4sflidLLfok';
    var scopes = 'email';
    function handleClientLoad() {
      gapi.client.setApiKey(apiKey);
      window.setTimeout(checkAuth,1);
    }
    function checkAuth() {
      gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
    }
    function handleAuthResult(authResult) {
      var authorizeButton = document.getElementById('authorize-button');
      if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
        makeApiCall();
      } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
      }
    }
    function handleAuthClick(event) {
      gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
      return false;
    }
    function makeApiCall() {
      gapi.client.load('plus', 'v1', function() {
        var request = gapi.client.plus.people.get({
          'userId': 'me'
        });
        request.execute(function(resp) {
          var heading = document.createElement('h4');
          var image = document.createElement('img');
          image.style['border-radius'] = '25px';
          image.src = resp.image.url;
          heading.appendChild(image);

            let name = resp.emails[0].value;
            name = name.substring(0, name.indexOf('@'));
            name = name.split('.').map((word) => {
              return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(' ');
            heading.appendChild(document.createTextNode(name));
            resp.displayName = name;

          document.getElementById('content').appendChild(heading);
          initiateGame(resp);
        });
      });
    }