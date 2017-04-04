package domain

import scala.collection._
import scala.collection.convert.decorateAsScala._
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.locks.Lock
import java.util.concurrent.locks.ReentrantReadWriteLock
import model.Pixel
import play.api.mvc.RawBuffer
import akka.util.ByteString
import javax.inject.Inject
import dao.PixelandDAO

class Pixels @Inject() (dao: PixelandDAO) {

  private val pixels = Array.fill[Byte](1000, 1000)(0x15.toByte)
  for (i <- 0 until 1000)
    for (j <- 0 until 1000)
      if (i == j)
        pixels(i)(j) = 0x30.toByte
      else if (i == 999 - j)
        pixels(i)(j) = 0x0C.toByte
  val data = dao.getPixelData();
  if (data != null) {
    var i = 0;
    for (b <- data) {
      pixels(i / 1000)(i % 1000) = b;
      i += 1;
    }
  }

  private val rwl = new ReentrantReadWriteLock();
  private val rl = rwl.readLock();
  private val wl = rwl.writeLock();

  def setPixel(p: Pixel) {
    setColor(p.x, p.y, p.c)
  }

  def setColor(x: Int, y: Int, c: Byte) {
    wl.lock()
    try {
      pixels(x)(y) = c
    } finally {
      wl.unlock()
    }
  }

  def getPixels(): Array[Array[Byte]] = {
    rl.lock()
    try {
      pixels.clone();
    } finally {
      rl.unlock()
    }
  }

  def setPixels(buffer: RawBuffer): Unit = {
    rl.lock()
    try {
      var i = 0;
      val bt = buffer.asBytes(1000l * 1000l).getOrElse(ByteString.empty);
      for (b <- bt) {
        pixels(i / 1000)(i % 1000) = b;
        i += 1;
      }
    } finally {
      rl.unlock()
    }
  }

}