val scala3Version = "3.10.1"

lazy val root = project
  .in(file("."))
  .settings(
    name := "testbot",
    version := "0.1.0-SNAPSHOT",
    scalaVersion := scala3Version,
    libraryDependencies += "com.discord4j" % "discord4j-core" % "3.3.3",
  )
