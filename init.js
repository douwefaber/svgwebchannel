//BEGIN SETUP
function output(message)
{
   console.error(message);
   //   var output = document.getElementById("output");
   //output.innerHTML = output.innerHTML + message + "\n";
}


window.onload = function() {
   // var baseUrl = (/[?&]webChannelBaseUrl=([A-Za-z0-9\-:/\.]+)/.exec(location.search)[1]);
   create_defs_element();

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

         dialog.fill_bt.connect(function(id, value) {
            create_clippath(id);
            var cliprect =  document.getElementById("cpr-"+id);
            var y1 = document.getElementById(id).getBBox().y;
            var height = document.getElementById(id).getBBox().height;
            if(cliprect != null)
            {
               cliprect.setAttribute("y", y1 + height * (1-value) );
               console.log(document.getElementById(id));
               console.log(cliprect);
            }
         });

         dialog.fill_tb.connect(function(id, value) {
            create_clippath(id);
            var cliprect =  document.getElementById("cpr-"+id);
            var height = document.getElementById(id).getBBox().height;
            if(cliprect != null)
            {
               cliprect.setAttribute("height", height*value);
               console.log(document.getElementById(id));
               console.log(cliprect);
            }
         });

         dialog.fill_lr.connect(function(id, value) {
            create_clippath(id);
            var cliprect =  document.getElementById("cpr-"+id);
            var width = document.getElementById(id).getBBox().width;
            if(cliprect != null)
            {
               cliprect.setAttribute("width", width*value);
            }
         });

         dialog.fill_rl.connect(function(id, value) {
            create_clippath(id);
            var cliprect =  document.getElementById("cpr-"+id);
            var left = document.getElementById(id).getBBox().x;
            var width = document.getElementById(id).getBBox().width;
            if(cliprect != null)
            {
               cliprect.setAttribute("x", left+(width*(1-value)));
            }
         });

         dialog.visibility.connect(function(id, value) {
            if(value == 0) 
            document.getElementById(id).setAttribute("visibility", "hidden");
            else
            document.getElementById(id).setAttribute("visibility", "visible");
         });

         dialog.rotation.connect(function(id, degrees, x_center, y_center) {
            var object =  document.getElementById(id);
            var x = x_center;
            var y = y_center;
            if(x == 0) {
               x = object.getBBox().x + (object.getBBox().width / 2);
            }
            if(y == 0) {
               y = object.getBBox().y + (object.getBBox().height / 2);
            }

            // If rotation was executed before there should be a rotation
            // attribute which indicates which index our rotation is stored in
            var rotationid = object.getAttribute("rotation_id");
            if(rotationid == null)
            {
               var xFormList = object.transform.baseVal;
               var svgroot = document.getElementsByTagName("svg")[0];
               xFormList.appendItem(svgroot.createSVGTransform());
               rotationid = xFormList.numberOfItems-1;
               object.setAttribute("rotation_id", rotationid);
            }

            var rotationXForm = object.transform.baseVal.getItem(rotationid);
            rotationXForm.setRotate(degrees, x, y);

         });

         dialog.strokelength.connect(function(id, value) {
            var object = document.getElementById(id);
            var length = object.getTotalLength();
            debugger;
            object.style.strokeDasharray = length + ' ' + length;
            object.style.strokeDashoffset = (1-value) * length;
         });
         dialog.receiveText("Client connected, ready to send/receive messages!");
         output("Connected to WebChannel, ready to send/receive messages!");
      });
   }
}

function create_defs_element()
{
   var defelement = document.getElementsByTagName("defs")[0];
   if(defelement == null)
   {
      var newelement = document.createElement("defs");
      var parent_element = document.getElementsByTagName("svg")[0];
      if(parent_element == null)
         alert("failed to create the custom defs");
      parent_element.insertBefore(newelement, parent_element.firstChild);
   }
}

function create_clippath(element)
{
   var clippathname = "cp-" + element;
   // Search for this element
   var cp_element = document.getElementById(clippathname);
   if(cp_element == null)
   {
      var clippathrectname = "cpr-" + element;
      var cliprect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      var el = document.getElementById(element);

      console.log(el.getBoundingClientRect());
      cliprect.setAttribute("id", clippathrectname);
      cliprect.setAttribute("x", el.getBBox().x);
      cliprect.setAttribute("y", el.getBBox().y);
      cliprect.setAttribute("width", el.getBBox().width); 
      cliprect.setAttribute("height", el.getBBox().height); 
      var clippath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");

      clippath.setAttribute("id", clippathname); 
      clippath.appendChild(cliprect);

      var defelement = document.getElementsByTagName("defs")[0];
      defelement.appendChild(clippath);

      el.setAttribute("clip-path", "url(#"+clippathname+")");
   }
}


function deltaTransformPoint(matrix, point)  {
   var dx = point.x * matrix.a + point.y * matrix.c + 0;
   var dy = point.x * matrix.b + point.y * matrix.d + 0;
   return { x: dx, y: dy };
}

function decomposeMatrix(matrix) {
   // @see https://gist.github.com/2052247
   // calculate delta transform point
   var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
   var py = deltaTransformPoint(matrix, { x: 1, y: 0 });

   // calculate skew
   var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
   var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

   return {
      translateX: matrix.e,
         translateY: matrix.f,
         scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
         scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
         skewX: skewX,
         skewY: skewY,
         rotation: skewX // rotation is the same as skew x
   };        
}

function getRotationFromMatrix(matrix)
{
   var px = deltaTransformPoint(matrix, { x: 0, y: 1 });
   var py = deltaTransformPoint(matrix, { x: 1, y: 0 });
   var rotation = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
   return {rotation};
}
     //Usage: decomposeMatrix(document.getElementById('myElement').getCTM())
//END SETUP
