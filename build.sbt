name := """pixeland"""
organization := "com.rdapps.pixeland"

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.8"

libraryDependencies += filters
libraryDependencies += jdbc
libraryDependencies += evolutions
libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "2.0.0" % Test
libraryDependencies += "com.h2database" % "h2" % "1.4.194"
libraryDependencies += "org.postgresql" % "postgresql" % "9.4.1212"

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.rdapps.pixeland.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.rdapps.pixeland.binders._"

scalacOptions ++= Seq("-unchecked", "-deprecation", "-feature")

