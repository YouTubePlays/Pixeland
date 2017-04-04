package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import domain.Pixels
import model.Pixel
import play.api.libs.json._
import play.api.libs.json.Reads._
import akka.stream.scaladsl.Source
import akka.stream.OverflowStrategies
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.Sink
import akka.stream.scaladsl.Flow
import akka.stream.scaladsl.Keep
import akka.stream.Materializer
import akka.actor.ActorSystem
import scala.concurrent.ExecutionContext
import akka.actor.ActorRef
import org.reactivestreams.Publisher
import akka.stream.scaladsl.BroadcastHub
import akka.NotUsed
import java.util.concurrent.atomic.AtomicLong
import scala.concurrent.duration._
import model.JSMessage._
import java.util.concurrent.TimeUnit
import dao.PixelandDAO

@Singleton
class PixelsController @Inject() (implicit actorSystem: ActorSystem,
    mat: Materializer,
    ec: ExecutionContext,
    pixels: Pixels,
    dao: PixelandDAO) extends Controller {

  private val logger = org.slf4j.LoggerFactory.getLogger("controllers.PixelsController")
  private var (out, in) = initFlow()

  private val lastSentCount = new AtomicLong(0);
  private val connectionCount = new AtomicLong(0);

  actorSystem.scheduler.schedule(Duration(0, TimeUnit.SECONDS), Duration(10, TimeUnit.SECONDS))(this.sendConnectionCount)
  actorSystem.scheduler.schedule(Duration(0, TimeUnit.SECONDS), Duration(60, TimeUnit.SECONDS))(this.savePixelData)

  def index = Action { implicit request =>
    Ok(views.html.index(connectionCount.get()));
  }
  
  def initFlow(): (ActorRef, Source[JsValue, NotUsed]) = {
    val source = Source.actorRef[JsValue](8, OverflowStrategy.dropHead)
    val sink = BroadcastHub.sink[JsValue](4)
    source.toMat(sink)(Keep.both).run()
  }

  def getPixels = Action {
    Ok(pixels.getPixels().flatten).as("application/octet-stream")
  }

  def setPixels = Action(parse.maxLength(maxLength = 1000l*1000l, parse.anyContent)) {
    implicit request =>
      request.body match {
        case Right(content) => content.asRaw match {
          case Some(buffer) => pixels.setPixels(buffer); out ! Json.toJson(refresh); Ok
          case _ => BadRequest
        }
        case _ => BadRequest
      }
  }

  def setPixel = Action(parse.json) {
    implicit request =>
      request.body.validate[Pixel] match {
        case JsSuccess(pixel, _) =>
          pixels.setPixel(pixel); out ! Json.toJson(fromPixel(pixel)); Ok
        case JsError(err) => BadRequest
      }
  }

  def ws = WebSocket.accept[Any, JsValue] {
    val sink = Sink.ignore
    (rh => {
      val flow = Flow.fromSinkAndSource(sink, in)
      userConnected()
      flow.watchTermination() { (_, done) =>
        done.map { _ => userDisconnected() }
      }
    })
  }

  def sendConnectionCount(): Unit = {
    val count = connectionCount.get()
    val lastCount = lastSentCount.get();
    if (count != lastCount) {
      lastSentCount.set(count)
      out ! Json.toJson(fromCount(count))
    }
  }

  def userConnected(): Unit = {
    connectionCount.incrementAndGet()
  }

  def userDisconnected(): Unit = {
    connectionCount.decrementAndGet()
  }
  
  def savePixelData(): Unit = {
    dao.setPixelData(pixels.getPixels().flatten);
  }
}