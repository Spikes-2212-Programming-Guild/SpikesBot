const TEAM_ASCII = `
░░░██╗░██╗░██████╗░██████╗░░░███╗░░██████╗░
██████████╗╚════██╗╚════██╗░████║░░╚════██╗
╚═██╔═██╔═╝░░███╔═╝░░███╔═╝██╔██║░░░░███╔═╝
██████████╗██╔══╝░░██╔══╝░░╚═╝██║░░██╔══╝░░
╚██╔═██╔══╝███████╗███████╗███████╗███████╗
░╚═╝░╚═╝░░░╚══════╝╚══════╝╚══════╝╚══════╝
`
const PREFIX = '$' //the string to use the bot
const TEAMOJI = '🔩' // the bot will sometimes use this emoji to react to messages
const TEAMTIME = new Date(0, 0, 0, 22, 12, 0) // set a daily Team Time (example: 22:12) or disable by setting it to null
let generalChannelsForTeamTime = [] // the bot will auto generate a list of general channels to send to the team time to
const HOST_TEAM_NUMBER = 2212 //set your team number, you can also set it to null. the team number will be used by the 'social' command to automagicly send links to your social media accounts.
const SPECIAL_COMMANDS = {
    website: 'https://www.spikes2212.com/',
    github: 'https://github.com/spikes-2212-programming-guild',
    spikeslib: 'https://github.com/spikes-2212-programming-guild/spikeslib2',
    youtube: 'https://www.youtube.com/officialspikes2212',
    instagram: 'https://www.instagram.com/spikes2212',
    twitter: 'https://twitter.com/spikes2212',
    facebook: 'https://www.facebook.com/spikes2212',
    bluealliance: 'https://www.thebluealliance.com/team/2212'
}; //set up special commands for your users to use, can be disabled by setting the value to null.

const TOKEN = 'YOUR_DISCORD_BOT_TOKEN_HERE'
const {Client, GatewayIntentBits} = require('discord.js'); //import the discord.js library
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
}); //Guilds = servers

//when the bot is connected
client.on('ready', () => {

    console.log(`${client.user.tag} is saying hello world!`);

    //for each server
    client.guilds.cache.forEach((guild) => {

        //for each channel
        guild.channels.cache.forEach((guildChannel) => {

            //if the channel named debug
            if (guildChannel.name === 'debug') {
                guildChannel.send('SpikesBot is up!')
            }
        })
    });
    // set a timeout for the recursive function that is sending the teamtime every day
    if (TEAMTIME !== null) {
        //get and set all of the general channels
        setAllGeneralChannels()
        //set a timeout for the teamtime
        setTimeout(() => {
            sendTeamTime(generalChannelsForTeamTime)
        }, whenIsTeamTime())
    }

});

// recursive function that is sending the teamtime every day at the correct time
function sendTeamTime(channels) {
    const now = new Date() //the current time

    //for each general channel from the list
    for(const channel of channels){

        //if it is the special date (example: for the team TheSpikes#2212 it is dec 22 or 22/12)
        try{
            if (now.getDate() === TEAMTIME.getHours() && now.getMonth() + 1 === TEAMTIME.getMinutes()) {
                //send teamascii
                channel.send(TEAM_ASCII)
            } else {
                //send teamtime
                channel.send(`${TEAMTIME.getHours().toString().padStart(2, '0')}:${TEAMTIME.getMinutes().toString().padStart(2, '0')}`)
            }
        }
        catch (error){
            // this is needed because discord has some ghost channels that will not work
        }
    }

    // after sending the teamtime in all of the channels, wait a minute before timing the next messages
    const waitAMinute = () => {
        //set all of the general channels
        setAllGeneralChannels()
        //set timeout for the teamtime
        setTimeout(() => {
            sendTeamTime(generalChannelsForTeamTime)
        }, whenIsTeamTime())
    }
    setTimeout(waitAMinute, 60000)
}

// a function for setting up the new and up-to-date list of general channels from each server
function setAllGeneralChannels() {
    generalChannelsForTeamTime = []

    //for each server
    client.guilds.cache.forEach((guild) => {

        //for each channel
        guild.channels.cache.forEach((guildChannel) => {

            //if the channel named general
            if (guildChannel.name === 'general') {

                //add it to the list
                generalChannelsForTeamTime[generalChannelsForTeamTime.length] = guildChannel
            }
        })
    });
}

//calc when to send the TEAMTIME message
function whenIsTeamTime() {
    const now = new Date() //the current time

    //calc the remaining time until the teamtime in milliseconds
    let remainingTime = (TEAMTIME.getHours() - now.getHours()) * 60 * 60 * 1000
    remainingTime += (TEAMTIME.getMinutes() - now.getMinutes()) * 60 * 1000
    remainingTime -= now.getSeconds() * 1000

    if (remainingTime >= 0) {
    } else {
        remainingTime += 24 * 60 * 60 * 1000
    }

    //return the time until the next teamtime
    console.log("next TEAMTIME: " + remainingTime);
    return remainingTime;
}

//fetch info about a team from the blue alliance website
function fetchTeamLinks(someTeamNumber) {

    return fetch('https://www.thebluealliance.com/team/' + someTeamNumber)
        .then(response => response.text())
        .then(htmlContent => {
            //get the html area of the team's social media accounts
            let social = htmlContent.split('team-social-media')[1].split('</div>')[0]
            let links = social.split('href="')

            //for each link
            for (let i = 0; i < links.length; i++) {
                //cut to get only the links
                links[i] = links[i].split('"')[0]
            }
            links.splice(0, 2); //get rid of non links
            return links;
        })
        .catch(error => {
            return ['fetch error occurred, please try again later'];
        });
}

//search for a specific social media of a specific team
function searchSocialMedia(searchItem, teamNumber) {

    try {
        //fetch all of the social media links of a team
        return fetchTeamLinks(teamNumber)
            .then(links => {

                //in each link
                for (const link of links) {

                    //search for the specific social media
                    if (link.includes(searchItem)) {
                        return link;
                    }
                }
                return 'not found';
            });
    } catch {
        return 'not found';
    }

}

client.on('messageCreate', msg => {

    //check that the message sent by a user
    if (!msg.author.bot) {

        //make sure the message is a message for the bot
        if (msg.content.startsWith(PREFIX)) {

            //make the message readable to the bot
            let msgContent = msg.content.slice(PREFIX.length).toLowerCase()

            //conditons for what message to send back
            if (msgContent === 'ping' && msg.channel.name === 'debug') {
                msg.reply('Pong!');
            }
            //help
            else if (msgContent === 'help') {

                let helpMessage = `**commands**:
                \n> - use the ||**team**||, ||**team-all**|| or ||**team(social_media_site)**|| command with a number of a team to find information about a specific frc team
                > - use the ||**social**|| command with a name of a social media website to see our social media
                > - write the team time at the correct time and the bot will react with the TeaMoji
                > - use the ||**teamtime**|| command to get the correct team time
                > - use the ||**help**|| command to see all available commands
                \n**note:** use the prefix **` + PREFIX + `** before any of the commands above to refer to this bot
                \nEnjoy!`

                msg.channel.send(helpMessage);
            }
            //get the teamtime
            else if (msgContent === 'teamtime') {
                if (TEAMTIME !== null) {
                    msg.channel.send('the team time is ' + TEAMTIME.getHours() + ':' + TEAMTIME.getMinutes() + ', make sure to be on the server at this time!')
                } else {
                    msg.channel.send('there is not currently any specific team time set, this feature was disabled in this version by the server owner.')
                }
            }
            //special commands set in the SPECIAL_COMMANDS const
            else if (SPECIAL_COMMANDS !== null && SPECIAL_COMMANDS[msgContent] !== undefined) {
                msg.channel.send(SPECIAL_COMMANDS[msgContent])
            }
            //social media for the host team
            else if (HOST_TEAM_NUMBER !== null && msgContent.startsWith('social')) {
                let searchText = msgContent.replaceAll(' ', '')
                searchText = searchText.substring('social'.length)
                searchSocialMedia(searchText, HOST_TEAM_NUMBER).then((link) => {
                    msg.channel.send(searchText + ': ' + link)
                });
            }
            //all information about a team
            else if (msgContent.startsWith('team-all')) {

                msgContent = msgContent.replaceAll(' ', '')

                //find the team number in the message
                let teamNumber = Number(msgContent.slice('team-all'.length, msgContent.length))

                //check if the number is valid
                if (Number.isInteger(teamNumber) && teamNumber > 0) {

                    //create a variable to store all the links
                    let allLinks = 'here is everything about team #' + teamNumber + ':\n\n> https://www.thebluealliance.com/team/' + teamNumber + '\n'

                    //get the links
                    fetchTeamLinks(teamNumber)
                        .then(links => {
                            //add each link to the replay message
                            links.forEach(link => {
                                allLinks += '> ' + link + '\n'
                            });
                            //send the message and remove the embeds
                            msg.channel.send(allLinks).then(replyMessage => {
                                replyMessage.suppressEmbeds(true)
                            })
                        });
                } else {
                    msg.reply("The team number should be a 64 bit Integer above 0")
                    msg.react('👎')
                }
            }
            //specific information about a team
            else if (msgContent.replaceAll(' ', '').startsWith('team(') && msgContent.includes(')')) {

                msgContent = msgContent.replaceAll(' ', '')

                //get the social media name to search for
                let searchText = msgContent.slice(msgContent.indexOf('(') + 1, msgContent.indexOf(')'))

                //get the team number to search
                let teamNumber = Number(msgContent.split(')')[1])

                searchSocialMedia(searchText, teamNumber).then((link) => {
                    msg.channel.send(link)
                });
            }
            //frc teams
            else if (msgContent.startsWith('team')) {

                msgContent = msgContent.replaceAll(' ', '')

                //find the team number in the message
                let teamNumber = Number(msgContent.slice('team'.length, msgContent.length))

                //check if the number is valid
                if (Number.isInteger(teamNumber) && teamNumber > 0) {
                    msg.channel.send('https://www.thebluealliance.com/team/' + teamNumber)
                } else {
                    msg.reply("The team number should be a 64 bit Integer above 0")
                    msg.react('👎')
                }
            }
            //if the message wasn't something the bot could understand
            else {
                msg.reply('use the **help** command to see all available commands for this bot')
            }
            //console.log('message sent')
        }
        //check is someone sent the TEAMTIME
        else if ((msg.content === (TEAMTIME.getHours() + "" + TEAMTIME.getMinutes()) || msg.content === (TEAMTIME.getHours() + ":" + TEAMTIME.getMinutes())) && !msg.author.bot) {
            const currentTime = new Date();

            //if it is the wrong time, send an appropriate message
            if (currentTime.getHours() !== TEAMTIME.getHours() || currentTime.getMinutes() !== TEAMTIME.getMinutes()) {
                msg.react('👎')
                msg.channel.send('the time is not ' + TEAMTIME.getHours() + ':' + TEAMTIME.getMinutes() + ', ' + msg.author.username.toUpperCase() + ' you noob! next time try looking at the clock or use the **teamtime** command to learn what is the correct time.');
                //console.log("wrong time")
            } else {
                msg.react(TEAMOJI)
                //console.log("correct time")
            }
        }
    }
});

//login bot using token
client.login(TOKEN);
