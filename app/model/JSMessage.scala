package model

import play.api.libs.json.Json
import play.api.libs.json.JsValue
import model.Pixel._

object JSMessage {
  implicit val messageReads = Json.reads[JSMessage]
  implicit val messageWrites = Json.writes[JSMessage]
  
  def fromPixel(p:Pixel):JSMessage = {
    new JSMessage("p", Some(Json.toJson(p)))
  }
  
  def fromCount(c:Long):JSMessage = {
    new JSMessage("c", Some(Json.toJson(c)))
  }
  
  def refresh() : JSMessage = {
    new JSMessage("r")
  }
  
}

case class JSMessage(t:String, m:Option[JsValue]=None) {
  
}