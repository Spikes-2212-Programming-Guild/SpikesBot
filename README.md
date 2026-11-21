# SpikesBot
The Spikes discord bot, now rewritten in Scala 3!

## building
```bash
sbt Debian/packageBin
```
*note:* you should remove the /target/out dir before building (`rm -r ./target/out/`).
your `.deb` package will be located at `SpikesBot/target/out/jvm/scala-3.10.1/spikesbot/spikesbot_0.1.0_all.deb`

## setting up
```bash
sudo apt install ./spikesbot_0.1.0_all.deb
```
put the (spikesbot.service)[https://github.com/Spikes-2212-Programming-Guild/SpikesBot/etc/systemd/system/spikesbot.service] at `/etc/systemd/system/spikesbot.service`
then run:
```bash
sudo systemctl daemon-reload
```
```bash
sudo systemctl enable spikesbot
```
```bash
sudo systemctl start spikesbot
```
you should be good to go now
