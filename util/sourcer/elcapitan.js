const fs = require('fs/promises');

const {copyDir} = require('../util.js');
const {getCompileOrder, buildPrefix, macTargetVersion, env} = require('./config.js');
const {compile} = require('./compile.js');
const {download} = require('./download.js');

const packages = new Map([
	['package', {
		'details': '',
		'link': '',
		'name': 'package',
		'method': '',
		'args': [],
		'requires': [
			'probelab-reimager',
		],
		'recompiles': [],
		'makes': [],
		'postCompile': async () => {
		}
	}],
	['probelab-reimager', {
		'details': 'https://github.com/Bob620/probelab-reimager',
		'link': 'https://github.com/Bob620/probelab-reimager/archive/refs/heads/dev.zip',
		'name': 'probelab-reimager',
		'method': 'electron',
		'args': [],
		'requires': [
			'sharp',
			'canvas'
		],
		'recompiles': [],
		'makes': ['probelab-reimager'],
		'postCompile': async () => {
			await copyDir(`${buildPrefix}/probelab-reimager/fonts`, `${buildPrefix}/electron/probelab-reimager/fonts`);
			await fs.writeFile(`${buildPrefix}/electron/probelab-reimager/module.js`, (await fs.readFile(`${buildPrefix}/electron/probelab-reimager/module.js`, 'utf8'))
				.replace(/\/\.\.\/fonts/gi, '/fonts'));
		}
	}],
	['canvas', {
		'details': 'https://www.npmjs.com/package/canvas',
		'link': 'https://github.com/Automattic/node-canvas/archive/v2.7.0.tar.gz',
		'name': 'canvas',
		'method': 'electron',
		'args': [],
		'requires': [
			'pango',
			'glib',
			'cairo',
			'dylibbundler'
		],
		'recompiles': [],
		'makes': ['canvas'],
		'postCompile': async () => {
			await fs.writeFile(`${buildPrefix}/electron/canvas/index.js`, (await fs.readFile(`${buildPrefix}/electron/canvas/index.js`, 'utf8'))
				.replace(/\.\.\/build\/Release\/canvas\.node/gi, './canvas.node'));
		}
	}],
	['sharp', {
		'details': 'https://sharp.pixelplumbing.com',
		'link': 'https://github.com/lovell/sharp/archive/v0.27.2.zip',
		'name': 'sharp',
		'method': 'electron',
		'args': [],
		'requires': [
			'vips',
			'gobject',
			'glib',
			'dylibbundler'
		],
		'recompiles': [],
		'makes': ['sharp'],
		'postConfigure': async () => {
			// Potentially need to patch the binding.gyp and add glib + gobject ???
			await fs.writeFile(`${buildPrefix}/sharp/binding.gyp`, (await fs.readFile(`${buildPrefix}/sharp/binding.gyp`, 'utf8'))
				.replace(/'libvips-cpp\.42\.dylib',/gi, '\'libvips-cpp.42.dylib\',\'libglib-2.0.0.dylib\',')
				.replace(/'libvips\.42\.dylib'/gi, '\'libgobject-2.0.0.dylib\',\'libvips.42.dylib\'')
				.replace(/'<\(sharp_vendor_dir\)\/lib'/gi, `'${buildPrefix}/lib/'`)
			);
		},
		'postCompile': async () => {
			await fs.writeFile(`${buildPrefix}/electron/sharp/lib/index.js`, (await fs.readFile(`${buildPrefix}/electron/sharp/lib/index.js`, 'utf8'))
				.replace(/\.\.\/build\/Release\/sharp\.node/gi, '../sharp.node'));
			const files = await fs.readdir(`${buildPrefix}/sharp/vendor/8.10.5/lib/`);
			for (const file of files)
				if (file.endsWith('.dll'))
					await fs.copyFile(`${buildPrefix}/sharp/vendor/8.10.5/lib/${file}`, `${buildPrefix}/electron/sharp/${file}`);
		}
	}],
	['dylibbundler', {
		'details': 'https://pango.gnome.org/',
		'link': 'https://github.com/auriamg/macdylibbundler.git',
		'name': 'dylibbundler',
		'method': 'make',
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['dylibbundler'],
		'postCompile': async () => {
			try {
				await fs.unlink(`${buildPrefix}/bin/dylibbundler`);
			} catch(e) {
			}
			await fs.symlink(`${buildPrefix}/dylibbundler/dylibbundler`, `${buildPrefix}/bin/dylibbundler`);
		}
	}],
	['rsvg', {
		'details': 'https://gitlab.gnome.org/GNOME/librsvg',
		'link': 'https://gitlab.gnome.org/GNOME/librsvg/-/archive/2.50.1/librsvg-2.50.1.tar.gz',
		'name': 'rsvg',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig',
			'pango',
			'cairo',
			'xml2',
			'pixbuf',
			'freetype',
			'gobject',
			'glib'
		],
		'recompiles': [],
		'makes': []
	}],
	['xml2', {
		'details': 'http://www.xmlsoft.org/',
		'link': 'http://xmlsoft.org/libxml2/libxml2-2.9.10.tar.gz',
		'name': 'xml2',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig',
			'zlib',
			'iconv'
		],
		'recompiles': [],
		'makes': []
	}],
	['pixbuf', {
		'details': 'https://gitlab.gnome.org/GNOME/gdk-pixbuf',
		'link': 'https://gitlab.gnome.org/GNOME/gdk-pixbuf/-/archive/2.40.0/gdk-pixbuf-2.40.0.tar.gz',
		'name': 'pixbuf',
		'method': 'meson',
		'args': [],
		'requires': [
			'pkgconfig',
			'pango',
			'cairo'
		],
		'recompiles': [],
		'makes': []
	}],
	['pango', {
		'details': 'https://pango.gnome.org/',
		'link': 'https://download.gnome.org/sources/pango/1.47/pango-1.47.0.tar.xz',
		'name': 'pango',
		'method': 'meson',
		'args': [],
		'requires': [
			'pkgconfig',
			'harfbuzz',
			'cairo'
		],
		'recompiles': [],
		'makes': ['libpango-1.0.dylib']
	}],
	['gobject', {
		'details': 'https://gitlab.gnome.org/GNOME/gobject-introspection/',
		'link': 'https://gitlab.gnome.org/GNOME/gobject-introspection/-/archive/1.66.1/gobject-introspection-1.66.1.zip',
		'name': 'gobject',
		'method': 'meson',
		'args': [],
		'requires': [
			'pkgconfig',
			'cairo',
			'ffi',
			'glib'
		],
		'recompiles': [],
		'makes': ['libgirepository-1.0.dylib']
	}],
	['harfbuzz', {
		'details': 'https://harfbuzz.github.io/',
		'link': 'https://github.com/harfbuzz/harfbuzz/releases/download/2.7.2/harfbuzz-2.7.2.tar.xz',
		'name': 'harfbuzz',
		'method': 'configure',
		'args': ['--with-glib', '--with-gobject', '--with-freetype', '--with-fontconfig', '--with-coretext', '--with-cairo'],
		'requires': [
			'pkgconfig',
			'cairo',
			'freetype',
			'glib',
			'gobject'
		],
		'recompiles': [],
		'makes': ['hb-coretext.h', 'libharfbuzz.dylib'],
		'postCompile': async () => {
			const files = await fs.readdir(`${buildPrefix}/include/harfbuzz/`);
			for (const file of files)
				try {
					await fs.symlink(`${buildPrefix}/include/harfbuzz/${file}`, `${buildPrefix}/include/${file}`);
				} catch(e) {
				}
		}
	}],
	['lzo2', {
		'details': 'http://www.oberhumer.com/opensource/lzo',
		'link': 'http://www.oberhumer.com/opensource/lzo/download/lzo-2.10.tar.gz',
		'name': 'lzo2',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['liblzo2.a']
	}],
	['freetype', {
		'details': 'https://www.freetype.org/download.html',
		'link': 'https://download.savannah.gnu.org/releases/freetype/freetype-2.9.1.tar.gz',
		'name': 'freetype',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['ft2build.h', 'libfreetype.dylib'],
		'postCompile': async () => {
			await fs.symlink(`${buildPrefix}/include/freetype2/ft2build.h`, `${buildPrefix}/include/ft2build.h`);
			await fs.symlink(`${buildPrefix}/include/freetype2/freetype`, `${buildPrefix}/include/freetype`);
		}
	}],
	['fontconfig', {
		'details': 'https://www.freedesktop.org/wiki/Software/fontconfig/',
		'link': 'https://www.freedesktop.org/software/fontconfig/release/fontconfig-2.13.92.tar.gz',
		'name': 'fontconfig',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libfontconfig.dylib']
	}],
	['zlib', {
		'details': 'http://zlib.net/',
		'link': 'http://zlib.net/zlib-1.2.11.tar.gz',
		'name': 'zlib',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libz.dylib']
	}],
	['pixman', {
		'details': 'https://www.cairographics.org',
		'link': 'https://www.cairographics.org/releases/pixman-0.40.0.tar.gz',
		'name': 'pixman',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libpixman-1.dylib']
	}],
	['cairo', {
		'details': 'https://www.cairographics.org',
		'link': 'https://www.cairographics.org/releases/cairo-1.16.0.tar.xz',
		'name': 'cairo',
		'method': 'configure',
		'args': ['--enable-gtk-doc-html=no', '--disable-xlib'],
		'requires': [
			'pkgconfig',
			'pixman',
			'libpng',
			'zlib',
			'lzo2',
			'freetype',
			'fontconfig'
		],
		'recompiles': [],
		'makes': ['cairo-trace', 'libcairo.dylib']
	}],
	['lcms2', {
		'details': 'https://github.com/mm2/Little-CMS',
		'link': 'https://managedway.dl.sourceforge.net/project/lcms/lcms/2.11/lcms2-2.11.tar.gz',
		'name': 'lcms2',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['liblcms2.dylib']
	}],
	['exif', {
		'details': 'https://github.com/libexif/libexif',
		'link': 'https://github.com/libexif/libexif/releases/download/libexif-0_6_22-release/libexif-0.6.22.tar.gz',
		'name': 'exif',
		'method': 'configure',
		'args': ['--disable-dependency-tracking'],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': []
	}],
	['orc', {
		'details': 'https://github.com/GStreamer/orc',
		'link': 'https://gstreamer.freedesktop.org/data/src/orc/orc-0.4.32.tar.xz',
		'name': 'orc',
		'method': 'meson',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['liborc-0.4.0.dylib']
	}],
	['fftw', {
		'details': 'http://fftw.org/index.html',
		'link': 'http://fftw.org/fftw-3.3.8.tar.gz',
		'name': 'fftw',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libfftw3.a']
	}],
	['heif', {
		'details': 'http://www.libheif.org/',
		'link': 'https://github.com/strukturag/libheif/releases/download/v1.9.1/libheif-1.9.1.tar.gz',
		'name': 'heif',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libheif.dylib']
	}],
	['libjpeg', {
		'details': 'https://www.libjpeg-turbo.org/',
		'link': 'https://iweb.dl.sourceforge.net/project/libjpeg-turbo/2.0.6/libjpeg-turbo-2.0.6.tar.gz',
		'name': 'libjpeg',
		'method': 'cmake',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libturbojpeg.dylib']
	}],
	['libpng', {
		'details': 'http://www.libpng.org/pub/png/libpng.html',
		'link': 'https://phoenixnap.dl.sourceforge.net/project/libpng/libpng16/1.6.37/libpng-1.6.37.tar.xz',
		'name': 'libpng',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['png.h', 'libpng.dylib']
	}],
	['libspng', {
		'details': 'https://libspng.org',
		'link': 'https://github.com/randy408/libspng/archive/v0.6.1.tar.gz',
		'name': 'libspng',
		'method': 'meson',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libspng.dylib']
	}],
	['libwebp', {
		'details': 'https://github.com/webmproject/libwebp',
		'link': 'https://github.com/webmproject/libwebp/archive/v1.1.0.zip',
		'name': 'libwebp',
		'method': 'cmake',
		'args': ['--enable-libwebpmux', '--enable-libwebpdemux', '--enable-libwebpdecoder', '--enable-libwebpextras'],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libwebp.a', 'libwebpdemux.a', 'libwebpdecoder.a', 'libwebpmux.a']
	}],
	['libtiff', {
		'details': 'http://libtiff.org/',
		'link': 'http://download.osgeo.org/libtiff/tiff-4.1.0.zip',
		'name': 'libtiff',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['libtiff.dylib']
	}],
	['expat', {
		'details': 'https://libexpat.github.io/',
		'link': 'https://github.com/libexpat/libexpat/releases/download/R_2_2_10/expat-2.2.10.tar.gz',
		'name': 'expat',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['expat.h', 'libexpat.dylib']
	}],
	['vips', {
		'details': 'https://libvips.github.io/libvips/',
		'link': 'https://github.com/libvips/libvips/releases/download/v8.10.2/vips-8.10.2.tar.gz',
		'name': 'vips',
		'method': 'configure',
		'args': ['--without-rsvg', '--without-gsf', '--without-magick', '--without-OpenEXR', '--without-pdfium', '--without-poppler', '--without-openslide', '--without-matio', '--without-cfitsio', '--without-giflib', '--without-imagequant', '--without-libexif'],
		'requires': [
			'pkgconfig',
			'glib',
			'expat',
			'libjpeg',
			'libspng',
			'libpng',
			'libwebp',
			'libtiff',
			'orc',
			'fftw',
//			'exif',
			'heif',
			'lcms2'
		],
		'recompiles': [],
		'makes': ['vips']
	}],
	['glib', {
		'details': 'https://gitlab.gnome.org/GNOME/glib',
		'link': 'https://download.gnome.org/sources/glib/2.67/glib-2.67.0.tar.xz',
		'name': 'glib',
		'method': 'meson',
		'args': [
			'--default-library=shared',
			'-Dxattr=false',
			'-Dselinux=disabled',
			'-Ddtrace=false',
			'-Dc_args=""',
			'-Dsystemtap=false',
			`-Dcpp_args="-mmacosx-version-min=${macTargetVersion}"`,
			`-Dc_link_args="-mmacosx-version-min=${macTargetVersion}"`,
			`-Dcpp_link_args="-mmacosx-version-min=${macTargetVersion}"`,
			`--pkg-config-path="${env.PKG_CONFIG_PATH}"`
		],
		'requires': [
			'pkgconfig',
			'iconv',
			'gettext',
			'ffi',
			'pcre'
		],
		'recompiles': [],
		'makes': ['gio', 'libgobject-2.0.dylib', 'libgio-2.0.0.dylib', 'libglib-2.0.0.dylib'],
		'postConfigure': async () => {

		}
	}],
	['pkgconfig', {
		'details': 'https://pkg-config.freedesktop.org',
		'link': 'https://pkg-config.freedesktop.org/releases/pkg-config-0.29.2.tar.gz',
		'name': 'pkgconfig',
		'method': 'configure',
		'args': ['--with-internal-glib'],
		'requires': [
			'iconv'
		],
		'recompiles': [],
		'makes': ['pkg-config']
	}],
	['iconv', {
		'details': 'http://www.gnu.org/software/libiconv',
		'link': 'https://ftp.gnu.org/pub/gnu/libiconv/libiconv-1.16.tar.gz',
		'name': 'iconv',
		'method': 'configure',
		'before-recompile': [
			'--without-libintl-prefix'
		],
		'args': [],
		'requires': [],
		'recompiles': [],
		'makes': ['iconv.h', 'libcharset.h', 'localcharset.h', 'libiconv.dylib', 'libcharset.dylib', 'iconv']
	}],
	['gettext', {
		'details': 'https://www.gnu.org/software/gettext/',
		'link': 'https://ftp.gnu.org/pub/gnu/gettext/gettext-0.21.tar.gz',
		'name': 'gettext',
		'method': 'configure',
		'args': [
			'--disable-java'
		],
		'requires': [
			'iconv',
			'pkgconfig'
		],
		'recompiles': [
			'iconv'
		],
		'makes': ['gettext-po.h', 'libgettextlib.dylib', 'libgettextpo.dylib', 'libintl.dylib', 'gettext', 'gettextize']
	}],
	['ffi', {
		'details': 'http://www.sourceware.org/libffi/',
		'link': 'https://github.com/libffi/libffi/releases/download/v3.3/libffi-3.3.tar.gz',
		'name': 'ffi',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['ffi.h', 'ffitarget.h', 'libffi.a', 'libffi.dylib', 'libffi.la']
	}],
	['pcre', {
		'details': 'http://www.pcre.org/',
		'link': 'https://ftp.pcre.org/pub/pcre/pcre-8.44.zip',
		'name': 'pcre',
		'method': 'configure',
		'args': [],
		'requires': [
			'pkgconfig'
		],
		'recompiles': [],
		'makes': ['pcre.h', 'libpcre.dylib', 'libpcrecpp.dylib', 'libpcreposix.dylib']
	}]
]);

getCompileOrder(packages).then(async compileOrder => {
	let toCompile = new Set();

	for (const packName of compileOrder) {
		const pack = packages.get(packName);
		if (pack.link !== '')
			await download(pack);

		if (pack.requires.filter(e => !packages.get(e).compiled).length !== 0) {
			toCompile.add(packName);
		} else
			try {
				await compile(packages, pack);
				pack.compiled = true;
			} catch(err) {
				console.log(err);
			}
	}
});