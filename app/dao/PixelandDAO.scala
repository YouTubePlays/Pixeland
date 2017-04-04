package dao

import javax.inject.Inject
import play.api.db.Database
import play.api.db.DBApi
import java.io.ByteArrayInputStream

class PixelandDAO @Inject()(protected val dbapi: DBApi) {
  
  val db = dbapi.database("default")
  
  def getPixelData(): Array[Byte] = {
    db.withConnection {
      conn => val stmt = conn.createStatement()
      val rs = stmt.executeQuery("SELECT * FROM PIXELAND WHERE VERSION=0");
      if(rs.next()) {
        rs.getBytes("PIXELS")
      } else {
        null
      }
    }
  }
  
  def setPixelData(data: Array[Byte]) : Unit = {
    db.withConnection {
      conn => val ps = conn.prepareStatement(" INSERT INTO PIXELAND (VERSION, PIXELS) VALUES (0, ?) ON CONFLICT (VERSION) DO UPDATE SET PIXELS = excluded.PIXELS")
      //val arr = conn.createArrayOf("bytea", data.asInstanceOf[Array[Object]]);
      ps.setBytes(1, data)
      ps.execute()
      Unit
      //System.err.println(ps.execute())
    }
  }
}