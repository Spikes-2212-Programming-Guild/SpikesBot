// enablePlugins(JavaServerAppPackaging)
enablePlugins(JavaServerAppPackaging)
enablePlugins(DebianPlugin)

val scala3Version = "3.9.0"

lazy val root = project
  .in(file("."))
  .settings(
    name := "spikesbot",
    version := "0.1.2",
    scalaVersion := scala3Version,

    Debian / maintainer := "TheSpikes#2212 <spikes.no2212@gmail.com>",
    Debian / packageSummary := "A discord bot for the FRC team The Spikes #2212",
    Debian / packageDescription := """A fun package description of our software, with multiple lines.
    source code available at: https://github.com/Spikes-2212-Programming-Guild/SpikesBot""",
    Debian / debianPackageDependencies := Seq("openjdk-25-jre-headless"),

    libraryDependencies += "com.discord4j" % "discord4j-core" % "3.3.3",
  )
