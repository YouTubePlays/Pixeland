package model

import play.api.libs.json.Json


object Pixel {
  implicit val pixelReads = Json.reads[Pixel]
  implicit val pixelWrites = Json.writes[Pixel]
}

case class Pixel(x: Int, y: Int, c:Byte)