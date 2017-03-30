const commando = require('discord.js-commando');
const Discord = require('discord.js');

module.exports = class UnbanCommand extends commando.Command {
    constructor(Client) {
        super(Client, {
            name: 'unban',
            aliases: [
                'unbanne'
            ],
            group: 'moderation',
            memberName: 'unban',
            description: 'Unbans a user. (;unban @User not being a jerk.)',
            examples: [";unban @User not being a jerk."],
            guildOnly: true,
            args: [{
                key: 'memberID',
                prompt: 'What member do you want to unban? Please enter the ID of the user.',
                type: 'integer',
                validate: userID => {
                    if (userID.length === 18) {
                        return true;
                    }
                    return "Invalid ID. Please enter the user you wish to unban's ID.";
                }
            }, {
                key: 'reason',
                prompt: 'What do you want to set the reason as?',
                type: 'string',
                validate: reason => {
                    if (reason.length < 141) {
                        return true;
                    }
                    return "Please keep your reason under 140 characters.";
                }
            }]
        });
    }
    hasPermission(msg) {
        return msg.member.hasPermission('BAN_MEMBERS');
    }

    async run(message, args) {
        if (message.channel.type !== 'dm') {
            if (!message.channel.permissionsFor(this.client.user).hasPermission(['SEND_MESSAGES', 'READ_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'])) return;
        }
        console.log(`[Command] ${message.content}`);
        if (!message.guild.channels.exists("name", "mod_logs")) return message.say(":x: Error! Could not find the mod_logs channel! Please create it!");
        let memberID = args.memberID;
        let reason = args.reason;
        let bans = await message.guild.fetchBans();
        if (!bans.has(memberID)) return message.say(':x: Error! Could not find this user in the bans.');
        try {
            let unbanUser = await bans.get(memberID).unban();
            let okHandMsg = await message.say(":ok_hand:");
            const embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
                .setColor(0xFF0000)
                .setFooter('XiaoBot Moderation', this.client.user.avatarURL)
                .setTimestamp()
                .setDescription(`**Member:** ${unbanUser.username}#${unbanUser.discriminator} (${unbanUser.id})\n**Action:** Ban\n**Reason:** ${reason}`);
            let modLogMsg = await message.guild.channels.find('name', 'mod_logs').sendEmbed(embed);
            return [unbanUser, okHandMsg, modLogMsg];
        }
        catch (err) {
            return message.say(':x: Error! Something went wrong!');
        }
    }
};
