const teamAscii = `
░░░██╗░██╗░██████╗░██████╗░░░███╗░░██████╗░
██████████╗╚════██╗╚════██╗░████║░░╚════██╗
╚═██╔═██╔═╝░░███╔═╝░░███╔═╝██╔██║░░░░███╔═╝
██████████╗██╔══╝░░██╔══╝░░╚═╝██║░░██╔══╝░░
╚██╔═██╔══╝███████╗███████╗███████╗███████╗
░╚═╝░╚═╝░░░╚══════╝╚══════╝╚══════╝╚══════╝
`
const prefix = '$' //the string to use the bot
const teaMoji = '🔩' // the bot will sometimes use this emoji to react to messages
const teamTime = new Date(0, 0, 0, 22, 12, 0) // set a daily Team Time (example: 22:12) or disable by setting it to null
const HostTeamNumber = 2212 //set your team number, you can also set it to null. the team number will be used by the 'social' command to automagicly send links to your social media accounts.
const specialCommands = {
    website: 'https://www.spikes2212.com/',
    github: 'https://github.com/spikes-2212-programming-guild',
    spikeslib: 'https://github.com/spikes-2212-programming-guild/spikeslib2',
    youtube: 'https://www.youtube.com/officialspikes2212',
    instagram: 'https://www.instagram.com/spikes2212',
    twitter: 'https://twitter.com/spikes2212',
    facebook: 'https://www.facebook.com/spikes2212',
    bluealliance: 'https://www.thebluealliance.com/team/2212'
}; //set up special commands for your users to use, can be disabled by setting the value to null.

const Token = 'YOUR_DISCORD_BOT_TOKEN_HERE'
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,

    ]
})

//when the bot is connected
client.on('ready', () => {

    console.log(`${client.user.tag} is saying hello world!`);

    //for each server
    client.guilds.cache.forEach((guild) => {
        
        //for each channel
        guild.channels.cache.forEach((guildChannel) =>{

            //if the channel named debug
            if(guildChannel.name === 'debug'){
                guildChannel.send('SpikesBot is up!')                
            }
        })
    });
    // set a timeout for the recursive function that is sending the teamtime every day
    if(teamTime !== null){
        setTimeout(() => {sendTeamTime(getAllGeneralChannels())}, whenIsTeamTime())
    }

});

// recursive function that is sending the teamtime every day at the correct time
function sendTeamTime (channels){
    const now = new Date() //the current time
    
    //for each general channel from the list
    channels.forEach((channel) =>{

        //if it is the special date (example: for the team TheSpikes#2212 it is dec 22 or 22/12)
        if(now.getDate() == teamTime.getHours() && now.getMonth()+1 === teamTime.getMinutes()){
            //send teamascii
            channel.send(teamAscii)
        }
        else{
            //send teamtime
            //channel.send(teamTime.getHours() + '' + teamTime.getMinutes())
            channel.send(`${teamTime.getHours().toString().padStart(2, '0')}:${teamTime.getMinutes().toString().padStart(2, '0')}`)
        }
    })

    // after sending, wait a minuate before timing the next messeges
    const waitAMinuate = () => {        
        setTimeout(() => {sendTeamTime(getAllGeneralChannels())}, whenIsTeamTime())
    }
    setTimeout(waitAMinuate, 60000)
}

// a function for getting the new and up to date list of general channels from each server
function getAllGeneralChannels(){
    let generalChannels = []

    //for each server
    client.guilds.cache.forEach((guild) => {
        //for each channel
        guild.channels.cache.forEach((guildChannel) =>{            

            //if the channel named general
            if(guildChannel.name === 'general'){
                //add it to the list
                generalChannels[generalChannels.length] = guildChannel
            }
        })
    });
    return generalChannels;
}

//calc when to send the teamTime message
function whenIsTeamTime(){
    const now = new Date() //the current time

    //calc the remaing time until 22:12
    let remain = (teamTime.getHours() - now.getHours()) * 60 * 60 * 1000
    remain += (teamTime.getMinutes() - now.getMinutes()) * 60 * 1000
    remain -= now.getSeconds() * 1000

    if(remain >= 0){
    }
    else{
        remain += 24 * 60 * 60 * 1000
    }

    //return the time until the next 22:12
    console.log("next teamTime: " + remain);
    return remain;
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
            for(let i = 0; i < links.length; i++){
                //vut to get only the links
                links[i] = links[i].split('"')[0]
            }
            links.splice(0, 2); //get rid of non links
            return links;
        })
        .catch(error => {
            //console.error('Error fetching HTML:', error);
            return ['fetch error occurred, please try again later'];
        });
}

//search for a specific social media of a specific team
function searchSocialMedia(seachItem, teamNumber){
    
    try{
        //fetch all of the social media links of a team
        return fetchTeamLinks(teamNumber)
        .then(links => {
            
            //in each link
            for(let i = 0; i < links.length; i++){

                //search for the specific social media
                if(links[i].includes(seachItem)){
                    return links[i]
                }
            }
            return 'not found';
        });
    }
    catch{
        return 'not found';
    }
    
}

client.on('messageCreate', msg => {

    //check that the message sent by a user
    if(!msg.author.bot){

        //make sure the message is a message for the bot
        if (msg.content.startsWith(prefix)) {

            //make the message readable to the bot
            let msgContent = msg.content.slice(prefix.length).toLowerCase()

            //conditons for what message to send back
            if (msgContent === 'ping' && msg.channel.name === 'debug') {
                msg.reply('Pong!');
            }
            //help
            else if(msgContent === 'help'){

                let helpMessage = `**commands**:
                \n> - use the ||**team**||, ||**team-all**|| or ||**team(social_media_site)**|| command with a number of a team to find information about a specific frc team
                > - use the ||**social**|| command with a name of a social media website to see our social media
                > - write the team time at the correct time and the bot will react with the TeaMoji
                > - use the ||**teamtime**|| command to get the correct team time
                > - use the ||**help**|| command to see all commands
                \n**note:** use the prefix **` + prefix + `** before any of the commands above to refer to this bot
                \nEnjoy!`

                msg.channel.send(helpMessage);
            }
            //get the teamtime
            else if(msgContent === 'teamtime'){
                if(teamTime !== null){
                    msg.channel.send('the team time is ' + teamTime.getHours() + ':' + teamTime.getMinutes() + ', make sure to be on the server in this time!')
                }
                else{
                    msg.channel.send('there is not currently any specific team time set, this feature was disabled in this version by the server owner.')
                }
            }
            //special commands
            else if(specialCommands !== null && specialCommands[msgContent] != undefined) {
                msg.channel.send(specialCommands[msgContent])
            }
            //social media for the host team
            else if(HostTeamNumber !== null && msgContent.startsWith('social')){
                let searchText = msgContent.replaceAll(' ', '')
                searchText = searchText.substring(6)
                searchSocialMedia(searchText, HostTeamNumber).then((link) => {
                    msg.channel.send(searchText + ': ' + link)
                });
            }
            //all information about a team
            else if(msgContent.startsWith('team-all')){

                msgContent = msgContent.replaceAll(' ', '')
                
                //find the team number in the message
                let teamNumber = Number(msgContent.slice(8, msgContent.length))

                //check if the number is valid
                if(Number.isInteger(teamNumber) && teamNumber > 0){

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
                } else{
                    msg.reply("The team number should be an Integer above 0")
                    msg.react('👎')
                }
            }
            //specific information about a team
            else if(msgContent.replaceAll(' ', '').startsWith('team(') && msgContent.includes(')')){
                
                msgContent = msgContent.replaceAll(' ', '')

                //get the social media name to search for
                let searchText = msgContent.slice(msgContent.indexOf('(')+1, msgContent.indexOf(')'))

                //get the team number to search
                let teamNumber = Number(msgContent.split(')')[1])

                searchSocialMedia(searchText, teamNumber).then((link) => {
                    msg.channel.send(link)
                });
            }
            //frc teams
            else if(msgContent.startsWith('team')){

                msgContent = msgContent.replaceAll(' ', '')

                //find the team number in the message
                let teamNumber = Number(msgContent.slice(4, msgContent.length))

                //check if the number is valid
                if(Number.isInteger(teamNumber) && teamNumber > 0){
                    msg.channel.send('https://www.thebluealliance.com/team/' + teamNumber)
                } else{
                    msg.reply("The team number should be an Integer above 0")
                    msg.react('👎')
                }
            }
            //if the message wasnt somthing the bot could understand
            else{
                msg.reply('use the **help** command to see all avilable commands for this bot')
            }
            //console.log('message sent')
        }
        //check is someone sent the teamTime at the wrong time
        else if( (msg.content === (teamTime.getHours() + "" + teamTime.getMinutes()) || msg.content === (teamTime.getHours() + ":" + teamTime.getMinutes())) && !msg.author.bot){
            const currentTime = new Date();

            //if it is the wrong time, send an apropriate message
            if (currentTime.getHours() != teamTime.getHours() || currentTime.getMinutes() != teamTime.getMinutes()) {
                msg.react('👎')
                msg.channel.send('the time is not ' + teamTime.getHours() + ':' + teamTime.getMinutes() + ', ' +msg.author.username.toUpperCase() + ' you noob! next time try looking at the clock or use the **teamtime** command to learn what is the correct time.');
                //console.log("wrong time")
            }
            else{
                msg.react(teaMoji)
                //console.log("correct time")
            }
        }
    }
});

//login bot using token
client.login(Token);
