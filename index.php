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

require_once('playground.php');
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge;chrome=1" />
<title>OAuth Playground</title>
<link type="text/css" rel="stylesheet" href="css/thickbox.css"/>
<!--<link type="text/css" rel="stylesheet" href="css/SyntaxHighlighter.css"/>-->
<link type="text/css" rel="stylesheet" href="css/main.css"/>
</head>
<body>

<header>
For the Google APIs that support it, try the <a href="https://code.google.com/oauthplayground/" target="_blank">OAuth 2.0 Playground</a>!
</header>

<form method="POST" name="oauth_form" id="oauth_form">

<table class="main" border="0" align="center" cellspacing="10" cellpadding="0">
<tr>
  <td style="width:280px">
    <a href="//www.googlecodesamples.com/oauth_playground/"><img src="images/oauth_playground_logo2.png" style="width:276px;height:35px" title="OAuth Playground Logo" alt="OAuth Playground Logo" border="0" /></a>
  </td>
  <td style="vertical-align:middle;padding-bottom:7px">
    By &nbsp; <img src="images/google.gif" style="height:18px;width:49px;vertical-align:middle;" title="by Google" alt="by Google" />
  </td>
  <td rowspan="2" id="dataViewsTD" valign="top">
    <h3>Signature base string</h3>
    <textarea id="base_string" class="dataView"></textarea>

    <h3>Request/Response</h3>
    <pre id="http_response" class="dataView xml:nogutter" name="code"></pre>

    <div id="html_link"></div>
  </td>
</tr>
<tr>
<td id="settings-menu" width="490" valign="top" rowspan="2" colspan="2">

  <div class="panel">
    <h3 class="title"><div class="num">1</div> Choose your Scope(s)</h3>
    <div id="scopes_container"></div>
    <input type="text" id="scope" name="scope" placeholder="input your own" />
  </div>

  <div class="panel" id="oauth_parameters">
    <h3 class="title"><div class="num">2</div> Modify the OAuth Parameters <small>(optional)</small></h3>
    <h4>oauth_signature_method</h4>
    <select name="sig_method" id="sig_method">
      <?php
        foreach ($SIG_METHODS as $name => $method) {
          print "<option value='$name'>$name</option>";
        }
      ?>
    {% endfor %}
    </select>

    <span id="ownPrivKey">
      <a href="#TB_inline?width=580&height=310&inlineId=privKey" class="thickbox popupLink" title="Enter a private key in .PEM format<p><b>Note:</b> This feature requires you to have previously uploaded a <br>public certificate to <a href='https://www.google.com/accounts/ManageDomains' target='_blank'>Google</a> under the domain you specified <br>for <code>oauth_consumer_key</code>.<p>For help creating a self-signing key/cert, see <br><a href='http://code.google.com/apis/gdata/docs/auth/oauth.html#GeneratingKeyCert' target='_blank'>Generating a self-signing private key and public certificate</a><p></p>">use your own private key</a>
    </span>

    <div class="column">
      <span>
        <h4>oauth_consumer_key</h4>
        <input type="text" name="consumer_key" value="<?php echo htmlentities(isset($_SESSION['consumer_key']) ? $_SESSION['consumer_key'] : 'googlecodesamples.com'); ?>" required placeholder="example.com" />
      </span>
      <span class="consumer_secret_container">
        <h4>consumer secret</h4>
        <input type="text" name="consumer_secret" id="consumer_secret" value="<?php echo htmlentities(isset($_SESSION['consumer_secret']) ?  $_SESSION['consumer_secret'] : $consumer->secret); ?>" />
      </span>
    </div>

    <div class="column">
      <span>
        <h4>oauth_token &nbsp; <span id="tokenType" style="font-size:small;"><?php echo htmlentities(isset($_SESSION['access_token']) ?  'access token' : ''); ?></span></h4>
        <input type="text" name="oauth_token" id="oauth_token" value="<?php echo htmlentities(isset($_SESSION['access_token']) ?  $_SESSION['access_token'] : $oauth_token ? $oauth_token->key : ''); ?>" placeholder="value"/>
      </span>
      <span class="consumer_secret_container">
        <h4>oauth_token_secret</h4>
        <input type="text" name="token_secret" id="token_secret" value="<?php echo htmlentities(isset($_SESSION['token_secret']) ?  $_SESSION['token_secret'] : $token_secret); ?>" placeholder="secret" />
      </span>
    </div>

    <div class="column">
      <span>
        <h4>oauth_timestamp</h4>
        <input type="text" name="timestamp" id="timestamp" value="" readonly disabled />
      </span>
      <span>
        <h4>oauth_nonce</h4>
        <input type="text" name="nonce" id="nonce" value="" readonly disabled />
      </span>
    </div>
  </div>

  <div class="panel">
    <h3 class="title" style="float:left;width:75%">Get the Token</h3><span style="float:right;">Advanced? <input type="checkbox" id="advanced_check"></span>
    <div style="clear:both">
      <span id="endpoint_container" style="display:none;">Server: <input type="text" id="host" name="host" value="https://www.google.com/accounts" style="width:275px;"/></span>
      <input type="text" id="token_endpoint" name="token_endpoint" value="/accounts/OAuthGetRequestToken" style="display:none;"/>
      <table id="token-steps">
      <tr>
        <td><div class="num">3</div></td><td><strong>Get a Request Token:</strong>
          <button type="submit" name="action" value="request_token" id="request_token_button" disabled>Request token</button>
        <div id="xoauth_displayname_container" style="display:none;margin-top:10px;"><strong>xoauth_displayname</strong>: <input type="text" id="xoauth_displayname" name="xoauth_displayname" value=""/></div>
        </td>
      </tr>
      <tr>
        <td><div class="num">4</div></td><td><strong>Authorize the Request Token:</strong>
          <button type="submit" name="action" value="authorize" id="authorize_token_button" disabled>Authorize</button>
      </tr>
      <tr>
        <td><div class="num">5</div></td><td><strong>Upgrade to an Access Token:</strong>
          <button type="submit" name="action" value="access_token" id="access_token_button" disabled>Access token</button>
      </tr>
      </table>

      <div id="token_ops">
        <span><h4>Token management:</h4></span>
        <span>
          <button type="submit" name="action" id="get_dev_token" value="get_dev_token" onclick="this.value='get_dev_token';" title="Fetch a temporary developer token for testing purposes">get dev token</button>
          <a href="" id="get_token_link">get token info</a>
          <a href="" id="revoke_token_link">revoke token</a>
          <a href="" id="start_over_link">start over</a>
        </span>
      </div>

    </div>
  </div>

</td>
</tr>
<tr>
<td valign="top">

  <div class="panel" id="input_feed">

    <h3 class="title" style="float:left;width:83%"><div class="num">6</div> Use the token</h3>

    <button type="submit" name="action" id="discovery" value="discovery" onclick="this.value='discovery';" title="Discover which authenticated feeds are accessible by your token">available feeds</button>

    <div style="clear:both;position:relative">
      <div style="float:left;margin-right:8px;text-align:right;">
        <select id="http_method" name="http_method">
          <option value="GET" selected="selected">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <br>
        <a href="#TB_inline?width=685&height=610&inlineId=postData" class="thickbox popupLink" title="Enter POST/PUT data" style="font-size:90%;">enter post data</a>
      </div>
      <input type="text" id="feedUri" name="feedUri" value="<?php echo strip_tags($feedUri); ?>" placeholder="Enter a feed URI" autofucus />
      <button type="submit" name="action" id="execute" value="execute" onclick="this.value='execute';" title="Query a feed">execute</button>
    </div>

    <div style="margin:10px 0 5px 0;clear:both;">
      <!--<label for="syntaxHighlight">Syntax highlight response?</label> <input type="checkbox" id="syntaxHighlight"/> &nbsp; <strong>|</strong> &nbsp;
      -->Put oauth params in: <input type="radio" id="oauth_params_loc1" name="oauth_params_loc" checked="checked" value="header"><label for="oauth_params_loc1">Authorization header</label>
      &nbsp; <input type="radio" id="oauth_params_loc2" name="oauth_params_loc" value="query"><label for="oauth_params_loc2">URL as params</label>
    </div>
    <div>
      GData-Version: <input type="text" id="gdata-version" name="gdata-version" value="2.0" />
    </div>
  </div>

</td>
</tr>
</table>

<div id="postData">
    <span>
    <strong>Content-Type:</strong>
    <input type="radio" name="content-type" checked="checked" value="application/atom+xml">application/atom+xml
    &nbsp;
    <input type="radio" name="content-type" value="application/json">application/json
    &nbsp;
    <input type="radio" name="content-type" value="text/csv">text/csv
    &nbsp;
    <input type="radio" name="content-type" value="text/plain">text/plain
   </span>
  <textarea name="postData" class="large"></textarea>
</div>

<div id="privKey">
  <textarea name="privKey" class="small"><? echo htmlentities(isset($_SESSION['privKey']) ? $_SESSION['privKey'] : ''); ?></textarea>
</div>

</form>

<div class="loading"><img src="images/ajax-loader.gif"><br>loading</div>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.form.js"></script>
<script type="text/javascript" src="js/thickbox-compressed.js"></script>
<script type="text/javascript" src="js/main.js"></script>
<!--<script type="text/javascript" src="js/syntaxHighlighter/shCore.js"></script>
<script type="text/javascript" src="js/syntaxHighlighter/shBrushXml.js"></script>-->
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-5079855-2']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>
</body>
</html>
