exports.run = (client, member) => {
    const defaultChannel = member.guild.channels.find(c=> c.permissionsFor(guild.me).has("SEND_MESSAGES"));
    defaultChannel.send(`Welcome ${member.user} to Raining's!`).catch(console.error);
}