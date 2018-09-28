const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const config = require("./config.json");
// A global queue of servers storing songs requested
const serverQueue = require("./serverQueue.json")

// This loop reads the /events/ dir and attaches each event file to the appropriate event
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    let eventFunction = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    // Call events with all their proper arguments *after* the 'client' var
    client.on(eventName, (...args) => eventFunction.run(client, ...args));
  });
});

client.on("message", message => {
  if (message.author.bot) return;
  if (message.content.indexOf(config.prefix) !== 0) return;

  // Define args
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  // Global variables
  var dispatcher;
  var URL;

  // When the command is music related
  if (command == "play" || command == "pause" || command == "resume" || command == "next" || command == "volume" || command == "stop") {
    try {
      if (command == "play") {URL = args[0];}
      else {URL = "";}
      let commandFile = require(`./commands/music.js`);
      commandFile.run(client, message, command, URL);
    } catch (err) {
      console.error(err);
    }
  }

  // Reads user inputs and look in directory for command js file
  else {
    try {
      let commandFile = require(`./commands/${command}.js`);
      commandFile.run(client, message, args);
    } catch (err) {
      console.error(err);
    }
  }
});

client.login(config.token);