# SpikesBot
The Spikes discord bot, now rewritten in Scala 3!

## building
```bash
sbt Debian/packageBin
```
*note:* you should remove the /target/out dir before building (`rm -r ./target/out/`).
your `.deb` package will be located at `SpikesBot/target/out/jvm/scala-3.10.1/spikesbot/spikesbot_0.1.0_all.deb`
