# Dir Server

Serve current directory statically.

## Usage

To make current directory available on the Internet, just type __dirserver__
and a server will open to provide content in this directory.

    $ dirserver

Default port is 8080, one can use broswer to open __http://localhost:8080/__
to get resource.

## Configure

The website can be configured using __setting.json__ in the working directory,
it is an JSON formetted file that currently provides setting of port, cache
policy, additional mime. An example is provided:

    {
      "cache_allowed": true,
      "mime": {
        "imjpeg" : ["jpg"]
      }
    }
