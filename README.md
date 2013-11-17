ngembryo
========

The Next Generation Embryology Project aimed to develop a web application
which provides annotations over 3D rendering of embryos.

## Installation

For now, I will describe the process to get this running under Mac
OSX. This project uses Apache web server and MySQL database server,
which come already installed in Mac OSX. If not, please Google for
installation instructions.

1. Enable PHP, by uncommenting PHP5 module (`LoadModule php5_module libexec/apache2/libphp5.so`).

    $ sudo vi /etc/apache2/httpd.conf

2. Ensure that MySQL server is accessible to PHP.

    $ sudo cd /var
    $ sudo mkdir mysql
    $ sudo ln -s /tmp/mysql.sock /var/mysql/mysql.sock

3. We will use the user's `Sites` directory to deploy `ngembryo`.
   Create the `Sites` directory if it does not exists.

    $ whoami
    user

    $ cd ~
    $ mkdir Sites

4. Download the source code:

    $ cd Sites
    $ git clone https://github/gyaikhom/ngembryo.git
    $ cd ngembryo

5. Install the database, and check that it is accessible to user `ngembryo`.

    $ pwd
    /Users/user/Sites/ngembryo

    $ cd resources
    $ mysql -u root < ngembryo.sql

6. Since the embryo images are hosted at MRC Edinburgh, we will have
   to set up a proxy so that request for images are re-directed.

    $ sudo vi /etc/apache2/other/proxy.conf

   Add the following:

    <IfModule mod_proxy.c>
        ProxyRequests On
        ProxyPreserveHost On
        ProxyStatus On
        <Location /status>
            SetHandler server-status
	    Order Deny,Allow
            Deny from all
            Allow from 127.0.0.1
        </Location>
        ProxyPass /fcgi-bin/iip3dsrv_ema.fcgi http://www.emouseatlas.org/fcgi-bin/iip3dsrv_ema.fcgi
        ProxyPassReverse /fcgi-bin/iip3dsrv_ema.fcgi http://www.emouseatlas.org/fcgi-bin/iip3dsrv_ema.fcgi
    </IfModule>

7. Start apache server

    $ sudo apachectl start

8. Visit `http://localhost:80/~user/ngembryo`. Register as user, and
   `ngembryo` is ready for use.


## History

This project was funded by [JISC](http://www.jisc.ac.uk/) to develop a
prototype system. The project was funded for 18 months. Design began in
September 2009, and active development started in January 2010. The project
has now concluded, and as of 1 October, development has also ceased. Further
details are in the `about.html` page.

## Code release

I am releasing the source code here, so that it is accessible to
embryo researchers who are interested in annotation and analysis. I have
also updated the embryo resources as currently hosted at [eMouse Atlas]
(http://www.emouseatlas.org). The code haven't changed much since the
project concluded, except for some cleanup. I have moved the code from
[sourceforge](http://sourceforge.net/projects/ngembryo/) to
GitHub so that all of my projects are under my GitHub account.

## Acknowledgement

This project uses the WoolzIIP protocol for retrieving embryo images. The related
code, especially `woolz.js`, is derived from the implementation available at
[MRC Edinburgh](http://aberlour.hgu.mrc.ac.uk/wlziipdemos/). The WoolzIIP is
itself derived from the [IIPImage project](http://iipimage.sourceforge.net/). 