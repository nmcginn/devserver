##DevServer

### A local node server for testing & development
At work, our intern was serving files from her local filesystem to test them, which created unanticipated errors. Not having a good dev server to serve just static files from, there arose a need for a decent local, lightweight server. For this reason, I wanted to whip up `devserver`.

### Enhancements
- Add templating for custom error messages
- Make everything not so damn synchronous
- Add capabilities for server-side scripting
- Feel free to throw additional ideas at me

### Usage
- Add the `node.sublime-build` file to your Packages folder, customize to taste.
- Open the project in Sublime
- Build the server and your files are now being served.
- Update config.json as desired, the server will automatically restart.
- I'd use the same sublime project for your files, so you can start serving your html from within the same project.