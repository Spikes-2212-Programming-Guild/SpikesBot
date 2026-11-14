import discord4j.common.util.Snowflake
import discord4j.core.`object`.emoji.Emoji
import discord4j.core.`object`.entity.Message
import discord4j.core.`object`.entity.channel.MessageChannel
import discord4j.core.{DiscordClient, GatewayDiscordClient, event}
import discord4j.core.event.domain.message.MessageCreateEvent
import discord4j.core.spec.MessageCreateSpec
import discord4j.discordjson.json.MessageReferenceData
import discord4j.gateway.intent.{Intent, IntentSet}
import java.time.{Duration, LocalDateTime, ZoneOffset}
import java.util.concurrent.{Executors, TimeUnit}
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
// your super secret token
val token = "NOPE"
// the scheduler
val scheduler = Executors.newSingleThreadScheduledExecutor()
// The Spikes#2212 time
var spikesTime = LocalDateTime.now()
  .withHour(22)
  .withMinute(12)
  .withSecond(0)
  .withNano(0)
// the discord client
val client: GatewayDiscordClient = DiscordClient.create(token)
    .gateway()
    .setEnabledIntents(IntentSet.nonPrivileged().or(IntentSet.of(Intent.MESSAGE_CONTENT)))
    .login()
    .block();

// main function
@main def SpikesBotScala(): Unit = {
  // debug message
  client.getChannelById(Snowflake.of("1133427274994155582")).ofType(classOf[MessageChannel]).block().createMessage("SpikesBot is up!").block()
  // schedule a message
  schedule2212()

  // when a new message arrives :)
  client.on(classOf[MessageCreateEvent]).subscribe({ event =>

    val message = event.getMessage()
    boundary {
      // don't reply to yourself
      if (message.getAuthor().get.getId() == client.getSelfId()) {
        break()
      }
      // actually reply tho
      handleMessage(message)
    }
  })
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

def schedule2212(): Unit = {

  if (spikesTime.isBefore(LocalDateTime.now())) spikesTime = spikesTime.plusDays(1)

  val delay = Duration.between(
    LocalDateTime.now(),
    spikesTime
  ).toMillis

  scheduler.schedule((() => send2212(if(spikesTime.getDayOfMonth == 22 && spikesTime.getMonthValue() == 12) asciiArt else "22:12")): Runnable, delay, TimeUnit.MILLISECONDS)
  println("scheduled.")
}

def send2212(messageContent: String): Unit = {

  client.getGuilds().flatMap(_.getChannels()).filter(_.getName == "meow").ofType(classOf[MessageChannel]).flatMap(channel => {
    channel.createMessage(messageContent)
  }).subscribe()

  schedule2212()
}

def msg = "I was compiled by Scala 3. :)"
