#!/usr/bin/env python3
import http.server

# Ensure SVG files are served with the correct MIME type
http.server.SimpleHTTPRequestHandler.extensions_map['.svg'] = 'image/svg+xml'

http.server.HTTPServer(("", 8000), http.server.SimpleHTTPRequestHandler).serve_forever()
