//BEGIN SETUP
function output(message)
{
   console.error(message);
   //   var output = document.getElementById("output");
   //output.innerHTML = output.innerHTML + message + "\n";
}
window.onload = function() {
   // var baseUrl = (/[?&]webChannelBaseUrl=([A-Za-z0-9\-:/\.]+)/.exec(location.search)[1]);
   var baseUrl = "ws://127.0.0.1:12345"
      output("Connecting to WebSocket server at " + baseUrl + ".");
   var socket = new WebSocket(baseUrl);

   socket.onclose = function()
   {
      console.error("web channel closed");
   };
   socket.onerror = function(error)
   {
      console.error("web channel error: " + error);
   };
   socket.onopen = function()
   {
      output("WebSocket connected, setting up QWebChannel.");
      new QWebChannel(socket, function(channel) {
         // make dialog object accessible globally
         window.dialog = channel.objects.dialog;

         //document.getElementById("path3007").onclick = function() {
         //   var text = "path3007 clicked";
         //   output("Sent message: " + text);
         //   dialog.receiveText(text);
         //}

         dialog.fillcolor.connect(function(id, value) {
            var el = document.getElementById(id);
            el.style.fill = value
         });

         dialog.strokecolor.connect(function(id, value) {
            var el = document.getElementById(id);
            el.style.stroke = value
         });

         dialog.string.connect(function(id, value) {
            var textElement= document.getElementById(id);
            var child = textElement.firstChild;
            //loop over all childs
            while (child != null) {
               //see if child is a tspan and has child nodes
               if (child.nodeName == "tspan" && child.hasChildNodes()) {
                  //see if firstChild is of nodeType "text"
                  if (child.firstChild.nodeType == 3) {
                     child.firstChild.nodeValue = value;
                  }
               }
               child = child.nextSibling;
            }
         });

         dialog.fillbt.connect(function(id, value) {
            // cp-rect13135-9
            var clippathname = "cp-" + id;
            var url = "url(#"+clippathname+")";
            document.getElementById(id).setAttribute("clip-path", url);

            var height = document.getElementById(id).getAttribute("height");
            var perc = height*value;
            document.getElementById(clippathname).setAttribute("height", perc);
            alert(url);
         });

         dialog.visibility.connect(function(id, value) {
            if(value == 0) 
            document.getElementById(id).setAttribute("visibility", "hidden");
            else
            document.getElementById(id).setAttribute("visibility", "visible");
         });


         dialog.receiveText("Client connected, ready to send/receive messages!");
         output("Connected to WebChannel, ready to send/receive messages!");
      });
   }
}
//END SETUP
