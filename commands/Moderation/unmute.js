const Moderation = require('../../structures/Moderation.js');

class Mute extends Moderation {
  constructor(client) {
    super(client, {
      name: 'unmute',
      description: 'Unmutes a mentioned user.',
      usage: 'unmute <member:user> <reason:string>',
      extended: 'This unmutes the mentioned user, with or without a reason',
      category: 'Moderation',            
      aliases: [],
      botPerms: ['SEND_MESSAGES', 'MANAGE_ROLES', 'EMBED_LINKS'],
      permLevel: 'Moderator'
    });
  }

  async run(message, args, level) {
    const settings = this.client.settings.get(message.guild.id);
    
    const channel  = message.guild.channels.exists('name', settings.modLogChannel);
    if (!channel)    return message.error(message, `I cannot find the \`${settings.modLogChannel}\` channel. Try running \`${settings.prefix}set edit modLogChannel logs\`.`);
    const muteRole = this.client.guilds.get(message.guild.id).roles.find('name', settings.muteRole);
    const target   = await this.verifyMember(message.guild, args[0]);
    if (!target)     return message.error(message, 'Invalid command usage, you must mention someone to use this command.');   
    const modLevel = this.modCheck(message, args[0], level);
    if (typeof modLevel === 'string') return message.reply(modLevel);
    const reason   = args.splice(1, args.length).join(' ');
    if (!reason)     return message.error(message, 'Invalid command usage, you must supply a reason to use this command.');
    try {
      await target.removeRole(muteRole);
      await this.buildModLog(this.client, message.guild, 'm', target, message.author, reason);
      await message.channel.send(`\`${target.user.tag}\` was successfully muted.`);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Mute;