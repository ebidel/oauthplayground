/* Copyright (c) 2012 Eric Bidelman
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Implements the UI functionality and JS utility methods
 * for the OAuth Playground. Handles initializing, updating, and resetting
 * various components in the UI. Its dependencies include the JQuery library,
 * jquery.form.js plugin, and SyntaxHighligher.
 *
 * @author ebidel@ (Eric Bidelman)
 */

// Protected namespace
var playground = {};

playground.TOKEN_ENDPOINTS = {
  'request' : 'OAuthGetRequestToken',
  'authorized' : 'OAuthAuthorizeToken',
  'access' : 'OAuthGetAccessToken',
  'info' : 'AuthSubTokenInfo',
  'revoke' : 'AuthSubRevokeToken',
  'dev_token' : 'accounts/OAuthWrapBridge'
};

// Displays what type of the token the user currently has
playground.TOKEN_TYPE = {
  'request' : 'request token',
  'authorized' : 'request token (authorized)',
  'access' : 'access token'
};

// API services and example feed endpoints.
playground.SCOPES = {
  'Analytics' : {
      'scope' : 'https://www.google.com/analytics/feeds/',
      'feeds' : ['accounts/default']
  },
  'Google Base' : {
      'scope' : 'https://www.google.com/base/feeds/',
      'feeds' : ['snippets', 'items', 'attributes', 'itemtypes/&lt;locale&gt;']
  },
  'Google Buzz' : {
      'scope' : 'https://www.googleapis.com/auth/buzz',
      'feeds' : ['']
  },
  'Book Search' : {
      'scope' : 'https://www.google.com/books/feeds/',
      'feeds' : ['volumes/[&lt;volume_ID&gt;]',
                'p/&lt;PARTNER_COBRAND_ID&gt;/volumes',
                'users/me/collections/library/volumes',
                'users/me/volumes']
  },
  'Blogger' : {
      'scope' : 'https://www.blogger.com/feeds/',
      'feeds' : ['default/blogs', '&lt;blogID&gt;/posts/default',
                '&lt;blogID&gt;/[&lt;postID&gt;]/comments/default']
  },
  'Calendar' : {
      'scope' : 'https://www.google.com/calendar/feeds/',
      'feeds' : ['default/allcalendars/full/[&lt;calendarID&gt;]',
                'default/owncalendars/full',
                'default/&lt;visibility&gt;/full/[&lt;eventID&gt;]']
  },
  'Contacts' : {
      'scope' : 'https://www.google.com/m8/feeds/',
      'feeds' : ['contacts/default/full/[&lt;contactID&gt;]',
                'groups/default/full/[&lt;contactID&gt;]']
  },
  'Chrome Web Store' : {
      'scope' : 'https://www.googleapis.com/auth/chromewebstore.readonly',
      'feeds' : ['']
  },
  'Documents List' : {
      'scope': 'https://docs.google.com/feeds/',
      'feeds': ['default/private/full/',
                'default/private/full/&lt;resource_id&gt;/acl',
                'default/private/full/&lt;folder_resouce_id&gt;/contents',
                'default/private/full/&lt;resouce_id&gt;/revisions',
                'metadata/default']
  },
  'Finance' : {
      'scope' : 'https://finance.google.com/finance/feeds/',
      'feeds' : ['default/portfolios/[&lt;portfolioID&gt;]',
                'default/portfolios/&lt;portfolioID&gt;/positions/' +
                '[&lt;tickerID&gt;]',
                'default/portfolios/&lt;portfolioID&gt;/positions/' +
                '&lt;tickerID&gt;/transactions/[&lt;transactionID&gt;]']
  },
  'GMail' : {
      'scope' : 'https://mail.google.com/mail/feed/atom',
      'feeds' : ['/[&lt;label&gt;]']
  },
  'Health' : {
      'scope' : 'https://www.google.com/health/feeds/',
      'feeds' : ['profile/default', 'register/default']
  },
  'H9' : {
      'scope' : 'https://www.google.com/h9/feeds/',
      'feeds' : ['profile/default', 'register/default']
  },
  'Maps' : {
      'scope' : 'https://maps.google.com/maps/feeds/',
      'feeds' : ['maps/default/full', 'maps/userID/full/[&lt;elementID&gt;]',
                 'features/default/[&lt;mapID&gt;]/full/[&lt;elementID&gt;]']
  },
  'Moderator' : {
      'scope' : 'https://www.googleapis.com/auth/moderator',
      'feeds' : ['']
  },
  'OpenSocial' : {
      'scope' : 'https://www-opensocial.googleusercontent.com/api/people/',
      'feeds' : ['@me/@all']
  },
  'Orkut REST' : {
      'scope' : 'https://www.googleapis.com/auth/orkut',
      'feeds' : ['']
  },
  'orkut' : {
      'scope' : 'https://orkut.gmodules.com/social/rest',
      'feeds' : ['']
  },
  'Picasa Web' : {
      'scope' : 'https://picasaweb.google.com/data/',
      'feeds' : ['feed/api/user/default/[albumid/&lt;albumID&gt;]',
                'entry/api/user/default/albumid/&lt;albumID&gt;/' +
                '&lt;versionNumber&gt;',
                'entry/api/user/default/albumid/&lt;albumID&gt;/photoid/' +
                '&lt;photoID&gt;/&lt;versionNumber&gt;',
                'media/api/user/default/albumid/&lt;albumID&gt;/photoid/' +
                '&lt;photoID&gt;/&lt;versionNumber&gt;']
  },
  'Sidewiki' : {
      'scope' : 'https://www.google.com/sidewiki/feeds/',
      'feeds' : ['entries/author/&lt;authorId&gt;/full',
                 'entries/webpage/&lt;webpageUri&gt;/full']
   },
  'Sites' : {
      'scope' : 'https://sites.google.com/feeds/',
      'feeds' : ['content/&lt;site&gt;/&lt;site_name&gt;/&lt;entryID&gt;]',
                 'revision/&lt;site&gt;/&lt;site_name&gt;',
                 'activity/&lt;site&gt;/&lt;site_name&gt;/[&lt;entryID&gt;]',
                 'site/&lt;site&gt;/[&lt;entryID&gt;]',
                 'acl/site/&lt;site&gt;/&lt;site_name&gt;/[&lt;entryID&gt;]']
   },
  'Spreadsheets' : {
    'scope': 'https://spreadsheets.google.com/feeds/',
    'feeds': ['spreadsheets/private/full/[&lt;key&gt;]',
              'worksheets/&lt;key&gt;/private/full/[&lt;worksheetID&gt;]',
              'list/&lt;key&gt;/&lt;worksheetID&gt;/private/full/' +
              '[&lt;rowID&gt;]',
              'cells/&lt;key&gt;/&lt;worksheetID&gt;/private/full/' +
              '[&lt;cellID&gt;]',
              '&lt;key&gt;/tables/[&lt;tableID&gt;]',
                '&lt;key&gt;/records/&lt;tableID&gt;/[&lt;recordID&gt;]']
  },
  'Tasks' : {
    'scope': 'https://www.googleapis.com/auth/tasks',
    'feeds': ['']
  },
  'URL Shortener' : {
      'scope': 'https://www.googleapis.com/auth/urlshortener',
      'feeds': ['']
  },
  'Wave' : {
    'scope': 'http://wave.googleusercontent.com/api/rpc',
    'feeds': ['']
  },
  'Webmaster Tools' : {
    'scope': 'https://www.google.com/webmasters/tools/feeds/',
    'feeds': ['sites/[&lt;siteID&gt;]', '&lt;siteID&gt;/sitemaps']
  },
  'YouTube': {
    'scope': 'https://gdata.youtube.com',
    'feeds': ['/feeds/api/users/default',
              '/feeds/api/users/default/contacts',
              '/feeds/api/users/default/favorites',
              '/feeds/api/users/default/playlists/[&lt;playlistID&gt;]',
              '/feeds/api/users/default/subscriptions',
              '/feeds/api/videos/&lt;videoID&gt;/related',
              '/feeds/api/videos/&lt;videoID&gt;/responses',
              '/feeds/api/videos/&lt;videoID&gt;/comments',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/top_rated',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/top_favorites',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_viewed',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_popular',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_recent',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_discussed',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_linked',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/most_responded',
              '/feeds/api/standardfeeds/[&lt;regionID&gt;]/recently_featured',
              '/feeds/api/standardfeeds/watch_on_mobile']
  }
};

playground.currentScope = {}; // current selected scope(s)
playground.ORIG_DATA_VIEW_WIDTH = 490; // original width of right panel

// Resize output panels on window resize. Needed for wrapping text.
window.addEventListener('resize', function(e) {
  playground.resetPanelWidths(e);
}, false);

// Setup event handlers and initialize UI
jQuery(document).ready(function() {

  playground.buildScopeOptions(); // Build scope options.

  // Set initial width on output panels.
  playground.resetPanelWidths();

  // Bind oauth_form as an 'ajaxForm'
  jQuery('#oauth_form').ajaxForm({
    url: 'index.php', // overrides form's action
    beforeSubmit: playground.showRequest, // pre-submit callback
    success: playground.showResponse, // post-submit callback
    dataType: 'json' // type of reponse to expect
  });

  // ===========================================================================
  // GET THE TOKEN (step 3-5) buttons
  // ===========================================================================

  // --------------------- 'Token management' links ----------------------------
  // 'get token info' link
  jQuery('#get_token_link').click(function() {
    jQuery('#http_method').val('GET');
    var hostPrefix = jQuery('#host').val();
    jQuery('#feedUri').val(hostPrefix + '/' + playground.TOKEN_ENDPOINTS['info']);
    return false;
  });

  // 'revoke token' link
  jQuery('#revoke_token_link').click(function() {
    jQuery('#http_method').val('GET');
    var hostPrefix = jQuery('#host').val();
    jQuery('#feedUri').val(hostPrefix + '/' + playground.TOKEN_ENDPOINTS['revoke']);
    return false;
  });

  // 'start over' link
  jQuery('#start_over_link').click(function() {
    jQuery('#http_method').val('GET');
    jQuery('#tokenType').text('');
    jQuery('#oauth_token').val('');
    jQuery('#token_ops').hide();
    jQuery('#token_secret').val('');
    window.sessionStorage.removeItem('tokenSecret');
    jQuery('#request_token_button').removeAttr('disabled');
    return false;
  });

  jQuery('#gdata-version').change(function() {
    window.sessionStorage.gdataVersion = this.value;
  });

  // -------------------- Fetch oauth token buttons ----------------------------
  jQuery('#request_token_button').click(function() {
    window.sessionStorage.tokenType = 'request';
    var hostPrefix = jQuery('#host').val();
    jQuery('#token_endpoint').val(hostPrefix + '/' +
                                  playground.TOKEN_ENDPOINTS['request']);;
    window.sessionStorage.host = hostPrefix;
    jQuery(this).val('request_token');
  });

  jQuery('#authorize_token_button').click(function() {
   window.sessionStorage.tokenType = 'authorized';
    jQuery('#token_endpoint').val(jQuery('#host').val() + '/' +
                                  playground.TOKEN_ENDPOINTS['authorized']);
    jQuery(this).val('authorize');
  });

  jQuery('#access_token_button').click(function() {
    window.sessionStorage.tokenType = 'access';
    jQuery('#token_endpoint').val(jQuery('#host').val() + '/' +
                                  playground.TOKEN_ENDPOINTS['access']);
    jQuery(this).val('access_token');
  });

  jQuery('#advanced_check').click(function() {
    jQuery('#endpoint_container').toggle();
    jQuery('#xoauth_displayname_container').toggle();
    window.sessionStorage.customEndpoint = this.checked ? 'yes' : 'no';
  });
  // ===========================================================================


  // ===========================================================================
  // EXECUTE SECTION (Step 6)
  // ===========================================================================

  // HTTP method dropdown <SELECT>
  jQuery('#sig_method').change(playground.setTokenUI);

  // 'Execute' button
  jQuery('#execute').click(function() {
    var feedUri = jQuery('#feedUri').val();
    if (!feedUri || feedUri.indexOf('http') != 0) {
      alert('Please enter a feed');
      return false;
    }
    return true;
  });

  // Toggle syntax highlighter checkbox
  jQuery('#syntaxHighlight').click(function() {
    if (!this.checked) {
      window.sessionStorage.syntaxHighlight = 'no';
    } else {
      window.sessionStorage.syntaxHighlight = 'yes';
    }
  });
  // ===========================================================================


  // Decide what type of token we have and display that on page load.
  if (jQuery('#oauth_token').val() == '') {
    window.sessionStorage.removeItem('tokenType');
    window.sessionStorage.host = 'www.google.com';
    jQuery('#tokenType').text('');
    jQuery('#token_ops').hide();
    jQuery('#request_token_button').removeAttr('disabled');
  } else {
    var tokenType = window.sessionStorage.tokenType;

    // User has authorized request token or access token
    if (tokenType) {
      jQuery('#tokenType').text(playground.TOKEN_TYPE[tokenType]);
      jQuery('#host').val(window.sessionStorage.host);
      jQuery('#token_secret').val(window.sessionStorage.tokenSecret);

      // Enable appropriate UI elements based on type of token
      switch(tokenType) {
        case 'authorized':
          jQuery('#access_token_button').removeAttr('disabled');
          break;
        case 'access':
          jQuery('#feedUri').focus();
          jQuery('#token_ops').show();
          break;
      }
    }
  }

  // Restore user's advanced? settings checkbox pref
  if (window.sessionStorage.customEndpoint == 'yes') {
    jQuery('#endpoint_container').show();
    jQuery('#advanced_check').get(0).checked = true;
    jQuery('#xoauth_displayname_container').show();
  }

  // Restore user's syntax highlight checkbox pref
  if (window.sessionStorage.syntaxHighlight == 'yes') {
    //jQuery('#syntaxHighlight').get(0).checked = true;
  }

  // Restore user's oauth signature method pref
  var sigMethod = window.sessionStorage.sigMethod;
  if (sigMethod) {
    jQuery('#sig_method').val(sigMethod);
    playground.setTokenUI();
  }

  // Restore gdata version.
  if (window.sessionStorage.gdataVersion) {
    jQuery('#gdata-version').val(window.sessionStorage.gdataVersion);
  }
});


// ===========================================================================
// MODIFY THE OAUTH PARAMETERS section (Step 2) - UI initializer
// ===========================================================================
playground.setTokenUI = function() {
  var sigMethod = jQuery('#sig_method').val();
  if (sigMethod == 'HMAC-SHA1') {
    jQuery('.consumer_secret_container').show();
    jQuery('#consumer_secret').get(0).required = true;
    jQuery('#ownPrivKey a').hide();
  } else {
    jQuery('.consumer_secret_container').hide();
    jQuery('#consumer_secret').get(0).required = false;
    jQuery('#ownPrivKey a').show();
  }
  window.sessionStorage.sigMethod = sigMethod;
};

/**
 * Presubmit callback for the ajax form that initializes display data panels.
 * @return {boolean} Alway return true to submit ajax form
 */
playground.showRequest = function(formData, jqForm, options) {
  jQuery('.nogutter').remove();
  jQuery('#base_string').html('');
  jQuery('#http_request').html('');
  jQuery('#http_response').html(
      '<div id="loading">' + $('.loading').html() + '</div>');

  return true;  // return true to submit form
};

/**
 * Postsubmit callback for the ajax form that displays response data.
 * @param {json object} responseText The response data as a json object.
 *     The jquery-form plugin automatically fills this variable name
 */
playground.showResponse = function(responseObj, statusText, xhr, $form) {
  var response = responseObj.response || '';
  var baseString = responseObj.base_string || '';
  var authorizationHeader = responseObj.authorization_header || '';
  var htmlLink = responseObj.html_link ? responseObj.html_link + '&v=' +
                                         jQuery('#gdata-version').val() : '';
  var response_headers = responseObj.headers || '';

  var syntaxHighlight = null;//jQuery('#syntaxHighlight').get(0).checked;

  if (responseObj.callback && responseObj.args) {
    response = window['playground'][responseObj.callback](responseObj.args);

    if (!syntaxHighlight) {
      response = response.replace(/(https?:\/\/.*)/g,
          '<a href="$1" onclick="javascript:jQuery(\'#feedUri\').val(\'$1\');return false;">$1</a>');
    }

    jQuery('#http_method').val('GET');
  }

  jQuery('#http_request').html(authorizationHeader);
  jQuery('#base_string').html(baseString);

  if (jQuery('#http_method').val() == 'GET') {
    jQuery('#html_link').html(
        '<a href="' + htmlLink + '" target="_blank">view in browser</a>');
  } else {
     jQuery('#html_link').html('');
  }

  // Extract oauth_token and oauth_token_secret values from request token step.
  var matches = response.match(/oauth_token=(.*)&oauth_token_secret=(.*)&oauth_callback_confirmed=(.*)/);
  if (matches) {
    jQuery('#oauth_token').val(decodeURIComponent(matches[1]));
    jQuery('#token_secret').val(matches[2]);
    window.sessionStorage.tokenSecret = decodeURIComponent(matches[2]);
  } else {
    // Extract oauth_token and secret values for access token step.
    var matches = response.match(/oauth_token=(.*)&oauth_token_secret=(.*)/);
    if (matches) {
      jQuery('#oauth_token').val(decodeURIComponent(matches[1]));
      jQuery('#token_secret').val(matches[2]);
      window.sessionStorage.tokenSecret = decodeURIComponent(matches[2]);
    }
  }

  // extract oauth_timestamp value
  var matches = authorizationHeader.match(/oauth_timestamp="(.*?)"/);
  if (matches) {
    jQuery('#timestamp').val(matches[1]);
  }

  // extract oauth_nonce value
  var matches = authorizationHeader.match(/oauth_nonce="(.*?)"/);
  if (matches) {
    jQuery('#nonce').val(matches[1]);
  }

  // Display what kind of oauth token we have.
  var tokenType = window.sessionStorage.tokenType;
  if (tokenType && (jQuery('#oauth_token').val() != '')) {
    jQuery('#tokenType').text(playground.TOKEN_TYPE[tokenType]);

    switch(tokenType) {
      case 'request':
        jQuery('#request_token_button').attr('disabled', 'disabled');
        jQuery('#authorize_token_button').removeAttr('disabled');
        break;
      case 'access':
        jQuery('#request_token_button').attr('disabled', 'disabled');
        jQuery('#authorize_token_button').attr('disabled', 'disabled');
        jQuery('#access_token_button').attr('disabled', 'disabled');
        jQuery('#token_ops').show();

        // Remove paramater junk from URL if we're upgrading to an access token.
        if (window.history && window.history.replaceState &&
            document.location.search.search('oauth_verifier') != -1) {
          history.replaceState({}, '',
              document.location.protocol + '//' + document.location.host +  document.location.pathname);
        }
        break;
      default:
        jQuery('#token_ops').hide();
    }
  } else if (jQuery('#oauth_token').val() == '') {
    jQuery('#tokenType').text('');
    jQuery('#token_ops').hide();
  }

  // syntax highlight? and resize correct response panel
  if (syntaxHighlight) {
    jQuery('#http_response').html(response_headers + response);
    dp.SyntaxHighlighter.ClipboardSwf = 'js/syntaxHighlighter/clipboard.swf';
    dp.SyntaxHighlighter.HighlightAll('code');
    jQuery('.nogutter').css('width', playground.DATA_VIEW_WIDTH + 10);
  } else {
    response = response.replace(/(https?:\/\/[^schemas].*?)&quot;/g,
        '<a href="$1" onclick="javascript:jQuery(\'#feedUri\').val(\'$1\');return false;">$1</a>"');
    jQuery('#http_response').html(response_headers + response);
    jQuery('#http_response').css('width', playground.DATA_VIEW_WIDTH);
  }
};

/**
 * Processes results from click of discover 'available feeds' button
 * @param {string} scopeArr An array formatted as a string that contains
 *     the scopes the OAuth token is valid for.
 * @return {string} A formatted string containg the available Google Data feeds.
 */
playground.getAvailableFeeds = function(scopeArr) {
  var feeds = [];

  var scopes = JSON.parse(scopeArr);
  for (var i = 0, scope; scope = scopes[i]; i++) {
    for (var service in playground.SCOPES) {
      if (playground.SCOPES[service].scope == scope) {
        feeds.push("\n" + service);
        jQuery.each(playground.SCOPES[service].feeds, function() {
          feeds.push(scope + this);
        });
      }
    }
  }

  return feeds.join("\n");
};

/**
 * Processes results from click of the 'get developer testing token' button.
 * @param {string} resp A stringified JSON object server's response.
 * @return {string} A formatted string containing output.
 */
playground.processDevTokenResponse = function(resp) {
  var obj = eval('(' + resp + ')');
  var token =  decodeURIComponent(obj['devToken']);
  var curl = 'curl --header "Authorization: AuthSub token=' + token +
             '" "&lt;API target URL&gt;" | tidy -xml -indent -quiet';

  return ['Test token: ', token,
          '\nExpires in: ', obj['expiresIn'],
          '\n\ncUrl command:\n', curl].join('');
};

// Utility functions -----------------------------------------------------------
/**
 * Build and display the list of possible Google Data scopes.
 */
playground.buildScopeOptions = function() {
  var scopes = playground.SCOPES;
  var html = ['<ul class="scopes">'];

  for (var service in scopes) {
    var scope = scopes[service].scope;
    html.push('<li><div><img src="images/unchecked.gif" ',
              'onclick="playground.swapCheck(this, \'', scope,
              '\')" align="top"/><input type="checkbox" id="', scope,
              '" value="', scope, '" style="display:none">', service,
              '</div><span>', scope, '</span></li>');
  }
  html.push('</ul>');

  jQuery('#scopes_container').html(html.join(''));

  // register click handlers
  jQuery('.scopes img').click(function() {
    var checkbox = jQuery(this).next();
    var key = checkbox.parent().text();
    if (checkbox.get(0).checked) {
      playground.currentScope[key] = checkbox.val();
    } else {
      delete playground.currentScope[key];
    }

    var temp = [];
    for (var i in playground.currentScope) {
      temp.push(playground.currentScope[i]);
    }

    jQuery('#scope').val(temp.join(' '));
  });
};

/**
 * Simulates a checkbox toggle with an image as a replacement.
 * @param {HTMLElement} image An HTML <img> element
 * @param {string} id A DOM id of an HTML checkbox
 */
playground.swapCheck = function(image, id) {
  var checkbox = document.getElementById(id);
  checkbox.checked = !checkbox.checked;
  image.src = (checkbox.checked) ? 'images/check.gif' : 'images/unchecked.gif';
};

/**
 * Resizes dataView output panels.
 */
playground.resetPanelWidths = function(e) {
  playground.DATA_VIEW_WIDTH = $(window).width() - playground.ORIG_DATA_VIEW_WIDTH;
  jQuery('.dataView').width(playground.DATA_VIEW_WIDTH);
  jQuery('#input_feed').width(playground.DATA_VIEW_WIDTH);
};