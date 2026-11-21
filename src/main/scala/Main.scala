import discord4j.common.util.Snowflake
import discord4j.core.`object`.command.ApplicationCommandOption
import discord4j.core.`object`.emoji.Emoji
import discord4j.core.`object`.entity.Message
import discord4j.core.`object`.entity.channel.MessageChannel
import discord4j.core.event.domain.interaction.{ApplicationCommandInteractionEvent, ChatInputInteractionEvent}
import discord4j.core.event.domain.message.MessageCreateEvent
import discord4j.core.spec.MessageCreateSpec
import discord4j.core.{DiscordClient, GatewayDiscordClient, event}
import discord4j.discordjson.json.{ApplicationCommandOptionData, ApplicationCommandRequest, MessageReferenceData}
import discord4j.gateway.intent.{Intent, IntentSet}

import java.time.{Duration, LocalDateTime, ZoneOffset}
import java.util.concurrent.{Executors, TimeUnit}
import scala.annotation.switch
import scala.compiletime.ops.long
import scala.util.boundary
import scala.util.boundary.break

// the greatest ascii art of all time
val asciiArt = """
░░░██╗░██╗░██████╗░██████╗░░░███╗░░██████╗░
██████████╗╚════██╗╚════██╗░████║░░╚════██╗
╚═██╔═██╔═╝░░███╔═╝░░███╔═╝██╔██║░░░░███╔═╝
██████████╗██╔══╝░░██╔══╝░░╚═╝██║░░██╔══╝░░
╚██╔═██╔══╝███████╗███████╗███████╗███████╗
░╚═╝░╚═╝░░░╚══════╝╚══════╝╚══════╝╚══════╝
"""

// the scheduler
val scheduler = Executors.newSingleThreadScheduledExecutor()
// The Spikes#2212 time
var spikesTime = LocalDateTime.now()
  .withHour(22)
  .withMinute(12)
  .withSecond(0)
  .withNano(0)

// main function
@main def SpikesBotScala(args: String*): Unit = {

  if (args.length < 1) {
    throw RuntimeException("where token??")
  }

  // your super secret discord token
  val token = args(0)

  // the discord client
  val client: GatewayDiscordClient = DiscordClient.create(token)
      .gateway()
      .setEnabledIntents(IntentSet.nonPrivileged().or(IntentSet.of(Intent.MESSAGE_CONTENT)))
      .login()
      .block();

  println(args.length)
  println(asciiArt)
  println(s"Logged in as ${client.getSelf().block().getUsername()} -> Hello world!")
  // debug message
  client.getChannelById(Snowflake.of("1133427274994155582")).ofType(classOf[MessageChannel]).block().createMessage("SpikesBot is up!").block()
  // schedule a message
  schedule2212(client)
  buildCommands(client)

  // when a new message arrives :)
  client.on(classOf[MessageCreateEvent]).subscribe({ event =>

    val message = event.getMessage()
    boundary {
      // don't reply to yourself
      if (message.getAuthor().get.getId() == client.getSelfId()) break()
      // actually reply tho
      handleMessage(message)
    }
  })

  // when a new command is commanded
  client.on(classOf[ApplicationCommandInteractionEvent], event => boundary {

      event.getCommandName() match {
        case "team" => {
          val interaction = event.getInteraction().getCommandInteraction().flatMap(thing => thing.getOption("team-number").get().getValue())
          val teamNumber = interaction.get().asLong
          if (teamNumber > 0) break(event.reply(s"https://www.thebluealliance.com/team/$teamNumber"))
          else break(event.reply(s"Nooo!!!1!1!11!!!1! `$teamNumber` is not a valid team number :((("))
        }
        case "source-code" => {
          break(event.reply("https://github.com/Spikes-2212-Programming-Guild/SpikesBot"))
        }
      }
  }).subscribe();


  // eob (end of bot)
  client.onDisconnect().block();
}

def handleMessage(message: Message): Unit = {
  // println(s"Content: '${message.getContent()}'")
  if (message.getContent().contains("hi")) {
    message.getChannel().block().createMessage("meow").block()
  }

  if (message.getContent().toLowerCase.contains("scala")) {
    message.getChannel().block().createMessage(msg).block()
  }

  if (message.getContent().equals("22:12") || message.getContent().equals("2212")) {

    val timeStamp = message.getTimestamp().atOffset(ZoneOffset.ofHours(2))
    if (timeStamp.getHour == 22 && timeStamp.getMinute == 12) {
      message.addReaction(Emoji.unicode("🔩")).block()
      if (timeStamp.getSecond == 0) {
        message.addReaction(Emoji.unicode("🏆")).block()
      }
    } else {
      message.addReaction(Emoji.unicode("🥴")).block()
      val response = MessageCreateSpec.builder().content("???").messageReference(MessageReferenceData.builder()
        .messageId(message.getId.asString())
        .build()).build()
      message.getChannel().block().createMessage(response).block()
    }
  }
}

def buildCommands(client: GatewayDiscordClient): Unit = {

  val applicationId: Long = client.getRestClient().getApplicationId().block()
  // val testGuild: Long = 1133413135265570857l

  val linkTeamCommand: ApplicationCommandRequest = ApplicationCommandRequest.builder()
  .name("team")
  .description("find an FRC team")
  .addOption(ApplicationCommandOptionData.builder()
    .name("team-number")
    .description("please provide a team number")
    .`type`(ApplicationCommandOption.Type.INTEGER.getValue())
    .required(true)
    .build()
  ).build()

  // client.getRestClient().getApplicationService()
  // .createGuildApplicationCommand(applicationId, testGuild, linkTeamCommand)
  // .block()
  client.getRestClient().getApplicationService()
  .createGlobalApplicationCommand(applicationId, linkTeamCommand)
  .block()

  val sourceCodeCommand: ApplicationCommandRequest = ApplicationCommandRequest.builder()
  .name("source-code")
  .description("get the source code powering this bot")
  .build()

  // client.getRestClient().getApplicationService()
  // .createGuildApplicationCommand(applicationId, testGuild, sourceCodeCommand)
  // .block()
  client.getRestClient().getApplicationService()
  .createGlobalApplicationCommand(applicationId, sourceCodeCommand)
  .block()
}

def schedule2212(client: GatewayDiscordClient): Unit = {

  if (spikesTime.isBefore(LocalDateTime.now())) spikesTime = spikesTime.plusDays(1)

  val delay = Duration.between(
    LocalDateTime.now(),
    spikesTime
  ).toMillis

  scheduler.schedule((() => send2212(client, if(spikesTime.getDayOfMonth == 22 && spikesTime.getMonthValue() == 12) asciiArt else "22:12")): Runnable, delay, TimeUnit.MILLISECONDS)
  println("The next 22:12 message is scheduled.")
}

def send2212(client: GatewayDiscordClient, messageContent: String): Unit = {

  client.getGuilds().flatMap(_.getChannels()).filter(_.getName == "general").ofType(classOf[MessageChannel]).flatMap(channel => {
    channel.createMessage(messageContent)
  }).subscribe()

  schedule2212(client)
}

def msg = "I was compiled and rewritten in Scala 3. :)"
