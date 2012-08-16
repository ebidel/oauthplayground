<?php
/* Copyright (c) 2012 Eric Bidelman
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Eric Bidelman <ebidel@>
 */

session_start();
require_once('common.inc.php');

// Use consumer key/secret set when request token was fetched or setup a
// consumer based on the request params (e.g. for 2 legged OAuth)
if (isset($_SESSION['consumer_key']) && isset($_SESSION['consumer_secret'])) {
  $consumer = new OAuthConsumer($_SESSION['consumer_key'],
                                $_SESSION['consumer_secret']);
} else {
  $consumer = new OAuthConsumer(@$_REQUEST['consumer_key'],
                                @$_REQUEST['consumer_secret']);
}

// OAuth v1.0a contains the oauth_verifier parameter coming back from the SP
if(isset($_GET['oauth_verifier']) && !isset($_SESSION['oauth_verifier'])) {
  $_SESSION['oauth_verifier'] = $_GET['oauth_verifier'];
}

$scope = @$_REQUEST['scope'];
$http_method = @$_REQUEST['http_method'];
$feedUri = @$_REQUEST['feedUri'];
$postData = @$_REQUEST['postData'];
$privKey = isset($_REQUEST['privKey']) && trim($_REQUEST['privKey']) != '' ? $_REQUEST['privKey'] : NULL;
$token_endpoint = @$_REQUEST['token_endpoint'];

$callback_url = "http://{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";

// OAuth token from token/secret parameters
$token = isset($_REQUEST['oauth_token']) ? $_REQUEST['oauth_token'] : @$_SESSION['access_token'];
$token_secret = isset($_SESSION['token_secret']) ? $_SESSION['token_secret'] : @$_REQUEST['token_secret'];
$oauth_token = $token ? new OAuthToken($token, $token_secret) : NULL;

$sig_method = isset($_REQUEST['sig_method']) ? $SIG_METHODS[$_REQUEST['sig_method']] : $rsa_method;

/**
 *  Main action controller
 */
switch(@$_REQUEST['action']) {

  // STEP 1: Fetch request token
  case 'request_token':

    // Cleanup: started the process to get a new access token
    unset($_SESSION['access_token']);
    unset($_SESSION['token_secret']);
    unset($_SESSION['oauth_verifier']);
    unset($_SESSION['consumer_key']);
    unset($_SESSION['consumer_secret']);

    // Use the user's own private key if set. Defaults to the Playground's.
    if ($privKey) {
      $_SESSION['privKey'] = $privKey;
    } else {
      unset($_SESSION['privKey']);
    }

    // Use the user's own consumer key ifset. Defaults to the Playground's.
    if ($_REQUEST['consumer_key']) {
      $_SESSION['consumer_key'] = $_REQUEST['consumer_key'];
    } else {
      unset($_SESSION['consumer_key']);
    }

    // Use the user's own consumer secret if set. Defaults to the Playground's.
    if ($_REQUEST['consumer_secret']) {
      $_SESSION['consumer_secret'] = $_REQUEST['consumer_secret'];
    } else {
      unset($_SESSION['consumer_secret']);
    }

    // Handle certain Google Data scopes that have their own approval pages.
    if ($scope) {
      // Health still uses OAuth v1.0
      if (preg_match('/health/', $scope) || preg_match('/h9/', $scope)) {
        $params = array('scope' => $scope);
      } else {
        // Use the OAuth v1.0a flow (callback in the request token step)
        $params = array('scope' => $scope, 'oauth_callback' => $callback_url);
      }
      $url = $token_endpoint . '?scope=' . urlencode($scope);
    } else {
      $params = array('oauth_callback' => $callback_url);
      $url = $token_endpoint;
    }

    // Installed app use case
    if ($_REQUEST['xoauth_displayname'] != NULL) {
      $params['xoauth_displayname'] = $_REQUEST['xoauth_displayname'];
      $params['oauth_callback'] = 'oob';
      $url .= (preg_match('/\?/', $url, $matches) == 0) ? '?' : '&';
      $url .= 'xoauth_displayname=' . urlencode($_REQUEST['xoauth_displayname']);
    }

    // GET https://www.google.com/accounts/OAuthGetRequestToken?scope=<SCOPEs>
    $req = OAuthRequest::from_consumer_and_token($consumer, $oauth_token, 'GET',
                                                 $url, $params);
    $req->sign_request($sig_method, $consumer, $oauth_token, $privKey);

    // Fill response
    echo json_encode(array(
        'html_link' => '',
        'base_string' =>  $req->get_signature_base_string(),
        'response' => send_signed_request('GET', $url, array($req->to_header())),
        'authorization_header' => $req->to_header()
    ));

    exit;  // ajax request, just stop exec

    break;

  // STEP 2: Authorize the request token.  Redirect user to approval page.
  case 'authorize':
    // OAuth v1.0a - no callback URL provided to the authorization page.
    $auth_url = $token_endpoint . '?oauth_token=' . $oauth_token->key;

    // Cover special cases for Google Health approval page
    if (preg_match('/health/', $scope) || preg_match('/h9/', $scope)) {
      // Google Health - append permission=1 parameter to read profiles
      // and callback URL for v1.0 flow.
      $auth_url .= '&permission=1&oauth_callback=' . urlencode($callback_url);
    }

    // Redirect to https://www.google.com/accounts/OAuthAuthorizeToken
    echo json_encode(array(
        'html_link' => '',
        'base_string' => '',
        'response' => "<script>window.location='$auth_url';</script>"
    ));

    exit; // ajax request, just stop exec

    break;

  // STEP 3: Upgrade authorized request token to an access token.
  case 'access_token':
    // GET https://www.google.com/accounts/OAuthGetAccessToken
    $req = OAuthRequest::from_consumer_and_token($consumer, $oauth_token, 'GET',
        $token_endpoint, array('oauth_verifier' => $_SESSION['oauth_verifier']));
    $req->sign_request($sig_method, $consumer, $oauth_token, $privKey);


    $response = send_signed_request('GET', $token_endpoint, array($req->to_header()));

    // Extract and remember oauth_token (access token) and oauth_token_secret
    preg_match('/oauth_token=(.*)&oauth_token_secret=(.*)/', $response, $matches);
    $_SESSION['access_token'] = urldecode(@$matches[1]);
    $_SESSION['token_secret'] = urldecode(@$matches[2]);

    echo json_encode(array(
        'html_link' => $req->to_url(),
        'base_string' => $req->get_signature_base_string(),
        'response' => $response,
        'authorization_header' => $req->to_header()
    ));

    exit;  // ajax request, just stop exec

    break;

  // Fetch data.  User has valid access token.
  case 'execute':
    $feedUri = trim($feedUri);

    // create an associative array from each key/value url query param pair.
    $params = array();
    $pieces = explode('?', $feedUri);
    if (isset($pieces[1])) {
     $params = explode_assoc('=', '&', $pieces[1]);
    }

    //$params['prettyprint'] = 'true';

    // urlencode each url parameter key/value pair
    $tempStr = $pieces[0];
    foreach ($params as $key=>$value) {
      $tempStr .= '&' . urlencode($key) . '=' . urlencode($value);
    }
    $feedUri = preg_replace('/&/', '?', $tempStr, 1);

    $req = OAuthRequest::from_consumer_and_token($consumer, $oauth_token,
                                                 $http_method, $feedUri, $params);
    $req->sign_request($sig_method, $consumer, $oauth_token, $privKey);

    $auth_header = $req->to_header();

    // decide where to put the oauth_* params (Authorization header or in URL)
    if ($_REQUEST['oauth_params_loc'] == 'query') {
      $feedUri = $req->to_url();
      $auth_header = null;
    }

    // Only allow https? urls.
    if (strpos($feedUri, 'http') !== 0) {
      echo json_encode(array('html_link' => $req->to_url(),
                             'base_string' =>  $req->get_signature_base_string(),
                             'response' => 'Please enter a feed URL.',
                             'authorization_header' => $auth_header));
      exit;
    }

    $content_type = 'Content-Type: ' . $_POST['content-type'];
    $gdataVersion = 'GData-Version: ' . @$_REQUEST['gdata-version'];
    $result = send_signed_request($http_method, $feedUri,
                                  array($auth_header, $content_type, $gdataVersion), $postData);

    if (!$result) {
      die("{'html_link' : '" . $req->to_url() . "', " .
           "'base_string' : '" . $req->get_signature_base_string() . "', " .
           "'response' : '" . $result . "'}");  // return json
    }

    $result = split('<', $result, 2);

    // If response was not XML xml_pretty_printer() will throw exception.
    // In that case, set the response body directly from the result.
    try {
      $response_body = @xml_pretty_printer(isset($result[1]) ? '<' . $result[1] : $result[0], true);
    } catch(Exception $e) {
      $response_body =  isset($result[1]) ? '<' . $result[1] : $result[0];
    }

    echo json_encode(array('html_link' => $req->to_url(),
                           'base_string' =>  $req->get_signature_base_string(),
                           'headers' => isset($result[1]) ? $result[0] : '',
                           'response' => $response_body,
                           'authorization_header' => $auth_header));
    exit;

    break;

  // 'available feeds' button. Uses AuthSubTokenInfo to parse out feeds the token can access.
  case 'discovery':
    $url = 'https://www.google.com/accounts/AuthSubTokenInfo';
    $req = OAuthRequest::from_consumer_and_token($consumer, $oauth_token, 'GET',
                                                 $url);
    $req->sign_request($sig_method, $consumer, $oauth_token, $privKey);

    $response = send_signed_request('GET', $req);

    // Parse out valid scopes returned for this access token
    preg_match_all('/Scope.*=(.*)/', $response, $matches);

    echo json_encode(array(
        'html_link' => $req->to_url(),
        'base_string' => $req->get_signature_base_string(),
        'authorization_header' => $req->to_header(),
        'args' => json_encode($matches[1]),
        'callback' => 'getAvailableFeeds'
    ));

    exit;  // ajax request, just stop execution

    break;

   // 'get developer testing token' button.
  case 'get_dev_token':
    $url = 'https://www.google.com/accounts/OAuthWrapBridge';
    $req = OAuthRequest::from_consumer_and_token($consumer, $oauth_token, 'GET',
                                                 $url);
    $req->sign_request($sig_method, $consumer, $oauth_token, $privKey);

    $response = send_signed_request('GET', $req);

    // Parse out valid scopes returned for this access token
    preg_match_all('/wrap_access_token=(.*)&wrap_access_token_expires_in=(.*)/',
                   $response, $matches);

    echo json_encode(array(
        'html_link' => '',
        'base_string' => 'N/A',
        'authorization_header' => $req->to_header(),
        'args' => "{'devToken':'" . $matches[1][0] .
                  "', 'expiresIn':" . $matches[2][0] . "}",
        'callback' => "processDevTokenResponse"
    ));

    exit;  // ajax request, just stop execution

    break;
}
?>
