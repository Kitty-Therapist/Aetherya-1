const Moderation = require('../../structures/Moderation.js');

class Purge extends Moderation {
  constructor(client) {
    super(client, {
      name: 'purge',
      description: 'It purges between 2 and 99 messages.',
      usage: 'purge [member:user] <number:integer>',
      extended: 'This command will either purge a mentioned users messages (between 2 and 99), or the bots own messages.',
      aliases: ['prune'],
      botPerms: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
      permLevel: 'Moderator'
    });
  }

  async run(message, args, level) { // eslint-disable-line no-unused-vars
    const settings = this.client.settings.get(message.guild.id);

    const user = message.mentions.users.first();
    const amount = parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2]);
    if (!amount) return message.reply(`${lang.purgeNoAmnt}`);
    if (!amount && !user) return message.reply(`${lang.purgeIncorrectUsage}`);
    message.channel.fetchMessages({ limit: amount }).then((messages) => {
      if (user) {
        const filterBy = user ? user.id : this.client.user.id;
        messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount);
      }
      message.channel.bulkDelete(messages).catch(error => console.log(error.stack));
    });  
  }
}

module.exports = Purge;