'use strict'

import gulp from 'gulp'
import watch from 'gulp-watch'
import autoprefixer from 'gulp-autoprefixer'
import gulpSass from 'gulp-sass'
import * as sassCompiler from 'sass'
import rigger from 'gulp-rigger'
import imagemin from 'gulp-imagemin'
import pngquant from 'imagemin-pngquant'
import rimraf from 'rimraf'
import pug from 'gulp-pug'
import browserSync from 'browser-sync'
import spritesmith from 'gulp.spritesmith'
import merge from 'merge-stream'

const reload = browserSync.reload

const sass = gulpSass(sassCompiler)

const path = {
	build: {
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/images/',
		fonts: 'build/fonts/',
	},
	src: {
		html: 'app/*.jade',
		js: 'app/js/*.js',
		style: 'app/styles/main.sass',
		img: 'app/images/**/*.*',
		fonts: 'app/fonts/**/*.*',
	},
	watch: {
		html: 'app/**/*.jade',
		js: 'app/js/**/*.js',
		style: 'app/styles/**/*.sass',
		img: 'app/images/**/*.*',
		fonts: 'app/fonts/**/*.*',
	},
	clean: './build',
}

const config = {
	server: {
		baseDir: './build',
	},
	tunnel: false,
	host: 'localhost',
	port: 9000,
	logPrefix: 'Vlad',
}

gulp.task('webserver', function () {
	browserSync(config)
})

gulp.task('clean', function (cb) {
	rimraf(path.clean, cb)
})

gulp.task('html:build', function () {
	return gulp
		.src(path.src.html)
		.pipe(rigger())
		.pipe(
			pug({
				pretty: true,
			})
		)
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({ stream: true }))
})

gulp.task('js:build', function () {
	return gulp
		.src(path.src.js)
		.pipe(rigger())
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({ stream: true }))
})

gulp.task('style:build', function () {
	return gulp
		.src(path.src.style)
		.pipe(
			sass({
				includePaths: ['app/styles/'],
			}).on('error', sass.logError) // Обробка помилок
		)
		.pipe(autoprefixer())
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({ stream: true }))
})

gulp.task('image:build', function () {
	return gulp
		.src(path.src.img)
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				use: [pngquant()],
				interlaced: true,
			})
		)
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({ stream: true }))
})

gulp.task('fonts:build', function () {
	return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts))
})

gulp.task('sprite', function () {
	const spriteData = gulp.src('app/images/*.png').pipe(
		spritesmith({
			imgName: 'sprite.png',
			cssName: '_sprite.sass',
			imgPath: '../images/sprite.png',
			padding: 10,
		})
	)

	const imgStream = spriteData.img.pipe(gulp.dest('app/images/'))
	const cssStream = spriteData.css.pipe(gulp.dest('app/styles/partials/'))

	return merge(imgStream, cssStream)
})

gulp.task(
	'build',
	gulp.series(
		'html:build',
		'js:build',
		'style:build',
		'fonts:build',
		'image:build'
	)
)

gulp.task('watch', function () {
	watch([path.watch.html], function () {
		gulp.start('html:build')
	})
	watch([path.watch.style], function () {
		gulp.start('style:build')
	})
	watch([path.watch.js], function () {
		gulp.start('js:build')
	})
	watch([path.watch.img], function () {
		gulp.start('image:build')
	})
	watch([path.watch.fonts], function () {
		gulp.start('fonts:build')
	})
})

gulp.task('default', gulp.series('build', 'webserver', 'watch'))
