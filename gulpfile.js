require('@ministryofjustice/module-alias/register')

const gulp = require('gulp')

const {
  cssClean: buildCssClean,
  css: buildCss,
  cssWatch: buildCssWatch
} = require('./src/gulp/build')

const {
  templates: transformTemplates
} = require('./src/gulp/transform')

gulp
  .task('build:css:clean', buildCssClean)

gulp
  .task('build:css', gulp.series('build:css:clean', buildCss))

gulp
  .task('build:css:watch', gulp.series('build:css', buildCssWatch))

gulp
  .task('build:clean', gulp.series('build:fonts:clean', 'build:images:clean', 'build:css:clean'))

gulp
  .task('build', gulp.series('build:fonts', 'build:images', 'build:css'))

gulp
  .task('build:watch', gulp.parallel('build:fonts:watch', 'build:images:watch', 'build:css:watch'))

gulp
  .task('transform:templates', transformTemplates)

gulp
  .task('transform', gulp.series('transform:templates'))
