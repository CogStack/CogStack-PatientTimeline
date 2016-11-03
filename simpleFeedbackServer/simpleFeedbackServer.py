import BaseHTTPServer
import cgi
import json
import urlparse

IP = "localhost"
PORT = 81
logFile = 'feedbackLog.json'


class MyHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Credentials', 'true')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")

    def do_POST(self, *args, **kwargs):
        ctype, temp  = cgi.parse_header(self.headers.getheader('content-type'))

        try:
            if ctype == 'application/json':
                postLength = int(self.headers.getheader('content-length'))
                receivedJSON = self.rfile.read(postLength)
                parsedJSON = json.dumps(urlparse.parse_qsl(receivedJSON), indent=4, sort_keys=True)

                # adds the comma at the end for easier possible parsing later on;
                tempList = list(parsedJSON)
                tempList.append(',')
                parsedJSON = "".join(tempList)

                with open(logFile, "a") as jsonLog:
                    jsonLog.write(parsedJSON)
                    jsonLog.write("\n")

                response = bytes("SUCCESS")
                self.send_response(200)
                self.send_header("Content-type", "text/plain")
                self.send_header('Access-Control-Allow-Origin', '*')

                self.send_header("Content-Length", len(response))
                self.end_headers()

                self.wfile.write(response)
                self.wfile.close()

        except Exception, e:
            print e

    # no need to handle that for this simple server
    def do_GET(self, *args, **kwargs):
        pass


def httpd(handler_class=MyHandler, server_address=(IP, PORT)):
    try:
        print "Server started on http://%s:%s/" % (server_address[0], server_address[1])
        srvr = BaseHTTPServer.HTTPServer(server_address, handler_class)
        srvr.serve_forever()  # serve_forever
    except KeyboardInterrupt:
        srvr.socket.close()

if __name__ == "__main__":
    httpd()