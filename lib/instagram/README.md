Eventboard Instagram Plugin
=

0. Create your app with instagram:  http://instagram.com/developer/clients/manage/
1. Create your `instagram-config.json`.  It needs to contain:
{
  "client_id":"YOUR_KEY",
  "client_secret":"YOUR_SECRET",
  "redirect_uri":"YOUR_REDIRECT_URI"
}
2. Install the instagram node module `npm i instagram-node-lib`
3. You will need to navigate to `http://localhost:3200/instagram/token` to obtain your token.
3. An `instagram-token-ignore.json` file will be created in this directory with the token stored for future use.