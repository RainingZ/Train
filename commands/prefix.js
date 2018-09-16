// Requires from the prefix.js directory thus ./../config.json
const config = require("./../config.json");
const fs = require("fs");

exports.run = (client, message, args) => {
    if (message.author.id !== config.ownerID) return
    // Gets the prefix from the command (eg. "!prefix +" it will take the "+" from it)
    let newPrefix = message.content.split(" ").slice(1, 2)[0];
    // Slice from index 1 to 2-1=1
    // change the configuration in memory
    if (newPrefix[0] == "/" || newPrefix[0] == "." || newPrefix[0] == " ") {
        message.channel.send("Authorized").catch(console.error);
        message.channel.send("Invalid Prefix").catch(console.error);
        return;
    }
    message.channel.send("Authorized").catch(console.error);
    config.prefix = newPrefix;
    message.channel.send("The prefix is now " + config.prefix).catch(console.error);
    // Now we have to save the file.
    // Exports.run from the tRainingBot.js directory thus ./config.json
    fs.writeFile("./config.json", JSON.stringify(config), (err) => console.error);
}