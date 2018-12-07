
module.exports = (req, res, next) => {
  // welcome message
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome!</title>
        <style>
          pre {
            background-color: #DDD;
            padding: 1em;
            display: inline-block;
          }
        </style>
      </head>
      <body>
        <h1>Your Heroku server is running!</h1>
        <p>You'll need the following information for your "start" IFTTT recipe:</p>
        <h3>Body</h3>
<pre>{
  "title":"<<<{{Title}}>>>",
  "start":"{{Starts}}",
  "end":"{{Ends}}",
  "token": "<TOP_SECRET_TOKEN>"
}</pre>
<p>You'll need the following information for your "end" IFTTT recipe:</p>
<h3>Body</h3>
<pre>{
  "clear":true,
  "token": "<TOP_SECRET_TOKEN>"
}</pre>
      </body>
    </html>
  `);
};
