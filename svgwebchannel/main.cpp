#include "qwebchannel.h"

#include <QApplication>
#include <QDialog>
#include <QVariantMap>
#include <QDesktopServices>
#include <QUrl>
#include <QDebug>

#include <QtWebSockets/QWebSocketServer>

#include "websocketclientwrapper.h"
#include "websockettransport.h"

#include "ui_dialog.h"

/*!
    An instance of this class gets published over the WebChannel and is then accessible to HTML clients.
*/
class Dialog : public QObject
{
   Q_OBJECT

public:
   explicit Dialog(QObject *parent = 0)
      : QObject(parent)
   {
      ui.setupUi(&dialog);
      dialog.show();


      connect(ui.setfillcolor, SIGNAL(clicked()), SLOT(setFillColor()));
      connect(ui.setstrokecolor, SIGNAL(clicked()), SLOT(setStrokeColor()));

      connect(ui.setstring, SIGNAL(clicked()), SLOT(setString()));

      connect(ui.setfillBT, SIGNAL(clicked()), SLOT(setFillBT()));
      connect(ui.setfillTB, SIGNAL(clicked()), SLOT(setFillTB()));
      connect(ui.setfillLR, SIGNAL(clicked()), SLOT(setFillLR()));
      connect(ui.setfillRL, SIGNAL(clicked()), SLOT(setFillRL()));

      connect(ui.setvisibility, SIGNAL(clicked()), SLOT(setVisibility()));

      connect(ui.setrotation, SIGNAL(clicked()), SLOT(setRotation()));

      connect(ui.setstrokelength, SIGNAL(clicked()), SLOT(setStrokeLength()));

      connect(ui.settooltip, SIGNAL(clicked()), SLOT(setToolTip()));

      connect(ui.setmovement, SIGNAL(clicked()), SLOT(setMove()));
   }

   void displayMessage(const QString &message)
   {
      ui.output->appendPlainText(message);
   }

signals:
   void fillcolor(const QString& id, const QString& value);
   void strokecolor(const QString& id, const QString& value);

   void string(const QString& id, const QString& value);

   void fill_bt(const QString& id, const QString& value);
   void fill_tb(const QString& id, const QString& value);
   void fill_lr(const QString& id, const QString& value);
   void fill_rl(const QString& id, const QString& value);

   void visibility(const QString& id, const QString& value);

   void rotation(const QString& id, const QString& degrees,
                 const QString& xCenter, const QString& yCenter);

   void strokelength(const QString& id, const QString& value);

   void tooltip(const QString& id, const QString& value);

   void move(  const QString& id, const QString& value,
               const QString& xfrom, const QString& yfrom,
               const QString& xto, const QString& yto);


public slots:
   void receiveText(const QString &text)
   {
      displayMessage(tr("Received message: %1").arg(text));
   }

private slots:

   void setFillColor()
   {
      emit fillcolor(ui.object->text(), ui.value->text());
   }

   void setStrokeColor()
   {
      emit strokecolor(ui.object->text(), ui.value->text());
   }

   void setString()
   {
      emit string(ui.object->text(), ui.value->text());
   }

   void setFillBT()
   {
      emit fill_bt(ui.object->text(), ui.value->text());
   }

   void setFillTB()
   {
      emit fill_tb(ui.object->text(), ui.value->text());
   }

   void setFillLR()
   {
      emit fill_lr(ui.object->text(), ui.value->text());
   }

   void setFillRL()
   {
      emit fill_rl(ui.object->text(), ui.value->text());
   }

   void setVisibility()
   {
      emit visibility(ui.object->text(), ui.value->text());
   }

   void setRotation()
   {
      emit rotation(ui.object->text(), ui.value->text(),
                    ui.rotationcenterx->text(), ui.rotationcentery->text());
   }

   void setStrokeLength()
   {
      emit strokelength(ui.object->text(), ui.value->text());
   }

   void setToolTip()
   {
      emit tooltip(ui.object->text(), ui.value->text());
   }

   void setMove()
   {
      emit move(ui.object->text(), ui.value->text(),
                    ui.xmovefrom->text(), ui.ymovefrom->text(),
                     ui.xmoveto->text(), ui.ymoveto->text());
   }

private:
   QDialog dialog;
   Ui::Dialog ui;
};

int main(int argc, char** argv)
{
   QApplication app(argc, argv);

   // setup the QWebSocketServer
   QWebSocketServer server(QStringLiteral("QWebChannel Standalone Example Server"), QWebSocketServer::NonSecureMode);
   if (!server.listen(QHostAddress::LocalHost, 12345)) {
      qFatal("Failed to open web socket server.");
      return 1;
   }

   // wrap WebSocket clients in QWebChannelAbstractTransport objects
   WebSocketClientWrapper clientWrapper(&server);

   // setup the channel
   QWebChannel channel;
   QObject::connect(&clientWrapper, &WebSocketClientWrapper::clientConnected,
                    &channel, &QWebChannel::connectTo);

   // setup the dialog and publish it to the QWebChannel
   Dialog dialog;
   channel.registerObject(QStringLiteral("dialog"), &dialog);

   // open a browser window with the client HTML page
   //QUrl url = QUrl::fromLocalFile("D:/index.html");

//   QUrl url = QUrl::fromLocalFile("D:/WebTest/webchannel/drawing.svg");
//   url.setQuery(QStringLiteral("webChannelBaseUrl=") + server.serverUrl().toString());
//   QDesktopServices::openUrl(url);

   //dialog.displayMessage(QObject::tr("Initialization complete, opening browser at %1.").arg(url.toDisplayString()));

   return app.exec();
}

#include "main.moc"
