exports.run = (client, message, args, dispatcher, URL) => {
    message.channel.send("music").catch(console.error);
}